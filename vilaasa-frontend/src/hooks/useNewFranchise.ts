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

interface BackendProperty {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  description: string;
  type: string;
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
  supportModules?: string[] | null;
  advantages?: string[] | null;
  location?: BackendLocation | null;
  media?: BackendMedia[];
  amenities?: BackendAmenityRel[];
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/* -------------------- CURATED FALLBACK DATA -------------------- */

const FALLBACK_FRANCHISES: FranchiseItem[] = [
  {
    id: "wellness-resorts-kerala",
    name: "Wellness Resorts Kerala",
    category: "Franchises",
    type: "Wellness Resort",
    location: "Kerala & Pondicherry",
    price: 7000000,
    heroImage:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop&q=80",
    description: [
      "An ultra-luxury Ayurvedic sanctuary bringing 5,000 years of transformative wellness wisdom to institutional hospitality.",
      "Designed for high-yield investor aggregation with full operator-backed operational management under the FOCO framework.",
    ],
    spec: [
      { label: "Min Investment", value: "₹70,00,000" },
      { label: "Annual ROI", value: "24% Annually" },
      { label: "Payback Period", value: "3.5 Years" },
      { label: "Model", value: "FOCO (Franchise Owned Company Operated)" },
    ],
    galleryImages: [
      {
        name: "Ayurvedic Treatment Pavilion",
        description: "Bespoke Healing Suite",
        image:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80",
      },
      {
        name: "Private Infinity Lagoon",
        description: "Overwater Yoga Shala",
        image:
          "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200&auto=format&fit=crop&q=80",
      },
    ],
    financial: [
      { label: "Total Project Cost", value: "₹25,00,00,000" },
      { label: "Min Ticket Size", value: "₹70,00,000" },
      { label: "Lock In Period", value: "3 Years" },
      { label: "Yield Payout", value: "Quarterly Guaranteed" },
    ],
    support_training_para: [
      "Turnkey institutional development covering location scouting, biophilic architectural styling, therapist certification, and international marketing.",
    ],
    support_training: [
      {
        icon: "storefront",
        name: "Location Scouting",
        description: "Rigorous demographic analysis and prime waterfront sourcing.",
      },
      {
        icon: "design_services",
        name: "Biophilic Design",
        description: "Eco-luxe architecture harmonizing natural stone, timber, and water.",
      },
      {
        icon: "school",
        name: "Ayurveda Training",
        description: "Certified training programs via Kerala Ayurveda University.",
      },
      {
        icon: "campaign",
        name: "Global Marketing",
        description: "High-net-worth distribution across GCC, Europe, and India.",
      },
    ],
    advantages: [
      {
        icon: "spa",
        name: "Authentic Ayurveda",
        description: "Physician-designed transformative treatments with 5,000-year lineage.",
      },
      {
        icon: "self_improvement",
        name: "Yoga & Meditation",
        description: "Certified daily mindful journeys in serene natural settings.",
      },
      {
        icon: "psychiatry",
        name: "Transformative Journeys",
        description: "Curated 7-to-21-day immersive retreats with high retention rates.",
      },
    ],
  },
  {
    id: "carlton-wellness-spa",
    name: "Carlton Wellness Spa",
    category: "Franchises",
    type: "Luxury Day Spa",
    location: "Mumbai, Delhi, Bangalore",
    price: 7000000,
    heroImage:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&auto=format&fit=crop&q=80",
    description: [
      "Signature European thermal hydrotherapy and cryogenic healing suites tailored to tier-1 luxury metropolitan hubs.",
      "High-margin recurring membership model with established private clientele across prime real estate districts.",
    ],
    spec: [
      { label: "Min Investment", value: "₹70,00,000" },
      { label: "Annual ROI", value: "26% Annually" },
      { label: "Payback Period", value: "3 Years" },
      { label: "Model", value: "FOCO Institutional" },
    ],
    galleryImages: [
      {
        name: "Hydrotherapy Suite",
        description: "Thermal Mineral Bath",
        image:
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=80",
      },
    ],
    financial: [
      { label: "Total Project Cost", value: "₹18,00,00,000" },
      { label: "Min Ticket Size", value: "₹70,00,000" },
      { label: "Lock In Period", value: "2 Years" },
      { label: "Yield Payout", value: "Monthly Dividend" },
    ],
    support_training_para: [
      "Complete operational handover with proprietary client CRM and luxury brand ambassadorship.",
    ],
    support_training: [
      {
        icon: "storefront",
        name: "Location Scouting",
        description: "Prime high-street & 5-star hotel lobby leasing.",
      },
      {
        icon: "design_services",
        name: "Biophilic Design",
        description: "Soundproofed ambient sensory architecture.",
      },
    ],
    advantages: [
      {
        icon: "spa",
        name: "Thermal Healing",
        description: "Bespoke hydrothermal and infrared saunas.",
      },
    ],
  },
  {
    id: "colton-resort-chennai",
    name: "Colton Beach Resort",
    category: "Franchises",
    type: "Boutique Beach Resort",
    location: "Chennai ECR",
    price: 7000000,
    heroImage:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop&q=80",
    description: [
      "Exclusive beachfront hospitality destination on Chennai East Coast Road with private cabana villas and coastal dining.",
    ],
    spec: [
      { label: "Min Investment", value: "₹70,00,000" },
      { label: "Annual ROI", value: "22% Annually" },
      { label: "Payback Period", value: "4 Years" },
      { label: "Model", value: "FOCO" },
    ],
    galleryImages: [
      {
        name: "Beachfront Villa",
        description: "Ocean View",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
      },
    ],
    financial: [
      { label: "Total Project Cost", value: "₹30,00,00,000" },
      { label: "Min Ticket Size", value: "₹70,00,000" },
      { label: "Lock In Period", value: "3 Years" },
      { label: "Yield Payout", value: "Quarterly" },
    ],
  },
];

/* -------------------- TRANSFORMS -------------------- */

export function transformPropertyToFranchise(prop: BackendProperty): FranchiseItem {
  const heroUrl =
    prop.media?.find((m) => m.mediaType === "HERO_IMAGE")?.url ||
    prop.media?.[0]?.url ||
    DEFAULT_PROPERTY_IMAGES[prop.slug] ||
    DEFAULT_PROPERTY_IMAGE;

  const minTicket = Number(prop.minTicketSize || prop.price) || 0;
  const projectCost = Number(prop.totalProjectCost || Number(prop.price) * 3.5) || 0;
  const annualRoi = Number(prop.expectedAnnualRoi || prop.rentalYieldPercent || 24);
  const payback = prop.paybackPeriodYears ? `${prop.paybackPeriodYears} Years` : "3.5 Years";
  const lockIn = prop.lockInPeriodYears ? `${prop.lockInPeriodYears} Years` : "3 Years";
  const payout = prop.yieldPayoutFrequency || "Quarterly Distribution";
  const model = prop.franchiseModel || "FOCO";

  const supportModules = Array.isArray(prop.supportModules) ? prop.supportModules : [];
  const advantagesList = Array.isArray(prop.advantages) ? prop.advantages : [];

  return {
    id: prop.slug || prop.id,
    name: prop.name,
    category: "Franchises",
    type: prop.tagline || prop.type.replace(/_/g, " "),
    location: prop.location
      ? `${prop.location.city}, ${prop.location.country}`
      : "Prime Location",
    price: minTicket,
    heroImage: heroUrl,
    description: [prop.description],
    franchiseModel: model,
    minTicketSize: minTicket,
    totalProjectCost: projectCost,
    expectedAnnualRoi: annualRoi,
    paybackPeriodYears: prop.paybackPeriodYears || 3.5,
    lockInPeriodYears: prop.lockInPeriodYears || 3.0,
    yieldPayoutFrequency: payout,
    supportModules,
    advantagesList,
    spec: [
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
    ],
    galleryImages: (prop.media || []).map((m, idx) => ({
      name: m.altText || `${prop.name} View ${idx + 1}`,
      description: "Franchise Asset",
      image: m.url,
    })),
    financial: [
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
    ],
    support_training_para: supportModules.length
      ? supportModules
      : [
          "Full turnkey operational management, brand licensing, site selection, and marketing enablement.",
        ],
    support_training: supportModules.length
      ? supportModules.map((mod, idx) => ({
          icon: idx === 0 ? "storefront" : idx === 1 ? "design_services" : idx === 2 ? "school" : "campaign",
          name: mod.split(" ")[0] + " " + (mod.split(" ")[1] || "Module"),
          description: mod,
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
    advantages: advantagesList.length
      ? advantagesList.map((adv, idx) => ({
          icon: idx === 0 ? "spa" : idx === 1 ? "self_improvement" : "psychiatry",
          name: adv.split(" ")[0] + " " + (adv.split(" ")[1] || "Advantage"),
          description: adv,
        }))
      : (prop.amenities || []).map((a) => ({
          icon: a.amenity.iconKey || "spa",
          name: a.amenity.name,
          description: a.amenity.category || "Luxury Ecosystem Feature",
        })),
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

  return {
    id: prop.slug || prop.id,
    name: prop.name,
    type: prop.tagline || prop.type.replace(/_/g, " "),
    location: prop.location
      ? `${prop.location.city}, ${prop.location.country}`
      : "Prime Location",
    price: minTicket,
    category: "Franchises",
    image: imageUrl,
    franchiseModel: prop.franchiseModel || "FOCO",
    minTicketSize: minTicket,
    expectedAnnualRoi: annualRoi,
    investment: `${prop.currency} ${minTicket.toLocaleString()}`,
    expectedROI: `${annualRoi}% Annually`,
    features: [
      `${prop.franchiseModel || "FOCO"} Business Model`,
      `${prop.yieldPayoutFrequency || "Quarterly"} Dividend Payouts`,
      "Turnkey Operational Support",
    ],
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
      } catch {
        // Check fallback dataset if not found in backend DB
        const fallback = FALLBACK_FRANCHISES.find((f) => f.id === slug);
        if (fallback) return fallback;
      }

      const fallback = FALLBACK_FRANCHISES.find((f) => f.id === slug);
      if (fallback) return fallback;

      throw new Error(`Franchise with slug '${slug}' not found`);
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

        if (res.data.success && res.data.data && res.data.data.length > 0) {
          return res.data.data.map(transformPropertyToFranchiseListItem);
        }
      } catch {
        // Fallback to curated dataset
      }

      // Return curated list
      return FALLBACK_FRANCHISES.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        location: f.location,
        price: f.price,
        category: f.category,
        image: f.heroImage,
        investment: f.spec.find((s) => s.label === "Min Investment")?.value || "₹70,00,000",
        expectedROI: f.spec.find((s) => s.label === "Annual ROI")?.value || "24% Annually",
        features: [
          "FOCO Business Model",
          "Quarterly Dividend Payouts",
          "Turnkey Operational Management",
        ],
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
