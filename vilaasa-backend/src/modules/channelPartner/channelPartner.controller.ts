import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  RegisterChannelPartnerInput,
  UpdatePartnerStatusInput,
  PartnerFilterQuery,
} from "./channelPartner.schema";
import {
  sendPartnerRegistrationEmail,
  sendPartnerApprovedEmail,
} from "../../services/email.service";

/**
 * @desc    Public Channel Partner application submission
 * @route   POST /api/v1/channel-partners/register
 * @access  Public
 */
export const registerChannelPartner = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as RegisterChannelPartnerInput;

    const existing = await prisma.channelPartner.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw ApiError.badRequest(
        "A channel partner application with this email already exists",
      );
    }

    const partner = await prisma.channelPartner.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        experience: data.experience,
        city: data.city,
        status: "PENDING",
      },
    });

    // Send acknowledgement email (non-blocking)
    sendPartnerRegistrationEmail({
      name: partner.name,
      email: partner.email,
      company: partner.company || undefined,
    }).catch((err) => console.error("Email dispatch failed:", err));

    return res.status(201).json(
      ApiResponse.created(
        partner,
        "Channel partner registration submitted successfully. Institutional onboarding will contact you.",
      ),
    );
  },
);

/**
 * @desc    Get all channel partner applications (Super Admin only)
 * @route   GET /api/v1/channel-partners
 * @access  Protected (Super Admin)
 */
export const getChannelPartners = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = req.query as unknown as PartnerFilterQuery;
    const { status, search, page = 1, limit = 20 } = filters;

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, partners] = await Promise.all([
      prisma.channelPartner.count({ where }),
      prisma.channelPartner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
      ApiResponse.ok(partners, "Channel partners retrieved successfully", {
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
 * @desc    Get single channel partner details
 * @route   GET /api/v1/channel-partners/:id
 * @access  Protected (Super Admin)
 */
export const getChannelPartnerById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const partner = await prisma.channelPartner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw ApiError.notFound(`Channel partner with id '${id}' not found`);
    }

    return res.status(200).json(
      ApiResponse.ok(partner, "Channel partner details retrieved successfully"),
    );
  },
);

/**
 * @desc    Approve or reject channel partner application
 * @route   PATCH /api/v1/channel-partners/:id/status
 * @access  Protected (Super Admin only)
 */
export const updatePartnerStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as UpdatePartnerStatusInput;

    const partner = await prisma.channelPartner.findUnique({
      where: { id },
    });

    if (!partner) {
      throw ApiError.notFound(`Channel partner with id '${id}' not found`);
    }

    let userId = partner.userId;

    // If approving, provision user account if doesn't already exist
    if (status === "APPROVED" && !userId) {
      let existingUser = await prisma.user.findUnique({
        where: { email: partner.email },
      });

      if (!existingUser) {
        // Generate random initial password
        const initialPassword = `Partner@Vilaasa${Math.floor(1000 + Math.random() * 9000)}`;
        const passwordHash = await bcrypt.hash(initialPassword, 12);

        existingUser = await prisma.user.create({
          data: {
            email: partner.email,
            passwordHash,
            name: partner.name,
            phone: partner.phone,
            role: "CHANNEL_PARTNER",
          },
        });
      }

      userId = existingUser.id;

      // Send congratulations / approval email
      sendPartnerApprovedEmail({
        name: partner.name,
        email: partner.email,
      }).catch((err) => console.error("Email dispatch failed:", err));
    }

    const updated = await prisma.channelPartner.update({
      where: { id },
      data: {
        status,
        approvedById: req.user?.id || null,
        userId,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(
        updated,
        `Channel partner application ${status.toLowerCase()} successfully`,
      ),
    );
  },
);
