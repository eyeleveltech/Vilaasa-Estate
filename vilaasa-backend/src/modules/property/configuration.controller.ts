import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const ConfigurationSchema = z.object({
  unitType: z.string().min(1, "Unit type is required"),
  areaSqFt: z.number().positive("Area must be a positive number"),
  viewType: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  isAvailable: z.boolean().default(true),
  floorPlanUrl: z.string().url().optional().or(z.literal("")),
});

export const UpdateConfigurationSchema = ConfigurationSchema.partial();

export type ConfigurationInput = z.infer<typeof ConfigurationSchema>;
export type UpdateConfigurationInput = z.infer<typeof UpdateConfigurationSchema>;

/**
 * @desc    Add a unit configuration to a property
 * @route   POST /api/v1/properties/:propertyId/configurations
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const addConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body as ConfigurationInput;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const config = await prisma.propertyConfiguration.create({
      data: {
        propertyId,
        unitType: data.unitType,
        areaSqFt: data.areaSqFt,
        viewType: data.viewType,
        price: data.price,
        isAvailable: data.isAvailable ?? true,
        floorPlanUrl: data.floorPlanUrl,
      },
    });

    return res.status(201).json(
      ApiResponse.created(
        config,
        "Unit configuration added successfully",
      ),
    );
  },
);

/**
 * @desc    Update a unit configuration
 * @route   PUT /api/v1/properties/:propertyId/configurations/:configId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const updateConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, configId } = req.params;
    const data = req.body as UpdateConfigurationInput;

    const existing = await prisma.propertyConfiguration.findFirst({
      where: { id: configId, propertyId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Configuration '${configId}' not found for property '${propertyId}'`,
      );
    }

    const updated = await prisma.propertyConfiguration.update({
      where: { id: configId },
      data: {
        unitType: data.unitType,
        areaSqFt: data.areaSqFt,
        viewType: data.viewType,
        price: data.price,
        isAvailable: data.isAvailable,
        floorPlanUrl: data.floorPlanUrl,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Configuration updated successfully"),
    );
  },
);

/**
 * @desc    Delete a unit configuration
 * @route   DELETE /api/v1/properties/:propertyId/configurations/:configId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const deleteConfiguration = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, configId } = req.params;

    const existing = await prisma.propertyConfiguration.findFirst({
      where: { id: configId, propertyId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Configuration '${configId}' not found for property '${propertyId}'`,
      );
    }

    await prisma.propertyConfiguration.delete({
      where: { id: configId },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Configuration deleted successfully"),
    );
  },
);
