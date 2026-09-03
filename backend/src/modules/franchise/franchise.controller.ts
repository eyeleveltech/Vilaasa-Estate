import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

/**
 * @desc    Get franchise page content by property ID or slug
 * @route   GET /api/v1/franchise/:propertyId/page
 * @access  Public
 */
export const getFranchisePage = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;

    // Resolve property by ID or Slug
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: propertyId }, { slug: propertyId }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (!property) {
      throw ApiError.notFound("Franchise property not found");
    }

    const page = await prisma.franchisePage.findUnique({
      where: { propertyId: property.id },
    });

    return res.status(200).json(
      ApiResponse.ok(page || null, "Franchise page content retrieved successfully"),
    );
  },
);

/**
 * @desc    Upsert franchise page content
 * @route   PUT /api/v1/franchise/:propertyId/page
 * @access  Protected (SUPER_ADMIN only)
 */
export const upsertFranchisePage = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body;

    // Resolve property
    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id: propertyId }, { slug: propertyId }],
      },
      select: { id: true },
    });

    if (!property) {
      throw ApiError.notFound("Franchise property not found");
    }

    // Clean data (prevent id or propertyId collisions in payload)
    const { id, propertyId: _, createdAt, updatedAt, ...updateData } = data;

    const page = await prisma.franchisePage.upsert({
      where: { propertyId: property.id },
      update: updateData,
      create: {
        propertyId: property.id,
        ...updateData,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(page, "Franchise page content saved successfully"),
    );
  },
);
