import { z } from "zod";
import {
  PropertyType,
  PropertyStatus,
  FurnishingStatus,
  Currency,
} from "@prisma/client";

export const LocationInputSchema = z.object({
  city: z.string().min(1, "City is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
  community: z.string().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  googleMapUrl: z.string().optional().nullable().or(z.literal("")),
  mapEmbedUrl: z.string().optional().nullable().or(z.literal("")),
});

export const PropertyConfigurationInputSchema = z.object({
  unitType: z.string().min(1, "Unit type is required"),
  areaSqFt: z.number().positive("Area must be a positive number"),
  viewType: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  isAvailable: z.boolean().default(true),
  floorPlanUrl: z.string().url().optional().or(z.literal("")),
});

export const PropertyMediaInputSchema = z.object({
  mediaType: z.string().default("GALLERY"),
  url: z.string().url("Valid media URL required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  altText: z.string().optional(),
  orderIndex: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
});

export const PropertyAmenityInputSchema = z.object({
  amenityId: z.string().min(1, "Amenity ID is required"),
  description: z.string().optional(),
});

export const NearbyPlaceInputSchema = z.object({
  name: z.string().min(1, "Place name is required"),
  distance: z.string().min(1, "Distance is required"),
  category: z.string().optional(),
});

export const FinancialMetricInputSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
  note: z.string().optional(),
  icon: z.string().optional(),
});

export const CreatePropertySchema = z.object({
  name: z.string().min(2, "Property name is required").trim(),
  slug: z.string().min(2, "Slug is required").trim().optional(),
  tagline: z.string().optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  visionHeadline: z.string().optional().nullable(),
  type: z.nativeEnum(PropertyType).default(PropertyType.RESIDENTIAL_VILLA),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.AVAILABLE),
  price: z.coerce.number().nonnegative("Price must be non-negative").default(0),
  currency: z.nativeEnum(Currency).default(Currency.INR),
  priceOnApplication: z.boolean().default(false),
  rentalYieldPercent: z.coerce.number().optional().nullable(),
  expectedIrrPercent: z.coerce.number().optional().nullable(),
  appreciationPercent: z.coerce.number().optional().nullable(),
  totalAreaSqFt: z.coerce.number().positive().optional().nullable(),
  bedrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  bathrooms: z.coerce.number().int().nonnegative().optional().nullable(),
  furnishingStatus: z
    .nativeEnum(FurnishingStatus)
    .default(FurnishingStatus.FULLY_FURNISHED),
  possessionDate: z.string().optional().nullable().or(z.literal("")),
  reraNumber: z.string().optional().nullable(),
  ownershipType: z.string().optional().nullable(),
  paymentPlan: z.any().optional().nullable(),
  virtualTour360Url: z.string().optional().nullable().or(z.literal("")),
  brochureUrl: z.string().optional().nullable().or(z.literal("")),
  maintenanceFeePerSqFt: z.coerce.number().optional().nullable(),
  verdictQuote: z.string().optional().nullable(),
  verdictAuthor: z.string().optional().nullable(),
  verdictTitle: z.string().optional().nullable(),

  // Franchise-specific fields (only used when type = FRANCHISE)
  franchiseModel: z
    .enum(["FOCO", "FOFO", "FICO"])
    .optional()
    .nullable()
    .or(z.literal("")),
  minTicketSize: z.coerce.number().nonnegative().optional().nullable(),
  totalProjectCost: z.coerce.number().nonnegative().optional().nullable(),
  paybackPeriodYears: z.coerce.number().nonnegative().optional().nullable(),
  lockInPeriodYears: z.coerce.number().nonnegative().optional().nullable(),
  expectedAnnualRoi: z.coerce.number().nonnegative().optional().nullable(),
  yieldPayoutFrequency: z
    .enum(["MONTHLY", "QUARTERLY", "ANNUALLY"])
    .optional()
    .nullable()
    .or(z.literal("")),
  supportModules: z.array(z.string()).optional().nullable(),
  advantages: z.array(z.string()).optional().nullable(),

  // Nested structures
  location: LocationInputSchema,
  configurations: z.array(PropertyConfigurationInputSchema).optional(),
  media: z.array(PropertyMediaInputSchema).optional(),
  amenities: z.array(PropertyAmenityInputSchema).optional(),
  nearbyPlaces: z.array(NearbyPlaceInputSchema).optional(),
  financialMetrics: z.array(FinancialMetricInputSchema).optional(),
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

export const PropertyFilterSchema = z.object({
  status: z.nativeEnum(PropertyStatus).optional(),
  type: z.nativeEnum(PropertyType).optional(),
  franchiseModel: z.enum(["FOCO", "FOFO", "FICO"]).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().optional(),
  furnishingStatus: z.nativeEnum(FurnishingStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  sortBy: z
    .enum(["price_asc", "price_desc", "newest", "oldest", "area_asc", "area_desc"])
    .default("newest"),
});

export interface LocationInput {
  city: string;
  country: string;
  community?: string;
  addressLine?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapUrl?: string;
  mapEmbedUrl?: string;
}

export interface PropertyConfigurationInput {
  unitType: string;
  areaSqFt: number;
  viewType?: string;
  price: number;
  isAvailable?: boolean;
  floorPlanUrl?: string;
}

export interface PropertyMediaInput {
  mediaType?: string;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  orderIndex?: number;
  isFeatured?: boolean;
}

export interface PropertyAmenityInput {
  amenityId: string;
  description?: string;
}

export interface NearbyPlaceInput {
  name: string;
  distance: string;
  category?: string;
}

export interface FinancialMetricInput {
  label: string;
  value: string;
  note?: string;
  icon?: string;
}

export interface CreatePropertyInput {
  name: string;
  slug?: string;
  tagline?: string;
  description: string;
  visionHeadline?: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: Currency;
  priceOnApplication?: boolean;
  rentalYieldPercent?: number;
  expectedIrrPercent?: number;
  appreciationPercent?: number;
  totalAreaSqFt?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishingStatus?: FurnishingStatus;
  possessionDate?: string;
  reraNumber?: string;
  ownershipType?: string;
  paymentPlan?: unknown;
  virtualTour360Url?: string;
  brochureUrl?: string;
  maintenanceFeePerSqFt?: number;
  verdictQuote?: string;
  verdictAuthor?: string;
  verdictTitle?: string;
  franchiseModel?: "FOCO" | "FOFO" | "FICO" | "";
  minTicketSize?: number;
  totalProjectCost?: number;
  paybackPeriodYears?: number;
  lockInPeriodYears?: number;
  expectedAnnualRoi?: number;
  yieldPayoutFrequency?: "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "";
  supportModules?: string[];
  advantages?: string[];
  location: LocationInput;
  configurations?: PropertyConfigurationInput[];
  media?: PropertyMediaInput[];
  amenities?: PropertyAmenityInput[];
  nearbyPlaces?: NearbyPlaceInput[];
  financialMetrics?: FinancialMetricInput[];
}

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export interface PropertyFilterQuery {
  status?: PropertyStatus;
  type?: PropertyType;
  franchiseModel?: "FOCO" | "FOFO" | "FICO";
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  furnishingStatus?: FurnishingStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "area_asc" | "area_desc";
}
