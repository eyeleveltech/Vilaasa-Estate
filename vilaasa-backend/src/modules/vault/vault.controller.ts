import { Request, Response } from "express";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreateVaultAssetInput,
  UpdateVaultAssetInput,
} from "./vault.schema";

/**
 * @desc    Get currently authenticated investor's Vault portfolio & metrics
 * @route   GET /api/v1/vault/portfolio
 * @access  Protected (Client / Investor)
 */
export const getMyPortfolio = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required to access The Vault");
    }

    // Find user by id or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: req.user.id }, { email: req.user.email }],
      },
    });

    if (!user) {
      // Empty portfolio state for new OTP guest sessions
      return res.status(200).json(
        ApiResponse.ok(
          {
            summary: {
              totalPortfolioValue: 0,
              totalInvested: 0,
              totalAppreciation: 0,
              appreciationPercent: 0,
              totalMonthlyRental: 0,
              annualizedYieldPercent: 0,
              totalUnits: 0,
            },
            assets: [],
          },
          "Investor portfolio retrieved successfully",
        ),
      );
    }

    const assets = await prisma.vaultAsset.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: {
            location: true,
            media: {
              where: { isFeatured: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { purchaseDate: "desc" },
    });

    let totalInvested = 0;
    let totalPortfolioValue = 0;
    let totalMonthlyRental = 0;

    const formattedAssets = assets.map((a) => {
      const purchase = Number(a.purchasePrice);
      const current = Number(a.currentValuation);
      const rental = Number(a.monthlyRentalYield || 0);

      totalInvested += purchase;
      totalPortfolioValue += current;
      totalMonthlyRental += rental;

      const appreciation = current - purchase;
      const appreciationPct =
        purchase > 0 ? ((appreciation / purchase) * 100).toFixed(2) : "0.00";

      return {
        id: a.id,
        unitNumber: a.unitNumber,
        occupancyStatus: a.occupancyStatus,
        purchaseDate: a.purchaseDate,
        purchasePrice: purchase,
        currentValuation: current,
        monthlyRentalYield: rental,
        appreciation,
        appreciationPercent: parseFloat(appreciationPct),
        property: {
          id: a.property.id,
          slug: a.property.slug,
          name: a.property.name,
          type: a.property.type,
          currency: a.property.currency,
          city: a.property.location.city,
          country: a.property.location.country,
          heroImage: a.property.media[0]?.url || null,
        },
      };
    });

    const totalAppreciation = totalPortfolioValue - totalInvested;
    const appreciationPercent =
      totalInvested > 0
        ? parseFloat(((totalAppreciation / totalInvested) * 100).toFixed(2))
        : 0;

    const annualizedYieldPercent =
      totalPortfolioValue > 0
        ? parseFloat(
            (((totalMonthlyRental * 12) / totalPortfolioValue) * 100).toFixed(2),
          )
        : 0;

    return res.status(200).json(
      ApiResponse.ok(
        {
          summary: {
            totalPortfolioValue,
            totalInvested,
            totalAppreciation,
            appreciationPercent,
            totalMonthlyRental,
            annualizedYieldPercent,
            totalUnits: formattedAssets.length,
          },
          assets: formattedAssets,
        },
        "Investor portfolio retrieved successfully",
      ),
    );
  },
);

/**
 * @desc    Get all vault assets across the firm
 * @route   GET /api/v1/vault/assets
 * @access  Protected (Super Admin)
 */
export const getAllVaultAssets = asyncHandler(
  async (_req: Request, res: Response) => {
    const assets = await prisma.vaultAsset.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(
      ApiResponse.ok(assets, "All vault holdings retrieved successfully"),
    );
  },
);

/**
 * @desc    Assign a property asset to an investor portfolio
 * @route   POST /api/v1/vault/assets
 * @access  Protected (Super Admin)
 */
export const createVaultAsset = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreateVaultAssetInput;

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw ApiError.notFound(`Investor user with id '${data.userId}' not found`);
    }

    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      throw ApiError.notFound(`Property with id '${data.propertyId}' not found`);
    }

    const asset = await prisma.vaultAsset.create({
      data: {
        userId: data.userId,
        propertyId: data.propertyId,
        unitNumber: data.unitNumber,
        purchaseDate: new Date(data.purchaseDate),
        purchasePrice: data.purchasePrice,
        currentValuation: data.currentValuation,
        monthlyRentalYield: data.monthlyRentalYield || 0,
        occupancyStatus: data.occupancyStatus,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return res.status(201).json(
      ApiResponse.created(asset, "Asset assigned to investor vault successfully"),
    );
  },
);

/**
 * @desc    Update vault asset valuation or rental income
 * @route   PUT /api/v1/vault/assets/:id
 * @access  Protected (Super Admin)
 */
export const updateVaultAsset = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateVaultAssetInput;

    const asset = await prisma.vaultAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw ApiError.notFound(`Vault asset with id '${id}' not found`);
    }

    const updated = await prisma.vaultAsset.update({
      where: { id },
      data: {
        unitNumber: data.unitNumber !== undefined ? data.unitNumber : asset.unitNumber,
        currentValuation:
          data.currentValuation !== undefined
            ? data.currentValuation
            : asset.currentValuation,
        monthlyRentalYield:
          data.monthlyRentalYield !== undefined
            ? data.monthlyRentalYield
            : asset.monthlyRentalYield,
        occupancyStatus:
          data.occupancyStatus !== undefined
            ? data.occupancyStatus
            : asset.occupancyStatus,
      },
      include: {
        property: true,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Vault asset updated successfully"),
    );
  },
);

/**
 * @desc    Delete vault asset
 * @route   DELETE /api/v1/vault/assets/:id
 * @access  Protected (Super Admin)
 */
export const deleteVaultAsset = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const asset = await prisma.vaultAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw ApiError.notFound(`Vault asset with id '${id}' not found`);
    }

    await prisma.vaultAsset.delete({
      where: { id },
    });

    return res.status(200).json(
      ApiResponse.ok(null, "Vault asset removed successfully"),
    );
  },
);
