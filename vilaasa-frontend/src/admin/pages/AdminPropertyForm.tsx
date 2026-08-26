import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  LayoutGrid,
  TrendingUp,
  Tag,
  ExternalLink,
  Layers,
  ArrowRight,
  FileText,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { MediaUploader } from "../components/MediaUploader";
import { BrochureUploader } from "../components/BrochureUploader";
import {
  Property,
  PropertyType,
  PropertyStatus,
  FurnishingStatus,
  Currency,
  ApiResponse,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const detectAmenityIcon = (name: string): string => {
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

export const STATUS_CONFIG: Record<
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

export const mapToPropertyTypeEnum = (text: string): PropertyType => {
  const lower = (text || "").toLowerCase();
  if (lower.includes("apartment") || lower.includes("flat")) return "LUXURY_APARTMENT";
  if (lower.includes("penthouse")) return "PENTHOUSE";
  if (lower.includes("commercial") || lower.includes("office") || lower.includes("retail")) return "COMMERCIAL_DEVELOPMENT";
  if (lower.includes("plot") || lower.includes("land") || lower.includes("farm")) return "PLOT_LAND";
  if (lower.includes("franchise")) return "FRANCHISE";
  return "RESIDENTIAL_VILLA";
};

const SECTIONS = [
  { id: 1, title: "Hero Section", shortTitle: "Hero", icon: Sparkles },
  { id: 2, title: "Concept & Vision", shortTitle: "Concept", icon: Eye },
  { id: 3, title: "At a Glance", shortTitle: "At a Glance", icon: LayoutGrid },
  { id: 4, title: "Financial Intelligence", shortTitle: "Financials", icon: TrendingUp },
  { id: 5, title: "Pricing & Configurations", shortTitle: "Pricing & Units", icon: Tag },
  { id: 6, title: "Gallery & Media", shortTitle: "Gallery", icon: ImageIcon },
  { id: 7, title: "Amenities", shortTitle: "Amenities", icon: Layers },
  { id: 8, title: "Location & Connectivity", shortTitle: "Location", icon: MapPin },
];

export const AdminPropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [activeSection, setActiveSection] = useState<number>(1);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    id || null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [existingMedia, setExistingMedia] = useState<Property["media"]>([]);

  // 1. Hero Section
  const [marketScope, setMarketScope] = useState<"DOMESTIC" | "INTERNATIONAL">(
    "DOMESTIC",
  );
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("Residential Villa");
  const [status, setStatus] = useState<PropertyStatus>("AVAILABLE");
  const [virtualTour360Url, setVirtualTour360Url] = useState<string>("");
  const [brochureUrl, setBrochureUrl] = useState<string>("");
  const [uploadingBrochure, setUploadingBrochure] = useState<boolean>(false);
  const brochureFileInputRef = useRef<HTMLInputElement>(null);

  // 2. Concept & Vision
  const [visionHeadline, setVisionHeadline] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [verdictQuote, setVerdictQuote] = useState<string>("");
  const [verdictAuthor, setVerdictAuthor] = useState<string>("Vilaasa Advisory Board");
  const [verdictTitle, setVerdictTitle] = useState<string>("Director of Private Client Acquisitions");

  // 3. At a Glance (100% Free-Text Specs)
  const [customSpecs, setCustomSpecs] = useState<{ label: string; value: string }[]>([
    { label: "Property Type", value: "Residential Villa" },
    { label: "Built-up Area", value: "" },
    { label: "Bedrooms", value: "" },
    { label: "Furnishing", value: "Fully Furnished" },
    { label: "Ownership", value: "Freehold" },
  ]);

  // 4. Financial Intelligence (Admin-filled Labels & Values)
  const [financialMetrics, setFinancialMetrics] = useState<{ label: string; value: string; note: string; icon: string }[]>([
    { label: "Projected IRR Returns", value: "", note: "5-Year Capital Horizon", icon: "trending_up" },
    { label: "Annual Industry Growth", value: "", note: "Luxury Segment CAGR", icon: "show_chart" },
    { label: "5-Year Appreciation", value: "", note: "Conservative Baseline", icon: "monitoring" },
    { label: "Breakeven Timeline", value: "", note: "Full Capital Recovery", icon: "timelapse" },
  ]);

  // 5. Pricing & Configurations
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [priceOnApplication, setPriceOnApplication] = useState<boolean>(false);
  const [rentalYieldPercent, setRentalYieldPercent] = useState<string>("");
  const [expectedIrrPercent, setExpectedIrrPercent] = useState<string>("");
  const [configurations, setConfigurations] = useState<{
    unitType: string;
    areaSqFt: string;
    viewType: string;
    price: string;
    isAvailable: boolean;
  }[]>([]);

  // 7. Amenities
  const [amenities, setAmenities] = useState<{ name: string; iconKey: string; description: string }[]>([]);

  // 8. Location & Connectivity
  const [city, setCity] = useState<string>("Goa");
  const [country, setCountry] = useState<string>("India");
  const [community, setCommunity] = useState<string>("");
  const [addressLine, setAddressLine] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [googleMapUrl, setGoogleMapUrl] = useState<string>("");
  const [nearbyPlaces, setNearbyPlaces] = useState<{ name: string; distance: string; travelTime: string; category: string; description: string }[]>([]);

  const handleMarketScopeChange = (scope: "DOMESTIC" | "INTERNATIONAL") => {
    setMarketScope(scope);
    if (scope === "DOMESTIC") {
      setCountry("India");
      if (currency === "AED" || currency === "USD") {
        setCurrency("INR");
      }
      if (!city || city === "Dubai" || city === "Abu Dhabi") {
        setCity("Goa");
      }
    } else {
      if (!country || country.trim().toLowerCase() === "india") {
        setCountry("United Arab Emirates");
      }
      if (currency === "INR") {
        setCurrency("AED");
      }
      if (!city || city === "Goa" || city === "Mumbai" || city === "Kumarakom") {
        setCity("Dubai");
      }
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPropertyForEdit = async () => {
        try {
          setLoading(true);
          const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
          if (res.data.success && res.data.data) {
            const prop = res.data.data;
            setName(prop.name || "");
            setTagline(prop.tagline || "");
            setVisionHeadline(prop.visionHeadline || "");
            setVerdictQuote(prop.verdictQuote || "");
            setVerdictAuthor(prop.verdictAuthor || "Vilaasa Advisory Board");
            setVerdictTitle(prop.verdictTitle || "Director of Private Client Acquisitions");
            setPropertyType(prop.customType || (prop.type ? prop.type.replace(/_/g, " ") : "Residential Villa"));
            setStatus(prop.status);
            setDescription(prop.description || "");
            setVirtualTour360Url(prop.virtualTour360Url || "");
            setBrochureUrl(prop.brochureUrl || "");
            setPrice(prop.price?.toString() || "");
            setCurrency(prop.currency);
            setPriceOnApplication(prop.priceOnApplication);
            setRentalYieldPercent(prop.rentalYieldPercent?.toString() || "");
            setExpectedIrrPercent(prop.expectedIrrPercent?.toString() || "");

            // 3. At a Glance custom specs
            if (prop.customSpecs && Array.isArray(prop.customSpecs) && prop.customSpecs.length > 0) {
              setCustomSpecs(prop.customSpecs);
            } else {
              // Backward-compatibility fallback
              const initialSpecs: { label: string; value: string }[] = [];
              if (prop.type) initialSpecs.push({ label: "Property Type", value: prop.type.replace(/_/g, " ") });
              if (prop.location?.city) initialSpecs.push({ label: "Location", value: prop.location.city });
              if (prop.price && Number(prop.price) > 0) initialSpecs.push({ label: "Minimum Investment", value: `${prop.currency} ${Number(prop.price).toLocaleString()}` });
              if (prop.totalAreaSqFt) initialSpecs.push({ label: "Built-up Area", value: `${prop.totalAreaSqFt.toLocaleString()} Sq.Ft.` });
              if (prop.bedrooms) initialSpecs.push({ label: "Bedrooms", value: `${prop.bedrooms} BHK` });
              if (prop.bathrooms) initialSpecs.push({ label: "Bathrooms", value: `${prop.bathrooms}` });
              if (prop.furnishingStatus) initialSpecs.push({ label: "Furnishing", value: prop.furnishingStatus.replace(/_/g, " ") });
              if (prop.ownershipType) initialSpecs.push({ label: "Ownership", value: prop.ownershipType });
              if (prop.reraNumber) initialSpecs.push({ label: "RERA / Permit", value: prop.reraNumber });
              setCustomSpecs(initialSpecs.length > 0 ? initialSpecs : [
                { label: "Property Type", value: prop.type.replace(/_/g, " ") },
                { label: "Built-up Area", value: "" },
                { label: "Bedrooms", value: "" },
                { label: "Furnishing", value: "Fully Furnished" },
              ]);
            }

            // 4. Financial Intelligence metrics
            if (prop.financialMetrics && prop.financialMetrics.length > 0) {
              setFinancialMetrics(prop.financialMetrics.map((f: any) => ({
                label: f.label || "",
                value: f.value || "",
                note: f.note || "",
                icon: f.icon || "payments",
              })));
            }

            // 5. Unit Configurations
            if (prop.configurations && prop.configurations.length > 0) {
              setConfigurations(prop.configurations.map((c: any) => ({
                unitType: c.unitType || "",
                areaSqFt: c.areaSqFt?.toString() || "",
                viewType: c.viewType || "",
                price: c.price?.toString() || "",
                isAvailable: c.isAvailable ?? true,
              })));
            }

            // Location
            if (prop.location) {
              const isDom = prop.location.country?.trim().toLowerCase() === "india";
              setMarketScope(isDom ? "DOMESTIC" : "INTERNATIONAL");
              setCity(prop.location.city || "");
              setCountry(
                prop.location.country || (isDom ? "India" : "United Arab Emirates"),
              );
              setCommunity(prop.location.community || "");
              setAddressLine(prop.location.addressLine || "");
              setLatitude(prop.location.latitude?.toString() || "");
              setLongitude(prop.location.longitude?.toString() || "");
              setGoogleMapUrl(prop.location.googleMapUrl || "");
            }

            // 7. Amenities
            if (prop.amenities && prop.amenities.length > 0) {
              setAmenities(prop.amenities.map((a: any) => ({
                name: a.amenity?.name || "",
                iconKey: a.amenity?.iconKey || detectAmenityIcon(a.amenity?.name || "") || "star",
                description: a.description || "",
              })));
            }

            // 8. Nearby Places
            if (prop.nearbyPlaces && prop.nearbyPlaces.length > 0) {
              setNearbyPlaces(prop.nearbyPlaces.map((p: any) => ({
                name: p.name || "",
                distance: p.distance || "",
                travelTime: p.travelTime || "",
                category: p.category || "",
                description: p.description || "",
              })));
            }

            // 6. Media
            if (prop.media) {
              setExistingMedia(prop.media);
            }
          }
        } catch {
          toast.error("Failed to load property details for editing");
        } finally {
          setLoading(false);
        }
      };

      fetchPropertyForEdit();
    }
  }, [isEditMode, id]);

  const handleBrochureFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Brochure file size must be less than 15MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "vilaasa/brochures");

    setUploadingBrochure(true);
    const toastId = toast.loading("Uploading brochure file...");

    try {
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success && res.data.data?.url) {
        setBrochureUrl(res.data.data.url);
        toast.success("Brochure uploaded & attached successfully!", { id: toastId });
      } else {
        toast.error("Failed to retrieve brochure upload link", { id: toastId });
      }
    } catch {
      toast.error("Brochure upload failed", { id: toastId });
    } finally {
      setUploadingBrochure(false);
      if (brochureFileInputRef.current) {
        brochureFileInputRef.current.value = "";
      }
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Property name is required (Hero Section)");
      setActiveSection(1);
      return false;
    }
    if (!propertyType.trim()) {
      toast.error("Property type is required (Hero Section)");
      setActiveSection(1);
      return false;
    }
    if (description.trim().length < 20) {
      toast.error("Concept & Vision description must be at least 20 characters");
      setActiveSection(2);
      return false;
    }
    if (!priceOnApplication && (!price || Number(price) <= 0)) {
      toast.error("Valid property price is required unless Price On Application is selected");
      setActiveSection(5);
      return false;
    }
    if (!city.trim()) {
      toast.error("City is required (Location Section)");
      setActiveSection(8);
      return false;
    }
    if (!country.trim()) {
      toast.error("Country is required (Location Section)");
      setActiveSection(8);
      return false;
    }
    return true;
  };

  const handleSaveProperty = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setSaving(true);
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
      .filter((c) => c.unitType.trim() && Number(c.areaSqFt) > 0)
      .map((c) => ({
        unitType: c.unitType.trim(),
        areaSqFt: parseFloat(c.areaSqFt),
        viewType: c.viewType.trim() || undefined,
        price: parseFloat(c.price) || 0,
        isAvailable: c.isAvailable,
      }));

    const mappedType = mapToPropertyTypeEnum(propertyType);

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
      price: priceOnApplication ? 0 : parseFloat(price) || 0,
      currency,
      priceOnApplication,
      rentalYieldPercent: rentalYieldPercent ? parseFloat(rentalYieldPercent) : undefined,
      expectedIrrPercent: expectedIrrPercent ? parseFloat(expectedIrrPercent) : undefined,
      financialMetrics: cleanedFinancialMetrics,
      configurations: cleanedConfigurations.length > 0 ? cleanedConfigurations : undefined,
      amenities: amenities
        .filter((a) => a.name.trim())
        .map((a) => ({
          name: a.name.trim(),
          iconKey: a.iconKey.trim() || detectAmenityIcon(a.name.trim()) || "star",
          description: a.description.trim() || undefined,
        })),
      nearbyPlaces: nearbyPlaces
        .filter((p) => p.name.trim() && (p.distance.trim() || p.travelTime.trim()))
        .map((p) => ({
          name: p.name.trim(),
          distance: p.distance.trim() || (p.travelTime.trim() ? `${p.travelTime.trim()} drive` : "Nearby"),
          travelTime: p.travelTime.trim() || undefined,
          category: p.category.trim() || undefined,
          description: p.description.trim() || undefined,
        })),
      location: {
        city: city.trim(),
        country: country.trim(),
        community: community.trim() || undefined,
        addressLine: addressLine.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        googleMapUrl: googleMapUrl.trim() || undefined,
      },
    };

    try {
      if (isEditMode && createdPropertyId) {
        const res = await api.put<ApiResponse<Property>>(
          `/properties/${createdPropertyId}`,
          payload,
        );
        if (res.data.success) {
          toast.success("Property specifications updated successfully!");
          return true;
        }
      } else {
        const res = await api.post<ApiResponse<Property>>(
          "/properties",
          payload,
        );
        if (res.data.success && res.data.data) {
          const newId = res.data.data.id;
          setCreatedPropertyId(newId);
          toast.success("Property created! You can now upload gallery assets or review sections.");
          setActiveSection(6); // Navigate to Gallery
          return true;
        }
      }
      return false;
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to save property";
      toast.error(errMsg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpec = (defaultLabel: string = "", defaultValue: string = "") => {
    setCustomSpecs([...customSpecs, { label: defaultLabel, value: defaultValue }]);
  };

  const handleAddFinancialMetric = () => {
    setFinancialMetrics([
      ...financialMetrics,
      { label: "", value: "", note: "", icon: "payments" },
    ]);
  };

  const handleAddConfiguration = () => {
    setConfigurations([
      ...configurations,
      {
        unitType: "Villa Suite",
        areaSqFt: "3500",
        viewType: "Private Garden View",
        price: price || "0",
        isAvailable: true,
      },
    ]);
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-6xl mx-auto pb-24"
    >
      {/* Top Action & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-4 rounded-xl border border-border sticky top-4 z-40 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
              {isEditMode ? "Edit Property" : "Add New Property"}
            </span>
            <span className="text-xs text-muted-foreground">
              Section {activeSection} of {SECTIONS.length}
            </span>
          </div>
          <h1 className="text-lg font-bold text-foreground truncate max-w-md mt-0.5">
            {name || "Untitled Luxury Estate"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-semibold px-4"
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

      {/* 8-Section Pill Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-card p-2 rounded-xl border border-border">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex flex-col items-center text-center p-2.5 rounded-lg transition-all text-xs font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {sec.id}
                </span>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="truncate w-full text-[11px] leading-tight">
                {sec.shortTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Content Container */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm min-h-[480px]">
        <AnimatePresence mode="wait">
          {/* SECTION 1: HERO SECTION */}
          {activeSection === 1 && (
            <motion.div
              key="sec-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  1. Hero Section & Core Attributes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top-level brand identification, market scope, and essential listing parameters.
                </p>
              </div>

              {/* Market Scope Toggle */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Market Scope & Region
                </Label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => handleMarketScopeChange("DOMESTIC")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-xs font-semibold transition-all ${
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
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-xs font-semibold transition-all ${
                      marketScope === "INTERNATIONAL"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <span>🇦🇪 International (UAE / Global)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Property Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="propertyName" className="text-xs font-semibold">
                    Property Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="propertyName"
                    placeholder="e.g. Carlton Krillam Wellness Residences"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary/40 h-10 text-sm font-medium"
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="tagline" className="text-xs font-semibold">
                    Subtitle / Hero Tagline
                  </Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. Branded 4-Bedroom Sanctuary & Private Vineyard"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-secondary/40 h-10 text-sm"
                  />
                </div>

                {/* Property Type (Free Text Field) */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="propertyType" className="text-xs font-semibold">
                      Property Type <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      Free-text field (e.g. Residential Villa, Beachfront Sanctuary)
                    </span>
                  </div>
                  <Input
                    id="propertyType"
                    placeholder="e.g. Residential Villa, Luxury Penthouse, Beachfront Sanctuary"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="bg-secondary/40 h-10 text-xs font-medium"
                  />
                  {/* Quick-select suggestion chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground self-center mr-1">Quick Select:</span>
                    {[
                      "Residential Villa",
                      "Luxury Apartment",
                      "Penthouse",
                      "Heritage Estate",
                      "Commercial Development",
                      "Plot / Land",
                      "Franchise Asset",
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPropertyType(preset)}
                        className={`text-[11px] py-0.5 px-2.5 rounded-full border transition-all ${
                          propertyType.toLowerCase() === preset.toLowerCase()
                            ? "bg-primary/20 text-primary border-primary/50 font-semibold shadow-sm"
                            : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground hover:bg-secondary/70"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing Status with Color Indication */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="propertyStatus" className="text-xs font-semibold">
                      Listing Status <span className="text-destructive">*</span>
                    </Label>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                        STATUS_CONFIG[status]?.badgeClass || "border-border text-foreground"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          STATUS_CONFIG[status]?.dotColor || "bg-primary"
                        } animate-pulse`}
                      />
                      {STATUS_CONFIG[status]?.label || status}
                    </span>
                  </div>

                  {/* Interactive Status Color Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {(Object.keys(STATUS_CONFIG) as PropertyStatus[]).map((key) => {
                      const cfg = STATUS_CONFIG[key];
                      const isCurrent = status === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setStatus(key)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all ${
                            isCurrent
                              ? cfg.activeBorder
                              : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${cfg.dotColor} shrink-0`} />
                          <span className="truncate">{cfg.label.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brochure Direct PDF URL & Add Media */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brochureUrl" className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Brochure Direct PDF URL / Media Link</span>
                    </Label>
                    {brochureUrl && (
                      <div className="flex items-center gap-2">
                        <a
                          href={brochureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Brochure</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setBrochureUrl("")}
                          className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      id="brochureUrl"
                      placeholder="https://drive.google.com/file/d/1A2B3C4D5E6F.../view?usp=sharing"
                      value={brochureUrl}
                      onChange={(e) => setBrochureUrl(e.target.value)}
                      className="bg-secondary/40 h-10 text-xs font-mono flex-1"
                    />

                    <input
                      ref={brochureFileInputRef}
                      type="file"
                      accept="application/pdf,image/*,.doc,.docx"
                      onChange={handleBrochureFileUpload}
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => brochureFileInputRef.current?.click()}
                      disabled={uploadingBrochure}
                      className="h-10 px-3.5 text-xs font-medium gap-1.5 shrink-0 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                    >
                      {uploadingBrochure ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <UploadCloud className="h-3.5 w-3.5" />
                      )}
                      <span>{uploadingBrochure ? "Uploading..." : "Upload / Add Media"}</span>
                    </Button>
                  </div>

                  <p className="text-[10px] text-muted-foreground flex flex-wrap items-center gap-1">
                    <span className="text-primary font-medium">Google Drive format:</span>
                    <span>Paste a Google Drive shareable link (e.g. https://drive.google.com/file/d/.../view) or click &quot;Upload / Add Media&quot; to upload directly.</span>
                  </p>
                </div>

                {/* Virtual Tour 360 URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="virtualTour" className="text-xs font-semibold">
                    360° Virtual Tour URL
                  </Label>
                  <Input
                    id="virtualTour"
                    placeholder="https://my.matterport.com/show/?m=..."
                    value={virtualTour360Url}
                    onChange={(e) => setVirtualTour360Url(e.target.value)}
                    className="bg-secondary/40 h-10 text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Matterport, Kuula, or Metareal 360-degree immersive tour embed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 2: CONCEPT & VISION */}
          {activeSection === 2 && (
            <motion.div
              key="sec-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  2. Concept & Vision (Architectural Story & The Verdict)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Craft the architectural narrative, design philosophy, and the official Vilaasa Verdict.
                </p>
              </div>

              <div className="space-y-4">
                {/* Vision Headline */}
                <div className="space-y-1.5">
                  <Label htmlFor="visionHeadline" className="text-xs font-semibold">
                    Concept & Vision Headline
                  </Label>
                  <Input
                    id="visionHeadline"
                    placeholder="e.g. Timeless Spaces, Lifelong Wellness"
                    value={visionHeadline}
                    onChange={(e) => setVisionHeadline(e.target.value)}
                    className="bg-secondary/40 h-10 text-sm font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Displays prominently as the heading above the architectural narrative.
                  </p>
                </div>

                {/* Narrative Description (Multi-paragraph) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description" className="text-xs font-semibold">
                      Architectural Story & Vision Narrative <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-primary/80 font-mono">
                      Tip: Press Enter twice to create multiple paragraphs
                    </span>
                  </div>
                  <textarea
                    id="description"
                    rows={8}
                    placeholder="First paragraph detailing the architectural philosophy and setting...&#10;&#10;Second paragraph elaborating on materials, wellness sanctuaries, and generational legacy..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-y"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Minimum 20 characters. Blank lines automatically split into separate paragraphs on the public page.
                  </p>
                </div>

                {/* The Vilaasa Verdict Card */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">verified</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      The Vilaasa Verdict Card
                    </h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    An editorial sign-off providing trusted curation, investment perspective, and leadership endorsement.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="verdictQuote" className="text-xs font-medium">
                        Editorial Quote / Verdict Statement
                      </Label>
                      <textarea
                        id="verdictQuote"
                        rows={3}
                        placeholder='e.g. "Carlton Krillam is a rare convergence of Ayurvedic mastery and sovereign capital preservation. It achieves what few luxury retreats can: uncompromising discretion alongside institutional-grade yields."'
                        value={verdictQuote}
                        onChange={(e) => setVerdictQuote(e.target.value)}
                        className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs italic focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="verdictAuthor" className="text-xs font-medium">
                          Reviewer / Author Name
                        </Label>
                        <Input
                          id="verdictAuthor"
                          placeholder="e.g. Vilaasa Advisory Board"
                          value={verdictAuthor}
                          onChange={(e) => setVerdictAuthor(e.target.value)}
                          className="bg-card h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="verdictTitle" className="text-xs font-medium">
                          Reviewer Title / Role
                        </Label>
                        <Input
                          id="verdictTitle"
                          placeholder="e.g. Director of Private Client Acquisitions"
                          value={verdictTitle}
                          onChange={(e) => setVerdictTitle(e.target.value)}
                          className="bg-card h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 3: AT A GLANCE (100% Free-Text Specs) */}
          {activeSection === 3 && (
            <motion.div
              key="sec-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    3. At a Glance (User-Defined Specifications)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All labels and values are 100% free text. Add any property dimension, permit, or feature you wish.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSpec()}
                  className="gap-1.5 text-xs self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Specification</span>
                </Button>
              </div>

              {/* Quick Preset Chips */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Add Common Specs (Click to add editable row)
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Built-up Area", defVal: "4,500 Sq.Ft." },
                    { label: "Bedrooms", defVal: "4 Master Suites" },
                    { label: "Bathrooms", defVal: "5 En-Suite Baths" },
                    { label: "Furnishing", defVal: "Designer Furnished" },
                    { label: "Ownership", defVal: "Freehold" },
                    { label: "RERA / Permit", defVal: "Approved" },
                    { label: "Possession", defVal: "Ready to Move" },
                    { label: "Ceiling Height", defVal: "14 Ft." },
                    { label: "Private Land", defVal: "1.5 Acres" },
                    { label: "Parking", defVal: "4 Covered Bays" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSpec(preset.label, preset.defVal)}
                      className="inline-flex items-center gap-1 text-[11px] py-1 px-2.5 rounded-full border border-border bg-secondary/40 text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-primary" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Specs Table / Grid */}
              <div className="space-y-2.5 pt-2">
                {customSpecs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No specifications added yet. Click &quot;Add Specification&quot; or use one of the quick chips above.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSpec("Built-up Area", "4,500 Sq.Ft.")}
                      className="text-xs"
                    >
                      Add First Specification
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customSpecs.map((spec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                            Specification Label
                          </Label>
                          <Input
                            placeholder="e.g. Built-up Area, Bedrooms, Ceiling Height"
                            value={spec.label}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[idx].label = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-semibold"
                          />
                        </div>

                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                            Value
                          </Label>
                          <Input
                            placeholder="e.g. 140,000 Sq.Ft., 4 BHK, Freehold"
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[idx].value = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = customSpecs.filter((_, i) => i !== idx);
                            setCustomSpecs(updated);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors self-end mb-1"
                          title="Remove specification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SECTION 4: FINANCIAL INTELLIGENCE */}
          {activeSection === 4 && (
            <motion.div
              key="sec-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    4. Financial Intelligence (Admin-Defined Metrics)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize the metrics shown in the Financial Intelligence card. All labels, values, and notes are editable.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFinancialMetric}
                  className="gap-1.5 text-xs self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Metric</span>
                </Button>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {financialMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-lg">
                            {metric.icon || "payments"}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                          Metric #{idx + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = financialMetrics.filter((_, i) => i !== idx);
                          setFinancialMetrics(updated);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        title="Remove metric"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                          Metric Label
                        </Label>
                        <Input
                          placeholder="e.g. Projected IRR, Breakeven Timeline, Annual Growth"
                          value={metric.label}
                          onChange={(e) => {
                            const updated = [...financialMetrics];
                            updated[idx].label = e.target.value;
                            setFinancialMetrics(updated);
                          }}
                          className="bg-secondary/40 h-8 text-xs font-semibold mt-0.5"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                            Metric Value
                          </Label>
                          <Input
                            placeholder="e.g. 18-22%, 4-5 Years"
                            value={metric.value}
                            onChange={(e) => {
                              const updated = [...financialMetrics];
                              updated[idx].value = e.target.value;
                              setFinancialMetrics(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-bold text-primary mt-0.5"
                          />
                        </div>

                        <div>
                          <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                            Icon Key
                          </Label>
                          <select
                            value={metric.icon || "payments"}
                            onChange={(e) => {
                              const updated = [...financialMetrics];
                              updated[idx].icon = e.target.value;
                              setFinancialMetrics(updated);
                            }}
                            className="w-full h-8 rounded-md border border-input bg-secondary/40 px-2 text-xs mt-0.5"
                          >
                            <option value="trending_up">Trending Up (IRR)</option>
                            <option value="timelapse">Timelapse (Breakeven)</option>
                            <option value="monitoring">Monitoring (5-Yr Gain)</option>
                            <option value="show_chart">Show Chart (Growth)</option>
                            <option value="savings">Savings (Net Yield)</option>
                            <option value="payments">Payments (Returns)</option>
                            <option value="account_balance">Account Balance</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-[10px] text-muted-foreground font-mono uppercase">
                          Context / Subtitle Note (Optional)
                        </Label>
                        <Input
                          placeholder="e.g. Tax-free in INR, Conservative baseline"
                          value={metric.note}
                          onChange={(e) => {
                            const updated = [...financialMetrics];
                            updated[idx].note = e.target.value;
                            setFinancialMetrics(updated);
                          }}
                          className="bg-secondary/40 h-8 text-xs mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SECTION 5: PRICING & CONFIGURATIONS */}
          {activeSection === 5 && (
            <motion.div
              key="sec-5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  5. Pricing & Unit Configurations
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set minimum investment ticket, currency, and multi-unit layout breakdowns.
                </p>
              </div>

              {/* Base Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="price" className="text-xs font-semibold">
                    Minimum Investment / Base Price
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      disabled={priceOnApplication}
                      className="w-28 h-10 rounded-md border border-input bg-secondary/40 px-3 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>

                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g. 25000000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={priceOnApplication}
                      className="bg-secondary/40 h-10 font-mono text-sm font-semibold flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="poa"
                    checked={priceOnApplication}
                    onChange={(e) => setPriceOnApplication(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <Label htmlFor="poa" className="text-xs font-medium cursor-pointer">
                    Price On Application (POA)
                  </Label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rentalYield" className="text-xs font-semibold">
                    Expected Rental Yield (% p.a.)
                  </Label>
                  <Input
                    id="rentalYield"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.5"
                    value={rentalYieldPercent}
                    onChange={(e) => setRentalYieldPercent(e.target.value)}
                    className="bg-secondary/40 h-10 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="expectedIrr" className="text-xs font-semibold">
                    Expected Target IRR (%)
                  </Label>
                  <Input
                    id="expectedIrr"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 21.0"
                    value={expectedIrrPercent}
                    onChange={(e) => setExpectedIrrPercent(e.target.value)}
                    className="bg-secondary/40 h-10 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Unit Configurations */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Unit Configurations & Layouts
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Floor plans and unit specifications displayed in the Configurations table.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddConfiguration}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Unit Layout</span>
                  </Button>
                </div>

                {configurations.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                    <p className="text-xs text-muted-foreground">
                      No unit layouts defined yet. Click &quot;Add Unit Layout&quot; to specify 3 BHK, 4 BHK, or custom suites.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {configurations.map((config, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 p-3 rounded-lg border border-border bg-card shadow-sm items-end"
                      >
                        <div className="sm:col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">Unit Type</Label>
                          <Input
                            placeholder="e.g. 3 BHK Villa"
                            value={config.unitType}
                            onChange={(e) => {
                              const updated = [...configurations];
                              updated[idx].unitType = e.target.value;
                              setConfigurations(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">Area (Sq.Ft.)</Label>
                          <Input
                            type="number"
                            placeholder="3200"
                            value={config.areaSqFt}
                            onChange={(e) => {
                              const updated = [...configurations];
                              updated[idx].areaSqFt = e.target.value;
                              setConfigurations(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">View Type</Label>
                          <Input
                            placeholder="e.g. Ocean View"
                            value={config.viewType}
                            onChange={(e) => {
                              const updated = [...configurations];
                              updated[idx].viewType = e.target.value;
                              setConfigurations(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase">Price ({currency})</Label>
                          <Input
                            type="number"
                            placeholder="25000000"
                            value={config.price}
                            onChange={(e) => {
                              const updated = [...configurations];
                              updated[idx].price = e.target.value;
                              setConfigurations(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-1 flex items-center justify-between gap-2 h-8">
                          <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.isAvailable}
                              onChange={(e) => {
                                const updated = [...configurations];
                                updated[idx].isAvailable = e.target.checked;
                                setConfigurations(updated);
                              }}
                              className="h-3.5 w-3.5 rounded border-border text-primary"
                            />
                            <span>Available</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = configurations.filter((_, i) => i !== idx);
                              setConfigurations(updated);
                            }}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SECTION 6: GALLERY & MEDIA */}
          {activeSection === 6 && (
            <motion.div
              key="sec-6"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  6. Gallery & Media Assets
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload architectural photography, hero shots, and PDF brochures. Edit image captions inline.
                </p>
              </div>

              {createdPropertyId ? (
                <div className="space-y-8">
                  <MediaUploader
                    propertyId={createdPropertyId}
                    existingMedia={existingMedia}
                    onMediaUploaded={() => {
                      api.get<ApiResponse<Property>>(`/properties/${createdPropertyId}`).then((res) => {
                        if (res.data.success && res.data.data?.media) {
                          setExistingMedia(res.data.data.media);
                        }
                      });
                    }}
                  />

                  <div className="pt-6 border-t border-border">
                    <BrochureUploader
                      propertyId={createdPropertyId}
                      currentBrochureUrl={brochureUrl}
                      onBrochureUploaded={(url) => {
                        setBrochureUrl(url);
                        toast.success("Brochure attached to property!");
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-4 max-w-lg mx-auto my-8">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      Save Property First to Enable Direct Uploads
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Direct Cloudinary media streaming requires a property record. Click below to save your core details and unlock media uploads.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSaveProperty}
                    disabled={saving}
                    className="bg-primary text-primary-foreground text-xs gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Draft & Enable Media Uploads</span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* SECTION 7: AMENITIES */}
          {activeSection === 7 && (
            <motion.div
              key="sec-7"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    7. Curated Amenities
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Icons automatically match keywords in real-time. Add descriptions to enrich the luxury amenity cards.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAmenities([
                      ...amenities,
                      { name: "", iconKey: "star", description: "" },
                    ])
                  }
                  className="gap-1.5 text-xs self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Amenity</span>
                </Button>
              </div>

              <div className="space-y-3">
                {amenities.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      No amenities added yet. Click &quot;Add Amenity&quot; to begin.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setAmenities([
                          { name: "Ayurvedic Wellness Sanctuary", iconKey: "spa", description: "Bespoke therapies by resident Ayurvedic masters." },
                          { name: "Private Marina & Yacht Berth", iconKey: "directions_boat", description: "Direct deep-water access with dedicated concierge." },
                          { name: "Executive Helipad", iconKey: "helicopter", description: "Seamless point-to-point transfers from international hubs." },
                        ])
                      }
                      className="text-xs"
                    >
                      Pre-fill Signature Amenities
                    </Button>
                  </div>
                ) : (
                  amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/30 text-primary shrink-0"
                          title={`Icon: ${amenity.iconKey || "star"}`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {amenity.iconKey || "star"}
                          </span>
                        </div>

                        <Input
                          placeholder="Amenity Name (e.g. Sri Sri Panchakarma Wellness Centre)"
                          value={amenity.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newAm = [...amenities];
                            newAm[idx].name = val;
                            if (!newAm[idx].iconKey || newAm[idx].iconKey === "star") {
                              newAm[idx].iconKey = detectAmenityIcon(val);
                            }
                            setAmenities(newAm);
                          }}
                          className="bg-secondary/40 h-9 text-xs font-semibold flex-1"
                        />

                        <select
                          value={amenity.iconKey || "star"}
                          onChange={(e) => {
                            const newAm = [...amenities];
                            newAm[idx].iconKey = e.target.value;
                            setAmenities(newAm);
                          }}
                          className="h-9 rounded-md border border-input bg-secondary/40 px-2 text-xs max-w-[140px]"
                        >
                          {COMMON_AMENITY_ICONS.map((p) => (
                            <option key={p.icon} value={p.icon}>
                              {p.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const newAm = amenities.filter((_, i) => i !== idx);
                            setAmenities(newAm);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Input
                        placeholder="Amenity Description / Context (e.g. 5,000 sq.ft. holistic spa with certified healers)"
                        value={amenity.description}
                        onChange={(e) => {
                          const newAm = [...amenities];
                          newAm[idx].description = e.target.value;
                          setAmenities(newAm);
                        }}
                        className="bg-secondary/40 h-8 text-[11px] text-muted-foreground"
                      />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* SECTION 8: LOCATION & CONNECTIVITY */}
          {activeSection === 8 && (
            <motion.div
              key="sec-8"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  8. Location & Connectivity
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Geographic location, geo-coordinates, embed map link, and nearby landmark commute times.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Goa, Dubai, Kumarakom"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-semibold">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g. India, United Arab Emirates"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="community" className="text-xs font-semibold">
                    Community / District / Area
                  </Label>
                  <Input
                    id="community"
                    placeholder="e.g. Candolim Beachfront, Palm Jumeirah"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="addressLine" className="text-xs font-semibold">
                    Address Line
                  </Label>
                  <Input
                    id="addressLine"
                    placeholder="e.g. Plot 42, Coastal Highway"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="latitude" className="text-xs font-semibold">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="15.5186"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="bg-secondary/40 h-10 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="longitude" className="text-xs font-semibold">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="73.7634"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="bg-secondary/40 h-10 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="mapUrl" className="text-xs font-semibold">
                    Google Maps Embed URL
                  </Label>
                  <Input
                    id="mapUrl"
                    type="text"
                    placeholder='e.g. <iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'
                    value={googleMapUrl}
                    onChange={(e) => setGoogleMapUrl(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    For an exact pin on the public page, paste the embed iframe snippet from Google Maps here.
                  </p>
                </div>
              </div>

              {/* Nearby Places */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Nearby Places & Connectivity
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Airports, helipads, beaches, hospitals, and transit hubs with travel times.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNearbyPlaces([
                        ...nearbyPlaces,
                        { name: "", distance: "", travelTime: "", category: "Transit", description: "" },
                      ])
                    }
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Nearby Place</span>
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {nearbyPlaces.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border rounded-xl bg-secondary/10">
                      <p className="text-xs text-muted-foreground">
                        No nearby places added yet. Click &quot;Add Nearby Place&quot; to list airports, beaches, or private helipads.
                      </p>
                    </div>
                  ) : (
                    nearbyPlaces.map((place, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card shadow-sm"
                      >
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Landmark Name (e.g. MOPA International Airport)"
                            value={place.name}
                            onChange={(e) => {
                              const newP = [...nearbyPlaces];
                              newP[idx].name = e.target.value;
                              setNearbyPlaces(newP);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-semibold flex-1"
                          />

                          <Input
                            placeholder="Distance (e.g. 24 km)"
                            value={place.distance}
                            onChange={(e) => {
                              const newP = [...nearbyPlaces];
                              newP[idx].distance = e.target.value;
                              setNearbyPlaces(newP);
                            }}
                            className="bg-secondary/40 h-8 text-xs w-28"
                          />

                          <Input
                            placeholder="Travel Time (e.g. 35 Mins Drive)"
                            value={place.travelTime}
                            onChange={(e) => {
                              const newP = [...nearbyPlaces];
                              newP[idx].travelTime = e.target.value;
                              setNearbyPlaces(newP);
                            }}
                            className="bg-secondary/40 h-8 text-xs w-36"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const newP = nearbyPlaces.filter((_, i) => i !== idx);
                              setNearbyPlaces(newP);
                            }}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <Input
                          placeholder="Context (e.g. Direct expressway access from property entrance)"
                          value={place.description}
                          onChange={(e) => {
                            const newP = [...nearbyPlaces];
                            newP[idx].description = e.target.value;
                            setNearbyPlaces(newP);
                          }}
                          className="bg-secondary/40 h-7 text-[11px] text-muted-foreground"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section Pager Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={activeSection === 1}
          onClick={() => setActiveSection((prev) => Math.max(1, prev - 1))}
          className="gap-1.5 text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous: {SECTIONS[activeSection - 2]?.shortTitle || ""}</span>
        </Button>

        <div className="flex items-center gap-2">
          {activeSection < SECTIONS.length ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveSection((prev) => Math.min(SECTIONS.length, prev + 1))}
              className="gap-1.5 text-xs"
            >
              <span>Next: {SECTIONS[activeSection]?.shortTitle || ""}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSaveProperty}
              disabled={saving}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-semibold px-4"
            >
              {saving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isEditMode ? "Save All Changes" : "Complete & Save"}</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
