// Property types for the frontend

export interface PropertyListItem {
  id: string;
  name: string;
  location: string;
  price: number;
  type: string;
  roi: string;
  status: string;
  features: string[];
  image: string;
  franchiseCategory?: string;
  return?:string
}

export interface PropertySpec {
  label: string;
  value: string;
}

export interface PropertyFinancial {
  label: string;
  icon: string;
  value: string;
  trend?: string;
  note: string;
}

export interface PropertyConfiguration {
  type: string;
  area: string;
  view: string;
  price: number;
}

export interface PropertyGalleryImage {
  name: string;
  description: string;
  image: string;
}

export interface PropertyAmenity {
  icon: string;
  name: string;
  description: string | string[];
}

export interface PropertyNearbyLocation {
  name: string;
  distance: string;
}

export interface PropertyVerdict {
  quote: string;
  author: string;
  title: string;
}

export interface PropertyDetail {
  id: string;
  name: string;
  location: string;
  country: string;
  type: string;
  price: number;
  priceValue: string;
  status: string;
  brochure: string;
  heroImage: string;
  heroVideo?: string;
  description: string[];
  verdict: PropertyVerdict;
  specs: PropertySpec[];
  financials: PropertyFinancial[];
  configurations: PropertyConfiguration[];
  galleryImages: PropertyGalleryImage[];
  amenities: PropertyAmenity[];
  nearbyLocations: PropertyNearbyLocation[];
  googleMapLink: string
  visionHeadline: string
}

// Default placeholder images for properties
export const DEFAULT_PROPERTY_IMAGES: Record<string, string> = {
  "the-aurum":
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
  "palm-royale":
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80",
  "manhattan-heights":
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80",
  "beverly-estate":
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=80",
  "marina-bay-penthouse":
    "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1920&q=80",
  "monaco-harbour":
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1920&q=80",
  "swiss-alps-chalet":
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&q=80",
  "mumbai-sea-link":
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=80",
};

export const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80";

export interface ConstructionMilestone {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "upcoming";
  date: string;
}

export interface ConstructionGalleryItem {
  id: string;
  url: string;
  date: string;
  caption: string;
}

export interface ConstructionAsset {
  id: string;
  name: string;
  location: string;
  image: string;
  structureProgress: number;
  interiorProgress: number;
  overallProgress: number;
  lastUpdate: string;
  milestones: ConstructionMilestone[];
  gallery: ConstructionGalleryItem[];
}






