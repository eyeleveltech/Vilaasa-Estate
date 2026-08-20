import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreateInquiryInput,
  UpdateInquiryStatusInput,
  InquiryFilterQuery,
} from "./inquiry.schema";

/**
 * @desc    Submit a new property / investment inquiry
 * @route   POST /api/v1/inquiries
 * @access  Public
 */
export const createInquiry = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateInquiryInput;

    if (data.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: data.propertyId },
      });
      if (!property) {
        throw ApiError.badRequest(
          `Referenced property with id '${data.propertyId}' does not exist`,
        );
      }
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        investmentType: data.investmentType,
        investmentRange: data.investmentRange,
        currency: data.currency,
        propertyId: data.propertyId,
        source: data.source,
        utmSource: data.utmSource,
        utmCampaign: data.utmCampaign,
        notes: data.notes,
      },
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

    return res.status(201).json(
      ApiResponse.created(
        inquiry,
        "Inquiry submitted successfully. Our luxury advisory team will contact you shortly.",
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
      search,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.InquiryWhereInput = {};

    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;
    if (source) where.source = source;

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
            },
          },
          assignedAgent: {
            select: {
              id: true,
              name: true,
              email: true,
            },
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
 * @desc    Update inquiry status & assigned agent
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
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Inquiry status updated successfully"),
    );
  },
);
