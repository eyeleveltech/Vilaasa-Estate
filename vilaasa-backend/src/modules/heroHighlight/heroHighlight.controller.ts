import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreateHeroHighlightInput,
  UpdateHeroHighlightInput,
} from "./heroHighlight.schema";

/**
 * @desc    Get active Hero Highlights for homepage (public, max 3)
 * @route   GET /api/v1/hero-highlights
 * @access  Public
 */
export const getPublicHeroHighlights = asyncHandler(
  async (_req: Request, res: Response) => {
    const highlights = await prisma.heroHighlight.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 3,
    });

    return res.status(200).json(
      ApiResponse.ok(highlights, "Hero highlights retrieved successfully"),
    );
  },
);

/**
 * @desc    Get all Hero Highlights for Admin management
 * @route   GET /api/v1/hero-highlights/admin
 * @access  Protected (Super Admin)
 */
export const getAdminHeroHighlights = asyncHandler(
  async (_req: Request, res: Response) => {
    const highlights = await prisma.heroHighlight.findMany({
      orderBy: { order: "asc" },
    });

    return res.status(200).json(
      ApiResponse.ok(highlights, "All hero highlights retrieved successfully"),
    );
  },
);

/**
 * @desc    Create a new Hero Highlight
 * @route   POST /api/v1/hero-highlights
 * @access  Protected (Super Admin)
 */
export const createHeroHighlight = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateHeroHighlightInput;

    // Check count of active highlights if trying to create active
    if (data.isActive !== false) {
      const activeCount = await prisma.heroHighlight.count({
        where: { isActive: true },
      });

      if (activeCount >= 3) {
        throw ApiError.badRequest(
          "Maximum of 3 active hero highlights allowed. Please deactivate or remove an existing highlight first.",
        );
      }
    }

    const highlight = await prisma.heroHighlight.create({
      data: {
        name: data.name,
        tagline: data.tagline,
        linkUrl: data.linkUrl,
        icon: data.icon || "hotel_class",
        order: data.order || 1,
        isActive: data.isActive !== false,
      },
    });

    return res.status(201).json(
      ApiResponse.created(highlight, "Hero highlight created successfully"),
    );
  },
);

/**
 * @desc    Update an existing Hero Highlight
 * @route   PUT /api/v1/hero-highlights/:id
 * @access  Protected (Super Admin)
 */
export const updateHeroHighlight = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateHeroHighlightInput;

    const existing = await prisma.heroHighlight.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound(`Hero highlight with id '${id}' not found`);
    }

    // If activating, verify active count limit
    if (data.isActive === true && !existing.isActive) {
      const activeCount = await prisma.heroHighlight.count({
        where: { isActive: true },
      });

      if (activeCount >= 3) {
        throw ApiError.badRequest(
          "Maximum of 3 active hero highlights allowed. Please deactivate an existing highlight first.",
        );
      }
    }

    const updated = await prisma.heroHighlight.update({
      where: { id },
      data,
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Hero highlight updated successfully"),
    );
  },
);

/**
 * @desc    Delete a Hero Highlight
 * @route   DELETE /api/v1/hero-highlights/:id
 * @access  Protected (Super Admin)
 */
export const deleteHeroHighlight = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.heroHighlight.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound(`Hero highlight with id '${id}' not found`);
    }

    await prisma.heroHighlight.delete({
      where: { id },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Hero highlight deleted successfully"),
    );
  },
);
