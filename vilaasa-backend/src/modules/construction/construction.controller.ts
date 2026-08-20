import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  UpdateConstructionInput,
  MilestoneInput,
  UpdateMilestoneInput,
  GalleryItemInput,
} from "./construction.schema";

/**
 * @desc    Get construction progress, milestones, and gallery for a property
 * @route   GET /api/v1/construction/:propertyId
 * @access  Public
 */
export const getConstructionAsset = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const asset = await prisma.constructionAsset.findUnique({
      where: { propertyId },
      include: {
        milestones: {
          orderBy: { targetDate: "asc" },
        },
        gallery: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!asset) {
      throw ApiError.notFound(
        `Construction tracking data not initialized for property '${propertyId}'`,
      );
    }

    return res.status(200).json(
      ApiResponse.ok(asset, "Construction data retrieved successfully"),
    );
  },
);

/**
 * @desc    Upsert construction asset progress tracking
 * @route   PUT /api/v1/construction/:propertyId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const upsertConstructionAsset = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body as UpdateConstructionInput;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const asset = await prisma.constructionAsset.upsert({
      where: { propertyId },
      update: {
        structureProgress: data.structureProgress,
        interiorProgress: data.interiorProgress,
        overallProgress: data.overallProgress,
        lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : new Date(),
      },
      create: {
        propertyId,
        structureProgress: data.structureProgress,
        interiorProgress: data.interiorProgress,
        overallProgress: data.overallProgress,
        lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : new Date(),
      },
      include: {
        milestones: true,
        gallery: true,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(asset, "Construction asset progress updated successfully"),
    );
  },
);

/**
 * @desc    Add a milestone to property construction
 * @route   POST /api/v1/construction/:propertyId/milestones
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const addMilestone = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body as MilestoneInput;

    let asset = await prisma.constructionAsset.findUnique({
      where: { propertyId },
    });

    if (!asset) {
      asset = await prisma.constructionAsset.create({
        data: { propertyId },
      });
    }

    await prisma.constructionMilestone.create({
      data: {
        constructionAssetId: asset.id,
        name: data.name,
        status: data.status,
        targetDate: new Date(data.targetDate),
      },
    });

    const updatedMilestones = await prisma.constructionMilestone.findMany({
      where: { constructionAssetId: asset.id },
      orderBy: { targetDate: "asc" },
    });

    return res.status(201).json(
      ApiResponse.created(
        updatedMilestones,
        "Construction milestone added successfully",
      ),
    );
  },
);

/**
 * @desc    Update a construction milestone
 * @route   PUT /api/v1/construction/:propertyId/milestones/:milestoneId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const updateMilestone = asyncHandler(
  async (req: Request, res: Response) => {
    const { milestoneId } = req.params;
    const data = req.body as UpdateMilestoneInput;

    const existing = await prisma.constructionMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!existing) {
      throw ApiError.notFound(`Milestone with id '${milestoneId}' not found`);
    }

    const updated = await prisma.constructionMilestone.update({
      where: { id: milestoneId },
      data: {
        name: data.name,
        status: data.status,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Construction milestone updated successfully"),
    );
  },
);

/**
 * @desc    Delete a construction milestone
 * @route   DELETE /api/v1/construction/:propertyId/milestones/:milestoneId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const deleteMilestone = asyncHandler(
  async (req: Request, res: Response) => {
    const { milestoneId } = req.params;

    const existing = await prisma.constructionMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!existing) {
      throw ApiError.notFound(`Milestone with id '${milestoneId}' not found`);
    }

    await prisma.constructionMilestone.delete({
      where: { id: milestoneId },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Milestone deleted successfully"),
    );
  },
);

/**
 * @desc    Add an image to construction site gallery
 * @route   POST /api/v1/construction/:propertyId/gallery
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const addGalleryItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body as GalleryItemInput;

    let asset = await prisma.constructionAsset.findUnique({
      where: { propertyId },
    });

    if (!asset) {
      asset = await prisma.constructionAsset.create({
        data: { propertyId },
      });
    }

    const item = await prisma.constructionGalleryItem.create({
      data: {
        constructionAssetId: asset.id,
        imageUrl: data.imageUrl,
        date: data.date ? new Date(data.date) : new Date(),
        caption: data.caption,
      },
    });

    return res.status(201).json(
      ApiResponse.created(
        item,
        "Construction gallery photo added successfully",
      ),
    );
  },
);

/**
 * @desc    Delete a construction site gallery photo
 * @route   DELETE /api/v1/construction/:propertyId/gallery/:itemId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const deleteGalleryItem = asyncHandler(
  async (req: Request, res: Response) => {
    const { itemId } = req.params;

    const existing = await prisma.constructionGalleryItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Gallery photo item with id '${itemId}' not found`,
      );
    }

    await prisma.constructionGalleryItem.delete({
      where: { id: itemId },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Gallery photo removed successfully"),
    );
  },
);
