import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  LayoutGrid,
  TrendingUp,
  Tag,
  Layers,
  FileText,
  Upload,
  Star,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Compass,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { MediaUploader } from "../components/MediaUploader";
import { BrochureUploader } from "../components/BrochureUploader";
import {
  Property,
  PropertyType,
  PropertyStatus,
  Currency,
  ApiResponse,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { autoFormatCurrencySymbol } from "../lib/franchisePageHelpers";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS & HELPERS                         */
/* -------------------------------------------------------------------------- */

interface GalleryItemState {
  id: string;
  url: string;
  caption: string;
  orderIndex: number;
  isHero?: boolean;
}

const detectAmenityIcon = (name: string): string => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("panchakarma") || lower.includes("wellness") || lower.includes("ayurved")) return "spa";
  if (lower.includes("boat") || lower.includes("yacht") || lower.includes("marina") || lower.includes("sailing") || lower.includes("lake") || lower.includes("kayak")) return "directions_boat";
  if (lower.includes("clubhouse") || lower.includes("club") || lower.includes("lifestyle") || lower.includes("lounge")) return "cottage";
  if (lower.includes("helipad") || lower.includes("heli") || lower.includes("chopper") || lower.includes("aviation") || lower.includes("flight")) return "helicopter";
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("jacuzzi") || lower.includes("plunge")) return "pool";
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("crossfit") || lower.includes("training")) return "fitness_center";
  if (lower.includes("yoga") || lower.includes("meditat") || lower.includes("zen") || lower.includes("mindful")) return "self_improvement";
  if (lower.includes("spa") || lower.includes("sauna") || lower.includes("steam") || lower.includes("massage")) return "spa";
  if (lower.includes("tennis") || lower.includes("court") || lower.includes("racquet") || lower.includes("squash") || lower.includes("badminton")) return "sports_tennis";
  if (lower.includes("golf") || lower.includes("putting")) return "sports_golf";
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("guard") || lower.includes("surveillance") || lower.includes("gated")) return "security";
  if (lower.includes("garden") || lower.includes("park") || lower.includes("lawn") || lower.includes("nature") || lower.includes("landscape") || lower.includes("forest")) return "park";
  if (lower.includes("dining") || lower.includes("restaurant") || lower.includes("culinary") || lower.includes("bistro") || lower.includes("cafe") || lower.includes("kitchen")) return "restaurant";
  if (lower.includes("bar") || lower.includes("wine") || lower.includes("cellar") || lower.includes("cocktail") || lower.includes("pub")) return "local_bar";
  if (lower.includes("beach") || lower.includes("coast") || lower.includes("shore") || lower.includes("sea") || lower.includes("ocean")) return "beach_access";
  if (lower.includes("theater") || lower.includes("theatre") || lower.includes("cinema") || lower.includes("movie") || lower.includes("screening")) return "theaters";
  if (lower.includes("concierge") || lower.includes("butler") || lower.includes("room service") || lower.includes("valet service")) return "room_service";
  if (lower.includes("parking") || lower.includes("garage") || lower.includes("valet") || lower.includes("ev charge") || lower.includes("car")) return "local_parking";
  if (lower.includes("wifi") || lower.includes("internet") || lower.includes("smart home") || lower.includes("automation")) return "wifi";
  if (lower.includes("kids") || lower.includes("children") || lower.includes("play") || lower.includes("creche") || lower.includes("daycare")) return "child_care";
  if (lower.includes("pet") || lower.includes("dog")) return "pets";
  if (lower.includes("library") || lower.includes("study") || lower.includes("cowork") || lower.includes("business")) return "menu_book";
  if (lower.includes("deck") || lower.includes("terrace") || lower.includes("view") || lower.includes("skyline") || lower.includes("rooftop")) return "deck";
  if (lower.includes("hospital") || lower.includes("clinic") || lower.includes("medical") || lower.includes("health")) return "local_hospital";
  return "star";
};

const COMMON_AMENITY_ICONS = [
  { label: "Wellness / Leaf", icon: "eco" },
  { label: "Spa / Lotus", icon: "spa" },
  { label: "Yoga / Zen", icon: "self_improvement" },
  { label: "Clubhouse", icon: "cottage" },
  { label: "Boat Club", icon: "directions_boat" },
  { label: "Helipad", icon: "helicopter" },
  { label: "Pool", icon: "pool" },
  { label: "Fitness Center", icon: "fitness_center" },
  { label: "Tennis Court", icon: "sports_tennis" },
  { label: "Golf Course", icon: "sports_golf" },
  { label: "Dining / Culinary", icon: "restaurant" },
  { label: "Lounge Bar", icon: "local_bar" },
  { label: "Beach Access", icon: "beach_access" },
  { label: "Security 24/7", icon: "security" },
  { label: "Private Garden", icon: "park" },
  { label: "Concierge Butler", icon: "room_service" },
  { label: "Valet Parking", icon: "local_parking" },
  { label: "High-Speed WiFi", icon: "wifi" },
  { label: "Star / Bespoke", icon: "star" },
];

const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; dotColor: string; badgeClass: string; activeBorder: string; emoji: string }
> = {
  AVAILABLE: {
    label: "Available (For Sale)",
    dotColor: "bg-emerald-500",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    activeBorder: "border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    emoji: "🟢",
  },
  READY_TO_MOVE: {
    label: "Ready to Move",
    dotColor: "bg-teal-400",
    badgeClass: "border-teal-500/40 bg-teal-500/10 text-teal-300",
    activeBorder: "border-teal-400 text-teal-300 bg-teal-500/10 shadow-[0_0_12px_rgba(20,184,166,0.25)]",
    emoji: "🟢",
  },
  UNDER_CONSTRUCTION: {
    label: "Under Construction",
    dotColor: "bg-amber-400",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    activeBorder: "border-amber-400 text-amber-300 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    emoji: "🟡",
  },
  OFF_PLAN: {
    label: "Off-Plan Offering",
    dotColor: "bg-sky-400",
    badgeClass: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    activeBorder: "border-sky-400 text-sky-300 bg-sky-500/10 shadow-[0_0_12px_rgba(56,189,248,0.25)]",
    emoji: "🔵",
  },
  RESERVED: {
    label: "Reserved",
    dotColor: "bg-purple-400",
    badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    activeBorder: "border-purple-400 text-purple-300 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]",
    emoji: "🟣",
  },
  SOLD: {
    label: "Sold / Closed",
    dotColor: "bg-rose-500",
    badgeClass: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    activeBorder: "border-rose-500 text-rose-400 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
    emoji: "🔴",
  },
};

const mapToPropertyTypeEnum = (text: string): PropertyType => {
  const lower = (text || "").toLowerCase();
  if (lower.includes("apartment") || lower.includes("flat")) return "RESIDENTIAL_APARTMENT";
  if (lower.includes("penthouse")) return "PENTHOUSE";
  if (lower.includes("commercial") || lower.includes("office") || lower.includes("retail")) return "COMMERCIAL";
  if (lower.includes("plot") || lower.includes("land") || lower.includes("farm")) return "FARMLAND";
  if (lower.includes("franchise")) return "FRANCHISE";
  if (lower.includes("heritage") || lower.includes("estate")) return "HERITAGE_ESTATE";
  return "RESIDENTIAL_VILLA";
};

const parseAmountNumber = (val: string | undefined): number => {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  if (/cr/i.test(val)) return num * 10000000;
  if (/l|lac|lakh/i.test(val)) return num * 100000;
  if (/k/i.test(val)) return num * 1000;
  if (/m/i.test(val)) return num * 1000000;
  return num;
};

// Section Definitions for Quick Nav
const SECTIONS_NAV = [
  { id: "sec-hero", label: "1. Hero & Basics" },
  { id: "sec-vision", label: "2. Vision & Story" },
  { id: "sec-specs", label: "3. At a Glance" },
  { id: "sec-financials", label: "4. Financials" },
  { id: "sec-pricing", label: "5. Pricing & Units" },
  { id: "sec-gallery", label: "6. Visual Showcase" },
  { id: "sec-amenities", label: "7. Amenities" },
  { id: "sec-location", label: "8. Location" },
];

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export const AdminPropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);

  // 1. Hero & Core Listing
  const [marketScope, setMarketScope] = useState<"DOMESTIC" | "INTERNATIONAL">("DOMESTIC");
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [status, setStatus] = useState<PropertyStatus>("AVAILABLE");
  const [virtualTour360Url, setVirtualTour360Url] = useState<string>("");
  const [brochureUrl, setBrochureUrl] = useState<string>("");

  // 2. Vision & Advisory Verdict
  const [visionHeadline, setVisionHeadline] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [verdictQuote, setVerdictQuote] = useState<string>("");
  const [verdictAuthor, setVerdictAuthor] = useState<string>("");
  const [verdictTitle, setVerdictTitle] = useState<string>("");

  // 3. At a Glance (Dynamic Specs)
  const [customSpecs, setCustomSpecs] = useState<{ label: string; value: string }[]>([]);

  // 4. Financial Intelligence
  const [financialMetrics, setFinancialMetrics] = useState<
    { label: string; value: string; note: string; icon: string }[]
  >([]);

  // 5. Pricing & Unit Configurations
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [priceOnApplication, setPriceOnApplication] = useState<boolean>(false);
  const [rentalYieldPercent, setRentalYieldPercent] = useState<string>("");
  const [expectedIrrPercent, setExpectedIrrPercent] = useState<string>("");
  const [configurations, setConfigurations] = useState<
    { unitType: string; areaSqFt: string; viewType: string; price: string; isAvailable: boolean }[]
  >([]);

  // 6. Gallery & Media Assets
  const [galleryImages, setGalleryImages] = useState<GalleryItemState[]>([]);
  const [existingMedia, setExistingMedia] = useState<Property["media"]>([]);

  // 7. Curated Amenities
  const [amenities, setAmenities] = useState<
    { name: string; iconKey: string; description: string }[]
  >([]);

  // 8. Location & Connectivity
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [community, setCommunity] = useState<string>("");
  const [addressLine, setAddressLine] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [googleMapUrl, setGoogleMapUrl] = useState<string>("");
  const [nearbyPlaces, setNearbyPlaces] = useState<
    { name: string; distance: string; travelTime: string; category: string; description: string }[]
  >([]);

  /* -------------------------- Fetch Existing Data ------------------------- */
  const fetchPropertyData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      if (res.data.success && res.data.data) {
        const prop = res.data.data;
        setName(prop.name || "");
        setTagline(prop.tagline || "");
        setVisionHeadline(prop.visionHeadline || "");
        setVerdictQuote(prop.verdictQuote || "");
        setVerdictAuthor(prop.verdictAuthor || "");
        setVerdictTitle(prop.verdictTitle || "");
        setPropertyType(prop.customType || (prop.type ? prop.type.replace(/_/g, " ") : ""));
        setStatus(prop.status);
        setDescription(prop.description || "");
        setVirtualTour360Url(prop.virtualTour360Url || "");
        setBrochureUrl(prop.brochureUrl || "");
        setPrice(prop.price ? prop.price.toString() : "");
        setCurrency(prop.currency || "INR");
        setPriceOnApplication(Boolean(prop.priceOnApplication));
        setRentalYieldPercent(prop.rentalYieldPercent?.toString() || "");
        setExpectedIrrPercent(prop.expectedIrrPercent?.toString() || "");

        // Specs
        if (prop.customSpecs && Array.isArray(prop.customSpecs) && prop.customSpecs.length > 0) {
          setCustomSpecs(prop.customSpecs);
        }

        // Financials
        if (prop.financialMetrics && prop.financialMetrics.length > 0) {
          setFinancialMetrics(
            prop.financialMetrics.map((f) => ({
              label: f.label || "",
              value: f.value || "",
              note: f.note || "",
              icon: f.icon || "payments",
            }))
          );
        }

        // Configurations
        if (prop.configurations && prop.configurations.length > 0) {
          setConfigurations(
            prop.configurations.map((c) => ({
              unitType: c.unitType || "",
              areaSqFt: c.areaSqFt?.toString() || "",
              viewType: c.viewType || "",
              price: c.price?.toString() || "",
              isAvailable: c.isAvailable ?? true,
            }))
          );
        }

        // Location
        if (prop.location) {
          const isDom = prop.location.country?.trim().toLowerCase() === "india";
          setMarketScope(isDom ? "DOMESTIC" : "INTERNATIONAL");
          setCity(prop.location.city || "");
          setCountry(prop.location.country || (isDom ? "India" : "United Arab Emirates"));
          setCommunity(prop.location.community || "");
          setAddressLine(prop.location.addressLine || "");
          setLatitude(prop.location.latitude?.toString() || "");
          setLongitude(prop.location.longitude?.toString() || "");
          setGoogleMapUrl(prop.location.mapEmbedUrl || prop.location.googleMapUrl || "");
        }

        // Amenities
        if (prop.amenities && prop.amenities.length > 0) {
          setAmenities(
            prop.amenities.map((a) => ({
              name: a.amenity?.name || "",
              iconKey: a.amenity?.iconKey || detectAmenityIcon(a.amenity?.name || "") || "star",
              description: a.description || "",
            }))
          );
        }

        // Nearby Places
        if (prop.nearbyPlaces && prop.nearbyPlaces.length > 0) {
          setNearbyPlaces(
            prop.nearbyPlaces.map((p) => ({
              name: p.name || "",
              distance: p.distance || "Nearby",
              travelTime: p.travelTime || "",
              category: p.category || "Transit",
              description: p.description || "",
            }))
          );
        }

        // Media Gallery
        if (prop.media && Array.isArray(prop.media)) {
          setExistingMedia(prop.media);
          const gal = prop.media.map((m, idx) => ({
            id: m.id || `gal-${idx}`,
            url: m.url,
            caption: m.caption || "",
            orderIndex: m.orderIndex ?? idx,
            isHero: Boolean(m.isFeatured || idx === 0),
          }));
          setGalleryImages(gal);
        }
      }
    } catch {
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchPropertyData();
  }, [fetchPropertyData]);

  /* ---------------------------- Scope Change ------------------------------ */
  const handleMarketScopeChange = (scope: "DOMESTIC" | "INTERNATIONAL") => {
    setMarketScope(scope);
    if (scope === "DOMESTIC") {
      setCurrency("INR");
      setCountry("India");
    } else {
      setCurrency("AED");
      setCountry("United Arab Emirates");
    }
  };

  /* ------------------------ Array Mutator Handlers ------------------------ */
  // Specs
  const handleAddSpec = () => {
    setCustomSpecs((prev) => [...prev, { label: "", value: "" }]);
  };
  const handleRemoveSpec = (index: number) => {
    setCustomSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleUpdateSpec = (index: number, field: "label" | "value", val: string) => {
    setCustomSpecs((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: val };
      }
      return updated;
    });
  };

  // Financials
  const handleAddFinancialMetric = () => {
    setFinancialMetrics((prev) => [
      ...prev,
      { label: "", value: "", note: "", icon: "trending_up" },
    ]);
  };
  const handleRemoveFinancialMetric = (index: number) => {
    setFinancialMetrics((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleUpdateFinancialMetric = (
    index: number,
    field: "label" | "value" | "note" | "icon",
    val: string
  ) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setFinancialMetrics((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: formattedVal };
      }
      return updated;
    });
  };

  // Configurations
  const handleAddConfiguration = () => {
    setConfigurations((prev) => [
      ...prev,
      { unitType: "", areaSqFt: "", viewType: "", price: "", isAvailable: true },
    ]);
  };
  const handleRemoveConfiguration = (index: number) => {
    setConfigurations((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleUpdateConfiguration = (
    index: number,
    field: "unitType" | "areaSqFt" | "viewType" | "price" | "isAvailable",
    val: string | boolean
  ) => {
    const formattedVal = field === "price" && typeof val === "string" ? autoFormatCurrencySymbol(val) : val;
    setConfigurations((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: formattedVal };
      }
      return updated;
    });
  };

  // Amenities
  const handleAddAmenity = () => {
    setAmenities((prev) => [...prev, { name: "", iconKey: "star", description: "" }]);
  };
  const handleRemoveAmenity = (index: number) => {
    setAmenities((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleUpdateAmenity = (
    index: number,
    field: "name" | "iconKey" | "description",
    val: string
  ) => {
    setAmenities((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        let newIcon = updated[index].iconKey;
        if (field === "name") {
          const detected = detectAmenityIcon(val);
          if (detected) newIcon = detected;
        }
        updated[index] = {
          ...updated[index],
          [field]: val,
          ...(field === "name" ? { iconKey: newIcon } : {}),
        };
      }
      return updated;
    });
  };

  // Nearby Places
  const handleAddNearbyPlace = () => {
    setNearbyPlaces((prev) => [
      ...prev,
      { name: "", distance: "", travelTime: "", category: "Transit", description: "" },
    ]);
  };
  const handleRemoveNearbyPlace = (index: number) => {
    setNearbyPlaces((prev) => prev.filter((_, idx) => idx !== index));
  };
  const handleUpdateNearbyPlace = (
    index: number,
    field: "name" | "distance" | "travelTime" | "category" | "description",
    val: string
  ) => {
    setNearbyPlaces((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: val };
      }
      return updated;
    });
  };

  // Gallery
  const handleUploadGalleryImage = async (file: File) => {
    if (!file) return;
    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "properties/gallery");
      const res = await api.post<ApiResponse<{ url: string }>>("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success && res.data.data?.url) {
        const newImg: GalleryItemState = {
          id: `gal-${Date.now()}`,
          url: res.data.data.url,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          orderIndex: galleryImages.length,
          isHero: galleryImages.length === 0,
        };
        setGalleryImages((prev) => [...prev, newImg]);
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleToggleHeroImage = (index: number) => {
    setGalleryImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isHero: i === index ? !img.isHero : false,
      }))
    );
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateGalleryCaption = (index: number, caption: string) => {
    setGalleryImages((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], caption };
      }
      return updated;
    });
  };

  /* ---------------------------- Save Handler ------------------------------ */
  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Property name is required");
      return false;
    }
    if (!propertyType.trim()) {
      toast.error("Property type is required");
      return false;
    }
    if (description.trim().length > 0 && description.trim().length < 10) {
      toast.error("Description should be descriptive (at least 10 characters)");
      return false;
    }
    return true;
  };

  const handleSaveProperty = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const cleanedCustomSpecs = customSpecs
        .filter((s) => s.label.trim() && s.value.trim())
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }));

      const cleanedFinancialMetrics = financialMetrics
        .filter((f) => f.label.trim() && f.value.trim())
        .map((f) => ({
          label: f.label.trim(),
          value: f.value.trim(),
          note: f.note.trim() || undefined,
          icon: f.icon.trim() || undefined,
        }));

      const cleanedConfigurations = configurations
        .filter((c) => c.unitType.trim())
        .map((c) => ({
          unitType: c.unitType.trim(),
          areaSqFt: parseFloat(c.areaSqFt) || 0,
          viewType: c.viewType.trim() || undefined,
          price: parseAmountNumber(c.price),
          isAvailable: c.isAvailable ?? true,
        }));

      const mappedType = mapToPropertyTypeEnum(propertyType);

      const mediaPayload = galleryImages.map((img, idx) => ({
        url: img.url,
        caption: img.caption || undefined,
        mediaType: "IMAGE",
        isFeatured: Boolean(img.isHero || idx === 0),
        orderIndex: idx,
      }));

      const payload = {
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        visionHeadline: visionHeadline.trim() || undefined,
        verdictQuote: verdictQuote.trim() || undefined,
        verdictAuthor: verdictAuthor.trim() || undefined,
        verdictTitle: verdictTitle.trim() || undefined,
        type: mappedType,
        customType: propertyType.trim(),
        status,
        description: description.trim(),
        virtualTour360Url: virtualTour360Url.trim() || undefined,
        brochureUrl: brochureUrl.trim() || undefined,
        customSpecs: cleanedCustomSpecs,
        price: priceOnApplication ? 0 : parseAmountNumber(price),
        currency,
        priceOnApplication,
        rentalYieldPercent: rentalYieldPercent ? parseFloat(rentalYieldPercent) : undefined,
        expectedIrrPercent: expectedIrrPercent ? parseFloat(expectedIrrPercent) : undefined,
        financialMetrics: cleanedFinancialMetrics,
        configurations: cleanedConfigurations,
        media: mediaPayload.length > 0 ? mediaPayload : undefined,
        amenities: amenities
          .filter((a) => a.name.trim())
          .map((a) => ({
            name: a.name.trim(),
            iconKey: a.iconKey.trim() || detectAmenityIcon(a.name.trim()) || "star",
            description: a.description.trim() || undefined,
          })),
        nearbyPlaces: nearbyPlaces
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            distance: p.distance.trim() || (p.travelTime.trim() ? `${p.travelTime.trim()} drive` : "Nearby"),
            travelTime: p.travelTime.trim() || undefined,
            category: p.category.trim() || undefined,
            description: p.description.trim() || undefined,
          })),
        location: {
          city: city.trim() || (marketScope === "INTERNATIONAL" ? "Dubai" : "Goa"),
          country: country.trim() || (marketScope === "INTERNATIONAL" ? "United Arab Emirates" : "India"),
          community: community.trim() || undefined,
          addressLine: addressLine.trim() || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          mapEmbedUrl: googleMapUrl.trim() || undefined,
          googleMapUrl: googleMapUrl.trim() || undefined,
        },
      };

      if (isEditMode && id) {
        const res = await api.put<ApiResponse<Property>>(`/properties/${id}`, payload);
        if (res.data.success) {
          queryClient.invalidateQueries({ queryKey: ["properties"] });
          queryClient.invalidateQueries({ queryKey: ["property", id] });
          toast.success("Property updated successfully!");
          navigate("/admin/properties");
        }
      } else {
        const res = await api.post<ApiResponse<Property>>("/properties", payload);
        if (res.data.success) {
          queryClient.invalidateQueries({ queryKey: ["properties"] });
          toast.success("Property created successfully!");
          navigate("/admin/properties");
        }
      }
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save property";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading property details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ----------------- TOP HEADER BAR ----------------- */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/properties")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                {isEditMode ? "Edit Property" : "Add New Property"}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {marketScope === "DOMESTIC" ? "🇮🇳 Domestic" : "🇦🇪 International"}
              </span>
            </div>
            <h1 className="text-base font-bold text-foreground truncate max-w-md mt-0.5">
              {name || "Untitled Luxury Estate"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/properties")}
            className="text-xs h-8"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveProperty}
            disabled={saving}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-semibold h-8 px-4"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isEditMode ? "Save Changes" : "Create Property"}</span>
          </Button>
        </div>
      </div>

      {/* ----------------- QUICK SECTION JUMP NAV ----------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-lg border border-border bg-card shadow-sm text-xs">
        {SECTIONS_NAV.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 whitespace-nowrap transition-colors font-medium text-[11px]"
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* ----------------- FORM SECTIONS CONTAINER ----------------- */}
      <div className="space-y-8">
        {/* SECTION 1: HERO & CORE LISTING */}
        <section id="sec-hero" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="border-b border-border/70 pb-3 mb-5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              1. Hero Header &amp; Core Listing
            </span>
          </div>

          <div className="space-y-5">
            {/* Market Scope */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Market Scope &amp; Region
              </Label>
              <div className="grid grid-cols-2 gap-3 max-w-md mt-1.5">
                <button
                  type="button"
                  onClick={() => handleMarketScopeChange("DOMESTIC")}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-xs font-semibold transition-all ${
                    marketScope === "DOMESTIC"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>🇮🇳 Domestic (India)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarketScopeChange("INTERNATIONAL")}
                  className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-xs font-semibold transition-all ${
                    marketScope === "INTERNATIONAL"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>🇦🇪 International (UAE / Global)</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Property Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Glasshouse Sanctuary"
                  className="bg-secondary/40 h-10 text-sm font-semibold mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Hero Subtitle / Description (Top Banner Hook)
                </Label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Live or Lease - Your Villa, Your Choice. Ultra-luxury waterfront villa in North Goa..."
                  className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder="e.g. Residential Villa, Penthouse, Farmland Estate"
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Listing Status
                </Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className="w-full bg-secondary/40 border border-border rounded-md px-3 h-10 text-sm text-foreground focus:outline-none focus:border-primary mt-1"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.emoji} {conf.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  360° Virtual Tour URL
                </Label>
                <Input
                  value={virtualTour360Url}
                  onChange={(e) => setVirtualTour360Url(e.target.value)}
                  placeholder="e.g. https://my.matterport.com/show/?m=..."
                  className="bg-secondary/40 h-10 text-sm mt-1 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Official Property Brochure (PDF)
                </Label>
                <div className="mt-1">
                  <BrochureUploader
                    value={brochureUrl}
                    onChange={(url) => {
                      setBrochureUrl(url);
                      toast.success("Brochure attached!");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE VISION & STORY */}
        <section id="sec-vision" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              2. The Vision Story &amp; Advisory Verdict
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Vision Headline
              </Label>
              <Input
                value={visionHeadline}
                onChange={(e) => setVisionHeadline(e.target.value)}
                placeholder="e.g. Where architectural mastery merges with pristine nature."
                className="bg-secondary/40 h-10 text-sm mt-1"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Vision Story Narrative (Section 2 Body) <span className="text-destructive">*</span>
              </Label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Elaborate on the architectural philosophy, craftsmanship, landscape integration, and lifestyle story..."
                className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
              />
            </div>

            <div className="pt-3 border-t border-border/60 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Advisory Verdict Quote
                </Label>
                <textarea
                  rows={2}
                  value={verdictQuote}
                  onChange={(e) => setVerdictQuote(e.target.value)}
                  placeholder='e.g. "An unprecedented trophy asset offering rare riparian rights and unmatched capital longevity."'
                  className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Verdict Author
                  </Label>
                  <Input
                    value={verdictAuthor}
                    onChange={(e) => setVerdictAuthor(e.target.value)}
                    placeholder="e.g. Vilaasa Advisory Board"
                    className="bg-secondary/40 h-9 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Verdict Title / Role
                  </Label>
                  <Input
                    value={verdictTitle}
                    onChange={(e) => setVerdictTitle(e.target.value)}
                    placeholder="e.g. Director of Private Client Acquisitions"
                    className="bg-secondary/40 h-9 text-xs mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: AT A GLANCE (SPECS) */}
        <section id="sec-specs" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              3. At a Glance (Key Specifications)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSpec}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Spec</span>
            </Button>
          </div>

          {customSpecs.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground">
                No custom specifications added. Click &quot;Add Spec&quot; to configure key specs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {customSpecs.map((spec, idx) => {
                const specPlaceholders = [
                  { label: "e.g. BUILT-UP AREA", value: "e.g. 6,500 Sq.Ft." },
                  { label: "e.g. BEDROOMS", value: "e.g. 5 Master Suites" },
                  { label: "e.g. FURNISHING", value: "e.g. Fully Furnished" },
                  { label: "e.g. OWNERSHIP", value: "e.g. Freehold" },
                ];
                const ph = specPlaceholders[idx] || { label: "e.g. SPEC LABEL", value: "e.g. Value" };

                return (
                  <div key={idx} className="relative p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Spec #{idx + 1}
                      </Label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Spec"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Label</Label>
                      <Input
                        value={spec.label}
                        onChange={(e) => handleUpdateSpec(idx, "label", e.target.value)}
                        placeholder={ph.label}
                        className="bg-secondary/40 h-8 text-xs font-semibold mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Value</Label>
                      <Input
                        value={spec.value}
                        onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                        placeholder={ph.value}
                        className="bg-secondary/40 h-8 text-xs text-foreground font-bold mt-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 4: FINANCIAL INTELLIGENCE */}
        <section id="sec-financials" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              4. Financial Intelligence
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFinancialMetric}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Metric</span>
            </Button>
          </div>

          {financialMetrics.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground">
                No financial metrics added. Click &quot;Add Metric&quot; to configure ROI metrics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {financialMetrics.map((metric, idx) => {
                const finPlaceholders = [
                  { label: "e.g. PROJECTED IRR", value: "e.g. 18% - 22%", note: "e.g. 5-Year Capital Horizon" },
                  { label: "e.g. ANNUAL APPRECIATION", value: "e.g. 14% CAGR", note: "e.g. Luxury Segment Benchmark" },
                  { label: "e.g. BREAKEVEN TIMELINE", value: "e.g. 4.5 Years", note: "e.g. Full Capital Recovery" },
                  { label: "e.g. NET RENTAL YIELD", value: "e.g. 8.5% p.a.", note: "e.g. Managed Villa Rental" },
                ];
                const ph = finPlaceholders[idx] || { label: "e.g. METRIC NAME", value: "e.g. Value", note: "e.g. Context Note" };

                return (
                  <div key={idx} className="relative p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Metric #{idx + 1}
                      </Label>
                      <button
                        type="button"
                        onClick={() => handleRemoveFinancialMetric(idx)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Metric"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Label</Label>
                      <Input
                        value={metric.label}
                        onChange={(e) => handleUpdateFinancialMetric(idx, "label", e.target.value)}
                        placeholder={ph.label}
                        className="bg-secondary/40 h-8 text-xs font-semibold mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Value</Label>
                      <Input
                        value={metric.value}
                        onChange={(e) => handleUpdateFinancialMetric(idx, "value", e.target.value)}
                        placeholder={ph.value}
                        className="bg-secondary/40 h-8 text-xs text-primary font-bold mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Context Note</Label>
                      <Input
                        value={metric.note}
                        onChange={(e) => handleUpdateFinancialMetric(idx, "note", e.target.value)}
                        placeholder={ph.note}
                        className="bg-secondary/40 h-7 text-[11px] text-muted-foreground mt-1"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 5: PRICING & CONFIGURATIONS */}
        <section id="sec-pricing" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="border-b border-border/70 pb-3 mb-5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              5. Pricing &amp; Unit Configurations
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Base Price (Auto-Currency: inr 12 cr ➔ ₹12 Cr)
                </Label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    disabled={priceOnApplication}
                    className="w-24 bg-secondary/40 border border-border rounded-md px-2.5 h-10 text-xs font-bold text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <Input
                    value={price}
                    onChange={(e) => setPrice(autoFormatCurrencySymbol(e.target.value))}
                    disabled={priceOnApplication}
                    placeholder="e.g. ₹15 Cr or 150000000"
                    className="bg-secondary/40 h-10 text-sm font-semibold flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="poa"
                  checked={priceOnApplication}
                  onChange={(e) => setPriceOnApplication(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="poa" className="text-xs font-medium cursor-pointer">
                  Price On Application (POA)
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Expected Rental Yield (%)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 12.5"
                  value={rentalYieldPercent}
                  onChange={(e) => setRentalYieldPercent(e.target.value)}
                  className="bg-secondary/40 h-10 text-xs mt-1 font-mono"
                />
              </div>
            </div>

            {/* Configurations Table */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Unit Configurations &amp; Layout Breakdowns
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Specify 3 BHK, 4 BHK, or custom penthouse floor plans and pricing.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddConfiguration}
                  className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Unit Layout</span>
                </Button>
              </div>

              {configurations.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <p className="text-xs text-muted-foreground">
                    No unit layouts defined. Click &quot;Add Unit Layout&quot; to specify BHK suites.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {configurations.map((config, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 p-3 rounded-lg border border-border bg-secondary/20 items-end"
                    >
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">Unit Type</Label>
                        <Input
                          placeholder="e.g. 4 BHK Royal Villa"
                          value={config.unitType}
                          onChange={(e) => handleUpdateConfiguration(idx, "unitType", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs font-semibold mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">Area (Sq.Ft.)</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 4500"
                          value={config.areaSqFt}
                          onChange={(e) => handleUpdateConfiguration(idx, "areaSqFt", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs font-mono mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">View Type</Label>
                        <Input
                          placeholder="e.g. Sea View / Private Garden"
                          value={config.viewType}
                          onChange={(e) => handleUpdateConfiguration(idx, "viewType", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">Price ({currency})</Label>
                        <Input
                          placeholder="e.g. ₹5.5 Cr"
                          value={config.price}
                          onChange={(e) => handleUpdateConfiguration(idx, "price", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs font-semibold text-primary mt-1"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 h-8">
                        <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.isAvailable}
                            onChange={(e) => handleUpdateConfiguration(idx, "isAvailable", e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-border text-primary"
                          />
                          <span>Available</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveConfiguration(idx)}
                          className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                          title="Remove Layout"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 6: VISUAL SHOWCASE & GALLERY */}
        <section id="sec-gallery" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                6. Visual Showcase &amp; Architectural Gallery
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload luxury architectural photography, layouts, and mark your primary Hero Image.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUploadGalleryImage(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingGallery}
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 h-8 text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                {uploadingGallery ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>Upload Image</span>
              </Button>
            </div>
          </div>

          {galleryImages.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">No gallery images uploaded</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click &quot;Upload Image&quot; to add photos, floor plans, and select your Hero Showcase image.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  className={`relative rounded-xl border p-3 bg-secondary/20 space-y-2.5 transition-all ${
                    img.isHero ? "border-amber-400/80 shadow-md ring-1 ring-amber-400/30" : "border-border"
                  }`}
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/40 relative">
                    <img src={img.url} alt={img.caption || "Gallery"} className="w-full h-full object-cover" />
                    {img.isHero && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        <Star className="h-3 w-3 fill-black" />
                        <span>★ Hero Image</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(img.isHero)}
                          onChange={() => handleToggleHeroImage(idx)}
                          className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-[11px] font-semibold">Show as Hero Image</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase">Caption / Title</Label>
                      <Input
                        value={img.caption}
                        onChange={(e) => handleUpdateGalleryCaption(idx, e.target.value)}
                        placeholder="e.g. Master Bedroom View"
                        className="bg-secondary/40 h-8 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 7: AMENITIES */}
        <section id="sec-amenities" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              7. Signature Amenities
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAmenity}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Amenity</span>
            </Button>
          </div>

          {amenities.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
              <p className="text-xs text-muted-foreground">
                No amenities added yet. Click &quot;Add Amenity&quot; to configure luxury features.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {amenities.map((amenity, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-border bg-secondary/20 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30 shrink-0">
                        <span className="material-symbols-outlined text-lg">{amenity.iconKey || "star"}</span>
                      </div>
                      <Input
                        placeholder="Amenity Name (e.g. Private Marina & Yacht Berth)"
                        value={amenity.name}
                        onChange={(e) => handleUpdateAmenity(idx, "name", e.target.value)}
                        className="bg-secondary/40 h-8 text-xs font-semibold flex-1"
                      />
                    </div>
                    <select
                      value={amenity.iconKey || "star"}
                      onChange={(e) => handleUpdateAmenity(idx, "iconKey", e.target.value)}
                      className="bg-secondary/70 border border-border text-[11px] rounded px-2 h-8 text-muted-foreground max-w-[130px]"
                    >
                      {COMMON_AMENITY_ICONS.map((p) => (
                        <option key={p.icon} value={p.icon}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(idx)}
                      className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove Amenity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Input
                    placeholder="Context / Details (e.g. 24/7 dedicated concierge and yacht mooring privileges)"
                    value={amenity.description}
                    onChange={(e) => handleUpdateAmenity(idx, "description", e.target.value)}
                    className="bg-secondary/40 h-7 text-[11px] text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 8: LOCATION & CONNECTIVITY */}
        <section id="sec-location" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="border-b border-border/70 pb-3 mb-5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              8. Location &amp; Connectivity
            </span>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">City</Label>
                <Input
                  placeholder={marketScope === "INTERNATIONAL" ? "Dubai" : "Goa"}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Country</Label>
                <Input
                  placeholder={marketScope === "INTERNATIONAL" ? "United Arab Emirates" : "India"}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Community / Area
                </Label>
                <Input
                  placeholder={marketScope === "INTERNATIONAL" ? "Palm Jumeirah" : "Candolim Beachfront"}
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Address Line
                </Label>
                <Input
                  placeholder="e.g. Coastal Highway, Plot 42"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder={marketScope === "INTERNATIONAL" ? "25.1124" : "15.5186"}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="bg-secondary/40 h-9 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder={marketScope === "INTERNATIONAL" ? "55.1390" : "73.7634"}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="bg-secondary/40 h-9 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Google Maps Link</Label>
                <Input
                  placeholder="e.g. https://maps.google.com/?q=..."
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="bg-secondary/40 h-9 text-xs mt-1 font-mono"
                />
              </div>
            </div>

            {/* Nearby Places */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Nearby Landmarks &amp; Commute Times
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Airports, helipads, beaches, hospitals, and transit hubs.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNearbyPlace}
                  className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Place</span>
                </Button>
              </div>

              {nearbyPlaces.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <p className="text-xs text-muted-foreground">
                    No nearby places added. Click &quot;Add Place&quot; to list airports or beaches.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {nearbyPlaces.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border bg-secondary/20 space-y-2"
                    >
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Landmark (e.g. MOPA International Airport)"
                          value={place.name}
                          onChange={(e) => handleUpdateNearbyPlace(idx, "name", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs font-semibold flex-1"
                        />
                        <Input
                          placeholder="Distance (e.g. 24 km)"
                          value={place.distance}
                          onChange={(e) => handleUpdateNearbyPlace(idx, "distance", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs w-28"
                        />
                        <Input
                          placeholder="Travel (e.g. 35 Mins)"
                          value={place.travelTime}
                          onChange={(e) => handleUpdateNearbyPlace(idx, "travelTime", e.target.value)}
                          className="bg-secondary/40 h-8 text-xs w-32"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNearbyPlace(idx)}
                          className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove Place"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Input
                        placeholder="Context (e.g. Direct expressway access from main gates)"
                        value={place.description}
                        onChange={(e) => handleUpdateNearbyPlace(idx, "description", e.target.value)}
                        className="bg-secondary/40 h-7 text-[11px] text-muted-foreground"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ----------------- BOTTOM INLINE ACTIONS ----------------- */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/properties")}
          className="text-xs"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={handleSaveProperty}
          disabled={saving}
          size="lg"
          className="gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider px-8"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isEditMode ? "Save Changes" : "Create Property"}</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminPropertyForm;
