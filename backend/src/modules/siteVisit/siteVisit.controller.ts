import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreateSiteVisitInput,
  UpdateSiteVisitStatusInput,
  SiteVisitFilterQuery,
} from "./siteVisit.schema";
import { sendSiteVisitConfirmationEmail } from "../../services/email.service";

/**
 * @desc    Book a private estate site visit inspection
 * @route   POST /api/v1/site-visits
 * @access  Public
 */
export const createSiteVisit = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateSiteVisitInput;

    // 1. Resolve property by either ID or slug
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: data.propertyId }, { slug: data.propertyId }],
      },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(
        `Property with id or slug '${data.propertyId}' not found`,
      );
    }

    const scheduledDate = new Date(data.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      throw ApiError.badRequest("Invalid inspection date format");
    }

    // 2. Prevent Slot Collisions / Double-Booking
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingVisit = await prisma.siteVisit.findFirst({
      where: {
        propertyId: property.id,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        scheduledTime: data.scheduledTime,
        status: { not: "CANCELLED" },
      },
    });

    if (conflictingVisit) {
      throw ApiError.conflict(
        `The ${data.scheduledTime} time slot on ${scheduledDate.toLocaleDateString()} is already booked for ${property.name}. Please select another time slot.`,
      );
    }

    // 3. Atomic creation & CRM pipeline synchronization
    const visit = await prisma.$transaction(async (tx) => {
      const newVisit = await tx.siteVisit.create({
        data: {
          propertyId: property.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          scheduledDate,
          scheduledTime: data.scheduledTime,
          timezone: data.timezone,
          visitType: data.visitType,
          notes: data.notes,
          status: "CONFIRMED",
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
            },
          },
        },
      });

      // If converting an existing inquiry, link & update rather than creating a duplicate
      if (data.inquiryId) {
        const existingInquiry = await tx.inquiry.findUnique({
          where: { id: data.inquiryId },
        });

        if (existingInquiry) {
          await tx.inquiry.update({
            where: { id: existingInquiry.id },
            data: {
              status: "SITE_VISIT_SCHEDULED",
              followUpDate: scheduledDate,
              followUpNotes: `Site inspection booked for ${data.scheduledTime}`,
            },
          });

          await tx.inquiryTimeline.create({
            data: {
              inquiryId: existingInquiry.id,
              fromStatus: existingInquiry.status,
              toStatus: "SITE_VISIT_SCHEDULED",
              note: `Private inspection booked for ${scheduledDate.toLocaleDateString()} at ${data.scheduledTime}`,
              changedById: req.user?.id || null,
            },
          });
        }
      } else {
        // Auto-log as new qualified inquiry in the CRM pipeline
        await tx.inquiry.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            investmentType: "real-estate",
            investmentRange: `${property.currency} ${Number(property.price).toLocaleString()}`,
            currency: property.currency,
            propertyId: property.id,
            source: "SITE_VISIT_MODAL",
            status: "SITE_VISIT_SCHEDULED",
            assignedAgentId:
              req.user?.role === Role.CHANNEL_PARTNER ? req.user.id : undefined,
            followUpDate: scheduledDate,
            followUpNotes: `Site inspection booked for ${data.scheduledTime}`,
            notes: `Private inspection requested for ${property.name} on ${scheduledDate.toLocaleDateString()} at ${data.scheduledTime}. Client note: ${data.notes || "None"}`,
            timeline: {
              create: {
                fromStatus: "NEW",
                toStatus: "SITE_VISIT_SCHEDULED",
                note: `Inspection scheduled for ${scheduledDate.toLocaleDateString()} at ${data.scheduledTime}`,
                changedById: req.user?.id || null,
              },
            },
          },
        });
      }

      return newVisit;
    });

    // Send confirmation email (non-blocking)
    sendSiteVisitConfirmationEmail({
      name: visit.name,
      email: visit.email,
      propertyName: property.name,
      scheduledDate: scheduledDate.toLocaleDateString(),
      scheduledTime: visit.scheduledTime,
    }).catch((err) => console.error("Email dispatch failed:", err));

    return res.status(201).json(
      ApiResponse.created(
        visit,
        "Site inspection booked successfully. Check your email for full itinerary.",
      ),
    );
  },
);

/**
 * @desc    Get all booked site visits
 * @route   GET /api/v1/site-visits
 * @access  Protected (Super Admin & Channel Partner)
 */
export const getSiteVisits = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = req.query as unknown as SiteVisitFilterQuery;
    const { propertyId, status, search, page = 1, limit = 20 } = filters;

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    // Channel Partner Data Isolation: Only show visits for their properties or their registered visits
    if (req.user?.role === Role.CHANNEL_PARTNER) {
      where.OR = [
        { email: req.user.email },
        { property: { adminId: req.user.id } },
      ];
    }

    if (search) {
      const searchConditions = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [total, visits] = await Promise.all([
      prisma.siteVisit.count({ where }),
      prisma.siteVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: "asc" },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              slug: true,
              location: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
      ApiResponse.ok(visits, "Site visits retrieved successfully", {
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
 * @desc    Get single site visit details
 * @route   GET /api/v1/site-visits/:id
 * @access  Protected (Super Admin & Channel Partner)
 */
export const getSiteVisitById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const visit = await prisma.siteVisit.findUnique({
      where: { id },
      include: {
        property: true,
      },
    });

    if (!visit) {
      throw ApiError.notFound(`Site visit with id '${id}' not found`);
    }

    // Restrict Channel Partners to their own site visits or properties
    if (
      req.user?.role === Role.CHANNEL_PARTNER &&
      visit.email !== req.user.email &&
      visit.property.adminId !== req.user.id
    ) {
      throw ApiError.forbidden(
        "Access denied. You can only view site visits for your partner account or properties.",
      );
    }

    return res.status(200).json(
      ApiResponse.ok(visit, "Site visit details retrieved successfully"),
    );
  },
);

/**
 * @desc    Update site visit status or reschedule
 * @route   PATCH /api/v1/site-visits/:id/status
 * @access  Protected (Super Admin & Channel Partner)
 */
export const updateSiteVisitStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, scheduledDate, scheduledTime, notes } =
      req.body as UpdateSiteVisitStatusInput;

    const visit = await prisma.siteVisit.findUnique({
      where: { id },
    });

    if (!visit) {
      throw ApiError.notFound(`Site visit with id '${id}' not found`);
    }

    const dataToUpdate: Record<string, unknown> = {
      status,
      notes: notes !== undefined ? notes : visit.notes,
    };

    if (scheduledDate) {
      const parsed = new Date(scheduledDate);
      if (!isNaN(parsed.getTime())) {
        dataToUpdate.scheduledDate = parsed;
      }
    }

    if (scheduledTime) {
      dataToUpdate.scheduledTime = scheduledTime;
    }

    const updated = await prisma.siteVisit.update({
      where: { id },
      data: dataToUpdate,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Site visit status updated successfully"),
    );
  },
);

/**
 * @desc    Get available time slots for a property on a given date
 * @route   GET /api/v1/site-visits/slots
 * @access  Public
 */
export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, date } = req.query as {
      propertyId?: string;
      date?: string;
    };

    const allSlots = [
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
    ];

    if (!date) {
      return res.status(200).json(
        ApiResponse.ok(
          {
            allSlots,
            bookedSlots: [],
            availableSlots: allSlots,
          },
          "Available slots retrieved",
        ),
      );
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw ApiError.badRequest("Invalid date parameter format");
    }

    // Define day boundaries
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = {
      scheduledDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "CANCELLED" },
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const bookedVisits = await prisma.siteVisit.findMany({
      where,
      select: { scheduledTime: true },
    });

    const bookedSlots = bookedVisits.map((v) => v.scheduledTime);
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    return res.status(200).json(
      ApiResponse.ok(
        {
          allSlots,
          bookedSlots,
          availableSlots,
        },
        "Available inspection slots retrieved successfully",
      ),
    );
  },
);
