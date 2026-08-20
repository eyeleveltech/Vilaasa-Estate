import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { CreateAmenityInput, AssignAmenityInput } from "./amenity.schema";

/**
 * @desc    Get all amenities grouped by category
 * @route   GET /api/v1/amenities
 * @access  Public
 */
export const getAllAmenities = asyncHandler(
  async (_req: Request, res: Response) => {
    const amenities = await prisma.amenity.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    interface AmenityItem {
      id: string;
      name: string;
      iconKey: string;
      category: string | null;
    }

    const grouped = amenities.reduce<Record<string, AmenityItem[]>>(
      (acc: Record<string, AmenityItem[]>, amenity: AmenityItem) => {
        const cat = (amenity.category || "other").toLowerCase();
        if (!acc[cat]) {
          acc[cat] = [];
        }
        acc[cat].push(amenity);
        return acc;
      },
      {},
    );

    return res.status(200).json(
      ApiResponse.ok(grouped, "Amenities catalog retrieved successfully"),
    );
  },
);

/**
 * @desc    Create a new luxury amenity
 * @route   POST /api/v1/amenities
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const createAmenity = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateAmenityInput;

    const existing = await prisma.amenity.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw ApiError.badRequest(`Amenity '${data.name}' already exists`);
    }

    const amenity = await prisma.amenity.create({
      data: {
        name: data.name,
        iconKey: data.iconKey,
        category: data.category,
      },
    });

    return res.status(201).json(
      ApiResponse.created(amenity, "Amenity created successfully"),
    );
  },
);

/**
 * @desc    Assign an amenity to a property
 * @route   POST /api/v1/properties/:propertyId/amenities
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const assignAmenityToProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const { amenityId, description } = req.body as AssignAmenityInput;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const amenity = await prisma.amenity.findUnique({
      where: { id: amenityId },
    });

    if (!amenity) {
      throw ApiError.notFound(`Amenity with id '${amenityId}' not found`);
    }

    try {
      const assignment = await prisma.propertyOnAmenity.create({
        data: {
          propertyId,
          amenityId,
          description,
        },
        include: {
          amenity: true,
        },
      });

      return res.status(201).json(
        ApiResponse.created(
          assignment,
          "Amenity assigned to property successfully",
        ),
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        throw new ApiError(409, "This amenity is already assigned to this property");
      }
      throw error;
    }
  },
);

/**
 * @desc    Remove an amenity from a property
 * @route   DELETE /api/v1/properties/:propertyId/amenities/:amenityId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const removeAmenityFromProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, amenityId } = req.params;

    const existing = await prisma.propertyOnAmenity.findUnique({
      where: {
        propertyId_amenityId: {
          propertyId,
          amenityId,
        },
      },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Amenity assignment not found for property '${propertyId}' and amenity '${amenityId}'`,
      );
    }

    await prisma.propertyOnAmenity.delete({
      where: {
        propertyId_amenityId: {
          propertyId,
          amenityId,
        },
      },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Amenity removed from property successfully"),
    );
  },
);
