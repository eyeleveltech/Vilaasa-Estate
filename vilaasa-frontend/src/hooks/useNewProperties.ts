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
    rawType: prop.type,
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

  const galleryImages = (prop.media || [])
    .filter((m) => m.mediaType === "GALLERY" || m.mediaType === "HERO_IMAGE")
    .map((m, idx) => ({
      name: m.altText || `${prop.name} - View ${idx + 1}`,
      description: m.altText || "",
      image: m.url,
    }));

  const specs = [];
  
  if (prop.type) {
    specs.push({ label: "Property Type", value: prop.type.replace(/_/g, " ") });
  }
  if (prop.location?.city) {
    specs.push({ label: "Location", value: prop.location.city });
  }
  if (prop.price && Number(prop.price) > 0) {
    specs.push({ label: "Minimum Investment", value: `${prop.currency} ${Number(prop.price).toLocaleString()}` });
  }

  if (prop.bedrooms) {
    specs.push({ label: "Bedrooms", value: `${prop.bedrooms} BHK` });
  }
  if (prop.bathrooms) {
    specs.push({ label: "Bathrooms", value: `${prop.bathrooms}` });
  }
  if (prop.totalAreaSqFt) {
    specs.push({ label: "Built-up Area", value: `${prop.totalAreaSqFt.toLocaleString()} Sq.Ft.` });
  }
  if (prop.furnishingStatus) {
    specs.push({ label: "Furnishing", value: prop.furnishingStatus.replace(/_/g, " ") });
  }

  if (prop.configurations && prop.configurations.length > 0) {
    specs.push({ label: "Configuration", value: prop.configurations[0].unitType });
  }

  const financials = (prop.financialMetrics || []).map((f) => ({
    label: f.label,
    icon: f.icon || "payments",
    value: f.value,
    note: f.note || "",
  }));

  // No fallback financials as per user request
  
  const configurations = (prop.configurations || []).map((c) => ({
    type: c.unitType,
    area: `${c.areaSqFt.toLocaleString()} Sq.Ft.`,
    view: c.viewType || "Panoramic Skyline",
    price: Number(c.price),
  }));

  const amenities = (prop.amenities || []).map((a) => ({
    name: a.amenity.name,
    icon: a.amenity.iconKey || "spa",
    description: a.description || "",
  }));

  const nearbyLocations = (prop.nearbyPlaces || []).map((p) => ({
    name: p.name,
    distance: p.distance,
    travelTime: p.travelTime,
    description: p.description,
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
      undefined,
    heroImage,
    description: prop.description
      ? prop.description
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [prop.description || ""],
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
    galleryImages: galleryImages.length > 0 ? galleryImages : [{ name: prop.name, description: "", image: heroImage }],
    amenities,
    nearbyLocations,
    visionHeadline: prop.visionHeadline || undefined,
    virtualTour360Url: prop.virtualTour360Url,
    googleMapLink: prop.location?.googleMapUrl,
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
                id: m.id || Math.random().toString(),
                name: m.name,
                status: (m.status.toLowerCase() as "completed" | "in-progress" | "upcoming") || "upcoming",
                date: m.targetDate ? new Date(m.targetDate).toLocaleDateString() : new Date().toLocaleDateString(),
              })),
              gallery: (p.constructionAsset?.gallery || []).map((g) => ({
                id: g.id || Math.random().toString(),
                url: g.imageUrl,
                date: g.date ? new Date(g.date).toLocaleDateString() : new Date().toLocaleDateString(),
                caption: g.caption || "Construction Update",
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
