import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";

export const FinancialMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
  note: z.string().optional(),
  icon: z.string().optional(),
});

export const UpdateFinancialMetricSchema = FinancialMetricSchema.partial();

export type FinancialMetricInput = z.infer<typeof FinancialMetricSchema>;
export type UpdateFinancialMetricInput = z.infer<
  typeof UpdateFinancialMetricSchema
>;

/**
 * @desc    Add a financial metric to a property
 * @route   POST /api/v1/properties/:propertyId/financials
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const addFinancialMetric = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const data = req.body as FinancialMetricInput;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with id '${propertyId}' not found`);
    }

    const metric = await prisma.propertyFinancialMetric.create({
      data: {
        propertyId,
        label: data.label,
        value: data.value,
        note: data.note,
        icon: data.icon,
      },
    });

    return res.status(201).json(
      ApiResponse.created(
        metric,
        "Financial metric added successfully",
      ),
    );
  },
);

/**
 * @desc    Update a financial metric
 * @route   PUT /api/v1/properties/:propertyId/financials/:metricId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const updateFinancialMetric = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, metricId } = req.params;
    const data = req.body as UpdateFinancialMetricInput;

    const existing = await prisma.propertyFinancialMetric.findFirst({
      where: { id: metricId, propertyId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Financial metric '${metricId}' not found for property '${propertyId}'`,
      );
    }

    const updated = await prisma.propertyFinancialMetric.update({
      where: { id: metricId },
      data: {
        label: data.label,
        value: data.value,
        note: data.note,
        icon: data.icon,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Financial metric updated successfully"),
    );
  },
);

/**
 * @desc    Delete a financial metric
 * @route   DELETE /api/v1/properties/:propertyId/financials/:metricId
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const deleteFinancialMetric = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, metricId } = req.params;

    const existing = await prisma.propertyFinancialMetric.findFirst({
      where: { id: metricId, propertyId },
    });

    if (!existing) {
      throw ApiError.notFound(
        `Financial metric '${metricId}' not found for property '${propertyId}'`,
      );
    }

    await prisma.propertyFinancialMetric.delete({
      where: { id: metricId },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Financial metric deleted successfully"),
    );
  },
);
