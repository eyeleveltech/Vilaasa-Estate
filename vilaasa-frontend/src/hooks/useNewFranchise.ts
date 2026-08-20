import { useQuery } from "@tanstack/react-query";
import {
  graphqlRequest,
  PRODUCTS_QUERY,
  ProductsResponse,
  SaleorProduct,
  PRODUCT_BY_SLUG_QUERY,
  ProductBySlugResponse,
  ProductAttribute,
} from "@/lib/graphql";
import {
  DEFAULT_PROPERTY_IMAGE,
  DEFAULT_PROPERTY_IMAGES,
  PropertyAmenity,
  PropertyGalleryImage,
  PropertySpec,
} from "@/types/property";

interface EditorJsBlock {
  data?: {
    text?: string;
  };
}

interface EditorJsData {
  blocks?: EditorJsBlock[];
}

/* -------------------- HELPERS -------------------- */

// Single value attribute
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

// Multi value attribute
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

function getProductPrice(product: SaleorProduct): number {
  return product.pricing?.priceRange.start.gross.amount || 0;
}

// EditorJS / plain description parser
function parseDescription(description: string | null): string[] {
  if (!description) return [];
  try {
    const parsed = JSON.parse(description) as EditorJsData;
    if (Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block) => block.data?.text)
        .filter((text): text is string => Boolean(text));
    }
  } catch {
    return [description];
  }
  return [description];
}

// File attribute (PDF / brochure)
function getFileAttributeUrl(
  attributes: ProductAttribute[],
  slug: string,
): string | null {
  const attr = attributes.find((a) => a.attribute.slug === slug);
  return attr?.values?.[0]?.file?.url || null;
}

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
  investment?: string | null;
  expectedROI?: string | null;
  features: string[];
}

/* -------------------- TRANSFORMS -------------------- */

// Franchise detail card
export function transformToFranchise(product: SaleorProduct): FranchiseItem {
  return {
    id: product.slug,
    name: product.name,
    category: product.category?.name || "Franchises",
    type: product.productType?.name || "Premium",
    heroImage:
      product.media?.[0]?.url ||
      DEFAULT_PROPERTY_IMAGES[product.slug] ||
      DEFAULT_PROPERTY_IMAGE,
    description: parseDescription(product.description),
    location: getAttributeValue(product.attributes, "location") || "",
    price: getProductPrice(product),
    spec: [
      {
        label: "Min Investment",
        value: getAttributeValue(product.attributes, "min-Investment") || "N/A",
      },
      {
        label: "Annual ROI",
        value: getAttributeValue(product.attributes, "annual-roi") || "N/A",
      },
      {
        label: "Payback Period",
        value: getAttributeValue(product.attributes, "payback-period") || "N/A",
      },
      {
        label: "Model",
        value: getAttributeValue(product.attributes, "model") || "N/A",
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
    financial: [
      {
        label: "Total Project Cost",
        value:
          getAttributeValues(product.attributes, "total-project-cost") || "N/A",
      },
      {
        label: "Min Ticket Size",
        value:
          getAttributeValues(product.attributes, "min-ticket-size") || "N/A",
      },
      {
        label: "Lock In Period",
        value: getAttributeValue(product.attributes, "lock-in-period") || "N/A",
      },
      {
        label: "Yield Payout",
        value: getAttributeValue(product.attributes, "yield-payout") || "N/A",
      },
    ],
    support_training_para: getAttributeValues(
      product.attributes,
      "support-and-training",
    ),
    support_training: [
      {
        icon: "storefront",
        name: "Locating Scouting",
        description:
          getAttributeValue(product.attributes, "location-Scouting") || "N/A",
      },
      {
        icon: "design_services",
        name: "Biophilic Design",
        description:
          getAttributeValue(product.attributes, "biophilic-design") || "N/A",
      },
      {
        icon: "school",
        name: "Ayurveda Training",
        description:
          getAttributeValue(product.attributes, "ayurveda-training") || "N/A",
      },
      {
        icon: "campaign",
        name: "Global Marketing",
        description:
          getAttributeValue(product.attributes, "global-Marketing") || "N/A",
      },
    ],
    advantages: [
      {
        icon: "spa",
        name: "Authentic Ayurveda",
        description:
          "Treatments designed by Kerala Ayurveda University-trained physicians with 5,000 years of healing wisdom.",
      },
      {
        icon: "self_improvement",
        name: "Yoga & Meditation",
        description:
          "Daily programs led by certified instructors in serene natural settings.",
      },
      {
        icon: "psychiatry",
        name: "Transformative Journeys",
        description:
          "Curated wellness programs from 7 to 21 days for complete mind-body-spirit renewal.",
      },
    ],
  };
}

// Franchise list card
export function transformFranchiseToListItem(
  product: SaleorProduct,
): FranchiseListItem {
  return {
    id: product.slug,
    name: product.name,
    type: product.productType?.name || "Premium",
    location: getAttributeValue(product.attributes, "location") || "",
    price: getProductPrice(product),
    category: product.category?.name || "Franchises",
    features: getAttributeValues(product.attributes, "features"),
    image:
      product.media?.[0]?.url ||
      DEFAULT_PROPERTY_IMAGES[product.slug] ||
      DEFAULT_PROPERTY_IMAGE,

    investment: getAttributeValue(product.attributes, "min-Investment") || "",
    expectedROI: getAttributeValue(product.attributes, "annual-roi") || "",
  };
}

/* -------------------- HOOKS -------------------- */

export function useFranchise(slug: string) {
  return useQuery({
    queryKey: ["franchise", slug],
    queryFn: async () => {
      const data = await graphqlRequest<ProductBySlugResponse>(
        PRODUCT_BY_SLUG_QUERY,
        { slug },
      );

      if (!data.product) {
        throw new Error("Franchise not found");
      }

      if (data.product.category?.name !== "Franchises") {
        throw new Error("Not a franchise");
      }

      return transformToFranchise(data.product);
    },

    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFranchiseList() {
  return useQuery({
    queryKey: ["franchise-list"],
    queryFn: async () => {
      const data = await graphqlRequest<ProductsResponse>(PRODUCTS_QUERY, {
        first: 50,
      });

      // DEBUG: confirm attributes are coming
      // console.log(
      //   "FRANCHISE ATTRIBUTES 👉",
      //   data.products.edges
      //     .filter((e) => e.node.category?.name === "Franchises")
      //     .map((e) => ({
      //       name: e.node.name,
      //       attributes: e.node.attributes.map((a) => ({
      //         slug: a.attribute.slug,
      //         values: a.values.map((v) => v.name),
      //       })),
      //     })),
      // );

      return data.products.edges
        .filter((e) => e.node.category?.name === "Franchises")
        .map((e) => transformFranchiseToListItem(e.node));
    },
    staleTime: 5 * 60 * 1000,
  });
}
