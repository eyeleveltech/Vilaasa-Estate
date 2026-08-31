export type Role = "SUPER_ADMIN" | "CHANNEL_PARTNER";

export type PropertyType =
  | "RESIDENTIAL_VILLA"
  | "RESIDENTIAL_APARTMENT"
  | "PENTHOUSE"
  | "HERITAGE_ESTATE"
  | "COMMERCIAL"
  | "FRANCHISE"
  | "FARMLAND";

export type PropertyStatus =
  | "AVAILABLE"
  | "UNDER_CONSTRUCTION"
  | "OFF_PLAN"
  | "READY_TO_MOVE"
  | "SOLD"
  | "RESERVED";

export type FurnishingStatus =
  | "UNFURNISHED"
  | "SEMI_FURNISHED"
  | "FULLY_FURNISHED"
  | "DESIGNER_FURNISHED";

export type Currency = "INR" | "AED" | "USD" | "EUR" | "GBP" | "SGD";

export type InquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "SITE_VISIT_SCHEDULED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type LeadSource =
  | "HERO_INQUIRY"
  | "PROPERTY_DETAIL"
  | "FRANCHISE_DETAIL"
  | "SITE_VISIT_MODAL"
  | "CALENDAR_PAGE"
  | "CONTACT_FORM"
  | "CHANNEL_PARTNER_FORM"
  | "VAULT_CONCIERGE";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  phoneCode?: string | null;
  role: Role;
  avatar?: string | null;
  licenseNumber?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id?: string;
  city: string;
  country: string;
  community?: string | null;
  addressLine?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapUrl?: string | null;
  mapEmbedUrl?: string | null;
}

export interface PropertyConfiguration {
  id?: string;
  propertyId?: string;
  unitType: string;
  areaSqFt: number;
  viewType?: string | null;
  price: number;
  isAvailable: boolean;
  floorPlanUrl?: string | null;
}

export interface PropertyMedia {
  id?: string;
  propertyId?: string;
  mediaType: string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  caption?: string | null;
  orderIndex: number;
  isFeatured: boolean;
  createdAt?: string;
}

export interface Amenity {
  id: string;
  name: string;
  iconKey: string;
  category?: string | null;
}

export interface PropertyOnAmenity {
  propertyId: string;
  amenityId: string;
  description?: string | null;
  amenity: Amenity;
}

export interface NearbyPlace {
  id?: string;
  propertyId?: string;
  name: string;
  distance: string;
  category?: string | null;
  travelTime?: string | null;
  description?: string | null;
}

export interface PropertyFinancialMetric {
  id?: string;
  propertyId?: string;
  label: string;
  value: string;
  note?: string | null;
  icon?: string | null;
}

export interface ConstructionMilestone {
  id?: string;
  name: string;
  status: "COMPLETED" | "IN_PROGRESS" | "UPCOMING" | string;
  targetDate: string;
}

export interface ConstructionGalleryItem {
  id?: string;
  imageUrl: string;
  date: string;
  caption?: string | null;
}

export interface ConstructionAsset {
  id?: string;
  propertyId?: string;
  structureProgress: number;
  interiorProgress: number;
  overallProgress: number;
  lastUpdate: string;
  milestones?: ConstructionMilestone[];
  gallery?: ConstructionGalleryItem[];
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description: string;
  visionHeadline?: string | null;
  type: PropertyType;
  customType?: string | null;
  status: PropertyStatus;
  isDeleted: boolean;
  views: number;
  price: number | string;
  currency: Currency;
  priceOnApplication: boolean;
  rentalYieldPercent?: number | null;
  expectedIrrPercent?: number | null;
  appreciationPercent?: number | null;
  totalAreaSqFt?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnishingStatus: FurnishingStatus;
  possessionDate?: string | null;
  reraNumber?: string | null;
  ownershipType?: string | null;
  paymentPlan?: unknown;
  virtualTour360Url?: string | null;
  brochureUrl?: string | null;
  maintenanceFeePerSqFt?: number | null;
  customSpecs?: { label: string; value: string }[] | null;
  verdictQuote?: string | null;
  verdictAuthor?: string | null;
  verdictTitle?: string | null;
  franchiseModel?: "FOCO" | "FOFO" | "FICO" | null;
  minTicketSize?: number | null;
  totalProjectCost?: number | null;
  paybackPeriodYears?: number | null;
  lockInPeriodYears?: number | null;
  expectedAnnualRoi?: number | null;
  yieldPayoutFrequency?: "MONTHLY" | "QUARTERLY" | "ANNUALLY" | null;
  supportModules?: string[] | null;
  advantages?: string[] | null;
  locationId: string;
  location: Location;
  adminId?: string | null;
  admin?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    licenseNumber?: string | null;
  } | null;
  configurations?: PropertyConfiguration[];
  media?: PropertyMedia[];
  amenities?: PropertyOnAmenity[];
  nearbyPlaces?: NearbyPlace[];
  financialMetrics?: PropertyFinancialMetric[];
  constructionAsset?: ConstructionAsset | null;
  _count?: {
    configurations?: number;
    media?: number;
    amenities?: number;
    inquiries?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InquiryTimeline {
  id: string;
  inquiryId: string;
  fromStatus?: string | null;
  toStatus: string;
  note?: string | null;
  changedById?: string | null;
  changedByName?: string | null;
  changedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  investmentType: string;
  investmentRange: string;
  currency: Currency;
  status: InquiryStatus;
  source: LeadSource;
  notes?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  followUpDate?: string | null;
  followUpNotes?: string | null;
  propertyId?: string | null;
  property?: {
    id: string;
    name: string;
    slug: string;
    price?: number | string;
    currency?: Currency;
    location?: {
      city: string;
      country: string;
    };
    media?: Array<{ url: string }>;
  } | null;
  assignedAgentId?: string | null;
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
  } | null;
  timeline?: InquiryTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisit {
  id: string;
  propertyId: string;
  property?: {
    id: string;
    name: string;
    slug: string;
    location?: {
      city: string;
      country: string;
    };
  };
  name: string;
  email: string;
  phone: string;
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  visitType: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | string;
  notes?: string | null;
  createdAt: string;
}

export interface ChannelPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  experience?: string | null;
  city?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedById?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyStats {
  totalProperties: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  totalInquiries: number;
  recentInquiries: Inquiry[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PropertyFilterParams {
  status?: PropertyStatus | "";
  type?: PropertyType | "";
  franchiseModel?: "FOCO" | "FOFO" | "FICO" | "";
  country?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  furnishingStatus?: FurnishingStatus | "";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest" | "area_asc" | "area_desc";
}

export interface VaultAdminOverview {
  totalAum: number;
  totalInvested: number;
  totalAppreciation: number;
  appreciationPercent: number;
  totalMonthlyRental: number;
  annualRentalIncome: number;
  totalInvestors: number;
  totalUnits: number;
  byOccupancy: {
    OCCUPIED: number;
    VACANT: number;
    UNDER_MAINTENANCE: number;
  };
}

export interface VaultAdminAsset {
  id: string;
  userId: string;
  propertyId: string;
  unitNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValuation: number;
  monthlyRentalYield: number;
  appreciation: number;
  appreciationPercent: number;
  occupancyStatus: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE" | string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  property: {
    id: string;
    name: string;
    slug: string;
    type: string;
    currency: Currency;
    location: {
      city: string;
      country: string;
      community?: string | null;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface VaultAdminInvestor {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  phoneCode?: string | null;
  isActive: boolean;
  createdAt: string;
  totalUnits: number;
  totalInvested: number;
  currentValue: number;
  totalAppreciation: number;
  appreciationPercent: number;
  monthlyRental: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  orderIndex: number;
}

export type {
  FranchisePageData,
  MetricBadge,
  SupportCard,
  BenefitCard,
  GalleryItem,
} from "../lib/franchisePageHelpers";


