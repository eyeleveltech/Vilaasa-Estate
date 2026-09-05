import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import {
  DEFAULT_PROPERTY_IMAGE,
  DEFAULT_PROPERTY_IMAGES,
  PropertyAmenity,
  PropertyGalleryImage,
  PropertySpec,
} from "@/types/property";

/* -------------------- TYPES -------------------- */

export interface FranchiseItem {
  id: string;
  name: string;
  tagline?: string;
  category: string;
  location: string;
  price: number;
  galleryImages: PropertyGalleryImage[];
  type: string;
  spec: PropertySpec[];
  description: string[];
  heroImage: string;
  financial: {
    label: string;
    value: string[] | string;
  }[];
  franchiseModel?: string;
  minTicketSize?: number;
  totalProjectCost?: number;
  expectedAnnualRoi?: number;
  paybackPeriodYears?: number;
  lockInPeriodYears?: number;
  yieldPayoutFrequency?: string;
  supportModules?: string[];
  advantagesList?: string[];
  support_training_para?: string[];
  support_training?: PropertyAmenity[];
  advantages?: PropertyAmenity[];
  visionHeadline?: string;
  visionEyebrow?: string;

  // Rich 7-Section Franchise Extensions
  categoryEyebrow?: string;
  brandOperatorName?: string;
  targetLocations?: string;
  projectCostRange?: string;
  highlightQuote?: string;
  returnHeadline?: string;
  returnTerms?: string;
  financialDisclaimer?: string;
  ecosystemEyebrow?: string;
  ecosystemHeading?: string;
  ecosystemIntro?: string;
  benefitsEyebrow?: string;
  benefitsHeading?: string;
  benefitsIntro?: string;
  claimDisclaimer?: string;
  investorDocuments?: {
    id: string;
    title: string;
    type: string;
    url: string;
    access: "PUBLIC" | "LEAD_GATED" | "PARTNER_ONLY";
    fileSize?: string;
    uploadedAt?: string;
  }[];
  primaryCta?: {
    text: string;
    link: string;
  };
  secondaryCta?: {
    text: string;
    link: string;
  };
  seoAndLegal?: {
    publishStatus?: string;
    seoTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    masterDisclaimer?: string;
    termsUrl?: string;
  };
  sectionVisibility?: Record<string, boolean>;
}

export interface FranchiseListItem {
  id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  image: string;
  type: string;
  franchiseModel?: string;
  minTicketSize?: number;
  expectedAnnualRoi?: number;
  investment?: string | null;
  expectedROI?: string | null;
  minInvestment?: string | null;
  roi?: string | null;
  features: string[];
}

interface BackendLocation {
  id: string;
  city: string;
  country: string;
  community?: string | null;
}

interface BackendMedia {
  id: string;
  mediaType: string;
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
}

interface BackendAmenityRel {
  amenity: {
    name: string;
    iconKey: string;
    category?: string | null;
  };
}

export interface FranchiseMetric {
  label: string;
  value: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showInHeroHighlights?: boolean;
  isVisible?: boolean;
}

export interface FranchiseSupportModule {
  name?: string;
  icon?: string;
  description?: string;
  isVisible?: boolean;
}

export interface FranchiseAdvantage {
  name?: string;
  icon?: string;
  description?: string;
  isVisible?: boolean;
}

export interface FranchiseRichSpecs {
  categoryEyebrow?: string;
  brandOperatorName?: string;
  location?: string;
  targetLocations?: string;
  operatingModel?: string;
  totalProjectCostText?: string;
  projectCostFrom?: string | number;
  projectCostTo?: string | number;
  minInvestmentText?: string;
  annualRoiText?: string;
  yieldPayoutText?: string;
  supportOverview?: string;
  locationScouting?: string;
  biophilicDesign?: string;
  ayurvedaTraining?: string;
  globalMarketing?: string;
  features?: string[];
  vision?: {
    headline?: string;
    highlightQuote?: string;
  };
  financialBlueprint?: {
    returnHeadline?: string;
    returnTerms?: string;
    financialDisclaimer?: string;
    metrics?: FranchiseMetric[];
  };
  supportEcosystem?: {
    eyebrow?: string;
    heading?: string;
    intro?: string;
    modules?: FranchiseSupportModule[];
  };
  investorBenefits?: {
    eyebrow?: string;
    heading?: string;
    intro?: string;
    claimDisclaimer?: string;
    advantages?: FranchiseAdvantage[];
  };
  investorDocuments?: FranchiseItem["investorDocuments"];
  primaryCta?: FranchiseItem["primaryCta"];
  secondaryCta?: FranchiseItem["secondaryCta"];
  seoAndLegal?: FranchiseItem["seoAndLegal"];
  [key: string]: unknown;
}

interface BackendProperty {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description: string;
  type: string;
  customType?: string | null;
  status: string;
  price: string | number;
  currency: string;
  rentalYieldPercent?: string | number | null;
  expectedIrrPercent?: string | number | null;
  appreciationPercent?: string | number | null;
  franchiseModel?: string | null;
  minTicketSize?: string | number | null;
  totalProjectCost?: string | number | null;
  paybackPeriodYears?: number | null;
  lockInPeriodYears?: number | null;
  expectedAnnualRoi?: number | null;
  yieldPayoutFrequency?: string | null;
  supportModules?: unknown;
  advantages?: unknown;
  customSpecs?: unknown;
  financialMetrics?: { label: string; value: string; note?: string; icon?: string }[] | null;
  visionHeadline?: string | null;
  verdictQuote?: string | null;
  verdictAuthor?: string | null;
  verdictTitle?: string | null;
  brochureUrl?: string | null;
  location?: BackendLocation | null;
  media?: BackendMedia[];
  amenities?: BackendAmenityRel[];
  sectionVisibility?: Record<string, boolean> | null;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/* -------------------- TRANSFORMS -------------------- */

export function transformPropertyToFranchise(prop: BackendProperty): FranchiseItem {
  const heroUrl =
    prop.media?.find((m) => m.mediaType === "HERO_IMAGE")?.url ||
    prop.media?.[0]?.url ||
    DEFAULT_PROPERTY_IMAGES[prop.slug] ||
    DEFAULT_PROPERTY_IMAGE;

  // Extract rich structured franchise configuration from customSpecs if available
  const richSpecs =
    prop.customSpecs && typeof prop.customSpecs === "object" && !Array.isArray(prop.customSpecs)
      ? (prop.customSpecs as FranchiseRichSpecs)
      : null;

  const minTicket = Number(prop.minTicketSize || prop.price) || 0;
  const projectCost = Number(prop.totalProjectCost || Number(prop.price) * 3.5) || 0;
  const annualRoi = Number(prop.expectedAnnualRoi || prop.rentalYieldPercent || 24);
  const payback = prop.paybackPeriodYears ? `${prop.paybackPeriodYears} Years` : "3.5 Years";
  const lockIn = prop.lockInPeriodYears ? `${prop.lockInPeriodYears} Years` : "3 Years";
  const payout = prop.yieldPayoutFrequency || "Quarterly Distribution";
  const model = prop.franchiseModel || "FOCO";

  // Financial Blueprint: Single Source of Truth for Hero Highlights & Table
  const blueprintMetrics: FranchiseMetric[] = richSpecs?.financialBlueprint?.metrics || [];
  const heroHighlights = blueprintMetrics.filter((m) => m.showInHeroHighlights && m.isVisible !== false);

  const heroSpec: PropertySpec[] =
    heroHighlights.length > 0
      ? heroHighlights.slice(0, 4).map((m) => ({
          label: m.label,
          value: `${m.valuePrefix || ""}${m.value}${m.valueSuffix ? " " + m.valueSuffix : ""}`,
        }))
      : [
          {
            label: "Min Investment",
            value: `${prop.currency} ${minTicket.toLocaleString()}`,
          },
          {
            label: "Annual ROI",
            value: `${annualRoi}% Annually`,
          },
          {
            label: "Payback Period",
            value: payback,
          },
          {
            label: "Model",
            value: `${model} (Franchise Owned Company Operated)`,
          },
        ];

  const financialData =
    blueprintMetrics.length > 0
      ? blueprintMetrics
          .filter((m) => m.isVisible !== false)
          .map((m) => ({
            label: m.label,
            value: `${m.valuePrefix || ""}${m.value}${m.valueSuffix ? " " + m.valueSuffix : ""}`,
          }))
      : prop.customSpecs && Array.isArray(prop.customSpecs) && prop.customSpecs.length > 0
      ? prop.customSpecs.map((s) => ({
          label: s.label,
          value: s.value,
        }))
      : prop.financialMetrics && Array.isArray(prop.financialMetrics) && prop.financialMetrics.length > 0
      ? prop.financialMetrics.map((f) => ({
          label: f.label,
          value: f.value,
        }))
      : [
          {
            label: "Total Project Cost",
            value: `${prop.currency} ${projectCost.toLocaleString()}`,
          },
          {
            label: "Min Ticket Size",
            value: `${prop.currency} ${minTicket.toLocaleString()}`,
          },
          {
            label: "Lock In Period",
            value: lockIn,
          },
          {
            label: "Yield Payout",
            value: payout,
          },
        ];

  // Support Ecosystem
  const rawSupport: FranchiseSupportModule[] =
    richSpecs?.supportEcosystem?.modules ||
    (typeof prop.supportModules === "object" && prop.supportModules !== null && !Array.isArray(prop.supportModules)
      ? ((prop.supportModules as { modules?: FranchiseSupportModule[] })?.modules)
      : null) ||
    (Array.isArray(prop.supportModules) ? (prop.supportModules as FranchiseSupportModule[]) : []);

  const supportModules = rawSupport.filter((m) => m && m.isVisible !== false);

  // Fallback / direct support modules from Section 6
  const userSupportModules: PropertyAmenity[] = [];
  if (richSpecs?.locationScouting) {
    userSupportModules.push({
      name: "Location Scouting",
      description: richSpecs.locationScouting,
      icon: "storefront",
    });
  }
  if (richSpecs?.biophilicDesign) {
    userSupportModules.push({
      name: "Architecture & Design",
      description: richSpecs.biophilicDesign,
      icon: "design_services",
    });
  }
  if (richSpecs?.ayurvedaTraining) {
    userSupportModules.push({
      name: "Staff & Management Training",
      description: richSpecs.ayurvedaTraining,
      icon: "school",
    });
  }
  if (richSpecs?.globalMarketing) {
    userSupportModules.push({
      name: "Global Marketing & PR",
      description: richSpecs.globalMarketing,
      icon: "campaign",
    });
  }

  // Investor Benefits
  const rawAdvantages: FranchiseAdvantage[] =
    richSpecs?.investorBenefits?.advantages ||
    (typeof prop.advantages === "object" && prop.advantages !== null && !Array.isArray(prop.advantages)
      ? ((prop.advantages as { items?: FranchiseAdvantage[] })?.items)
      : null) ||
    (Array.isArray(prop.advantages) ? (prop.advantages as FranchiseAdvantage[]) : []);

  const advantages = rawAdvantages.filter((a) => a && a.isVisible !== false);

  // Investor Documents & Memorandums
  const investorDocuments =
    richSpecs?.investorDocuments && Array.isArray(richSpecs.investorDocuments) && richSpecs.investorDocuments.length > 0
      ? richSpecs.investorDocuments
      : prop.brochureUrl
      ? [
          {
            id: "brochure-default",
            title: `${prop.name} Official Investment Memorandum & Dossier`,
            type: "INVESTMENT_MEMORANDUM",
            url: prop.brochureUrl,
            access: "LEAD_GATED" as const,
            fileSize: "PDF Document",
            uploadedAt: "Latest Edition",
          },
        ]
      : [];

  const projectCostRange =
    richSpecs?.totalProjectCostText ||
    (richSpecs?.projectCostFrom && richSpecs?.projectCostTo
      ? `${prop.currency} ${richSpecs.projectCostFrom} – ${prop.currency} ${richSpecs.projectCostTo}`
      : undefined);

  return {
    id: prop.slug || prop.id,
    name: prop.name,
    tagline: prop.tagline || undefined,
    category: prop.customType || "Franchises",
    type: prop.tagline || prop.type.replace(/_/g, " "),
    location:
      richSpecs?.location ||
      richSpecs?.targetLocations ||
      (prop.location ? `${prop.location.city}, ${prop.location.country}` : "Prime Locations"),
    price: minTicket,
    heroImage: heroUrl,
    visionHeadline: richSpecs?.vision?.headline || prop.visionHeadline || undefined,
    description: prop.description
      ? prop.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
      : [prop.description || ""],
    franchiseModel: richSpecs?.operatingModel || model,
    minTicketSize: minTicket,
    totalProjectCost: projectCost,
    expectedAnnualRoi: annualRoi,
    paybackPeriodYears: prop.paybackPeriodYears || 3.5,
    lockInPeriodYears: prop.lockInPeriodYears || 3.0,
    yieldPayoutFrequency: richSpecs?.yieldPayoutText || payout,
    supportModules: supportModules.map((m) => (typeof m === "object" ? m.name || "" : String(m))),
    advantagesList: advantages.map((a) => (typeof a === "object" ? a.name || "" : String(a))),
    spec: heroSpec,
    galleryImages: (prop.media || [])
      .filter((m) => m.mediaType === "GALLERY" || m.mediaType === "HERO_IMAGE")
      .map((m, idx) => ({
        name: m.altText || `${prop.name} View ${idx + 1}`,
        description: m.altText || "",
        image: m.url,
      })),
    financial: financialData,
    support_training_para: [
      richSpecs?.supportOverview ||
        richSpecs?.supportEcosystem?.intro ||
        (typeof prop.supportModules === "object" && prop.supportModules !== null && (prop.supportModules as { intro?: string })?.intro) ||
        "Turnkey institutional development covering location scouting, biophilic architectural styling, therapist certification, and international marketing.",
    ],
    support_training:
      userSupportModules.length > 0
        ? userSupportModules
        : supportModules.length > 0
        ? supportModules.map((mod, idx) => ({
            name: (typeof mod === "object" ? mod.name : String(mod)) || `Module ${idx + 1}`,
            icon: (typeof mod === "object" ? mod.icon : "storefront") || "storefront",
            description: (typeof mod === "object" ? mod.description : "") || "",
          }))
        : [
            {
              icon: "storefront",
              name: "Site Selection",
              description: "Demographic intelligence and prime commercial leasing.",
            },
            {
              icon: "design_services",
              name: "Architectural Design",
              description: "Bespoke interior fitout matching luxury brand guidelines.",
            },
          ],
    advantages:
      advantages.length > 0
        ? advantages.map((adv, idx) => ({
            name: (typeof adv === "object" ? adv.name : String(adv)) || `Advantage ${idx + 1}`,
            icon: (typeof adv === "object" ? adv.icon : "verified_user") || "verified_user",
            description: (typeof adv === "object" ? adv.description : "") || "",
          }))
        : (prop.amenities || []).map((a) => ({
            icon: a.amenity.iconKey || "spa",
            name: a.amenity.name,
            description: a.amenity.category || "Luxury Ecosystem Feature",
          })),

    // Rich 7-Section Extensions
    categoryEyebrow: richSpecs?.categoryEyebrow || prop.customType || "Premium Franchise",
    brandOperatorName: richSpecs?.brandOperatorName || prop.name,
    targetLocations: richSpecs?.location || richSpecs?.targetLocations || (prop.location ? `${prop.location.city}, ${prop.location.country}` : undefined),
    projectCostRange,
    highlightQuote: richSpecs?.vision?.highlightQuote || prop.verdictQuote || undefined,
    returnHeadline: richSpecs?.financialBlueprint?.returnHeadline || undefined,
    returnTerms: richSpecs?.financialBlueprint?.returnTerms || undefined,
    financialDisclaimer: richSpecs?.financialBlueprint?.financialDisclaimer || undefined,
    ecosystemEyebrow: richSpecs?.supportEcosystem?.eyebrow || "Comprehensive Ecosystem",
    ecosystemHeading: richSpecs?.supportEcosystem?.heading || "Support & Training",
    ecosystemIntro: richSpecs?.supportOverview || richSpecs?.supportEcosystem?.intro || undefined,
    benefitsEyebrow: richSpecs?.investorBenefits?.eyebrow || "Key Benefits",
    benefitsHeading: richSpecs?.investorBenefits?.heading || "The FOCO Advantage",
    benefitsIntro: richSpecs?.investorBenefits?.intro || undefined,
    claimDisclaimer: richSpecs?.investorBenefits?.claimDisclaimer || undefined,
    investorDocuments,
    primaryCta: richSpecs?.primaryCta || { text: "Book a call today", link: "/calendar" },
    secondaryCta: richSpecs?.secondaryCta || { text: "Open Wealth Projector", link: "/wealth-projector" },
    seoAndLegal: richSpecs?.seoAndLegal || undefined,
    sectionVisibility: (prop.sectionVisibility as Record<string, boolean>) || undefined,
  };
}

export function transformPropertyToFranchiseListItem(
  prop: BackendProperty,
): FranchiseListItem {
  const imageUrl =
    prop.media?.find((m) => m.mediaType === "HERO_IMAGE")?.url ||
    prop.media?.[0]?.url ||
    DEFAULT_PROPERTY_IMAGES[prop.slug] ||
    DEFAULT_PROPERTY_IMAGE;

  const minTicket = Number(prop.minTicketSize || prop.price) || 0;
  const annualRoi = Number(prop.expectedAnnualRoi || prop.rentalYieldPercent || 24);

  const richSpecs =
    prop.customSpecs && typeof prop.customSpecs === "object" && !Array.isArray(prop.customSpecs)
      ? (prop.customSpecs as FranchiseRichSpecs)
      : null;

  const minInvestmentStr =
    richSpecs?.minInvestmentText ||
    `${prop.currency} ${minTicket >= 10000000 ? (minTicket / 10000000).toFixed(1) + " Cr" : minTicket.toLocaleString()}`;

  const roiStr = richSpecs?.annualRoiText || `${annualRoi}% Annually`;

  const featuresList =
    Array.isArray(richSpecs?.features) && richSpecs.features.length > 0
      ? richSpecs.features
      : [
          `${prop.franchiseModel || "FOCO"} Business Model`,
          `${prop.yieldPayoutFrequency || "Quarterly"} Dividend Payouts`,
          "Turnkey Operational Support",
        ];

  return {
    id: prop.slug || prop.id,
    name: prop.name,
    type: prop.customType || prop.tagline || prop.type.replace(/_/g, " "),
    location:
      richSpecs?.location ||
      (prop.location ? `${prop.location.city}, ${prop.location.country}` : "Prime Location"),
    price: minTicket,
    category: "Franchises",
    image: imageUrl,
    franchiseModel: richSpecs?.operatingModel || prop.franchiseModel || "FOCO",
    minTicketSize: minTicket,
    expectedAnnualRoi: annualRoi,
    investment: minInvestmentStr,
    expectedROI: roiStr,
    minInvestment: minInvestmentStr,
    roi: roiStr,
    features: featuresList,
  };
}

/* -------------------- HOOKS -------------------- */

/**
 * Fetch a single franchise opportunity by slug or ID via Express REST API
 */
export function useFranchise(slug?: string) {
  return useQuery({
    queryKey: ["franchise", slug],
    queryFn: async (): Promise<FranchiseItem> => {
      if (!slug) throw new Error("Franchise slug is required");

      try {
        const res = await api.get<ApiResponse<BackendProperty>>(`/properties/${slug}`);
        if (res.data.success && res.data.data) {
          return transformPropertyToFranchise(res.data.data);
        }
        throw new Error(`Franchise with slug '${slug}' not found`);
      } catch (err) {
        console.error(`[useFranchise] Error fetching franchise '${slug}':`, err);
        throw err;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all franchise opportunities via Express REST API
 */
export function useFranchiseList() {
  return useQuery({
    queryKey: ["franchise-list"],
    queryFn: async (): Promise<FranchiseListItem[]> => {
      try {
        const res = await api.get<ApiResponse<BackendProperty[]>>("/properties", {
          params: { type: "FRANCHISE", limit: 50 },
        });

        if (res.data.success && Array.isArray(res.data.data)) {
          return res.data.data.map(transformPropertyToFranchiseListItem);
        }
        return [];
      } catch (err) {
        console.error("[useFranchiseList] Error fetching franchise list:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
