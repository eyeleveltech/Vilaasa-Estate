import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreateInquiryInput,
  UpdateInquiryStatusInput,
  ScheduleFollowUpInput,
  InquiryFilterQuery,
} from "./inquiry.schema";
import { sendInquiryConfirmationEmail } from "../../services/email.service";

/**
 * @desc    Submit a new property / investment inquiry
 * @route   POST /api/v1/inquiries
 * @access  Public
 */
export const createInquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateInquiryInput;

    let resolvedPropertyId: string | undefined = undefined;
    let propertyName: string | undefined = undefined;
    if (data.propertyId) {
      const property = await prisma.property.findFirst({
        where: {
          OR: [
            { id: data.propertyId },
            { slug: data.propertyId },
          ],
        },
        select: { id: true, name: true },
      });
      if (property) {
        resolvedPropertyId = property.id;
        propertyName = property.name;
      }
    }

    const isViewUnlock = data.sendEmail === false || data.intent === "UNLOCK_VIEW";
    const timelineNote = isViewUnlock
      ? "Confidential Dossier Unlocked (View Only — No Email Sent)"
      : `Inquiry submitted via ${data.source.replace(/_/g, " ")}`;

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        investmentType: data.investmentType,
        investmentRange: data.investmentRange,
        currency: data.currency,
        propertyId: resolvedPropertyId,
        source: data.source,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        notes: data.notes || (isViewUnlock ? "Confidential Dossier Unlocked" : undefined),
        timeline: {
          create: {
            fromStatus: null,
            toStatus: "NEW",
            note: timelineNote,
            changedById: req.user?.id || null,
          },
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        timeline: true,
      },
    });

    // Send confirmation email ONLY for deliberate inquiries, NEVER for view unlocks
    if (!isViewUnlock) {
      sendInquiryConfirmationEmail({
        name: inquiry.name,
        email: inquiry.email,
        investmentType: inquiry.investmentType,
        investmentRange: inquiry.investmentRange,
        propertyName,
        propertySlug: inquiry.property?.slug,
      }).catch((err) => console.error("Email dispatch failed:", err));
    }

    const responseMessage = isViewUnlock
      ? "Dossier unlocked successfully. Enjoy exploring the portfolio asset."
      : "Inquiry submitted successfully. Our luxury advisory team will contact you shortly.";

    return res.status(201).json(
      ApiResponse.created(
        inquiry,
        responseMessage,
      ),
    );
  },
);

/**
 * @desc    Get paginated inquiries list with filters
 * @route   GET /api/v1/inquiries
 * @access  Protected (Admin and Channel Partner)
 */
export const getInquiries = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = req.query as unknown as InquiryFilterQuery;
    const {
      status,
      propertyId,
      source,
      investmentType,
      search,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.InquiryWhereInput = {};

    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;
    if (source) where.source = source;
    if (investmentType) where.investmentType = investmentType;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        {
          property: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [total, inquiries] = await Promise.all([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              currency: true,
              location: {
                select: {
                  city: true,
                  country: true,
                },
              },
              media: {
                where: { isFeatured: true },
                select: { url: true },
                take: 1,
              },
            },
          },
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          timeline: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
      ApiResponse.ok(inquiries, "Inquiries retrieved successfully", {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }),
    );
  },
);

/**
 * @desc    Get single inquiry with full CRM timeline history
 * @route   GET /api/v1/inquiries/:id
 * @access  Protected (Admin and Channel Partner)
 */
export const getInquiryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: true,
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!inquiry) {
      throw ApiError.notFound(`Inquiry with id '${id}' not found`);
    }

    return res.status(200).json(
      ApiResponse.ok(inquiry, "Inquiry details retrieved successfully"),
    );
  },
);

/**
 * @desc    Update inquiry status & assigned agent, recording timeline entry
 * @route   PATCH /api/v1/inquiries/:id/status
 * @access  Protected (Admin only)
 */
export const updateInquiryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, assignedAgentId, notes } =
      req.body as UpdateInquiryStatusInput;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw ApiError.notFound(`Inquiry with id '${id}' not found`);
    }

    if (assignedAgentId) {
      const agent = await prisma.user.findUnique({
        where: { id: assignedAgentId },
      });
      if (!agent) {
        throw ApiError.badRequest(
          `Assigned agent with id '${assignedAgentId}' not found`,
        );
      }
    }

    // Record timeline transition if status changed or note provided
    const timelineEntry = await prisma.inquiryTimeline.create({
      data: {
        inquiryId: id,
        fromStatus: inquiry.status,
        toStatus: status,
        note: notes || `Status updated from ${inquiry.status} to ${status}`,
        changedById: req.user?.id || null,
      },
    });

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status,
        assignedAgentId,
        notes: notes !== undefined ? notes : inquiry.notes,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.status(200).json(
      ApiResponse.ok(
        { inquiry: updated, timeline: timelineEntry },
        "Inquiry status updated successfully",
      ),
    );
  },
);

/**
 * @desc    Schedule next follow-up touchpoint date and notes
 * @route   PATCH /api/v1/inquiries/:id/follow-up
 * @access  Protected (Admin only)
 */
export const scheduleFollowUp = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { followUpDate, followUpNotes } = req.body as ScheduleFollowUpInput;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw ApiError.notFound(`Inquiry with id '${id}' not found`);
    }

    const parsedDate = new Date(followUpDate);
    if (isNaN(parsedDate.getTime())) {
      throw ApiError.badRequest("Invalid follow-up date format");
    }

    // Record timeline entry for scheduled follow-up
    await prisma.inquiryTimeline.create({
      data: {
        inquiryId: id,
        fromStatus: inquiry.status,
        toStatus: inquiry.status,
        note: `Follow-up scheduled for ${parsedDate.toLocaleDateString()}${followUpNotes ? `: ${followUpNotes}` : ""}`,
        changedById: req.user?.id || null,
      },
    });

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        followUpDate: parsedDate,
        followUpNotes,
      },
      include: {
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Follow-up scheduled successfully"),
    );
  },
);

/**
 * @desc    Get full CRM timeline for an inquiry
 * @route   GET /api/v1/inquiries/:id/timeline
 * @access  Protected (Admin only)
 */
export const getInquiryTimeline = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const timeline = await prisma.inquiryTimeline.findMany({
      where: { inquiryId: id },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(
      ApiResponse.ok(timeline, "Inquiry timeline retrieved successfully"),
    );
  },
);

/**
 * @desc    Get inquiry analytics & conversion KPIs
 * @route   GET /api/v1/inquiries/stats
 * @access  Protected (Super Admin & Channel Partner)
 */
export const getInquiryStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const [
      totalInquiries,
      newInquiries,
      contactedInquiries,
      qualifiedInquiries,
      siteVisitsScheduled,
      negotiatingInquiries,
      closedWonInquiries,
      closedLostInquiries,
    ] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.inquiry.count({ where: { status: "CONTACTED" } }),
      prisma.inquiry.count({ where: { status: "QUALIFIED" } }),
      prisma.inquiry.count({ where: { status: "SITE_VISIT_SCHEDULED" } }),
      prisma.inquiry.count({ where: { status: "NEGOTIATING" } }),
      prisma.inquiry.count({ where: { status: "CLOSED_WON" } }),
      prisma.inquiry.count({ where: { status: "CLOSED_LOST" } }),
    ]);

    const conversionRate =
      totalInquiries > 0
        ? parseFloat(((closedWonInquiries / totalInquiries) * 100).toFixed(1))
        : 0;

    return res.status(200).json(
      ApiResponse.ok(
        {
          totalInquiries,
          newInquiries,
          contactedInquiries,
          qualifiedInquiries,
          siteVisitsScheduled,
          negotiatingInquiries,
          closedWonInquiries,
          closedLostInquiries,
          conversionRate,
        },
        "Inquiry statistics retrieved successfully",
      ),
    );
  },
);

/**
 * @desc    Silent audit log: Records property view from an active 2-hour OTP session
 * @route   POST /api/v1/inquiries/track-view
 * @access  Public (Session Lead)
 */
export const trackPropertyView = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, propertyName, email, phone, name } = req.body;

    if (!propertyId) {
      throw ApiError.badRequest("propertyId is required");
    }

    // 1. Resolve property
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: propertyId }, { slug: propertyId }],
      },
      select: { id: true, name: true },
    });

    if (property) {
      // Increment total property views counter
      void prisma.property.update({
        where: { id: property.id },
        data: { views: { increment: 1 } },
      });
    }

    // 2. If verified lead email exists, link activity to lead history
    if (email && property) {
      const existingInquiry = await prisma.inquiry.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" },
      });

      if (existingInquiry) {
        // Append to lead timeline
        void prisma.inquiryTimeline.create({
          data: {
            inquiryId: existingInquiry.id,
            toStatus: existingInquiry.status,
            note: `VIP Client viewed portfolio asset: "${property.name}" during active 2-hour session`,
          },
        });
      }
    }

    return res.status(200).json(
      ApiResponse.ok(
        { tracked: true, propertyId: property?.id || propertyId },
        "Property view tracked successfully",
      ),
    );
  },
);

