import { useQuery } from "@tanstack/react-query";
import {
  graphqlRequest,
  PRODUCTS_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  ProductsResponse,
  ProductBySlugResponse,
  SaleorProduct,
  ProductAttribute,
} from "@/lib/graphql";
import {
  PropertyListItem,
  PropertyDetail,
  ConstructionAsset,
  DEFAULT_PROPERTY_IMAGES,
  DEFAULT_PROPERTY_IMAGE,
} from "@/types/property";

// Helper to get attribute value from Saleor product (Single)
function getAttributeValue(
  attributes: ProductAttribute[],
  slug: string,
): string | null {
  const attr = attributes.find((a) => a.attribute.slug === slug);
  if (attr && attr.values.length > 0) {
    return attr.values[0].plainText || attr.values[0].name;
  }
  return null;
}

// Helper to get attribute values from Saleor product (Multi)
function getAttributeValues(
  attributes: ProductAttribute[],
  slug: string,
): string[] {
  const attr = attributes.find((a) => a.attribute.slug === slug);

  if (attr && attr.values.length > 0) {
    return attr.values.map((v) => v.plainText || v.name);
  }
  return [];
}

// Parse EditorJS description to plain text array
function parseDescription(description: string | null): string[] {
  if (!description) return [];
  try {
    const parsed = JSON.parse(description);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .filter((block: { type: string }) => block.type === "paragraph")
        .map((block: { data: { text: string } }) => block.data.text);
    }
    return [description];
  } catch {
    return [description];
  }
}

// Helper to extract price
function getProductPrice(product: SaleorProduct): number {
  return product.pricing?.priceRange.start.gross.amount || 0;
}
// get pdf file
function getPdfMedia(product: SaleorProduct): string | null {
  const pdf = product.media?.find((m) => m.url.toLowerCase().endsWith(".pdf"));
  return pdf?.url || null;
}
function getFileAttributeUrl(
  attributes: ProductAttribute[],
  slug: string,
): string | null {
  const attr = attributes.find((a) => a.attribute.slug === slug);
  if (!attr || !attr.values.length) return null;

  return attr.values[0].file?.url || null;
}

// Transform Saleor product to PropertyListItem
function transformToListItem(product: SaleorProduct): PropertyListItem {
  const location = getAttributeValue(product.attributes, "location") || "";
  const status = getAttributeValue(product.attributes, "status") || "Available";
  const propertyType = product.productType?.name || "Residential";
  const rentalYield =
    getAttributeValue(product.attributes, "rental-yield") || "3-5% IRR";
  // Use the native Category name instead of attribute
  const franchiseCategory = product.category?.name;

  // Parse features from description if available
  let features = [
    "Premium Location",
    "High-End Finishes",
    "Luxury Amenities",
    "Investment Grade",
  ];

  try {
    if (product.description) {
      const parsed = JSON.parse(product.description);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        const listBlock = parsed.blocks.find(
          (b: { type: string }) => b.type === "list",
        );
        if (
          listBlock &&
          listBlock.data &&
          Array.isArray(listBlock.data.items)
        ) {
          features = listBlock.data.items;
        }
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  return {
    id: product.slug,
    name: product.name,
    location,
    price: getProductPrice(product),
    type: propertyType,
    roi: rentalYield,
    status,
    features,
    image:
      product.media?.[0]?.url ||
      DEFAULT_PROPERTY_IMAGES[product.slug] ||
      DEFAULT_PROPERTY_IMAGE,
    franchiseCategory: franchiseCategory || undefined,
  };
}

// Transform Saleor product to PropertyDetail
function transformToDetail(product: SaleorProduct): PropertyDetail {
  const location = getAttributeValue(product.attributes, "location") || "";
  const country = getAttributeValue(product.attributes, "country") || "";
  const status = getAttributeValue(product.attributes, "status") || "Available";
  const propertyType = product.productType?.name || "Residential";
  const totalArea = getAttributeValue(product.attributes, "total-area") || "";
  const configuration =
    getAttributeValue(product.attributes, "configuration") || "";
  const possession =
    getAttributeValue(product.attributes, "possession") || "Immediate";
  const rentalYield =
    getAttributeValue(product.attributes, "rental-yield") || "3.5% p.a.";
  const appreciation =
    getAttributeValue(product.attributes, "appreciation") || "15-20%";
  const furnishing =
    getAttributeValue(product.attributes, "furnishing") || "Semi-Furnished";
  const price = getProductPrice(product);

  const descriptions = parseDescription(product.description);

  const brochure = getFileAttributeUrl(
    product.attributes,
    "catalogue", // your file attribute slug
  );

  return {
    id: product.slug,
    name: product.name,
    location,
    country,
    type: propertyType,
    price,
    priceValue: `$${(price / 1000000).toFixed(1)}M+`, // Approximate string format
    status,
    heroImage:
      product.media?.[0]?.url ||
      DEFAULT_PROPERTY_IMAGES[product.slug] ||
      DEFAULT_PROPERTY_IMAGE,
    brochure: brochure || "",
    description:
      descriptions.length > 0
        ? descriptions
        : [
            "A premium luxury property offering exceptional living experience.",
            "Features world-class amenities and prime location advantages.",
          ],
    verdict: {
      quote: `An exceptional investment opportunity in ${location}. Strong appreciation potential with competitive rental yields.`,
      author: "Vilaasa Acquisitions",
      title: "Investment Advisory",
    },
    specs: [
      { label: "Property Type", value: propertyType },
      { label: "Configuration", value: configuration || "3 & 4 BHK" },
      { label: "Total Area", value: totalArea || "3,000+ Sq. Ft." },
      { label: "Possession", value: possession },
      { label: "Furnishing", value: furnishing },
    ],
    financials: [
      {
        label: "Projected Rental Yield",
        icon: "trending_up",
        value: rentalYield,
        trend: "up",
        note: "Based on current market analysis.",
      },
      {
        label: "5-Year Appreciation",
        icon: "monitoring",
        value: appreciation,
        trend: "up",
        note: "Historical growth trajectory.",
      },
      {
        label: "Breakeven Timeline",
        icon: "timelapse",
        value: "4 Years",
        trend: "neutral",
        note: "With standard financing terms.",
      },
    ],
    configurations: [
      {
        type: configuration || "3 BHK Residence",
        area: totalArea || "3,000 Sq. Ft.",
        view: "Premium View",
        price,
      },
    ],
    galleryImages: product.media?.map((m, index) => ({
      name: `${product.name} Image ${index + 1}`,
      description: m.alt || "Property View",
      image: m.url,
    })) || [
      {
        name: "Main Residence",
        description: "Exterior View",
        image: DEFAULT_PROPERTY_IMAGES[product.slug] || DEFAULT_PROPERTY_IMAGE,
      },
    ],
    amenities: getAttributeValues(product.attributes, "amenities").map(
      (name) => {
        const lower = name.toLowerCase();
        let icon = "star";
        let description = "Premium amenity";

        if (lower.includes("pool")) {
          icon = "pool";
          description = "Luxury pool with city views.";
        } else if (lower.includes("fitness") || lower.includes("gym")) {
          icon = "fitness_center";
          description = "State-of-the-art equipment.";
        } else if (lower.includes("spa") || lower.includes("wellness")) {
          icon = "spa";
          description = "Relaxation and wellness center.";
        } else if (lower.includes("security")) {
          icon = "security";
          description = "24/7 advanced security.";
        } else if (lower.includes("concierge")) {
          icon = "concierge";
          description = "Dedicated concierge service.";
        } // 'concierge' icon might not exist in standard material, but trying. Or 'room_service'
        else if (lower.includes("parking")) {
          icon = "local_parking";
          description = "Secure private parking.";
        } else if (lower.includes("smart")) {
          icon = "smart_toy";
          description = "Integrated smart home features.";
        } // or 'settings_remote'
        else if (lower.includes("garden") || lower.includes("green")) {
          icon = "yard";
          description = "Landscaped green spaces.";
        }

        return { icon, name, description };
      },
    ),

    nearbyLocations: [
      { name: "City Center", distance: "10 mins drive" },
      { name: "Airport", distance: "30 mins drive" },
      { name: "Shopping District", distance: "5 mins drive" },
    ],
  };
}

// Hook to fetch all properties
export function useProperties() {
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const data = await graphqlRequest<ProductsResponse>(PRODUCTS_QUERY, {
        first: 50,
      });

      return data.products.edges.map((edge) => transformToListItem(edge.node));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch single property by slug
export function useProperty(slug: string) {
  return useQuery({
    queryKey: ["property", slug],
    queryFn: async () => {
      const data = await graphqlRequest<ProductBySlugResponse>(
        PRODUCT_BY_SLUG_QUERY,
        { slug },
      );

      if (!data.product) {
        throw new Error("Property not found");
      }
      return transformToDetail(data.product);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
const DEFAULT_CONSTRUCTION_ASSET: ConstructionAsset = {
  id: "mock",
  name: "Mock Asset",
  location: "Mock Location",
  image: DEFAULT_PROPERTY_IMAGE,
  structureProgress: 0,
  interiorProgress: 0,
  overallProgress: 0,
  lastUpdate: new Date().toISOString(),
  milestones: [],
  gallery: [],
};

// Transform Saleor product to ConstructionAsset
function transformToConstructionAsset(
  product: SaleorProduct,
): ConstructionAsset | null {
  const assetMeta = product.metadata?.find(
    (m: any) => m.key === "construction_asset",
  );
  if (!assetMeta) return null;

  try {
    const data = JSON.parse(assetMeta.value);
    return {
      id: product.slug,
      name: product.name,
      location: getAttributeValue(product.attributes, "location") || "",
      image:
        product.media?.[0]?.url ||
        DEFAULT_PROPERTY_IMAGES[product.slug] ||
        DEFAULT_PROPERTY_IMAGE,
      structureProgress: data.structureProgress || 0,
      interiorProgress: data.interiorProgress || 0,
      overallProgress: data.overallProgress || 0,
      lastUpdate: data.lastUpdate || new Date().toISOString(),
      milestones: data.milestones || [],
      gallery: data.gallery || [],
    };
  } catch (e) {
    console.error("Failed to parse construction metadata", e);
    return null;
  }
}

// Hook to fetch construction assets
export function useConstructionAssets() {
  return useQuery({
    queryKey: ["construction-assets"],
    queryFn: async () => {
      const data = await graphqlRequest<ProductsResponse>(PRODUCTS_QUERY, {
        first: 50,
      });

      return data.products.edges
        .map((edge) => transformToConstructionAsset(edge.node))
        .filter((asset): asset is ConstructionAsset => asset !== null);
    },
    staleTime: 5 * 60 * 1000,
  });
}

//

// function transformTofileDetail(product: SaleorProduct): PropertyDetail {
//   return {
//     id: product.slug,
//     name: product.name,
//     brochurePdf: getPdfMedia(product),
//   };
// }

// franchise
// Franchise type
// Franchise type
export interface FranchiseItem {
  id: string;
  name: string;
  category: string; // This will always be the category name
  location: string;
  price: number;
  image: string;
  description: string[];
  brochure?: string | null;
}

// Transform Saleor product to FranchiseItem
export function transformToFranchise(product: SaleorProduct): FranchiseItem {
  const location = getAttributeValue(product.attributes, "location") || "";
  const price = getProductPrice(product);
  const category = product.category?.name || "Franchise";
  const descriptions = parseDescription(product.description);

  const brochure = getFileAttributeUrl(product.attributes, "catalogue");

  return {
    id: product.slug,
    name: product.name,
    category,
    location,
    price,
    image:
      product.media?.[0]?.url ||
      DEFAULT_PROPERTY_IMAGES[product.slug] ||
      DEFAULT_PROPERTY_IMAGE,
    description:
      descriptions.length > 0
        ? descriptions
        : ["A premium franchise opportunity with strong growth potential."],
    brochure: brochure || null,
  };
}

// Hook to fetch franchises
export function useFranchises() {
  return useQuery({
    queryKey: ["franchises"],
    queryFn: async () => {
      const data = await graphqlRequest<ProductsResponse>(PRODUCTS_QUERY, {
        first: 50,
      });

      // Filter products whose category is 'Franchise'
      return data.products.edges
        .filter((edge) => edge.node.category?.name === "Franchises")
        .map((edge) => transformToFranchise(edge.node));
    },
    staleTime: 5 * 60 * 1000,
  });
}

function getFranchiseMeta(product: SaleorProduct) {
  const meta = product.metadata?.find(
    (m: any) => m.key === "franchise_details",
  );

  if (!meta) return null;

  try {
    return JSON.parse(meta.value);
  } catch (e) {
    console.error("Invalid franchise metadata JSON", e);
    return null;
  }
}
// Franchise List Item (similar to PropertyListItem)
export interface FranchiseListItem {
  id: string;
  name: string;
  location: string;
  price: number;
  category: string;
  features: string[];
  image: string;

  minInvestment: string;
  annualROI: string;
  paybackPeriod: string;
  model: string;
  totalProjectCost: string;
}

// Transform Saleor product to FranchiseListItem
export function transformFranchiseToListItem(
  product: SaleorProduct,
): FranchiseListItem {
  const category = product.category?.name || "Franchises";
  const price = getProductPrice(product);

  const franchiseMeta = getFranchiseMeta(product);

  // Extract features from description
  let features = [
    "Investment Opportunity",
    "Premium Location",
    "Scalable Model",
  ];

  try {
    if (product.description) {
      const parsed = JSON.parse(product.description);
      const listBlock = parsed.blocks?.find((b: any) => b.type === "list");
      if (listBlock?.data?.items) {
        features = listBlock.data.items;
      }
    }
  } catch {}

  return {
    id: product.slug,
    name: product.name,
    location: franchiseMeta?.location || "",
    price,
    category,
    features,
    image:
      product.media?.[0]?.url ||
      DEFAULT_PROPERTY_IMAGES[product.slug] ||
      DEFAULT_PROPERTY_IMAGE,

    minInvestment: franchiseMeta?.minInvestment || "",
    annualROI: franchiseMeta?.annualROI || "",
    paybackPeriod: franchiseMeta?.paybackPeriod || "",
    model: franchiseMeta?.model || "",
    totalProjectCost: franchiseMeta?.totalProjectCost || "",
  };
}

// Hook to fetch franchise list items
export function useFranchiseList() {
  return useQuery({
    queryKey: ["franchise-list"],
    queryFn: async () => {
      const data = await graphqlRequest<ProductsResponse>(PRODUCTS_QUERY, {
        first: 50,
      });

      // Filter products whose category is 'Franchise'
      return data.products.edges
        .filter((edge) => edge.node.category?.name === "Franchises")
        .map((edge) => transformFranchiseToListItem(edge.node));
    },

    staleTime: 5 * 60 * 1000,
  });
}
