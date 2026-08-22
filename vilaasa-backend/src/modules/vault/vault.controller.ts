import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { LoginInput } from "../auth/auth.schema";
import {
  CreateVaultAssetInput,
  UpdateVaultAssetInput,
  QuickUpdateValuationInput,
} from "./vault.schema";

const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, id: userId, email, role },
    process.env.JWT_SECRET || "default_jwt_secret",
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any },
  );
};

/**
 * @desc    Dedicated investor authentication for The Vault portal
 * @route   POST /api/v1/vault/login
 * @access  Public
 */
export const vaultLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account is deactivated. Contact admin.");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Strict Role Gate
  if (user.role === Role.CHANNEL_PARTNER) {
    throw ApiError.forbidden(
      "Access restricted to Vault investors. Please use the partner portal.",
    );
  }

  if (user.role === Role.SUPER_ADMIN) {
    throw ApiError.forbidden("Administrators cannot access the Vault portal.");
  }

  if (user.role !== Role.VAULT_CLIENT) {
    throw ApiError.forbidden("Access restricted to Vault investors.");
  }

  const token = generateToken(user.id, user.email, user.role);

  const userProfile = {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    phoneCode: user.phoneCode,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  return res.status(200).json(
    ApiResponse.ok(
      { user: userProfile, token },
      "Authenticated with The Vault successfully",
    ),
  );
});

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
      // Empty portfolio state for new sessions
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
          community: a.property.location.community,
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
 * @desc    Get single vault asset detail by ID
 * @route   GET /api/v1/vault/assets/:id
 * @access  Protected (Investor / Super Admin)
 */
export const getVaultAssetById = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required");
    }

    const { id } = req.params;

    const asset = await prisma.vaultAsset.findUnique({
      where: { id },
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
          include: {
            location: true,
            media: true,
          },
        },
      },
    });

    if (!asset) {
      throw ApiError.notFound(`Vault asset with id '${id}' not found`);
    }

    // Role Gate: Only asset owner or SUPER_ADMIN can view
    if (req.user.role !== Role.SUPER_ADMIN && req.user.id !== asset.userId) {
      throw ApiError.forbidden("Access denied to this vault asset");
    }

    const purchase = Number(asset.purchasePrice);
    const current = Number(asset.currentValuation);
    const rental = Number(asset.monthlyRentalYield || 0);
    const appreciation = current - purchase;
    const appreciationPercent =
      purchase > 0 ? parseFloat(((appreciation / purchase) * 100).toFixed(2)) : 0;

    const formattedAsset = {
      id: asset.id,
      unitNumber: asset.unitNumber,
      occupancyStatus: asset.occupancyStatus,
      purchaseDate: asset.purchaseDate,
      purchasePrice: purchase,
      currentValuation: current,
      monthlyRentalYield: rental,
      appreciation,
      appreciationPercent,
      user: asset.user,
      property: {
        id: asset.property.id,
        name: asset.property.name,
        slug: asset.property.slug,
        type: asset.property.type,
        currency: asset.property.currency,
        location: {
          city: asset.property.location.city,
          country: asset.property.location.country,
          community: asset.property.location.community,
        },
        media: asset.property.media.map((m) => ({
          url: m.url,
          isFeatured: m.isFeatured,
        })),
      },
    };

    return res.status(200).json(
      ApiResponse.ok(formattedAsset, "Vault asset retrieved successfully"),
    );
  },
);

/**
 * @desc    Get all vault assets across the firm (with optional propertyId filter & pagination)
 * @route   GET /api/v1/vault/assets
 * @access  Protected (Super Admin)
 */
export const getAllVaultAssets = asyncHandler(
  async (req: Request, res: Response) => {
    const { propertyId, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    interface VaultWhereClause {
      propertyId?: string;
    }
    const where: VaultWhereClause = {};
    if (propertyId && typeof propertyId === "string" && propertyId.trim()) {
      where.propertyId = propertyId.trim();
    }

    const [total, assets] = await Promise.all([
      prisma.vaultAsset.count({ where }),
      prisma.vaultAsset.findMany({
        where,
        skip,
        take: limitNum,
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
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json(
      ApiResponse.ok(
        assets,
        "All vault holdings retrieved successfully",
        {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      ),
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

/**
 * @desc    Get firm-wide aggregate Vault portfolio metrics
 * @route   GET /api/v1/vault/admin/overview
 * @access  Protected (Super Admin)
 */
export const getAdminVaultOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const assets = await prisma.vaultAsset.findMany();

    let totalAum = 0;
    let totalInvested = 0;
    let totalMonthlyRental = 0;
    const investorSet = new Set<string>();

    const byOccupancy = {
      OCCUPIED: 0,
      VACANT: 0,
      UNDER_MAINTENANCE: 0,
    };

    for (const a of assets) {
      const current = Number(a.currentValuation);
      const purchase = Number(a.purchasePrice);
      const rent = Number(a.monthlyRentalYield || 0);

      totalAum += current;
      totalInvested += purchase;
      totalMonthlyRental += rent;
      investorSet.add(a.userId);

      const status = a.occupancyStatus as
        | "OCCUPIED"
        | "VACANT"
        | "UNDER_MAINTENANCE";
      if (byOccupancy[status] !== undefined) {
        byOccupancy[status]++;
      } else {
        byOccupancy.OCCUPIED++;
      }
    }

    const totalAppreciation = totalAum - totalInvested;
    const appreciationPercent =
      totalInvested > 0
        ? parseFloat(((totalAppreciation / totalInvested) * 100).toFixed(2))
        : 0;

    const annualRentalIncome = totalMonthlyRental * 12;

    return res.status(200).json(
      ApiResponse.ok(
        {
          totalAum,
          totalInvested,
          totalAppreciation,
          appreciationPercent,
          totalMonthlyRental,
          annualRentalIncome,
          totalInvestors: investorSet.size,
          totalUnits: assets.length,
          byOccupancy,
        },
        "Admin vault overview retrieved successfully",
      ),
    );
  },
);

/**
 * @desc    Get all vault asset allocations with search and filters
 * @route   GET /api/v1/vault/admin/assets
 * @access  Protected (Super Admin)
 */
export const getAdminAllVaultAssets = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      userId,
      propertyId,
      occupancyStatus,
      search,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.VaultAssetWhereInput = {};

    if (userId && typeof userId === "string" && userId.trim()) {
      where.userId = userId.trim();
    }

    if (propertyId && typeof propertyId === "string" && propertyId.trim()) {
      where.propertyId = propertyId.trim();
    }

    if (
      occupancyStatus &&
      typeof occupancyStatus === "string" &&
      occupancyStatus.trim()
    ) {
      where.occupancyStatus = occupancyStatus.trim();
    }

    if (search && typeof search === "string" && search.trim()) {
      const s = search.trim();
      where.OR = [
        { unitNumber: { contains: s, mode: "insensitive" } },
        { user: { name: { contains: s, mode: "insensitive" } } },
        { user: { email: { contains: s, mode: "insensitive" } } },
        { property: { name: { contains: s, mode: "insensitive" } } },
      ];
    }

    const [total, rawAssets] = await Promise.all([
      prisma.vaultAsset.count({ where }),
      prisma.vaultAsset.findMany({
        where,
        skip,
        take: limitNum,
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
              type: true,
              currency: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedAssets = rawAssets.map((a) => {
      const purchase = Number(a.purchasePrice);
      const current = Number(a.currentValuation);
      const rent = Number(a.monthlyRentalYield || 0);
      const appreciation = current - purchase;
      const appreciationPercent =
        purchase > 0
          ? parseFloat(((appreciation / purchase) * 100).toFixed(2))
          : 0;

      return {
        id: a.id,
        userId: a.userId,
        propertyId: a.propertyId,
        unitNumber: a.unitNumber,
        purchaseDate: a.purchaseDate,
        purchasePrice: purchase,
        currentValuation: current,
        monthlyRentalYield: rent,
        appreciation,
        appreciationPercent,
        occupancyStatus: a.occupancyStatus,
        user: a.user,
        property: a.property,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json(
      ApiResponse.ok(
        formattedAssets,
        "Vault asset allocations retrieved successfully",
        {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      ),
    );
  },
);

/**
 * @desc    Get all VAULT_CLIENT investors with aggregated portfolio summaries
 * @route   GET /api/v1/vault/admin/investors
 * @access  Protected (Super Admin)
 */
export const getAdminInvestors = asyncHandler(
  async (req: Request, res: Response) => {
    const { search, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.UserWhereInput = {
      role: Role.VAULT_CLIENT,
    };

    if (search && typeof search === "string" && search.trim()) {
      const s = search.trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          vaultAssets: {
            select: {
              id: true,
              purchasePrice: true,
              currentValuation: true,
              monthlyRentalYield: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedInvestors = users.map((u) => {
      let totalInvested = 0;
      let currentValue = 0;
      let monthlyRental = 0;

      for (const a of u.vaultAssets) {
        totalInvested += Number(a.purchasePrice);
        currentValue += Number(a.currentValuation);
        monthlyRental += Number(a.monthlyRentalYield || 0);
      }

      const totalAppreciation = currentValue - totalInvested;
      const appreciationPercent =
        totalInvested > 0
          ? parseFloat(((totalAppreciation / totalInvested) * 100).toFixed(2))
          : 0;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        phoneCode: u.phoneCode,
        isActive: u.isActive,
        createdAt: u.createdAt,
        totalUnits: u.vaultAssets.length,
        totalInvested,
        currentValue,
        totalAppreciation,
        appreciationPercent,
        monthlyRental,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json(
      ApiResponse.ok(
        formattedInvestors,
        "Vault investors retrieved successfully",
        {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      ),
    );
  },
);

/**
 * @desc    Quick-update only valuation and rental yield for a vault asset
 * @route   PATCH /api/v1/vault/admin/assets/:id/valuation
 * @access  Protected (Super Admin)
 */
export const quickUpdateValuation = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { currentValuation, monthlyRentalYield } =
      req.body as QuickUpdateValuationInput;

    const asset = await prisma.vaultAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw ApiError.notFound(`Vault asset with id '${id}' not found`);
    }

    const updated = await prisma.vaultAsset.update({
      where: { id },
      data: {
        currentValuation,
        ...(monthlyRentalYield !== undefined ? { monthlyRentalYield } : {}),
      },
      include: {
        property: {
          select: { id: true, name: true, slug: true, currency: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Asset valuation updated successfully"),
    );
  },
);
