import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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

export const AdminPropertyForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(
    id || null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [existingMedia, setExistingMedia] = useState<Property["media"]>([]);

  // Step 1: Basic Info
  const [marketScope, setMarketScope] = useState<"DOMESTIC" | "INTERNATIONAL">(
    "DOMESTIC",
  );
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [type, setType] = useState<PropertyType>("RESIDENTIAL_VILLA");
  const [status, setStatus] = useState<PropertyStatus>("AVAILABLE");
  const [description, setDescription] = useState<string>("");
  const [visionHeadline, setVisionHeadline] = useState<string>("");
  const [verdictQuote, setVerdictQuote] = useState<string>("");
  const [verdictAuthor, setVerdictAuthor] = useState<string>("Vilaasa Advisory Board");
  const [verdictTitle, setVerdictTitle] = useState<string>("Director of Private Client Acquisitions");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [totalAreaSqFt, setTotalAreaSqFt] = useState<string>("");
  const [furnishingStatus, setFurnishingStatus] =
    useState<FurnishingStatus>("FULLY_FURNISHED");
  const [reraNumber, setReraNumber] = useState<string>("");
  const [ownershipType, setOwnershipType] = useState<string>("Freehold");
  const [possessionDate, setPossessionDate] = useState<string>("");
  const [virtualTour360Url, setVirtualTour360Url] = useState<string>("");
  const [brochureUrl, setBrochureUrl] = useState<string>("");

  // Step 2: Location & Pricing
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [priceOnApplication, setPriceOnApplication] = useState<boolean>(false);
  const [rentalYieldPercent, setRentalYieldPercent] = useState<string>("");
  const [expectedIrrPercent, setExpectedIrrPercent] = useState<string>("");
  const [financialMetrics, setFinancialMetrics] = useState<{label: string, value: string, note: string, icon: string}[]>([
    { label: "Projected IRR Returns", value: "", note: "", icon: "trending_up" },
    { label: "Annual Industry Growth", value: "", note: "", icon: "show_chart" },
    { label: "5-Year Appreciation", value: "", note: "", icon: "monitoring" },
    { label: "Breakeven Timeline", value: "", note: "", icon: "timelapse" },
  ]);
  const [city, setCity] = useState<string>("Goa");
  const [country, setCountry] = useState<string>("India");
  const [community, setCommunity] = useState<string>("");
  const [addressLine, setAddressLine] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [googleMapUrl, setGoogleMapUrl] = useState<string>("");

  const [amenities, setAmenities] = useState<{name: string, iconKey: string, description: string}[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<{name: string, distance: string, travelTime: string, category: string, description: string}[]>([]);

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

  // Load existing property in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchPropertyForEdit = async () => {
        setLoading(true);
        try {
          const detailRes = await api.get<ApiResponse<Property>>(
            `/properties/${id}`,
          );
          if (detailRes.data.success && detailRes.data.data) {
            const prop = detailRes.data.data;

            setCreatedPropertyId(prop.id);
            setName(prop.name);
            setTagline(prop.tagline || "");
            setType(prop.type);
            setStatus(prop.status);
            setDescription(prop.description);
            setVisionHeadline(prop.visionHeadline || "");
            setVerdictQuote(prop.verdictQuote || "");
            setVerdictAuthor(prop.verdictAuthor || "Vilaasa Advisory Board");
            setVerdictTitle(prop.verdictTitle || "Director of Private Client Acquisitions");
            setBedrooms(prop.bedrooms?.toString() || "");
            setBathrooms(prop.bathrooms?.toString() || "");
            setTotalAreaSqFt(prop.totalAreaSqFt?.toString() || "");
            setFurnishingStatus(prop.furnishingStatus);
            setReraNumber(prop.reraNumber || "");
            setOwnershipType(prop.ownershipType || "Freehold");
            setPossessionDate(
              prop.possessionDate
                ? new Date(prop.possessionDate).toISOString().split("T")[0]
                : "",
            );
            setVirtualTour360Url(prop.virtualTour360Url || "");
            setBrochureUrl(prop.brochureUrl || "");
            setPrice(prop.price?.toString() || "");
            setCurrency(prop.currency);
            setPriceOnApplication(prop.priceOnApplication);
            setRentalYieldPercent(prop.rentalYieldPercent?.toString() || "");
            setExpectedIrrPercent(prop.expectedIrrPercent?.toString() || "");

            if (prop.location) {
              const isDom =
                prop.location.country?.trim().toLowerCase() === "india";
              setMarketScope(isDom ? "DOMESTIC" : "INTERNATIONAL");
              setCity(prop.location.city || "");
              setCountry(
                prop.location.country ||
                  (isDom ? "India" : "United Arab Emirates"),
              );
              setCommunity(prop.location.community || "");
              setAddressLine(prop.location.addressLine || "");
              setLatitude(prop.location.latitude?.toString() || "");
              setLongitude(prop.location.longitude?.toString() || "");
              setGoogleMapUrl(prop.location.googleMapUrl || "");
            }

            if (prop.amenities && prop.amenities.length > 0) {
              setAmenities(prop.amenities.map((a: any) => ({
                name: a.amenity?.name || "",
                iconKey: a.amenity?.iconKey || detectAmenityIcon(a.amenity?.name || "") || "star",
                description: a.description || "",
              })));
            }

            if (prop.nearbyPlaces && prop.nearbyPlaces.length > 0) {
              setNearbyPlaces(prop.nearbyPlaces.map((p: any) => ({
                name: p.name || "",
                distance: p.distance || "",
                travelTime: p.travelTime || "",
                category: p.category || "",
                description: p.description || "",
              })));
            }

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

  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      toast.error("Property name is required");
      return false;
    }
    if (description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!priceOnApplication && (!price || Number(price) <= 0)) {
      toast.error("Valid property price is required unless Price On Application is selected");
      return false;
    }
    if (!city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!country.trim()) {
      toast.error("Country is required");
      return false;
    }
    return true;
  };

  const handleSaveBasicAndLocation = async (): Promise<boolean> => {
    if (!validateStep1() || !validateStep2()) return false;

    setSaving(true);
    const payload = {
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      visionHeadline: visionHeadline.trim() || undefined,
      verdictQuote: verdictQuote.trim() || undefined,
      verdictAuthor: verdictAuthor.trim() || undefined,
      verdictTitle: verdictTitle.trim() || undefined,
      type,
      status,
      description: description.trim(),
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
      totalAreaSqFt: totalAreaSqFt ? parseFloat(totalAreaSqFt) : undefined,
      furnishingStatus,
      reraNumber: reraNumber.trim() || undefined,
      ownershipType: ownershipType || undefined,
      possessionDate: possessionDate
        ? new Date(possessionDate).toISOString()
        : undefined,
      virtualTour360Url: virtualTour360Url.trim() || undefined,
      brochureUrl: brochureUrl.trim() || undefined,
      price: priceOnApplication ? 0 : parseFloat(price) || 0,
      currency,
      priceOnApplication,
      rentalYieldPercent: rentalYieldPercent
        ? parseFloat(rentalYieldPercent)
        : undefined,
      expectedIrrPercent: expectedIrrPercent
        ? parseFloat(expectedIrrPercent)
        : undefined,
      financialMetrics: financialMetrics
        .filter((f) => f.label.trim() && f.value.trim())
        .map((f) => ({
          label: f.label.trim(),
          value: f.value.trim(),
          note: f.note.trim() || undefined,
          icon: f.icon.trim() || undefined,
        })),
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
          toast.success("Property specifications updated");
          setCurrentStep(3);
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
          toast.success("Property created! Now proceed to upload media assets.");
          setCurrentStep(3);
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

  const steps = [
    { num: 1, title: "Basic Info", icon: Building2 },
    { num: 2, title: "Location & Pricing", icon: MapPin },
    { num: 3, title: "Media Assets", icon: ImageIcon },
  ];

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
      className="space-y-8 max-w-5xl mx-auto"
    >
      {/* Header & Step Indicator */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3 text-primary/80 mb-1">
              <span className="h-px w-6 bg-current" />
              <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
                Estate Configuration
              </span>
            </div>
            <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
              {isEditMode ? "Edit Luxury Estate" : "Add New Luxury Estate"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {currentStep} of 3 — Complete listing specifications and high-resolution media assets
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/properties")}
            className="text-xs"
          >
            ← Back to Property List
          </Button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-3 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                onClick={() => {
                  if (isDone || (step.num === 2 && validateStep1())) {
                    setCurrentStep(step.num);
                  }
                }}
                className={`flex items-center space-x-3 rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isCurrent
                    ? "border-primary bg-primary/10 text-foreground shadow-lg"
                    : isDone
                    ? "border-emerald-500/40 bg-card text-emerald-400"
                    : "border-border bg-card/60 text-muted-foreground"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    Step {step.num}
                  </p>
                  <p className="text-xs font-bold">{step.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-2xl">
        {/* ================= STEP 1 ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground border-b border-border pb-3">
              Step 1: Core Specifications & Details
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Property Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Palm Royale Signature Villa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="tagline" className="text-xs font-semibold">
                  Tagline / Catchphrase
                </Label>
                <Input
                  id="tagline"
                  placeholder="e.g. Ultra-Prime Waterfront Living on Palm Jumeirah"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Market Scope */}
              <div className="space-y-1.5">
                <Label htmlFor="marketScope" className="text-xs font-semibold">
                  Market Scope <span className="text-primary">*</span>
                </Label>
                <select
                  id="marketScope"
                  value={marketScope}
                  onChange={(e) =>
                    handleMarketScopeChange(
                      e.target.value as "DOMESTIC" | "INTERNATIONAL",
                    )
                  }
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="DOMESTIC">Domestic (India Collection)</option>
                  <option value="INTERNATIONAL">International (UAE & Global)</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold">
                  Property Type <span className="text-primary">*</span>
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="RESIDENTIAL_VILLA">Residential Villa</option>
                  <option value="RESIDENTIAL_APARTMENT">Residential Apartment</option>
                  <option value="PENTHOUSE">Penthouse</option>
                  <option value="HERITAGE_ESTATE">Heritage Estate</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="FRANCHISE">Franchise Asset</option>
                  <option value="FARMLAND">Farmland</option>
                </select>
              </div>

              {/* Listing Status */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="status" className="text-xs font-semibold">
                  Listing Status <span className="text-primary">*</span>
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                  <option value="OFF_PLAN">Off Plan</option>
                  <option value="READY_TO_MOVE">Ready to Move</option>
                  <option value="SOLD">Sold</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>

              {/* Concept & Vision Heading */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="visionHeadline" className="text-xs font-semibold">
                    Concept & Vision Heading
                  </Label>
                  <span className="text-[11px] text-primary/90 font-medium">Hero Statement</span>
                </div>
                <Input
                  id="visionHeadline"
                  type="text"
                  placeholder="e.g. Timeless Spaces, Lifelong Wellness"
                  value={visionHeadline}
                  onChange={(e) => setVisionHeadline(e.target.value)}
                  className="bg-secondary/40 h-10 font-medium"
                />
                <p className="text-[11px] text-muted-foreground">
                  Displays as the prominent heading for the Concept & Vision section on the property page.
                </p>
              </div>

              {/* Concept & Vision Narrative (Multi-paragraph) */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="desc" className="text-xs font-semibold">
                    Concept & Vision Story (Paragraphs) <span className="text-primary">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Tip: Separate paragraphs with a blank line</span>
                </div>
                <textarea
                  id="desc"
                  rows={6}
                  required
                  placeholder={`Live or Lease - Your Villa, Your Choice. This isn't just a villa — it's a second home that earns for you. With guaranteed monthly rent and full property management, it offers peace of mind and steady returns.\n\nCarlton Krillam Wellness Residences is India's first branded wellness real estate destination, thoughtfully developed to blend luxury living, authentic Ayurveda, and long-term wealth creation.\n\nEach villa is designed not only as a personal sanctuary but also as an income-generating asset. With long-term lease-back assurance, assured monthly income, lifestyle privileges, and capital appreciation potential...`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Minimum 20 characters. Current: {description.length}. Each paragraph separated by an empty line will render as an individual clean paragraph on the public property page.
                </p>
              </div>

              {/* The Vilaasa Verdict Card (Right-hand editorial review) */}
              <div className="md:col-span-2 rounded-xl border border-primary/30 bg-secondary/15 p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">verified</span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">The Vilaasa Verdict</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Featured alongside Concept & Vision as the official editorial endorsement and investment verdict.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="verdictQuote" className="text-xs font-semibold">
                    Verdict Quote / Editorial Rationale
                  </Label>
                  <textarea
                    id="verdictQuote"
                    rows={3}
                    placeholder={`e.g. "Ongole's wellness positioning unlocks strong potential for superior IRR and long-term value creation."`}
                    value={verdictQuote}
                    onChange={(e) => setVerdictQuote(e.target.value)}
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground italic focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="verdictAuthor" className="text-xs font-semibold">
                      Reviewer / Author
                    </Label>
                    <Input
                      id="verdictAuthor"
                      type="text"
                      placeholder="e.g. Vilaasa Advisory Board"
                      value={verdictAuthor}
                      onChange={(e) => setVerdictAuthor(e.target.value)}
                      className="bg-secondary/40 h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="verdictTitle" className="text-xs font-semibold">
                      Author Title / Role
                    </Label>
                    <Input
                      id="verdictTitle"
                      type="text"
                      placeholder="e.g. Director of Private Client Acquisitions"
                      value={verdictTitle}
                      onChange={(e) => setVerdictTitle(e.target.value)}
                      className="bg-secondary/40 h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="space-y-1.5">
                <Label htmlFor="beds" className="text-xs font-semibold">
                  Bedrooms
                </Label>
                <Input
                  id="beds"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="baths" className="text-xs font-semibold">
                  Bathrooms
                </Label>
                <Input
                  id="baths"
                  type="number"
                  min="0"
                  placeholder="e.g. 7"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Total Area & Furnishing */}
              <div className="space-y-1.5">
                <Label htmlFor="sqft" className="text-xs font-semibold">
                  Total Built-up Area (Sq.Ft.)
                </Label>
                <Input
                  id="sqft"
                  type="number"
                  min="1"
                  placeholder="e.g. 14500"
                  value={totalAreaSqFt}
                  onChange={(e) => setTotalAreaSqFt(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="furnishing" className="text-xs font-semibold">
                  Furnishing Status
                </Label>
                <select
                  id="furnishing"
                  value={furnishingStatus}
                  onChange={(e) =>
                    setFurnishingStatus(e.target.value as FurnishingStatus)
                  }
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi-Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                  <option value="DESIGNER_FURNISHED">Designer Furnished</option>
                </select>
              </div>

              {/* RERA Number & Ownership */}
              <div className="space-y-1.5">
                <Label htmlFor="rera" className="text-xs font-semibold">
                  RERA / Trakheesi Permit No.
                </Label>
                <Input
                  id="rera"
                  type="text"
                  placeholder="e.g. DLD-TRAKHEESI-662819"
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ownership" className="text-xs font-semibold">
                  Ownership Type
                </Label>
                <select
                  id="ownership"
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="Freehold">Freehold</option>
                  <option value="Leasehold">Leasehold</option>
                </select>
              </div>

              {/* Possession Date & 360 Tour */}
              <div className="space-y-1.5">
                <Label htmlFor="possession" className="text-xs font-semibold">
                  Expected Possession Date
                </Label>
                <Input
                  id="possession"
                  type="date"
                  value={possessionDate}
                  onChange={(e) => setPossessionDate(e.target.value)}
                  className="bg-secondary/40 h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tour" className="text-xs font-semibold">
                  Virtual Tour 360 URL (Matterport / Polycam)
                </Label>
                <Input
                  id="tour"
                  type="url"
                  placeholder="https://my.matterport.com/show/?m=..."
                  value={virtualTour360Url}
                  onChange={(e) => setVirtualTour360Url(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <BrochureUploader
                  value={brochureUrl}
                  onChange={setBrochureUrl}
                  folder={`vilaasa/${createdPropertyId || "brochures"}`}
                />
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                type="button"
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                className="gap-2"
              >
                <span>Continue to Location & Pricing</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 2 ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground border-b border-border pb-3">
              Step 2: Pricing & Geographic Location
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Price & Currency */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price" className="text-xs font-semibold">
                    Property Price <span className="text-primary">*</span>
                  </Label>
                  <label className="flex items-center space-x-1.5 text-xs text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceOnApplication}
                      onChange={(e) => setPriceOnApplication(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-0"
                    />
                    <span>Price On Application (POA)</span>
                  </label>
                </div>
                <Input
                  id="price"
                  type="number"
                  disabled={priceOnApplication}
                  placeholder={priceOnApplication ? "POA (Price hidden)" : "e.g. 185000000"}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono disabled:opacity-40"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="curr" className="text-xs font-semibold">
                  Currency <span className="text-primary">*</span>
                </Label>
                <select
                  id="curr"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
              </div>

              {/* Rental Yield & Expected IRR */}
              <div className="space-y-1.5">
                <Label htmlFor="yield" className="text-xs font-semibold">
                  Projected Net Rental Yield (% p.a.)
                </Label>
                <Input
                  id="yield"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 6.8"
                  value={rentalYieldPercent}
                  onChange={(e) => setRentalYieldPercent(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="irr" className="text-xs font-semibold">
                  Expected IRR (%)
                </Label>
                <Input
                  id="irr"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 21.5"
                  value={expectedIrrPercent}
                  onChange={(e) => setExpectedIrrPercent(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Regional Presets */}
              <div className="space-y-1.5 md:col-span-2 pt-1 pb-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Region Presets ({marketScope === "DOMESTIC" ? "India" : "International"})
                  </Label>
                  <span className="text-[10px] text-primary">Click to prefill</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(marketScope === "DOMESTIC"
                    ? [
                        { city: "Goa", community: "Assagao Waterfront", country: "India" },
                        { city: "Mumbai", community: "Bandra West", country: "India" },
                        { city: "Kumarakom", community: "Vembanad Lakefront", country: "India" },
                        { city: "Alibaug", community: "Mandwa Coast", country: "India" },
                        { city: "Delhi NCR", community: "Golf Course Road", country: "India" },
                        { city: "Hyderabad", community: "Jubilee Hills", country: "India" },
                        { city: "Bangalore", community: "Indiranagar", country: "India" },
                      ]
                    : [
                        { city: "Dubai", community: "Palm Jumeirah", country: "United Arab Emirates" },
                        { city: "Dubai", community: "Downtown Dubai", country: "United Arab Emirates" },
                        { city: "Dubai", community: "Emirates Hills", country: "United Arab Emirates" },
                        { city: "Dubai", community: "Dubai Marina", country: "United Arab Emirates" },
                        { city: "Abu Dhabi", community: "Saadiyat Island", country: "United Arab Emirates" },
                        { city: "London", community: "Mayfair", country: "United Kingdom" },
                        { city: "Bali", community: "Uluwatu Clifftop", country: "Indonesia" },
                      ]
                  ).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCity(preset.city);
                        setCommunity(preset.community);
                        setCountry(preset.country);
                      }}
                      className="rounded-full border border-border bg-secondary/50 hover:bg-primary/20 hover:border-primary/50 px-3 py-1 text-xs text-foreground transition-all duration-150 active:scale-95"
                    >
                      {preset.city} • {preset.community}
                    </button>
                  ))}
                </div>
              </div>

              {/* City & Country */}
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold">
                  City <span className="text-primary">*</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  required
                  placeholder="e.g. Dubai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs font-semibold">
                  Country <span className="text-primary">*</span>
                </Label>
                <Input
                  id="country"
                  type="text"
                  required
                  placeholder="e.g. UAE"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Community & Address */}
              <div className="space-y-1.5">
                <Label htmlFor="community" className="text-xs font-semibold">
                  Community / Neighbourhood
                </Label>
                <Input
                  id="community"
                  type="text"
                  placeholder="e.g. Palm Jumeirah, Frond G"
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold">
                  Address Line
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="e.g. Billionaires Row Enclave"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Latitude & Longitude */}
              <div className="space-y-1.5">
                <Label htmlFor="lat" className="text-xs font-semibold">
                  Latitude
                </Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="e.g. 25.1124"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lng" className="text-xs font-semibold">
                  Longitude
                </Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="e.g. 55.1390"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Google Map URL */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="mapUrl" className="text-xs font-semibold">
                  Google Maps URL
                </Label>
                <Input
                  id="mapUrl"
                  type="text"
                  placeholder='e.g. <iframe src="https://www.google.com/maps/embed?pb=..."></iframe>'
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  For an exact pin, go to Google Maps {'>'} Share {'>'} "Embed a map" and paste the iframe snippet here. Standard links may fallback to searching the property name.
                </p>
              </div>
              </div>

              {/* Financial Metrics (Fixed) */}
              <div className="space-y-3 md:col-span-2 pt-4 border-t border-border pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Financial Intelligence Metrics
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Key financial indicators used across the platform.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {financialMetrics.map((metric, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-md border border-border bg-card">
                      <label className="text-xs font-medium text-foreground">{metric.label}</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Value (e.g. 18-22%)"
                          value={metric.value}
                          onChange={(e) => {
                            const newMetrics = [...financialMetrics];
                            newMetrics[idx].value = e.target.value;
                            setFinancialMetrics(newMetrics);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1"
                        />
                        <Input
                          placeholder="Note (optional)"
                          value={metric.note}
                          onChange={(e) => {
                            const newMetrics = [...financialMetrics];
                            newMetrics[idx].note = e.target.value;
                            setFinancialMetrics(newMetrics);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Amenities
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Icons automatically match keywords in real-time (wellness, boat, clubhouse, helipad, pool, gym, etc.). Add descriptions for rich cards.
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
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Amenity</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  {amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2.5 p-3 rounded-lg border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        {/* Live Material Icon Visual Indicator */}
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/30 text-primary shrink-0"
                          title={`Icon: ${amenity.iconKey || "star"}`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {amenity.iconKey || "star"}
                          </span>
                        </div>

                        {/* Amenity Name with Auto Keyword Observation */}
                        <Input
                          placeholder="Amenity Name (e.g. Sri Sri Panchakarma Wellness Centre)"
                          value={amenity.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newAm = [...amenities];
                            newAm[idx].name = val;
                            const detected = detectAmenityIcon(val);
                            if (detected && detected !== "star") {
                              newAm[idx].iconKey = detected;
                            } else if (!newAm[idx].iconKey) {
                              newAm[idx].iconKey = "star";
                            }
                            setAmenities(newAm);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1 font-medium"
                        />

                        {/* Icon Key Custom Selector */}
                        <div className="flex items-center gap-1">
                          <Input
                            placeholder="Icon key"
                            value={amenity.iconKey}
                            onChange={(e) => {
                              const newAm = [...amenities];
                              newAm[idx].iconKey = e.target.value;
                              setAmenities(newAm);
                            }}
                            className="bg-secondary/40 h-9 text-xs w-24 font-mono"
                            title="Material Symbols icon key"
                          />
                          <select
                            value={COMMON_AMENITY_ICONS.some((o) => o.icon === amenity.iconKey) ? amenity.iconKey : ""}
                            onChange={(e) => {
                              if (e.target.value) {
                                const newAm = [...amenities];
                                newAm[idx].iconKey = e.target.value;
                                setAmenities(newAm);
                              }
                            }}
                            className="h-9 rounded-md border border-input bg-secondary/40 px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                            title="Quick Icon Preset"
                          >
                            <option value="">Presets...</option>
                            {COMMON_AMENITY_ICONS.map((p) => (
                              <option key={p.icon} value={p.icon}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAm = [...amenities];
                            newAm.splice(idx, 1);
                            setAmenities(newAm);
                          }}
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Amenity Description Input */}
                      <Input
                        placeholder="Description (e.g. A curated wellness retail experience driving year-round engagement and repeat visits)"
                        value={amenity.description}
                        onChange={(e) => {
                          const newAm = [...amenities];
                          newAm[idx].description = e.target.value;
                          setAmenities(newAm);
                        }}
                        className="bg-secondary/40 h-9 text-xs w-full text-foreground/90"
                      />
                    </div>
                  ))}
                  {amenities.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-3 bg-secondary/20 rounded-md border border-dashed border-border">
                      No amenities added yet. Click &quot;Add Amenity&quot; to define features with auto-icon recognition.
                    </p>
                  )}
                </div>
              </div>

              {/* Nearby Places */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Nearby Places & Connectivity</h4>
                    <p className="text-[11px] text-muted-foreground">
                      Landmarks, commute hubs, airports, and points of interest.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNearbyPlaces([...nearbyPlaces, { name: "", distance: "", travelTime: "", category: "Connectivity", description: "" }])}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Place</span>
                  </Button>
                </div>
                <div className="space-y-3">
                  {nearbyPlaces.map((place, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card shadow-sm">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Place Name (e.g. International Airport)"
                          value={place.name}
                          onChange={(e) => {
                            const newPl = [...nearbyPlaces];
                            newPl[idx].name = e.target.value;
                            setNearbyPlaces(newPl);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1 font-medium"
                        />
                        <Input
                          placeholder="Distance (e.g. 15 km)"
                          value={place.distance}
                          onChange={(e) => {
                            const newPl = [...nearbyPlaces];
                            newPl[idx].distance = e.target.value;
                            setNearbyPlaces(newPl);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newPl = [...nearbyPlaces];
                            newPl.splice(idx, 1);
                            setNearbyPlaces(newPl);
                          }}
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Travel Time (e.g. 20 Mins Drive)"
                          value={place.travelTime}
                          onChange={(e) => {
                            const newPl = [...nearbyPlaces];
                            newPl[idx].travelTime = e.target.value;
                            setNearbyPlaces(newPl);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1"
                        />
                        <Input
                          placeholder="Category (e.g. Airport, Beach, Metro)"
                          value={place.category}
                          onChange={(e) => {
                            const newPl = [...nearbyPlaces];
                            newPl[idx].category = e.target.value;
                            setNearbyPlaces(newPl);
                          }}
                          className="bg-secondary/40 h-9 text-xs flex-1"
                        />
                      </div>
                      <Input
                        placeholder="Description / Context (optional e.g. Direct expressway connectivity)"
                        value={place.description}
                        onChange={(e) => {
                          const newPl = [...nearbyPlaces];
                          newPl[idx].description = e.target.value;
                          setNearbyPlaces(newPl);
                        }}
                        className="bg-secondary/40 h-9 text-xs w-full"
                      />
                    </div>
                  ))}
                  {nearbyPlaces.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-3 bg-secondary/20 rounded-md border border-dashed border-border">
                      No nearby connectivity landmarks added.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>

              <Button
                type="button"
                disabled={saving}
                onClick={handleSaveBasicAndLocation}
                className="gap-2"
              >
                {saving ? (
                  <span>Saving Property...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {isEditMode
                        ? "Update & Proceed to Media"
                        : "Create Property & Add Media"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ================= STEP 3 ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Step 3: Media Upload & Gallery Management
                </h3>
                <p className="text-xs text-muted-foreground">
                  Property ID: <span className="font-mono text-primary font-medium">{createdPropertyId}</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="text-xs"
              >
                ← Back to Details
              </Button>
            </div>

            {createdPropertyId ? (
              <MediaUploader
                propertyId={createdPropertyId}
                existingMedia={existingMedia}
                onFinish={() => {
                  toast.success("Listing setup completed!");
                  navigate(`/admin/properties/${createdPropertyId}`);
                }}
              />
            ) : (
              <div className="p-8 text-center text-xs text-destructive">
                Please complete Steps 1 and 2 to create the property record first.
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
