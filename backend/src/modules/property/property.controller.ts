import { Request, Response } from "express";
import { Prisma, PropertyStatus, PropertyType } from "@prisma/client";
import slugify from "slugify";
import { prisma } from "../../config/db";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertyFilterQuery,
} from "./property.schema";

/**
 * Generates a unique, collision-free URL slug from property name.
 */
const generateUniqueSlug = async (name: string, customSlug?: string): Promise<string> => {
  const baseSlug = customSlug
    ? slugify(customSlug, { lower: true, strict: true, trim: true })
    : slugify(name, { lower: true, strict: true, trim: true });

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.property.findUnique({ where: { slug } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

/**
 * @desc    Get paginated list of properties with filters
 * @route   GET /api/v1/properties
 * @access  Public
 */
export const getProperties = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = req.query as unknown as PropertyFilterQuery;
    const status = filters.status;
    const type = filters.type;
    const franchiseModel = filters.franchiseModel;
    const country = filters.country;
    const city = filters.city;
    const minPrice = filters.minPrice;
    const maxPrice = filters.maxPrice;
    const bedrooms = filters.bedrooms;
    const furnishingStatus = filters.furnishingStatus;
    const search = filters.search;
    const page: number = filters.page ? Number(filters.page) : 1;
    const limit: number = filters.limit ? Number(filters.limit) : 12;
    const sortBy = filters.sortBy || "newest";

    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      isDeleted: false,
    };

    if (status) where.status = status;
    if (type) {
      where.type = type;
    } else {
      where.type = { not: PropertyType.FRANCHISE };
    }
    if (franchiseModel) where.franchiseModel = franchiseModel;
    if (bedrooms !== undefined) where.bedrooms = { gte: Number(bedrooms) };
    if (furnishingStatus) where.furnishingStatus = furnishingStatus;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

    if (country || city) {
      where.location = {};
      if (country) {
        where.location.country = {
          equals: country,
          mode: "insensitive",
        };
      }
      if (city) {
        where.location.city = {
          equals: city,
          mode: "insensitive",
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
        {
          location: {
            city: { contains: search, mode: "insensitive" },
          },
        },
        {
          location: {
            country: { contains: search, mode: "insensitive" },
          },
        },
        {
          location: {
            community: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: "desc" };
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "area_asc":
        orderBy = { totalAreaSqFt: "asc" };
        break;
      case "area_desc":
        orderBy = { totalAreaSqFt: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          location: true,
          media: {
            where: { isFeatured: true },
            orderBy: { orderIndex: "asc" },
            take: 1,
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
          nearbyPlaces: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              configurations: true,
              media: true,
              amenities: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
      ApiResponse.ok(
        properties,
        "Properties retrieved successfully",
        {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      ),
    );
  },
);

/**
 * @desc    Get complete property details by slug and increment view counter
 * @route   GET /api/v1/properties/:slug
 * @access  Public
 */
export const getPropertyBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        location: true,
        configurations: {
          orderBy: { areaSqFt: "asc" },
        },
        media: {
          orderBy: { orderIndex: "asc" },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        nearbyPlaces: {
          orderBy: { category: "asc" },
        },
        financialMetrics: true,
        constructionAsset: {
          include: {
            milestones: {
              orderBy: { targetDate: "asc" },
            },
            gallery: {
              orderBy: { date: "desc" },
            },
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            licenseNumber: true,
          },
        },
        _count: {
          select: {
            inquiries: true,
          },
        },
      },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property with slug or ID '${slug}' was not found`);
    }

    // Increment view count asynchronously
    void prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } },
    });

    return res.status(200).json(
      ApiResponse.ok(property, "Property details retrieved successfully"),
    );
  },
);

/**
 * @desc    Create a new luxury property
 * @route   POST /api/v1/properties
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const createProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body as CreatePropertyInput;

    // Check for duplicate property name (case-insensitive, non-deleted)
    const existingProperty = await prisma.property.findFirst({
      where: {
        name: { equals: data.name.trim(), mode: "insensitive" },
        isDeleted: false,
      },
    });

    if (existingProperty) {
      throw new ApiError(
        409,
        `A property with the name "${data.name.trim()}" already exists. Please choose a unique property name.`,
      );
    }

    const slug = await generateUniqueSlug(data.name, data.slug);

    // 1. Create Unique Location for this Property
    let location = await prisma.location.create({
      data: {
        city: data.location.city || "Multiple Locations",
        country: data.location.country || "India",
        community: data.location.community,
        addressLine: data.location.addressLine,
        postalCode: data.location.postalCode,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        googleMapUrl: data.location.googleMapUrl,
        mapEmbedUrl: data.location.mapEmbedUrl,
      },
    });

    if (data.amenities?.length) {
      for (const a of data.amenities) {
        if (a.name) {
          await prisma.amenity.upsert({
            where: { name: a.name.trim() },
            update: a.iconKey ? { iconKey: a.iconKey } : {},
            create: {
              name: a.name.trim(),
              iconKey: a.iconKey || "star",
            },
          });
        }
      }
    }

    // 2. Create Property with relations
    const createdProperty = await prisma.property.create({
      data: {
        slug,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        visionHeadline: data.visionHeadline,
        type: data.type,
        customType: data.customType,
        status: data.status,
        price: data.price,
        currency: data.currency,
        priceOnApplication: data.priceOnApplication,
        rentalYieldPercent: data.rentalYieldPercent,
        expectedIrrPercent: data.expectedIrrPercent,
        appreciationPercent: data.appreciationPercent,
        totalAreaSqFt: data.totalAreaSqFt,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        furnishingStatus: data.furnishingStatus,
        possessionDate:
          data.possessionDate && !isNaN(new Date(data.possessionDate).getTime())
            ? new Date(data.possessionDate)
            : undefined,
        reraNumber: data.reraNumber,
        ownershipType: data.ownershipType,
        paymentPlan: data.paymentPlan ? (data.paymentPlan as Prisma.InputJsonValue) : Prisma.JsonNull,
        virtualTour360Url: data.virtualTour360Url,
        brochureUrl: data.brochureUrl,
        maintenanceFeePerSqFt: data.maintenanceFeePerSqFt,
        customSpecs: data.customSpecs !== undefined ? (data.customSpecs as any) : undefined,
        sectionVisibility: data.sectionVisibility !== undefined ? (data.sectionVisibility as any) : undefined,
        verdictQuote: data.verdictQuote,
        verdictAuthor: data.verdictAuthor,
        verdictTitle: data.verdictTitle,
        franchiseModel: data.franchiseModel || null,
        minTicketSize: data.minTicketSize !== undefined ? data.minTicketSize : null,
        totalProjectCost: data.totalProjectCost !== undefined ? data.totalProjectCost : null,
        paybackPeriodYears: data.paybackPeriodYears !== undefined ? data.paybackPeriodYears : null,
        lockInPeriodYears: data.lockInPeriodYears !== undefined ? data.lockInPeriodYears : null,
        expectedAnnualRoi: data.expectedAnnualRoi !== undefined ? data.expectedAnnualRoi : null,
        yieldPayoutFrequency: data.yieldPayoutFrequency || null,
        supportModules: data.supportModules !== undefined ? (data.supportModules as Prisma.InputJsonValue) : Prisma.JsonNull,
        advantages: data.advantages !== undefined ? (data.advantages as Prisma.InputJsonValue) : Prisma.JsonNull,
        locationId: location.id,
        adminId: req.user?.id,
        configurations: data.configurations?.length
          ? {
              createMany: {
                data: data.configurations.map((c) => ({
                  unitType: c.unitType.trim(),
                  areaSqFt: c.areaSqFt ?? 0,
                  viewType: c.viewType || null,
                  price: c.price ?? 0,
                  isAvailable: c.isAvailable ?? true,
                  floorPlanUrl: c.floorPlanUrl || null,
                })),
              },
            }
          : undefined,
        media: data.media?.length
          ? {
              createMany: {
                data: data.media.map((m, idx) => ({
                  mediaType: m.mediaType || "GALLERY",
                  url: m.url,
                  thumbnailUrl: m.thumbnailUrl,
                  altText: m.altText || m.caption,
                  orderIndex: m.orderIndex ?? idx,
                  isFeatured: m.isFeatured ?? idx === 0,
                })),
              },
            }
          : undefined,
        amenities: data.amenities?.length
          ? {
              create: data.amenities.map((a) => {
                if (a.amenityId) {
                  return {
                    description: a.description,
                    amenity: { connect: { id: a.amenityId } },
                  };
                }

                return {
                  description: a.description,
                  amenity: {
                    connectOrCreate: {
                      where: { name: a.name! },
                      create: {
                        name: a.name!,
                        iconKey: a.iconKey || "star",
                      },
                    },
                  },
                };
              }),
            }
          : undefined,
        nearbyPlaces: data.nearbyPlaces?.length
          ? {
              createMany: {
                data: data.nearbyPlaces.map((p) => ({
                  name: p.name,
                  distance: p.distance || "Nearby",
                  category: p.category ?? null,
                  travelTime: p.travelTime ?? null,
                  description: p.description ?? null,
                  iconKey: p.iconKey ?? null,
                })),
              },
            }
          : undefined,
        financialMetrics: data.financialMetrics?.length
          ? {
              createMany: {
                data: data.financialMetrics.map((f) => ({
                  label: f.label,
                  value: f.value,
                  note: f.note ?? null,
                  icon: f.icon ?? null,
                })),
              },
            }
          : undefined,
      },
      include: {
        location: true,
        configurations: true,
        media: true,
        amenities: {
          include: { amenity: true },
        },
        nearbyPlaces: true,
        financialMetrics: true,
      },
    });

    return res.status(201).json(
      ApiResponse.created(
        createdProperty,
        "Property created successfully",
      ),
    );
  },
);

/**
 * @desc    Update property details (partial update)
 * @route   PUT /api/v1/properties/:id
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const updateProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdatePropertyInput;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property '${id}' was not found`);
    }

    // Check for duplicate property name if name is being changed
    if (data.name && data.name.trim().toLowerCase() !== property.name.toLowerCase()) {
      const existingName = await prisma.property.findFirst({
        where: {
          name: { equals: data.name.trim(), mode: "insensitive" },
          id: { not: property.id },
          isDeleted: false,
        },
      });
      if (existingName) {
        throw new ApiError(
          409,
          `A property with the name "${data.name.trim()}" already exists. Please choose a unique property name.`,
        );
      }
    }

    let locationId = property.locationId;

    if (data.location) {
      if (locationId) {
        const updatedLoc = await prisma.location.upsert({
          where: { id: locationId },
          update: {
            city: data.location.city || "Multiple Locations",
            country: data.location.country || "India",
            community: data.location.community,
            addressLine: data.location.addressLine,
            postalCode: data.location.postalCode,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            googleMapUrl: data.location.googleMapUrl,
            mapEmbedUrl: data.location.mapEmbedUrl || data.location.googleMapUrl,
          },
          create: {
            city: data.location.city || "Multiple Locations",
            country: data.location.country || "India",
            community: data.location.community,
            addressLine: data.location.addressLine,
            postalCode: data.location.postalCode,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            googleMapUrl: data.location.googleMapUrl,
            mapEmbedUrl: data.location.mapEmbedUrl || data.location.googleMapUrl,
          },
        });
        locationId = updatedLoc.id;
      } else {
        const newLoc = await prisma.location.create({
          data: {
            city: data.location.city || "Multiple Locations",
            country: data.location.country || "India",
            community: data.location.community,
            addressLine: data.location.addressLine,
            postalCode: data.location.postalCode,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            googleMapUrl: data.location.googleMapUrl,
            mapEmbedUrl: data.location.mapEmbedUrl || data.location.googleMapUrl,
          },
        });
        locationId = newLoc.id;
      }
    }

    // Safely update Configurations
    if (data.configurations !== undefined) {
      await prisma.propertyConfiguration.deleteMany({
        where: { propertyId: property.id },
      });
      if (data.configurations.length > 0) {
        await prisma.propertyConfiguration.createMany({
          data: data.configurations.map((c) => ({
            propertyId: property.id,
            unitType: c.unitType.trim(),
            areaSqFt: c.areaSqFt ?? 0,
            viewType: c.viewType || null,
            price: c.price ?? 0,
            isAvailable: c.isAvailable ?? true,
            floorPlanUrl: c.floorPlanUrl || null,
          })),
        });
      }
    }

    // Safely update Media
    if (data.media !== undefined) {
      await prisma.propertyMedia.deleteMany({
        where: { propertyId: property.id },
      });
      if (data.media.length > 0) {
        await prisma.propertyMedia.createMany({
          data: data.media.map((m, idx) => ({
            propertyId: property.id,
            mediaType: m.mediaType || "GALLERY",
            url: m.url,
            thumbnailUrl: m.thumbnailUrl,
            altText: m.altText || m.caption,
            orderIndex: m.orderIndex ?? idx,
            isFeatured: m.isFeatured ?? idx === 0,
          })),
        });
      }
    }

    // Safely update Amenities
    if (data.amenities !== undefined) {
      await prisma.propertyOnAmenity.deleteMany({
        where: { propertyId: property.id },
      });
      for (const a of data.amenities) {
        if (a.amenityId) {
          await prisma.propertyOnAmenity.create({
            data: {
              propertyId: property.id,
              amenityId: a.amenityId,
              description: a.description,
            },
          });
        } else if (a.name) {
          const amenity = await prisma.amenity.upsert({
            where: { name: a.name.trim() },
            update: a.iconKey ? { iconKey: a.iconKey } : {},
            create: {
              name: a.name.trim(),
              iconKey: a.iconKey || "star",
            },
          });
          await prisma.propertyOnAmenity.create({
            data: {
              propertyId: property.id,
              amenityId: amenity.id,
              description: a.description,
            },
          });
        }
      }
    }

    // Safely update Nearby Places
    if (data.nearbyPlaces !== undefined) {
      await prisma.nearbyPlace.deleteMany({
        where: { propertyId: property.id },
      });
      if (data.nearbyPlaces.length > 0) {
        await prisma.nearbyPlace.createMany({
          data: data.nearbyPlaces.map((p) => ({
            propertyId: property.id,
            name: p.name,
            distance: p.distance || "Nearby",
            category: p.category ?? null,
            travelTime: p.travelTime ?? null,
            description: p.description ?? null,
            iconKey: p.iconKey ?? null,
          })),
        });
      }
    }

    // Safely update Financial Metrics
    if (data.financialMetrics !== undefined) {
      await prisma.propertyFinancialMetric.deleteMany({
        where: { propertyId: property.id },
      });
      if (data.financialMetrics.length > 0) {
        await prisma.propertyFinancialMetric.createMany({
          data: data.financialMetrics.map((f) => ({
            propertyId: property.id,
            label: f.label,
            value: f.value,
            note: f.note ?? null,
            icon: f.icon ?? null,
          })),
        });
      }
    }

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: {
        name: data.name,
        slug: data.slug ? slugify(data.slug, { lower: true, strict: true }) : undefined,
        tagline: data.tagline,
        description: data.description,
        visionHeadline: data.visionHeadline,
        type: data.type,
        customType: data.customType !== undefined ? data.customType : undefined,
        status: data.status,
        price: data.price,
        currency: data.currency,
        priceOnApplication: data.priceOnApplication,
        rentalYieldPercent: data.rentalYieldPercent,
        expectedIrrPercent: data.expectedIrrPercent,
        appreciationPercent: data.appreciationPercent,
        totalAreaSqFt: data.totalAreaSqFt,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        furnishingStatus: data.furnishingStatus,
        possessionDate:
          data.possessionDate && !isNaN(new Date(data.possessionDate).getTime())
            ? new Date(data.possessionDate)
            : undefined,
        reraNumber: data.reraNumber,
        ownershipType: data.ownershipType,
        paymentPlan: data.paymentPlan ? (data.paymentPlan as Prisma.InputJsonValue) : undefined,
        virtualTour360Url: data.virtualTour360Url,
        brochureUrl: data.brochureUrl,
        maintenanceFeePerSqFt: data.maintenanceFeePerSqFt,
        customSpecs: data.customSpecs !== undefined ? (data.customSpecs as any) : undefined,
        sectionVisibility: data.sectionVisibility !== undefined ? (data.sectionVisibility as any) : undefined,
        verdictQuote: data.verdictQuote,
        verdictAuthor: data.verdictAuthor,
        verdictTitle: data.verdictTitle,
        franchiseModel: data.franchiseModel !== undefined ? (data.franchiseModel || null) : undefined,
        minTicketSize: data.minTicketSize !== undefined ? data.minTicketSize : undefined,
        totalProjectCost: data.totalProjectCost !== undefined ? data.totalProjectCost : undefined,
        paybackPeriodYears: data.paybackPeriodYears !== undefined ? data.paybackPeriodYears : undefined,
        lockInPeriodYears: data.lockInPeriodYears !== undefined ? data.lockInPeriodYears : undefined,
        expectedAnnualRoi: data.expectedAnnualRoi !== undefined ? data.expectedAnnualRoi : undefined,
        yieldPayoutFrequency: data.yieldPayoutFrequency !== undefined ? (data.yieldPayoutFrequency || null) : undefined,
        supportModules: data.supportModules !== undefined ? (data.supportModules as Prisma.InputJsonValue) : undefined,
        advantages: data.advantages !== undefined ? (data.advantages as Prisma.InputJsonValue) : undefined,
        locationId,
      },
      include: {
        location: true,
        media: true,
        configurations: true,
        amenities: {
          include: { amenity: true },
        },
        nearbyPlaces: true,
        financialMetrics: true,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(updated, "Property updated successfully"),
    );
  },
);

/**
 * @desc    Soft delete a property (sets isDeleted=true, status=SOLD)
 * @route   DELETE /api/v1/properties/:id
 * @access  Protected (SUPER_ADMIN only)
 */
export const deleteProperty = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const property = await prisma.property.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!property || property.isDeleted) {
      throw ApiError.notFound(`Property '${id}' was not found`);
    }

    await prisma.property.update({
      where: { id: property.id },
      data: {
        isDeleted: true,
        status: PropertyStatus.SOLD,
      },
    });

    return res.status(200).json(
      ApiResponse.ok(
        { id: property.id, isDeleted: true, status: PropertyStatus.SOLD },
        "Property soft deleted successfully",
      ),
    );
  },
);

/**
 * @desc    Get dashboard metrics & statistical breakdowns
 * @route   GET /api/v1/properties/stats
 * @access  Protected (SUPER_ADMIN, ADMIN)
 */
export const getPropertyStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const [
      totalProperties,
      byStatusRaw,
      byTypeRaw,
      locationsWithCount,
      totalInquiries,
      recentInquiries,
    ] = await Promise.all([
      prisma.property.count({ where: { isDeleted: false } }),
      prisma.property.groupBy({
        by: ["status"],
        where: { isDeleted: false },
        _count: { _all: true },
      }),
      prisma.property.groupBy({
        by: ["type"],
        where: { isDeleted: false },
        _count: { _all: true },
      }),
      prisma.location.findMany({
        select: {
          country: true,
          _count: {
            select: {
              properties: {
                where: { isDeleted: false },
              },
            },
          },
        },
      }),
      prisma.inquiry.count(),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          investmentType: true,
          investmentRange: true,
          status: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    // Aggregate by country
    const byCountryMap: Record<string, number> = {};
    for (const loc of locationsWithCount) {
      byCountryMap[loc.country] =
        (byCountryMap[loc.country] || 0) + loc._count.properties;
    }

    const byStatus = byStatusRaw.reduce<Record<string, number>>(
      (acc: Record<string, number>, curr: { status: PropertyStatus; _count: { _all: number } }) => {
        acc[curr.status] = curr._count._all;
        return acc;
      },
      {},
    );

    const byType = byTypeRaw.reduce<Record<string, number>>(
      (acc: Record<string, number>, curr: { type: PropertyType; _count: { _all: number } }) => {
        acc[curr.type] = curr._count._all;
        return acc;
      },
      {},
    );

    return res.status(200).json(
      ApiResponse.ok(
        {
          totalProperties,
          byStatus,
          byType,
          byCountry: byCountryMap,
          totalInquiries,
          recentInquiries,
        },
        "Property analytics retrieved successfully",
      ),
    );
  },
);
