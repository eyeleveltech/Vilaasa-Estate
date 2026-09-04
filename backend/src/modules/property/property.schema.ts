import { z } from "zod";
import {
  PropertyType,
  PropertyStatus,
  FurnishingStatus,
  Currency,
} from "@prisma/client";

export const LocationInputSchema = z.object({
  city: z.string().trim().optional().nullable().default("Multiple Locations"),
  country: z.string().trim().optional().nullable().default("India"),
  community: z.string().optional().nullable(),
  addressLine: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  googleMapUrl: z.string().optional().nullable().or(z.literal("")),
  mapEmbedUrl: z.string().optional().nullable().or(z.literal("")),
});

export const PropertyConfigurationInputSchema = z.object({
  unitType: z.string().min(1, "Unit type is required").trim(),
  areaSqFt: z.coerce.number().min(0, "Area must be non-negative").default(0).optional().nullable(),
  viewType: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be non-negative").default(0).optional().nullable(),
  isAvailable: z.boolean().default(true),
  floorPlanUrl: z.string().url().optional().or(z.literal("")),
});

export const PropertyMediaInputSchema = z.object({
  mediaType: z.string().default("GALLERY"),
  url: z.string().url("Valid media URL required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  altText: z.string().optional(),
  caption: z.string().optional(),
  orderIndex: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
});

export const PropertyAmenityInputSchema = z.object({
  amenityId: z.string().optional(),
  name: z.string().optional(),
  iconKey: z.string().optional(),
  description: z.string().optional(),
});

export const NearbyPlaceInputSchema = z.object({
  name: z.string().min(1, "Place name is required"),
  distance: z.string().optional().nullable().default("Nearby"),
  category: z.string().optional().nullable(),
  travelTime: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  iconKey: z.string().optional().nullable(),
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
  customType: z.string().optional().nullable(),
  status: z.preprocess((val) => {
    if (val === "PUBLISHED") return PropertyStatus.AVAILABLE;
    return val;
  }, z.nativeEnum(PropertyStatus).default(PropertyStatus.AVAILABLE)),
  price: z.coerce.number().nonnegative("Price must be non-negative").default(0),
  currency: z.nativeEnum(Currency).default(Currency.INR),
  priceOnApplication: z.boolean().default(false),
  rentalYieldPercent: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : v),
    z.coerce
      .number({ invalid_type_error: "Rental yield must be a valid number" })
      .min(0, "Rental yield cannot be negative")
      .max(999.99, "Rental yield cannot exceed 999.99%")
      .optional()
      .nullable()
  ),
  expectedIrrPercent: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : v),
    z.coerce
      .number({ invalid_type_error: "Expected IRR must be a valid number" })
      .min(0, "Expected IRR cannot be negative")
      .max(999.99, "Expected IRR cannot exceed 999.99%")
      .optional()
      .nullable()
  ),
  appreciationPercent: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : v),
    z.coerce
      .number({ invalid_type_error: "Appreciation must be a valid number" })
      .min(0, "Appreciation cannot be negative")
      .max(999.99, "Appreciation cannot exceed 999.99%")
      .optional()
      .nullable()
  ),
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
  customSpecs: z.any().optional().nullable(),
  sectionVisibility: z.any().optional().nullable(),
  verdictQuote: z.string().optional().nullable(),
  verdictAuthor: z.string().optional().nullable(),
  verdictTitle: z.string().optional().nullable(),

  // Franchise-specific fields (only used when type = FRANCHISE)
  franchiseModel: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
  minTicketSize: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "number") return isNaN(val) ? undefined : val;
    if (typeof val === "string") {
      const clean = val.replace(/,/g, "");
      const match = clean.match(/[\d]+(?:\.\d+)?/);
      if (!match) return undefined;
      let num = parseFloat(match[0]);
      if (isNaN(num)) return undefined;
      if (/cr|crore/i.test(clean)) num = num * 10000000;
      else if (/lakh|lac/i.test(clean)) num = num * 100000;
      else if (/k/i.test(clean)) num = num * 1000;
      return num;
    }
    return undefined;
  }, z.number().nonnegative().optional().nullable()),
  totalProjectCost: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "number") return isNaN(val) ? undefined : val;
    if (typeof val === "string") {
      const clean = val.replace(/,/g, "");
      const match = clean.match(/[\d]+(?:\.\d+)?/);
      if (!match) return undefined;
      let num = parseFloat(match[0]);
      if (isNaN(num)) return undefined;
      if (/cr|crore/i.test(clean)) num = num * 10000000;
      else if (/lakh|lac/i.test(clean)) num = num * 100000;
      else if (/k/i.test(clean)) num = num * 1000;
      return num;
    }
    return undefined;
  }, z.number().nonnegative().optional().nullable()),
  paybackPeriodYears: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "number") return isNaN(val) ? undefined : val;
    if (typeof val === "string") {
      const match = val.match(/[\d]+(?:\.\d+)?/);
      return match ? parseFloat(match[0]) : undefined;
    }
    return undefined;
  }, z.number().nonnegative().optional().nullable()),
  lockInPeriodYears: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "number") return isNaN(val) ? undefined : val;
    if (typeof val === "string") {
      const match = val.match(/[\d]+(?:\.\d+)?/);
      return match ? parseFloat(match[0]) : undefined;
    }
    return undefined;
  }, z.number().nonnegative().optional().nullable()),
  expectedAnnualRoi: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "number") return isNaN(val) ? undefined : val;
    if (typeof val === "string") {
      const match = val.match(/[\d]+(?:\.\d+)?/);
      return match ? parseFloat(match[0]) : undefined;
    }
    return undefined;
  }, z.number().nonnegative().optional().nullable()),
  yieldPayoutFrequency: z.preprocess((val) => {
    if (!val || typeof val !== "string") return undefined;
    const upper = val.toUpperCase();
    if (upper.includes("MONTH")) return "MONTHLY";
    if (upper.includes("QUARTER")) return "QUARTERLY";
    if (upper.includes("ANNUAL") || upper.includes("YEAR")) return "ANNUALLY";
    return undefined;
  }, z.enum(["MONTHLY", "QUARTERLY", "ANNUALLY"]).optional().nullable()),
  supportModules: z.any().optional().nullable(),
  advantages: z.any().optional().nullable(),

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
  limit: z.coerce.number().int().positive().max(500).default(12),
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
  caption?: string;
  orderIndex?: number;
  isFeatured?: boolean;
}

export interface PropertyAmenityInput {
  amenityId?: string;
  name?: string;
  iconKey?: string;
  description?: string;
}

export interface NearbyPlaceInput {
  name: string;
  distance: string;
  category?: string;
  travelTime?: string;
  description?: string;
  iconKey?: string;
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
  customType?: string;
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
  customSpecs?: { label: string; value: string }[];
  sectionVisibility?: unknown;
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
  supportModules?: any;
  advantages?: any;
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
