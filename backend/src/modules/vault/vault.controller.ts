import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { LoginInput } from "../auth/auth.schema";
import {
  CreateVaultAssetInput,
  UpdateVaultAssetInput,
  QuickUpdateValuationInput,
  OnboardInvestorInput,
  CreateConciergeRequestInput,
  CreateNomineeInput,
  CreateLegacyDocumentInput,
  CreateVaultDocumentInput,
} from "./vault.schema";
import { sendVaultOnboardingEmail } from "../../services/email.service";

const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign({ userId, id: userId, email, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
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

  if (user.role !== Role.VAULT_CLIENT && user.role !== Role.CHANNEL_PARTNER && user.role !== Role.SUPER_ADMIN) {
    throw ApiError.forbidden("Access restricted to authorized Vault accounts.");
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

/**
 * @desc    Onboard a new Private Client / Investor into The Vault and email credentials
 * @route   POST /api/v1/vault/admin/onboard-investor
 * @access  Protected (SUPER_ADMIN only)
 */
export const onboardInvestor = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, phoneCode, password } =
      req.body as OnboardInvestorInput;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw ApiError.badRequest("An investor account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
        phoneCode: phoneCode?.trim() || "+91",
        passwordHash,
        role: Role.VAULT_CLIENT,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phoneCode: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Send high-priority onboarding email with credentials asynchronously
    void sendVaultOnboardingEmail({
      name: user.name,
      email: user.email,
      password,
    }).catch((err) => {
      console.error("❌ Failed to send Vault onboarding email to:", user.email, err);
    });

    return res.status(201).json(
      ApiResponse.created(
        { user, emailSent: true },
        `Investor account onboarded successfully. Access credentials have been dispatched to ${user.email}.`,
      ),
    );
  },
);

/**
 * @desc    Get Investor Overview summary, next installment, and dynamic action items
 * @route   GET /api/v1/vault/overview
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const assets = await prisma.vaultAsset.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            location: true,
            media: true,
            constructionAsset: true,
          },
        },
        leases: {
          orderBy: { leaseExpiry: "asc" },
        },
        paymentMilestones: {
          orderBy: { dueDate: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalValue = 0;
    let totalPurchasePrice = 0;
    let monthlyIncome = 0;

    const formattedAssets = assets.map((asset) => {
      const val = Number(asset.currentValuation);
      const purchase = Number(asset.purchasePrice);
      const yieldAmt = Number(asset.monthlyRentalYield || 0);

      totalValue += val;
      totalPurchasePrice += purchase;
      monthlyIncome += yieldAmt;

      const roi =
        purchase > 0 ? ((val - purchase) / purchase) * 100 : 0;

      const heroMedia =
        asset.property.media.find((m) => m.isFeatured)?.url ||
        asset.property.media[0]?.url ||
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";

      const activeLease = asset.leases[0];

      return {
        id: asset.id,
        propertyId: asset.propertyId,
        name: asset.property.name,
        type: asset.property.type.replace(/_/g, " "),
        category:
          asset.property.type === "FRANCHISE" ? ("franchise" as const) : ("real-estate" as const),
        location: `${asset.property.location.city}, ${asset.property.location.country}`,
        unitNumber: asset.unitNumber,
        value: val,
        purchasePrice: purchase,
        currentEstimate: val,
        status: asset.occupancyStatus.toLowerCase(),
        roi: Number(roi.toFixed(1)),
        image: heroMedia,
        tenancy: activeLease
          ? {
              status: asset.occupancyStatus.toLowerCase() as "occupied" | "vacant",
              tenant: activeLease.tenantName,
              leaseExpiry: activeLease.leaseExpiry.toISOString().split("T")[0],
              rentStatus: activeLease.rentStatus.toLowerCase() as
                | "paid"
                | "overdue"
                | "pending",
            }
          : undefined,
        construction: asset.property.constructionAsset
          ? {
              structureProgress:
                asset.property.constructionAsset.structureProgress,
              interiorProgress:
                asset.property.constructionAsset.interiorProgress,
              overallProgress:
                asset.property.constructionAsset.overallProgress,
            }
          : undefined,
      };
    });

    const totalROI =
      totalPurchasePrice > 0
        ? Number(
            (
              ((totalValue - totalPurchasePrice) / totalPurchasePrice) *
              100
            ).toFixed(1),
          )
        : 0;

    // Find next upcoming payment milestone across user's assets
    const upcomingMilestone = await prisma.paymentMilestone.findFirst({
      where: {
        vaultAsset: { userId },
        status: { in: ["UPCOMING", "PENDING"] },
        dueDate: { gte: new Date() },
      },
      include: {
        vaultAsset: {
          include: {
            property: { select: { name: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const nextPayment = upcomingMilestone
      ? {
          amount: Number(upcomingMilestone.amount),
          dueDate: upcomingMilestone.dueDate.toISOString().split("T")[0],
          property: upcomingMilestone.vaultAsset.property.name,
        }
      : {
          amount: 0,
          dueDate: "None",
          property: "No pending installments",
        };

    // Compute dynamic action items
    const actionItems: Array<{
      id: string;
      type: "lease" | "construction" | "payment" | "document";
      message: string;
      urgency: "high" | "medium" | "low";
    }> = [];

    const now = new Date();
    const in60Days = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // 1. Check leases expiring in <= 60 days or with OVERDUE rent
    const leases = await prisma.lease.findMany({
      where: { vaultAsset: { userId } },
      include: { vaultAsset: { include: { property: { select: { name: true } } } } },
    });

    leases.forEach((lease) => {
      if (lease.rentStatus === "OVERDUE") {
        actionItems.push({
          id: `lease-overdue-${lease.id}`,
          type: "lease",
          message: `Rent collection overdue for ${lease.tenantName} (${lease.vaultAsset.property.name})`,
          urgency: "high",
        });
      } else if (lease.leaseExpiry <= in60Days && lease.leaseExpiry >= now) {
        const daysLeft = Math.ceil(
          (lease.leaseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        actionItems.push({
          id: `lease-expiry-${lease.id}`,
          type: "lease",
          message: `Lease renewal due in ${daysLeft} days for ${lease.vaultAsset.property.name}`,
          urgency: daysLeft <= 30 ? "high" : "medium",
        });
      }
    });

    // 2. Check payment milestones due in <= 60 days
    const upcomingPayments = await prisma.paymentMilestone.findMany({
      where: {
        vaultAsset: { userId },
        status: { in: ["UPCOMING", "PENDING"] },
        dueDate: { lte: in60Days },
      },
      include: { vaultAsset: { include: { property: { select: { name: true } } } } },
    });

    upcomingPayments.forEach((pm) => {
      const daysLeft = Math.ceil(
        (pm.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      actionItems.push({
        id: `pm-due-${pm.id}`,
        type: "payment",
        message: `${pm.name} payment due ${daysLeft > 0 ? `in ${daysLeft} days` : "today"} (${pm.vaultAsset.property.name})`,
        urgency: daysLeft <= 15 ? "high" : "medium",
      });
    });

    // 3. Check in-progress construction updates
    const constructionProps = assets.filter(
      (a) => a.property.constructionAsset,
    );
    if (constructionProps.length > 0) {
      const firstConst = constructionProps[0];
      actionItems.push({
        id: `const-update-${firstConst.id}`,
        type: "construction",
        message: `New site progression updates logged for ${firstConst.property.name}`,
        urgency: "low",
      });
    }

    return res.status(200).json(
      ApiResponse.ok(
        {
          portfolioData: {
            totalValue,
            totalROI,
            monthlyIncome,
            assets: formattedAssets,
          },
          nextPayment,
          actionItems,
        },
        "Vault overview fetched successfully",
      ),
    );
  },
);

/**
 * @desc    Get Tenancy and Lease overview for investor's properties
 * @route   GET /api/v1/vault/tenancy
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultTenancy = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const assets = await prisma.vaultAsset.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            location: true,
            media: true,
          },
        },
        leases: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const tenancyAssets = assets.map((asset) => {
      const heroImage =
        asset.property.media.find((m) => m.isFeatured)?.url ||
        asset.property.media[0]?.url ||
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80";

      const activeLease = asset.leases[0];

      return {
        id: asset.id,
        propertyId: asset.propertyId,
        name: asset.property.name,
        unitNumber: asset.unitNumber,
        location: `${asset.property.location.city}, ${asset.property.location.country}`,
        image: heroImage,
        status: asset.occupancyStatus.toLowerCase() as "occupied" | "vacant",
        tenant: activeLease
          ? {
              id: activeLease.id,
              name: activeLease.tenantName,
              leaseStart: activeLease.leaseStart.toISOString().split("T")[0],
              leaseExpiry: activeLease.leaseExpiry.toISOString().split("T")[0],
              monthlyRent: Number(activeLease.monthlyRent),
              rentStatus: activeLease.rentStatus.toLowerCase() as
                | "paid"
                | "overdue"
                | "pending",
              lastPayment: activeLease.lastPayment
                ? activeLease.lastPayment.toISOString().split("T")[0]
                : undefined,
            }
          : undefined,
      };
    });

    return res.status(200).json(
      ApiResponse.ok(tenancyAssets, "Tenancy assets retrieved successfully"),
    );
  },
);

/**
 * @desc    Get Investor's Document Repository
 * @route   GET /api/v1/vault/documents
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const docs = await prisma.vaultDocument.findMany({
      where: { userId },
      include: {
        vaultAsset: {
          include: {
            property: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedDocs = docs.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      fileUrl: d.fileUrl,
      size: d.sizeLabel || "1.5 MB",
      icon: d.iconKey || "description",
      date: d.createdAt.toISOString().split("T")[0],
      property: d.vaultAsset?.property.name,
    }));

    return res.status(200).json(
      ApiResponse.ok(formattedDocs, "Vault documents retrieved successfully"),
    );
  },
);

/**
 * @desc    Get Investor's Payment Milestones & Completion Progress
 * @route   GET /api/v1/vault/payments
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const milestones = await prisma.paymentMilestone.findMany({
      where: { vaultAsset: { userId } },
      include: {
        vaultAsset: {
          include: {
            property: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const formattedMilestones = milestones.map((m) => ({
      id: m.id,
      property: m.vaultAsset.property.name,
      milestone: m.name,
      amount: Number(m.amount),
      dueDate: m.dueDate.toISOString().split("T")[0],
      status: m.status.toLowerCase() as "upcoming" | "pending" | "completed",
      paidAmount: m.paidAmount ? Number(m.paidAmount) : 0,
      totalAmount: Number(m.amount),
    }));

    // Compute progress grouped by property
    const propertyProgressMap = new Map<
      string,
      { property: string; paid: number; total: number }
    >();

    milestones.forEach((m) => {
      const propName = m.vaultAsset.property.name;
      const current = propertyProgressMap.get(propName) || {
        property: propName,
        paid: 0,
        total: 0,
      };

      const amt = Number(m.amount);
      current.total += amt;
      if (m.status === "COMPLETED") {
        current.paid += m.paidAmount ? Number(m.paidAmount) : amt;
      }
      propertyProgressMap.set(propName, current);
    });

    const paymentProgress = Array.from(propertyProgressMap.values());

    return res.status(200).json(
      ApiResponse.ok(
        {
          payments: formattedMilestones,
          paymentProgress,
        },
        "Payment milestones retrieved successfully",
      ),
    );
  },
);

/**
 * @desc    Get Live Construction Feed for Investor's properties
 * @route   GET /api/v1/vault/construction
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultConstruction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const userAssets = await prisma.vaultAsset.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            location: true,
            media: true,
            constructionAsset: {
              include: {
                milestones: true,
                gallery: true,
              },
            },
          },
        },
      },
    });

    const constructionData = userAssets
      .filter((a) => a.property.constructionAsset)
      .map((a) => {
        const ca = a.property.constructionAsset!;
        const heroImg =
          a.property.media.find((m) => m.isFeatured)?.url ||
          a.property.media[0]?.url ||
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";

        return {
          id: ca.id,
          propertyId: a.property.id,
          propertyName: a.property.name,
          propertySlug: a.property.slug,
          location: `${a.property.location.city}, ${a.property.location.country}`,
          image: heroImg,
          structureProgress: ca.structureProgress,
          interiorProgress: ca.interiorProgress,
          overallProgress: ca.overallProgress,
          lastUpdate: ca.lastUpdate.toISOString().split("T")[0],
          milestones: ca.milestones.map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            targetDate: m.targetDate.toISOString().split("T")[0],
          })),
          gallery: ca.gallery.map((g) => ({
            id: g.id,
            imageUrl: g.imageUrl,
            date: g.date.toISOString().split("T")[0],
            caption: g.caption || undefined,
          })),
        };
      });

    return res.status(200).json(
      ApiResponse.ok(
        constructionData,
        "Construction feed retrieved successfully",
      ),
    );
  },
);

/**
 * @desc    Get Concierge service request history & properties dropdown
 * @route   GET /api/v1/vault/concierge
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultConcierge = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const requests = await prisma.conciergeRequest.findMany({
      where: { userId },
      include: {
        property: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const userProperties = await prisma.vaultAsset.findMany({
      where: { userId },
      include: {
        property: {
          include: { location: true },
        },
      },
    });

    const propertiesList = userProperties.map((a) => ({
      id: a.property.id,
      name: `${a.property.name} (${a.unitNumber})`,
    }));

    const formattedRequests = requests.map((r) => ({
      id: r.id,
      type: r.type,
      property: r.property?.name || "General Portfolio",
      status: r.status.toLowerCase().replace(/_/g, "-") as
        | "pending"
        | "in-progress"
        | "completed",
      createdAt: r.createdAt.toISOString().split("T")[0],
      description: r.description,
    }));

    return res.status(200).json(
      ApiResponse.ok(
        {
          requests: formattedRequests,
          properties: propertiesList,
        },
        "Concierge requests retrieved successfully",
      ),
    );
  },
);

/**
 * @desc    Submit a new bespoke Concierge service request
 * @route   POST /api/v1/vault/concierge
 * @access  Protected (Investor / Vault Client)
 */
export const createVaultConciergeRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { type, propertyId, description } =
      req.body as CreateConciergeRequestInput;

    const created = await prisma.conciergeRequest.create({
      data: {
        userId,
        propertyId: propertyId || null,
        type,
        description,
      },
      include: {
        property: { select: { name: true } },
      },
    });

    return res.status(201).json(
      ApiResponse.created(
        {
          id: created.id,
          type: created.type,
          property: created.property?.name || "General Portfolio",
          status: "pending",
          createdAt: created.createdAt.toISOString().split("T")[0],
          description: created.description,
        },
        "Concierge request submitted successfully. A Dedicated Wealth Advisor will follow up shortly.",
      ),
    );
  },
);

/**
 * @desc    Get Investor's Nominees
 * @route   GET /api/v1/vault/nominees
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultNominees = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const nominees = await prisma.nominee.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    return res.status(200).json(
      ApiResponse.ok(nominees, "Nominees retrieved successfully"),
    );
  },
);

/**
 * @desc    Add a new Nominee
 * @route   POST /api/v1/vault/nominees
 * @access  Protected (Investor / Vault Client)
 */
export const createVaultNominee = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, relationship, email, phone, share, isPrimary } =
      req.body as CreateNomineeInput;

    if (isPrimary) {
      await prisma.nominee.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const created = await prisma.nominee.create({
      data: {
        userId,
        name,
        relationship,
        email: email || null,
        phone: phone || null,
        share,
        isPrimary,
      },
    });

    return res.status(201).json(
      ApiResponse.created(created, "Nominee added successfully"),
    );
  },
);

/**
 * @desc    Delete a Nominee
 * @route   DELETE /api/v1/vault/nominees/:id
 * @access  Protected (Investor / Vault Client)
 */
export const deleteVaultNominee = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const nominee = await prisma.nominee.findUnique({ where: { id } });
    if (!nominee || nominee.userId !== userId) {
      throw ApiError.notFound("Nominee not found");
    }

    await prisma.nominee.delete({ where: { id } });

    return res.status(200).json(
      ApiResponse.ok(null, "Nominee removed successfully"),
    );
  },
);

/**
 * @desc    Get Investor's Legacy & Estate Documents
 * @route   GET /api/v1/vault/legacy-documents
 * @access  Protected (Investor / Vault Client)
 */
export const getVaultLegacyDocuments = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const docs = await prisma.legacyDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    const formatted = docs.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      fileUrl: d.fileUrl,
      uploadedAt: d.uploadedAt.toISOString().split("T")[0],
    }));

    return res.status(200).json(
      ApiResponse.ok(formatted, "Legacy documents retrieved successfully"),
    );
  },
);

/**
 * @desc    Upload / Add Legacy Document
 * @route   POST /api/v1/vault/legacy-documents
 * @access  Protected (Investor / Vault Client)
 */
export const createVaultLegacyDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, type, fileUrl } = req.body as CreateLegacyDocumentInput;

    const doc = await prisma.legacyDocument.create({
      data: {
        userId,
        name,
        type,
        fileUrl,
      },
    });

    return res.status(201).json(
      ApiResponse.created(
        {
          id: doc.id,
          name: doc.name,
          type: doc.type,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt.toISOString().split("T")[0],
        },
        "Legacy document added to secure repository",
      ),
    );
  },
);

/**
 * @desc    Delete Legacy Document
 * @route   DELETE /api/v1/vault/legacy-documents/:id
 * @access  Protected (Investor / Vault Client)
 */
export const deleteVaultLegacyDocument = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const doc = await prisma.legacyDocument.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) {
      throw ApiError.notFound("Legacy document not found");
    }

    await prisma.legacyDocument.delete({ where: { id } });

    return res.status(200).json(
      ApiResponse.ok(null, "Legacy document deleted"),
    );
  },
);


