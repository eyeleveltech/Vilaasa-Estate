import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const NearbyPlaceSchema = z.object({
  name: z.string().min(1, "Place name is required"),
  distance: z.string().min(1, "Distance is required"),
  category: z.string().optional(),
});

export const UpdateNearbyPlaceSchema = NearbyPlaceSchema.partial();

export type NearbyPlaceInput = z.infer<typeof NearbyPlaceSchema>;
export type UpdateNearbyPlaceInput = z.infer<typeof UpdateNearbyPlaceSchema>;

/**
 * @desc    Get all nearby places for a property grouped by category
 * @route   GET /api/v1/properties/:propertyId/nearby
 * @access  Public
 */
export const getNearbyPlaces = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    interface NearbyPlaceItem {
      id: string;
      propertyId: string;
      name: string;
      distance: string;
      category: string | null;
    }

    const places: NearbyPlaceItem[] = await prisma.nearbyPlace.findMany({
      where: { propertyId },
      orderBy: { name: "asc" },
    });

    const grouped = places.reduce<Record<string, NearbyPlaceItem[]>>(
      (acc: Record<string, NearbyPlaceItem[]>, place: NearbyPlaceItem) => {
        const categoryKey = place.category || "General";
        if (!acc[categoryKey]) acc[categoryKey] = [];
        acc[categoryKey].push(place);
        return acc;
      },
      {},
    );

    return res.status(200).json(
      ApiResponse.ok(grouped, "Nearby places retrieved successfully"),
    );
  },
);

/**
 * @desc    Add a nearby place to a property
 * @route   POST /api/v1/properties/:propertyId/nearby
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const addNearbyPlace = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body as NearbyPlaceInput;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const place = await prisma.nearbyPlace.create({
      data: {
        propertyId,
        name: data.name,
        distance: data.distance,
        category: data.category,
      },
    });

    return res.status(201).json(
      ApiResponse.created(place, "Nearby place added successfully"),
    );
  },
);

/**
 * @desc    Update a nearby place
 * @route   PUT /api/v1/properties/:propertyId/nearby/:placeId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const updateNearbyPlace = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, placeId } = req.params;
    const data = req.body as UpdateNearbyPlaceInput;

    const existing = await prisma.nearbyPlace.findFirst({
      where: { id: placeId, propertyId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Nearby place '${placeId}' not found for property '${propertyId}'`,
      );
    }

    const updated = await prisma.nearbyPlace.update({
      where: { id: placeId },
      data: {
        name: data.name,
        distance: data.distance,
        category: data.category,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Nearby place updated successfully"),
    );
  },
);

/**
 * @desc    Delete a nearby place
 * @route   DELETE /api/v1/properties/:propertyId/nearby/:placeId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const deleteNearbyPlace = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, placeId } = req.params;

    const existing = await prisma.nearbyPlace.findFirst({
      where: { id: placeId, propertyId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Nearby place '${placeId}' not found for property '${propertyId}'`,
      );
    }

    await prisma.nearbyPlace.delete({
      where: { id: placeId },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Nearby place deleted successfully"),
    );
  },
);
