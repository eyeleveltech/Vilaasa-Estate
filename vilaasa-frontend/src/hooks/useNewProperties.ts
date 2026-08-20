import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import {
  PropertyListItem,
  PropertyDetail,
  ConstructionAsset,
  DEFAULT_PROPERTY_IMAGES,
  DEFAULT_PROPERTY_IMAGE,
} from "@/types/property";
import { Property as BackendProperty, ApiResponse } from "@/admin/types/admin.types";

/**
 * Transforms a backend PostgreSQL Property model into frontend PropertyListItem
 */
function transformToListItem(prop: BackendProperty): PropertyListItem {
  const isDomestic =
    prop.location?.country?.trim().toLowerCase() === "india";

  const featuredMedia =
    prop.media?.find((m) => m.isFeatured)?.url ||
    prop.media?.[0]?.url ||
    DEFAULT_PROPERTY_IMAGES[prop.slug] ||
    DEFAULT_PROPERTY_IMAGE;

  const amenityNames = prop.amenities?.map((a) => a.amenity.name) || [
    "Private Pool",
    "Smart Automation",
    "24/7 Security",
  ];

  return {
    id: prop.slug || prop.id,
    name: prop.name,
    location: prop.location
      ? `${prop.location.city}, ${prop.location.country}`
      : "Dubai, UAE",
    price: Number(prop.price),
    type: prop.type
      ? prop.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Luxury Villa",
    roi: prop.rentalYieldPercent
      ? `${prop.rentalYieldPercent}% Net Yield`
      : "High Appreciation",
    status: prop.status
      ? prop.status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      : "Available",
    features: amenityNames.slice(0, 4),
    image: featuredMedia,
    franchiseCategory: isDomestic ? "Domestic" : "International",
    return: prop.expectedIrrPercent ? `${prop.expectedIrrPercent}% IRR` : undefined,
  };
}

/**
 * Transforms a backend PostgreSQL deep Property model into frontend PropertyDetail
 */
function transformToDetail(prop: BackendProperty): PropertyDetail {
  const heroImage =
    prop.media?.find((m) => m.mediaType === "HERO_IMAGE" || m.isFeatured)?.url ||
    prop.media?.[0]?.url ||
    DEFAULT_PROPERTY_IMAGES[prop.slug] ||
    DEFAULT_PROPERTY_IMAGE;

  const galleryImages = (prop.media || []).map((m, idx) => ({
    name: m.altText || `${prop.name} - View ${idx + 1}`,
    description: m.mediaType.replace(/_/g, " "),
    image: m.url,
  }));

  const specs = [
    { label: "Built-up Area", value: prop.totalAreaSqFt ? `${prop.totalAreaSqFt.toLocaleString()} Sq.Ft.` : "Custom" },
    { label: "Bedrooms", value: prop.bedrooms ? `${prop.bedrooms} Master Suites` : "Bespoke" },
    { label: "Bathrooms", value: prop.bathrooms ? `${prop.bathrooms} En-Suite Baths` : "Custom" },
    { label: "Furnishing", value: prop.furnishingStatus ? prop.furnishingStatus.replace(/_/g, " ") : "Designer Furnished" },
    { label: "Ownership", value: prop.ownershipType || "Freehold" },
    { label: "RERA / Permit", value: prop.reraNumber || "Approved" },
    {
      label: "Possession",
      value: prop.possessionDate
        ? new Date(prop.possessionDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "Ready to Move",
    },
  ];

  const financials = (prop.financialMetrics || []).map((f) => ({
    label: f.label,
    icon: f.icon || "payments",
    value: f.value,
    note: f.note || "",
  }));

  // Fallback financial metrics if none seeded
  if (financials.length === 0) {
    if (prop.rentalYieldPercent) {
      financials.push({
        label: "Projected Net Yield",
        icon: "savings",
        value: `${prop.rentalYieldPercent}% p.a.`,
        note: `Tax-free in ${prop.currency}`,
      });
    }
    if (prop.expectedIrrPercent) {
      financials.push({
        label: "Target IRR",
        icon: "trending_up",
        value: `${prop.expectedIrrPercent}%`,
        note: "5-Year Capital Horizon",
      });
    }
  }

  const configurations = (prop.configurations || []).map((c) => ({
    type: c.unitType,
    area: `${c.areaSqFt.toLocaleString()} Sq.Ft.`,
    view: c.viewType || "Panoramic Skyline",
    price: Number(c.price),
  }));

  const amenities = (prop.amenities || []).map((a) => ({
    name: a.amenity.name,
    icon: a.amenity.iconKey || "diamond",
    description: a.description || "Curated bespoke amenity.",
  }));

  const nearbyLocations = (prop.nearbyPlaces || []).map((p) => ({
    name: p.name,
    distance: p.distance,
  }));

  return {
    id: prop.slug || prop.id,
    name: prop.name,
    location: prop.location
      ? `${prop.location.city}, ${prop.location.country}`
      : "Dubai, UAE",
    country: prop.location?.country || "UAE",
    type: prop.type ? prop.type.replace(/_/g, " ") : "Luxury Estate",
    price: Number(prop.price),
    priceValue: prop.priceOnApplication
      ? "Price on Application"
      : `${prop.currency} ${Number(prop.price).toLocaleString()}`,
    status: prop.status ? prop.status.replace(/_/g, " ") : "Available",
    brochure:
      prop.brochureUrl ||
      prop.media?.find((m) => m.mediaType === "BROCHURE_PDF")?.url ||
      "https://res.cloudinary.com/vilaasa/sample-brochure.pdf",
    heroImage,
    description: [prop.description],
    verdict: {
      quote:
        prop.verdictQuote ||
        "An exceptional acquisition in an irreplaceable ultra-prime global enclave.",
      author: prop.verdictAuthor || "Vilaasa Advisory Board",
      title: prop.verdictTitle || "Director of Private Client Acquisitions",
    },
    specs,
    financials,
    configurations,
    galleryImages: galleryImages.length > 0 ? galleryImages : [{ name: prop.name, description: "Estate View", image: heroImage }],
    amenities,
    nearbyLocations,
    googleMapLink: prop.location?.googleMapUrl || "",
    visionHeadline:
      prop.visionHeadline ||
      "Where architectural vision converges with generational prestige.",
  };
}

/**
 * Fetch all properties from the backend API
 */
export function useProperties(category?: string) {
  return useQuery({
    queryKey: ["properties", category],
    queryFn: async (): Promise<PropertyListItem[]> => {
      try {
        const res = await api.get<ApiResponse<BackendProperty[]>>("/properties", {
          params: { limit: 50 },
        });
        if (res.data.success && res.data.data) {
          const transformed = res.data.data.map(transformToListItem);
          if (category) {
            return transformed.filter((p) => p.franchiseCategory === category);
          }
          return transformed;
        }
        return [];
      } catch (err) {
        console.error("Failed to fetch properties from backend:", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export const useNewProperties = useProperties;

/**
 * Fetch property details by slug from the backend API
 */
export function useProperty(slug: string) {
  return useQuery({
    queryKey: ["property", slug],
    queryFn: async (): Promise<PropertyDetail> => {
      const res = await api.get<ApiResponse<BackendProperty>>(
        `/properties/${slug}`,
      );
      if (res.data.success && res.data.data) {
        return transformToDetail(res.data.data);
      }
      throw new Error(`Property with slug '${slug}' was not found`);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export const usePropertyBySlug = useProperty;

/**
 * Fetch construction progress assets from backend API
 */
export function useConstructionAssets() {
  return useQuery({
    queryKey: ["construction-assets"],
    queryFn: async (): Promise<ConstructionAsset[]> => {
      try {
        const res = await api.get<ApiResponse<BackendProperty[]>>("/properties", {
          params: { limit: 50 },
        });

        if (res.data.success && res.data.data) {
          return res.data.data
            .filter((p) => p.constructionAsset)
            .map((p) => ({
              id: p.slug || p.id,
              name: p.name,
              location: p.location
                ? `${p.location.city}, ${p.location.country}`
                : "Dubai, UAE",
              image: p.media?.[0]?.url || DEFAULT_PROPERTY_IMAGE,
              structureProgress: p.constructionAsset?.structureProgress || 0,
              interiorProgress: p.constructionAsset?.interiorProgress || 0,
              overallProgress: p.constructionAsset?.overallProgress || 0,
              lastUpdate: p.constructionAsset?.lastUpdate
                ? new Date(p.constructionAsset.lastUpdate).toISOString()
                : new Date().toISOString(),
              milestones: (p.constructionAsset?.milestones || []).map((m) => ({
                name: m.name,
                status: m.status,
                targetDate: new Date(m.targetDate).toLocaleDateString(),
              })),
              gallery: (p.constructionAsset?.gallery || []).map((g) => ({
                name: g.caption || "Construction Update",
                description: new Date(g.date).toLocaleDateString(),
                image: g.imageUrl,
              })),
            }));
        }
        return [];
      } catch {
        return [];
      }
    },
  });
}
