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
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [type, setType] = useState<PropertyType>("RESIDENTIAL_VILLA");
  const [status, setStatus] = useState<PropertyStatus>("AVAILABLE");
  const [description, setDescription] = useState<string>("");
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
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [community, setCommunity] = useState<string>("");
  const [addressLine, setAddressLine] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [googleMapUrl, setGoogleMapUrl] = useState<string>("");

  // Load existing property in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchPropertyForEdit = async () => {
        setLoading(true);
        try {
          const res = await api.get<ApiResponse<Property[]>>("/properties", {
            params: { limit: 50 },
          });
          const match = res.data.data.find((p) => p.id === id || p.slug === id);

          if (match) {
            const detailRes = await api.get<ApiResponse<Property>>(
              `/properties/${match.slug}`,
            );
            const prop = detailRes.data.data;

            setCreatedPropertyId(prop.id);
            setName(prop.name);
            setTagline(prop.tagline || "");
            setType(prop.type);
            setStatus(prop.status);
            setDescription(prop.description);
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
              setCity(prop.location.city || "");
              setCountry(prop.location.country || "");
              setCommunity(prop.location.community || "");
              setAddressLine(prop.location.addressLine || "");
              setLatitude(prop.location.latitude?.toString() || "");
              setLongitude(prop.location.longitude?.toString() || "");
              setGoogleMapUrl(prop.location.googleMapUrl || "");
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

              {/* Type */}
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

              {/* Status */}
              <div className="space-y-1.5">
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

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="desc" className="text-xs font-semibold">
                  Architectural Description <span className="text-primary">*</span>
                </Label>
                <textarea
                  id="desc"
                  rows={4}
                  required
                  placeholder="Detailed description of finishes, architectural vision, views..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Minimum 20 characters. Current: {description.length}
                </p>
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
                  type="url"
                  placeholder="https://maps.google.com/?q=..."
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
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
