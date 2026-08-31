import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
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
  CheckCircle,
  AlertCircle,
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
import {
  autoFormatCurrencySymbol,
  formatCurrencyInput,
  SPEC_PRESETS,
  FINANCIAL_METRIC_PRESETS,
  UNIT_TYPE_PRESETS,
  AMENITY_PRESETS,
  NEARBY_CATEGORY_PRESETS,
} from "../lib/franchisePageHelpers";
import { SortableArrayItem } from "../components/SortableArrayItem";
import { PresetDropdown } from "../components/PresetDropdown";
import { DraftSaveBar } from "../components/DraftSaveBar";

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

const COMMON_FINANCIAL_ICONS = [
  { label: "Trending Up (IRR)", icon: "trending_up" },
  { label: "Monitoring (Market Size)", icon: "monitoring" },
  { label: "Timelapse (Growth)", icon: "timelapse" },
  { label: "Payments (Rental Yield)", icon: "payments" },
  { label: "Savings (Capital Gains)", icon: "savings" },
  { label: "Real Estate (Development)", icon: "real_estate_agent" },
  { label: "Schedule (Timeline)", icon: "schedule" },
  { label: "Receipt (Stamp Duty)", icon: "receipt_long" },
  { label: "Account Balance (Escrow)", icon: "account_balance" },
];

const detectFinancialIcon = (label: string, currentIcon?: string): string => {
  const lower = (label || "").toLowerCase();
  if (lower.includes("irr") || lower.includes("yield") || lower.includes("return")) return "trending_up";
  if (lower.includes("market") || lower.includes("size") || lower.includes("tam") || lower.includes("gdv") || lower.includes("valuation")) return "monitoring";
  if (lower.includes("growth") || lower.includes("timeline") || lower.includes("cagr") || lower.includes("appreciation") || lower.includes("breakeven")) return "timelapse";
  return currentIcon || "trending_up";
};

const detectAmenityIcon = (name: string): string => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("spa") || lower.includes("panchakarma") || lower.includes("wellness") || lower.includes("ayurved") || lower.includes("sauna") || lower.includes("steam") || lower.includes("massage")) return "spa";
  if (lower.includes("water") || lower.includes("lake") || lower.includes("river") || lower.includes("fountain") || lower.includes("aquatic") || lower.includes("pond") || lower.includes("canal") || lower.includes("waterfront")) return "water";
  if (lower.includes("eco") || lower.includes("organic") || lower.includes("green") || lower.includes("biophilic") || lower.includes("sustainab") || lower.includes("nature") || lower.includes("botanical")) return "eco";
  if (lower.includes("dining") || lower.includes("restaurant") || lower.includes("culinary") || lower.includes("bistro") || lower.includes("cafe") || lower.includes("kitchen") || lower.includes("gourmet")) return "restaurant";
  if (lower.includes("boat") || lower.includes("yacht") || lower.includes("marina") || lower.includes("sailing") || lower.includes("kayak")) return "directions_boat";
  if (lower.includes("clubhouse") || lower.includes("club") || lower.includes("lifestyle") || lower.includes("lounge")) return "cottage";
  if (lower.includes("helipad") || lower.includes("heli") || lower.includes("chopper") || lower.includes("aviation") || lower.includes("flight")) return "helicopter";
  if (lower.includes("pool") || lower.includes("swim") || lower.includes("jacuzzi") || lower.includes("plunge")) return "pool";
  if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("crossfit") || lower.includes("training")) return "fitness_center";
  if (lower.includes("yoga") || lower.includes("meditat") || lower.includes("zen") || lower.includes("mindful")) return "self_improvement";
  if (lower.includes("tennis") || lower.includes("court") || lower.includes("racquet") || lower.includes("squash") || lower.includes("badminton")) return "sports_tennis";
  if (lower.includes("golf") || lower.includes("putting")) return "sports_golf";
  if (lower.includes("security") || lower.includes("cctv") || lower.includes("guard") || lower.includes("surveillance") || lower.includes("gated")) return "security";
  if (lower.includes("garden") || lower.includes("park") || lower.includes("lawn") || lower.includes("landscape") || lower.includes("forest")) return "park";
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
  { label: "Spa / Wellness", icon: "spa" },
  { label: "Water / Waterfront", icon: "water" },
  { label: "Eco / Sustainable", icon: "eco" },
  { label: "Dining / Culinary", icon: "restaurant" },
  { label: "Pool / Swimming", icon: "pool" },
  { label: "Fitness Center", icon: "fitness_center" },
  { label: "Yoga / Zen", icon: "self_improvement" },
  { label: "Clubhouse", icon: "cottage" },
  { label: "Boat Club & Marina", icon: "directions_boat" },
  { label: "Helipad", icon: "helicopter" },
  { label: "Tennis Court", icon: "sports_tennis" },
  { label: "Golf Course", icon: "sports_golf" },
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

// Helper to generate unique IDs for dynamic array items
const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export const AdminPropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const draftKey = `vilaasa_property_draft_${id || "new"}`;

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);

  /* ---------------------- DnD Sensors ---------------------------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  // 3. At a Glance (Dynamic Specs) — items get an id for dnd-kit
  const [customSpecs, setCustomSpecs] = useState<{ id: string; label: string; value: string }[]>([]);

  // 4. Financial Intelligence
  const [financialMetrics, setFinancialMetrics] = useState<
    { id: string; label: string; value: string; note: string; icon: string }[]
  >([]);

  // 5. Pricing & Unit Configurations
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [priceOnApplication, setPriceOnApplication] = useState<boolean>(false);
  const [rentalYieldPercent, setRentalYieldPercent] = useState<string>("");
  const [expectedIrrPercent, setExpectedIrrPercent] = useState<string>("");
  const [configurations, setConfigurations] = useState<
    { id: string; unitType: string; areaSqFt: string; viewType: string; price: string; isAvailable: boolean }[]
  >([]);

  // 6. Gallery & Media Assets
  const [galleryImages, setGalleryImages] = useState<GalleryItemState[]>([]);
  const [existingMedia, setExistingMedia] = useState<Property["media"]>([]);

  // 7. Curated Amenities
  const [amenities, setAmenities] = useState<
    { id: string; name: string; iconKey: string; description: string }[]
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
    { id: string; name: string; distance: string; travelTime: string; category: string; description: string }[]
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
          setCustomSpecs(prop.customSpecs.map((s: { label: string; value: string }, i: number) => ({ id: genId(`spec${i}`), ...s })));
        }

        // Financials
        if (prop.financialMetrics && prop.financialMetrics.length > 0) {
          setFinancialMetrics(
            prop.financialMetrics.map((f, i) => ({
              id: genId(`fin${i}`),
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
            prop.configurations.map((c, i) => ({
              id: genId(`cfg${i}`),
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
            prop.amenities.map((a, i) => ({
              id: genId(`am${i}`),
              name: a.amenity?.name || "",
              iconKey: a.amenity?.iconKey || detectAmenityIcon(a.amenity?.name || "") || "star",
              description: a.description || "",
            }))
          );
        }

        // Nearby Places
        if (prop.nearbyPlaces && prop.nearbyPlaces.length > 0) {
          setNearbyPlaces(
            prop.nearbyPlaces.map((p, i) => ({
              id: genId(`np${i}`),
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
            caption: m.caption || m.altText || "",
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

  /* -------------------- Draft Restore Handler ---------------------------- */
  const handleDraftRestore = (savedState: unknown) => {
    try {
      const s = savedState as {
        name?: string; tagline?: string; description?: string; visionHeadline?: string;
        verdictQuote?: string; verdictAuthor?: string; verdictTitle?: string;
        propertyType?: string; price?: string; customSpecs?: typeof customSpecs;
        financialMetrics?: typeof financialMetrics; configurations?: typeof configurations;
        amenities?: typeof amenities; nearbyPlaces?: typeof nearbyPlaces;
      };
      if (s.name) setName(s.name);
      if (s.tagline) setTagline(s.tagline);
      if (s.description) setDescription(s.description);
      if (s.visionHeadline) setVisionHeadline(s.visionHeadline);
      if (s.verdictQuote) setVerdictQuote(s.verdictQuote);
      if (s.verdictAuthor) setVerdictAuthor(s.verdictAuthor);
      if (s.verdictTitle) setVerdictTitle(s.verdictTitle);
      if (s.propertyType) setPropertyType(s.propertyType);
      if (s.price) setPrice(s.price);
      if (s.customSpecs) setCustomSpecs(s.customSpecs);
      if (s.financialMetrics) setFinancialMetrics(s.financialMetrics);
      if (s.configurations) setConfigurations(s.configurations);
      if (s.amenities) setAmenities(s.amenities);
      if (s.nearbyPlaces) setNearbyPlaces(s.nearbyPlaces);
      toast.success("Draft restored!");
    } catch {
      toast.error("Failed to restore draft.");
    }
  };

  /* -------------------- Generic DnD/Clone helpers ----------------------- */
  const reorderById = <T extends { id: string }>(arr: T[], activeId: string, overId: string): T[] => {
    const ai = arr.findIndex((x) => x.id === activeId);
    const oi = arr.findIndex((x) => x.id === overId);
    if (ai < 0 || oi < 0) return arr;
    return arrayMove(arr, ai, oi);
  };

  const cloneById = <T extends { id: string }>(arr: T[], id: string): T[] => {
    const idx = arr.findIndex((x) => x.id === id);
    if (idx < 0) return arr;
    const cloned = { ...arr[idx], id: genId("clone") };
    const result = [...arr];
    result.splice(idx + 1, 0, cloned);
    return result;
  };

  /* ------------------------ Array Mutator Handlers ------------------------ */
  // Specs
  const handleAddSpec = (preset?: { label: string } | null) => {
    setCustomSpecs((prev) => [...prev, { id: genId("spec"), label: preset?.label || "", value: "" }]);
  };
  const handleRemoveSpec = (id: string) => {
    setCustomSpecs((prev) => prev.filter((x) => x.id !== id));
  };
  const handleCloneSpec = (id: string) => setCustomSpecs((prev) => cloneById(prev, id));
  const handleDragEndSpecs = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setCustomSpecs((prev) => reorderById(prev, String(active.id), String(over.id)));
  };
  const handleUpdateSpec = (id: string, field: "label" | "value", val: string) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setCustomSpecs((prev) =>
      prev.map((x) => x.id === id ? { ...x, [field]: formattedVal } : x)
    );
  };

  // Financials
  const handleAddFinancialMetric = (preset?: { label: string; icon?: string } | null) => {
    setFinancialMetrics((prev) => [
      ...prev,
      { id: genId("fin"), label: preset?.label || "", value: "", note: "", icon: preset?.icon || "trending_up" },
    ]);
  };
  const handleRemoveFinancialMetric = (id: string) => {
    setFinancialMetrics((prev) => prev.filter((x) => x.id !== id));
  };
  const handleCloneFinancialMetric = (id: string) => setFinancialMetrics((prev) => cloneById(prev, id));
  const handleDragEndFinancialMetrics = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setFinancialMetrics((prev) => reorderById(prev, String(active.id), String(over.id)));
  };
  const handleUpdateFinancialMetric = (
    id: string,
    field: "label" | "value" | "note" | "icon",
    val: string
  ) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setFinancialMetrics((prev) =>
      prev.map((x) => x.id === id ? { ...x, [field]: formattedVal } : x)
    );
  };

  // Configurations
  const handleAddConfiguration = (preset?: { label: string } | null) => {
    setConfigurations((prev) => [
      ...prev,
      { id: genId("cfg"), unitType: preset?.label || "", areaSqFt: "", viewType: "", price: "", isAvailable: true },
    ]);
  };
  const handleRemoveConfiguration = (id: string) => {
    setConfigurations((prev) => prev.filter((x) => x.id !== id));
  };
  const handleCloneConfiguration = (id: string) => setConfigurations((prev) => cloneById(prev, id));
  const handleDragEndConfigurations = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setConfigurations((prev) => reorderById(prev, String(active.id), String(over.id)));
  };
  const handleUpdateConfiguration = (
    id: string,
    field: "unitType" | "areaSqFt" | "viewType" | "price" | "isAvailable",
    val: string | boolean
  ) => {
    const formattedVal = field === "price" && typeof val === "string" ? autoFormatCurrencySymbol(val) : val;
    setConfigurations((prev) =>
      prev.map((x) => x.id === id ? { ...x, [field]: formattedVal } : x)
    );
  };

  // Amenities
  const handleAddAmenity = (preset?: { label: string; icon?: string } | null) => {
    setAmenities((prev) => [...prev, { id: genId("am"), name: preset?.label || "", iconKey: preset?.icon || "star", description: "" }]);
  };
  const handleRemoveAmenity = (id: string) => {
    setAmenities((prev) => prev.filter((x) => x.id !== id));
  };
  const handleCloneAmenity = (id: string) => setAmenities((prev) => cloneById(prev, id));
  const handleDragEndAmenities = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setAmenities((prev) => reorderById(prev, String(active.id), String(over.id)));
  };
  const handleUpdateAmenity = (
    id: string,
    field: "name" | "iconKey" | "description",
    val: string
  ) => {
    setAmenities((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const newIcon = field === "name" ? (detectAmenityIcon(val) || x.iconKey) : x.iconKey;
        return { ...x, [field]: val, ...(field === "name" ? { iconKey: newIcon } : {}) };
      })
    );
  };

  // Nearby Places
  const handleAddNearbyPlace = (category?: string) => {
    setNearbyPlaces((prev) => [
      ...prev,
      { id: genId("np"), name: "", distance: "", travelTime: "", category: category || "Transit", description: "" },
    ]);
  };
  const handleRemoveNearbyPlace = (id: string) => {
    setNearbyPlaces((prev) => prev.filter((x) => x.id !== id));
  };
  const handleCloneNearbyPlace = (id: string) => setNearbyPlaces((prev) => cloneById(prev, id));
  const handleDragEndNearbyPlaces = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setNearbyPlaces((prev) => reorderById(prev, String(active.id), String(over.id)));
  };
  const handleUpdateNearbyPlace = (
    id: string,
    field: "name" | "distance" | "travelTime" | "category" | "description",
    val: string
  ) => {
    setNearbyPlaces((prev) =>
      prev.map((x) => x.id === id ? { ...x, [field]: val } : x)
    );
  };

  // Gallery — batch upload
  const handleUploadGalleryImages = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    const MAX_GALLERY_SIZE = 2 * 1024 * 1024; // 2MB
    const oversized = fileArr.filter((f) => f.size > MAX_GALLERY_SIZE);
    if (oversized.length > 0) {
      toast.error(
        `Image(s) exceed 2MB limit: ${oversized.map((f) => f.name).join(", ")}. Please upload images under 2MB.`
      );
      return;
    }
    setUploadingGallery(true);
    const toastId = toast.loading(`Uploading ${fileArr.length} image(s)...`);
    try {
      const newImgs: GalleryItemState[] = [];
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "properties/gallery");
        const res = await api.post<ApiResponse<{ url: string }>>("/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success && res.data.data?.url) {
          newImgs.push({
            id: `gal-${Date.now()}-${i}`,
            url: res.data.data.url,
            caption: file.name.replace(/\.[^/.]+$/, ""),
            orderIndex: galleryImages.length + i,
            isHero: galleryImages.length === 0 && i === 0,
          });
        }
      }
      setGalleryImages((prev) => [...prev, ...newImgs]);
      toast.success(`${newImgs.length} image(s) uploaded!`, { id: toastId });
    } catch {
      toast.error("Failed to upload images", { id: toastId });
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleGalleryDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.files?.length) void handleUploadGalleryImages(e.dataTransfer.files);
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

      localStorage.removeItem(draftKey);

      const mappedType = mapToPropertyTypeEnum(propertyType);

      const mediaPayload = galleryImages.map((img, idx) => ({
        url: img.url,
        caption: img.caption?.trim() || undefined,
        altText: img.caption?.trim() || undefined,
        mediaType: idx === 0 || img.isHero ? "HERO_IMAGE" : "GALLERY",
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

  /* ---------------------- Section Validation Status -------------------- */
  const sectionStatus: Record<string, boolean> = {
    "sec-hero": name.trim().length > 0 && propertyType.trim().length > 0,
    "sec-vision": description.trim().length >= 10,
    "sec-specs": customSpecs.some((s) => s.label.trim()),
    "sec-financials": financialMetrics.some((f) => f.label.trim()),
    "sec-pricing": price.trim().length > 0 || priceOnApplication,
    "sec-gallery": galleryImages.length > 0,
    "sec-amenities": amenities.some((a) => a.name.trim()),
    "sec-location": city.trim().length > 0,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Draft Save Bar */}
      <DraftSaveBar
        storageKey={draftKey}
        formState={{ name, tagline, description, visionHeadline, verdictQuote, verdictAuthor, verdictTitle, propertyType, price, customSpecs, financialMetrics, configurations, amenities, nearbyPlaces }}
        onRestore={handleDraftRestore}
      />
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

      {/* ----------------- QUICK SECTION JUMP NAV with Validation Indicators ----------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-lg border border-border bg-card shadow-sm text-xs">
        {SECTIONS_NAV.map((s) => {
          const done = sectionStatus[s.id];
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 whitespace-nowrap transition-colors font-medium text-[11px]"
            >
              {done ? (
                <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-400/60 shrink-0" />
              )}
              <span>{s.label}</span>
            </a>
          );
        })}
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
                  <span>🇮🇳 Domestic</span>
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
                  <span>🇦🇪 International</span>
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
            <div className="flex items-center gap-2">
              <PresetDropdown
                presets={SPEC_PRESETS}
                triggerLabel="Add Preset Spec"
                onSelect={(p) => handleAddSpec(p)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSpec(null)}
                className="gap-1.5 h-7 text-xs border-border text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                <span>Custom</span>
              </Button>
            </div>
          </div>

          {customSpecs.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground">
                No custom specifications added. Use a preset or click &quot;Custom&quot; to add specs.
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSpecs}>
              <SortableContext items={customSpecs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {customSpecs.map((spec, idx) => {
                    const specPlaceholders = [
                      { label: "e.g. BUILT-UP AREA", value: "e.g. 6,500 Sq.Ft." },
                      { label: "e.g. BEDROOMS", value: "e.g. 5 Master Suites" },
                      { label: "e.g. STARTING PRICE", value: "e.g. ₹12 Cr (or inr 12 cr)" },
                      { label: "e.g. OWNERSHIP", value: "e.g. Freehold" },
                    ];
                    const ph = specPlaceholders[idx] || { label: "e.g. SPEC LABEL", value: "e.g. Value or ₹ Amount" };
                    return (
                      <SortableArrayItem
                        key={spec.id}
                        id={spec.id}
                        onClone={() => handleCloneSpec(spec.id)}
                        onRemove={() => handleRemoveSpec(spec.id)}
                      >
                        <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Spec #{idx + 1}</Label>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Label</Label>
                            <Input value={spec.label} onChange={(e) => handleUpdateSpec(spec.id, "label", e.target.value)} placeholder={ph.label} className="bg-secondary/40 h-8 text-xs font-semibold mt-1" />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Value <span className="text-[9px] text-muted-foreground/60 lowercase font-normal"></span>
                            </Label>
                            <Input value={spec.value} onChange={(e) => handleUpdateSpec(spec.id, "value", e.target.value)} placeholder={ph.value} className="bg-secondary/40 h-8 text-xs text-foreground font-bold mt-1" />
                          </div>
                        </div>
                      </SortableArrayItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>

        {/* SECTION 4: FINANCIAL INTELLIGENCE */}
        <section id="sec-financials" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              4. Financial Intelligence
            </span>
            <div className="flex items-center gap-2">
              <PresetDropdown
                presets={FINANCIAL_METRIC_PRESETS}
                triggerLabel="Add Preset Metric"
                onSelect={(p) => handleAddFinancialMetric(p)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddFinancialMetric(null)}
                className="gap-1.5 h-7 text-xs border-border text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                <span>Custom</span>
              </Button>
            </div>
          </div>

          {financialMetrics.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground">No financial metrics added. Use a preset or &quot;Custom&quot; to add ROI metrics.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndFinancialMetrics}>
              <SortableContext items={financialMetrics.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {financialMetrics.map((metric, idx) => {
                    const finPlaceholders = [
                      { label: "e.g. PROJECTED IRR", value: "e.g. 18% - 22%", note: "e.g. 5-Year Capital Horizon" },
                      { label: "e.g. ANNUAL APPRECIATION", value: "e.g. 14% CAGR", note: "e.g. Luxury Segment Benchmark" },
                      { label: "e.g. BREAKEVEN TIMELINE", value: "e.g. 4.5 Years", note: "e.g. Full Capital Recovery" },
                      { label: "e.g. NET RENTAL YIELD", value: "e.g. 8.5% p.a.", note: "e.g. Managed Villa Rental" },
                    ];
                    const ph = finPlaceholders[idx] || { label: "e.g. METRIC NAME", value: "e.g. Value", note: "e.g. Context Note" };
                    return (
                      <SortableArrayItem key={metric.id} id={metric.id} onClone={() => handleCloneFinancialMetric(metric.id)} onRemove={() => handleRemoveFinancialMetric(metric.id)}>
                        <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30 shrink-0">
                              <span className="material-symbols-outlined text-sm">{metric.icon || "trending_up"}</span>
                            </div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Metric #{idx + 1}</Label>
                            <select
                              value={metric.icon || "trending_up"}
                              onChange={(e) => handleUpdateFinancialMetric(metric.id, "icon", e.target.value)}
                              className="ml-auto bg-secondary/70 border border-border text-[10px] rounded px-1.5 h-6 text-muted-foreground max-w-[130px]"
                            >
                              {COMMON_FINANCIAL_ICONS.map((ic) => (
                                <option key={ic.icon} value={ic.icon}>{ic.label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Label</Label>
                            <Input
                              value={metric.label}
                              onChange={(e) => {
                                handleUpdateFinancialMetric(metric.id, "label", e.target.value);
                                const detected = detectFinancialIcon(e.target.value, metric.icon);
                                if (detected !== metric.icon) {
                                  handleUpdateFinancialMetric(metric.id, "icon", detected);
                                }
                              }}
                              placeholder={ph.label}
                              className="bg-secondary/40 h-8 text-xs font-semibold mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Value</Label>
                            <Input value={metric.value} onChange={(e) => handleUpdateFinancialMetric(metric.id, "value", e.target.value)} placeholder={ph.value} className="bg-secondary/40 h-8 text-xs text-primary font-bold mt-1" />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Context Note</Label>
                            <Input value={metric.note} onChange={(e) => handleUpdateFinancialMetric(metric.id, "note", e.target.value)} placeholder={ph.note} className="bg-secondary/40 h-7 text-[11px] text-muted-foreground mt-1" />
                          </div>
                        </div>
                      </SortableArrayItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
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
                    onChange={(e) => {
                      const symbolFormatted = autoFormatCurrencySymbol(e.target.value);
                      setPrice(formatCurrencyInput(symbolFormatted));
                    }}
                    disabled={priceOnApplication}
                    placeholder="e.g. ₹15 Cr or 15,000,000"
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
                <div className="flex items-center gap-2">
                  <PresetDropdown
                    presets={UNIT_TYPE_PRESETS}
                    triggerLabel="Add Preset Unit"
                    onSelect={(p) => handleAddConfiguration(p)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddConfiguration(null)}
                    className="gap-1.5 h-7 text-xs border-border text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Custom</span>
                  </Button>
                </div>
              </div>

              {configurations.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <p className="text-xs text-muted-foreground">No unit layouts defined. Use a preset or click &quot;Custom&quot;.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndConfigurations}>
                  <SortableContext items={configurations.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4 pt-2">
                      {configurations.map((config, idx) => (
                        <SortableArrayItem key={config.id} id={config.id} onClone={() => handleCloneConfiguration(config.id)} onRemove={() => handleRemoveConfiguration(config.id)}>
                          <div className={`grid grid-cols-1 ${isEditMode ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-2.5 p-3 rounded-lg border border-border bg-secondary/20 items-end`}>
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase">Unit Type</Label>
                              <Input placeholder="e.g. 4 BHK Royal Villa" value={config.unitType} onChange={(e) => handleUpdateConfiguration(config.id, "unitType", e.target.value)} className="bg-secondary/40 h-8 text-xs font-semibold mt-1" />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase">Area (Sq.Ft.)</Label>
                              <Input type="number" placeholder="e.g. 4500" value={config.areaSqFt} onChange={(e) => handleUpdateConfiguration(config.id, "areaSqFt", e.target.value)} className="bg-secondary/40 h-8 text-xs font-mono mt-1" />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase">View Type</Label>
                              <Input placeholder="e.g. Sea View / Private Garden" value={config.viewType} onChange={(e) => handleUpdateConfiguration(config.id, "viewType", e.target.value)} className="bg-secondary/40 h-8 text-xs mt-1" />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase">Price ({currency})</Label>
                              <Input placeholder="e.g. ₹5.5 Cr" value={config.price} onChange={(e) => handleUpdateConfiguration(config.id, "price", e.target.value)} className="bg-secondary/40 h-8 text-xs font-semibold text-primary mt-1" />
                            </div>
                            {isEditMode && (
                              <div className="flex items-center gap-2 h-8">
                                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer flex-1">
                                  <input type="checkbox" checked={config.isAvailable} onChange={(e) => handleUpdateConfiguration(config.id, "isAvailable", e.target.checked)} className="h-3.5 w-3.5 rounded border-border text-primary" />
                                  <span>Available</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </SortableArrayItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 6: VISUAL SHOWCASE & GALLERY */}
        <section id="sec-gallery" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <div className="border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              6. Visual Showcase &amp; Architectural Gallery
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload luxury architectural photography, layouts, and mark your primary Hero Image.
            </p>
          </div>

          {/* Batch drag-and-drop upload zone */}
          <div className="mb-6">
            <label
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors"
              onDragOver={handleGalleryDragOver}
              onDrop={handleGalleryDrop}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {uploadingGallery ? "Uploading..." : "Click or drag-and-drop to upload gallery images"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 2MB each. Multiple files supported.</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                disabled={uploadingGallery}
                onChange={(e) => { if (e.target.files) void handleUploadGalleryImages(e.target.files); }}
                className="hidden"
              />
            </label>
          </div>

          {galleryImages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-xs border border-border/40 rounded-lg bg-secondary/10">
              No gallery images yet.
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
            <div className="flex items-center gap-2">
              <PresetDropdown
                presets={AMENITY_PRESETS}
                triggerLabel="Add Preset Amenity"
                onSelect={(p) => handleAddAmenity(p)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddAmenity(null)}
                className="gap-1.5 h-7 text-xs border-border text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                <span>Custom</span>
              </Button>
            </div>
          </div>

          {amenities.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
              <p className="text-xs text-muted-foreground">No amenities added yet. Use a preset or &quot;Custom&quot;.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndAmenities}>
              <SortableContext items={amenities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {amenities.map((amenity) => (
                    <SortableArrayItem key={amenity.id} id={amenity.id} onClone={() => handleCloneAmenity(amenity.id)} onRemove={() => handleRemoveAmenity(amenity.id)}>
                      <div className="p-3.5 rounded-lg border border-border bg-secondary/20 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30 shrink-0">
                            <span className="material-symbols-outlined text-lg">{amenity.iconKey || "star"}</span>
                          </div>
                          <Input
                            placeholder="Amenity Name (e.g. Private Marina & Yacht Berth)"
                            value={amenity.name}
                            onChange={(e) => handleUpdateAmenity(amenity.id, "name", e.target.value)}
                            className="bg-secondary/40 h-8 text-xs font-semibold flex-1"
                          />
                          <select
                            value={amenity.iconKey || "star"}
                            onChange={(e) => handleUpdateAmenity(amenity.id, "iconKey", e.target.value)}
                            className="bg-secondary/70 border border-border text-[11px] rounded px-2 h-8 text-muted-foreground max-w-[130px]"
                          >
                            {COMMON_AMENITY_ICONS.map((p) => (
                              <option key={p.icon} value={p.icon}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                        <Input
                          placeholder="Context / Details (e.g. 24/7 dedicated concierge and yacht mooring privileges)"
                          value={amenity.description}
                          onChange={(e) => handleUpdateAmenity(amenity.id, "description", e.target.value)}
                          className="bg-secondary/40 h-7 text-[11px] text-muted-foreground"
                        />
                      </div>
                    </SortableArrayItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
                <div className="flex items-center gap-2">
                  <PresetDropdown
                    presets={NEARBY_CATEGORY_PRESETS.map((cat) => ({ label: cat }))}
                    triggerLabel="Add Preset Place"
                    onSelect={(p) => handleAddNearbyPlace(p?.label)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddNearbyPlace()}
                    className="gap-1.5 h-7 text-xs border-border text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Custom</span>
                  </Button>
                </div>
              </div>

              {nearbyPlaces.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                  <p className="text-xs text-muted-foreground">No nearby places added. Use a preset or click &quot;Custom&quot;.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndNearbyPlaces}>
                  <SortableContext items={nearbyPlaces.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4 pt-2">
                      {nearbyPlaces.map((place) => (
                        <SortableArrayItem key={place.id} id={place.id} onClone={() => handleCloneNearbyPlace(place.id)} onRemove={() => handleRemoveNearbyPlace(place.id)}>
                          <div className="p-3 rounded-lg border border-border bg-secondary/20 space-y-2">
                            <div className="flex gap-2 items-center">
                              <Input placeholder="Landmark (e.g. MOPA International Airport)" value={place.name} onChange={(e) => handleUpdateNearbyPlace(place.id, "name", e.target.value)} className="bg-secondary/40 h-8 text-xs font-semibold flex-1" />
                              <Input placeholder="Distance (e.g. 24 km)" value={place.distance} onChange={(e) => handleUpdateNearbyPlace(place.id, "distance", e.target.value)} className="bg-secondary/40 h-8 text-xs w-28" />
                              <Input placeholder="Travel (e.g. 35 Mins)" value={place.travelTime} onChange={(e) => handleUpdateNearbyPlace(place.id, "travelTime", e.target.value)} className="bg-secondary/40 h-8 text-xs w-32" />
                            </div>
                            <Input placeholder="Context (e.g. Direct expressway access from main gates)" value={place.description} onChange={(e) => handleUpdateNearbyPlace(place.id, "description", e.target.value)} className="bg-secondary/40 h-7 text-[11px] text-muted-foreground" />
                          </div>
                        </SortableArrayItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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
