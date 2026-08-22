import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Store,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Building,
  DollarSign,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Property,
  PropertyStatus,
  PropertyMedia,
  ApiResponse,
} from "../types/admin.types";
import { MediaUploader } from "../components/MediaUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FranchiseStep = 1 | 2 | 3;

export const AdminFranchiseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<FranchiseStep>(1);
  const [createdFranchiseId, setCreatedFranchiseId] = useState<string | null>(
    id || null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [existingMedia, setExistingMedia] = useState<PropertyMedia[]>([]);

  // Step 1 - Business Details
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [franchiseModel, setFranchiseModel] = useState<"FOCO" | "FOFO" | "FICO">("FOCO");
  const [status, setStatus] = useState<PropertyStatus>("AVAILABLE");
  const [minTicketSize, setMinTicketSize] = useState<string>("7000000");
  const [totalProjectCost, setTotalProjectCost] = useState<string>("250000000");
  const [expectedAnnualRoi, setExpectedAnnualRoi] = useState<string>("24");
  const [paybackPeriodYears, setPaybackPeriodYears] = useState<string>("3.5");
  const [lockInPeriodYears, setLockInPeriodYears] = useState<string>("3");
  const [yieldPayoutFrequency, setYieldPayoutFrequency] = useState<
    "MONTHLY" | "QUARTERLY" | "ANNUALLY"
  >("QUARTERLY");

  // Step 2 - Support & Advantages & Location
  const [supportModules, setSupportModules] = useState<string[]>([
    "Location Scouting & Prime Waterfront Sourcing",
    "Biophilic Architecture & Interior Styling",
    "Ayurveda Therapist University Certification",
    "Global Luxury Marketing & HNW Distribution",
  ]);
  const [advantages, setAdvantages] = useState<string[]>([
    "Physician-Designed Authentic Healing Protocols",
    "High-Margin Recurring Retainer & Treatment Model",
    "100% Hands-Off Operator Management under FOCO",
    "Quarterly Guaranteed Yield Distributions",
  ]);
  const [city, setCity] = useState<string>("Kochi");
  const [country, setCountry] = useState<string>("India");
  const [community, setCommunity] = useState<string>("Fort Kochi Waterfront");

  // Load existing franchise if edit mode
  const fetchFranchiseData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      if (res.data.success && res.data.data) {
        const prop = res.data.data;
        setName(prop.name || "");
        setTagline(prop.tagline || "");
        setDescription(prop.description || "");
        setFranchiseModel(
          (prop.franchiseModel as "FOCO" | "FOFO" | "FICO") || "FOCO",
        );
        setStatus(prop.status || "AVAILABLE");
        setMinTicketSize(
          prop.minTicketSize?.toString() || prop.price?.toString() || "0",
        );
        setTotalProjectCost(prop.totalProjectCost?.toString() || "");
        setExpectedAnnualRoi(
          prop.expectedAnnualRoi?.toString() ||
            prop.rentalYieldPercent?.toString() ||
            "",
        );
        setPaybackPeriodYears(prop.paybackPeriodYears?.toString() || "");
        setLockInPeriodYears(prop.lockInPeriodYears?.toString() || "");
        setYieldPayoutFrequency(
          (prop.yieldPayoutFrequency as
            | "MONTHLY"
            | "QUARTERLY"
            | "ANNUALLY") || "QUARTERLY",
        );

        if (Array.isArray(prop.supportModules) && prop.supportModules.length > 0) {
          setSupportModules(prop.supportModules);
        }
        if (Array.isArray(prop.advantages) && prop.advantages.length > 0) {
          setAdvantages(prop.advantages);
        }

        if (prop.location) {
          setCity(prop.location.city || "");
          setCountry(prop.location.country || "India");
          setCommunity(prop.location.community || "");
        }

        if (prop.media) {
          setExistingMedia(prop.media);
        }
      }
    } catch {
      toast.error("Failed to load franchise asset details");
      navigate("/admin/franchises");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchFranchiseData();
    }
  }, [isEditMode, fetchFranchiseData]);

  // Support module helpers
  const addSupportModule = () => {
    setSupportModules((prev) => [...prev, ""]);
  };

  const updateSupportModule = (idx: number, val: string) => {
    setSupportModules((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const removeSupportModule = (idx: number) => {
    setSupportModules((prev) => prev.filter((_, i) => i !== idx));
  };

  // Advantage helpers
  const addAdvantage = () => {
    setAdvantages((prev) => [...prev, ""]);
  };

  const updateAdvantage = (idx: number, val: string) => {
    setAdvantages((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const removeAdvantage = (idx: number) => {
    setAdvantages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in the required brand name and description");
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !country.trim()) {
      toast.error("City and Country are required for asset territory");
      return;
    }

    const payload = {
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim(),
      type: "FRANCHISE",
      status,
      price: Number(minTicketSize) || 0,
      currency: "INR",
      franchiseModel,
      minTicketSize: minTicketSize ? Number(minTicketSize) : undefined,
      totalProjectCost: totalProjectCost ? Number(totalProjectCost) : undefined,
      expectedAnnualRoi: expectedAnnualRoi ? Number(expectedAnnualRoi) : undefined,
      paybackPeriodYears: paybackPeriodYears ? Number(paybackPeriodYears) : undefined,
      lockInPeriodYears: lockInPeriodYears ? Number(lockInPeriodYears) : undefined,
      yieldPayoutFrequency,
      supportModules: supportModules.filter((s) => s.trim().length > 0),
      advantages: advantages.filter((a) => a.trim().length > 0),
      location: {
        city: city.trim(),
        country: country.trim(),
        community: community.trim() || undefined,
      },
    };

    setSaving(true);
    try {
      if (isEditMode && id) {
        const res = await api.put<ApiResponse<Property>>(
          `/properties/${id}`,
          payload,
        );
        if (res.data.success) {
          toast.success("Franchise asset updated successfully!");
          setCurrentStep(3);
        }
      } else {
        const res = await api.post<ApiResponse<Property>>(
          "/properties",
          payload,
        );
        if (res.data.success && res.data.data) {
          toast.success("Franchise registered! You may now upload media assets.");
          setCreatedFranchiseId(res.data.data.id);
          setCurrentStep(3);
        }
      }
    } catch {
      toast.error("Failed to save franchise asset");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    toast.success("Franchise opportunity published successfully!");
    navigate("/admin/franchises");
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading franchise editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/franchises"
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Franchises</span>
          </Link>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            {isEditMode ? "Edit Franchise" : "New Franchise Asset"}{" "}
            <span className="font-serif italic text-primary">Studio</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure institutional FOCO/FOFO terms, financial returns, and operational training modules
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center space-x-2 rounded-lg bg-secondary/50 p-1.5 border border-border">
          {[
            { num: 1, label: "Business Terms" },
            { num: 2, label: "Support & Territory" },
            { num: 3, label: "Media & Dossier" },
          ].map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <div
                key={s.num}
                className={`flex items-center space-x-2 px-3 py-1 rounded text-xs font-medium transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : isCompleted
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleStep1Submit}
            className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6"
          >
            <div className="flex items-center space-x-2 border-b border-border pb-3 text-primary">
              <Store className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Step 1: Brand & Financial Architecture
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Franchise Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Franchise Brand Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g. Wellness Resorts Kerala or Carlton Wellness Spa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tagline" className="text-xs font-semibold">
                  Tagline / Sector Description
                </Label>
                <Input
                  id="tagline"
                  type="text"
                  placeholder="e.g. Ultra-Luxury Ayurvedic Sanctuary & Retainer Model"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="bg-secondary/40 h-10"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Franchise Overview & Commercial Dossier <span className="text-primary">*</span>
                </Label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="Describe the hospitality lineage, target clientele, recurring revenue model, and operational certainty..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Franchise Model */}
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs font-semibold">
                  Operating Business Model <span className="text-primary">*</span>
                </Label>
                <select
                  id="model"
                  value={franchiseModel}
                  onChange={(e) =>
                    setFranchiseModel(e.target.value as "FOCO" | "FOFO" | "FICO")
                  }
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
                >
                  <option value="FOCO">
                    FOCO — Franchise Owned, Company Operated (Recommended)
                  </option>
                  <option value="FOFO">
                    FOFO — Franchise Owned, Franchise Operated
                  </option>
                  <option value="FICO">
                    FICO — Franchise Invested, Company Operated
                  </option>
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
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
                >
                  <option value="AVAILABLE">Available for Investment</option>
                  <option value="UNDER_CONSTRUCTION">Under Development</option>
                  <option value="RESERVED">Allocated / Reserved</option>
                  <option value="SOLD">Fully Subscribed / Sold Out</option>
                </select>
              </div>

              {/* Minimum Ticket Size */}
              <div className="space-y-1.5">
                <Label htmlFor="minTicket" className="text-xs font-semibold">
                  Minimum Ticket Size (INR ₹) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="minTicket"
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 7000000"
                  value={minTicketSize}
                  onChange={(e) => setMinTicketSize(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Total Project Cost */}
              <div className="space-y-1.5">
                <Label htmlFor="totalCost" className="text-xs font-semibold">
                  Total Project Cost (INR ₹)
                </Label>
                <Input
                  id="totalCost"
                  type="number"
                  min="0"
                  placeholder="e.g. 250000000"
                  value={totalProjectCost}
                  onChange={(e) => setTotalProjectCost(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Expected Annual ROI */}
              <div className="space-y-1.5">
                <Label htmlFor="roi" className="text-xs font-semibold">
                  Expected Annual ROI (%)
                </Label>
                <Input
                  id="roi"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 24.0"
                  value={expectedAnnualRoi}
                  onChange={(e) => setExpectedAnnualRoi(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Payback Period */}
              <div className="space-y-1.5">
                <Label htmlFor="payback" className="text-xs font-semibold">
                  Payback Period (Years)
                </Label>
                <Input
                  id="payback"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 3.5"
                  value={paybackPeriodYears}
                  onChange={(e) => setPaybackPeriodYears(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Lock-in Period */}
              <div className="space-y-1.5">
                <Label htmlFor="lockin" className="text-xs font-semibold">
                  Lock-in Period (Years)
                </Label>
                <Input
                  id="lockin"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 3.0"
                  value={lockInPeriodYears}
                  onChange={(e) => setLockInPeriodYears(e.target.value)}
                  className="bg-secondary/40 h-10 font-mono"
                />
              </div>

              {/* Payout Frequency */}
              <div className="space-y-1.5">
                <Label htmlFor="payout" className="text-xs font-semibold">
                  Yield Payout Frequency
                </Label>
                <select
                  id="payout"
                  value={yieldPayoutFrequency}
                  onChange={(e) =>
                    setYieldPayoutFrequency(
                      e.target.value as "MONTHLY" | "QUARTERLY" | "ANNUALLY",
                    )
                  }
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
                >
                  <option value="MONTHLY">Monthly Distribution</option>
                  <option value="QUARTERLY">Quarterly Distribution</option>
                  <option value="ANNUALLY">Annual Dividend</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" className="gap-2">
                <span>Continue to Support & Territory</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.form>
        )}

        {currentStep === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleStep2Submit}
            className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6"
          >
            <div className="flex items-center space-x-2 border-b border-border pb-3 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Step 2: Turnkey Support, Advantages & Territory
              </h3>
            </div>

            {/* Territory / Location */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>Franchise Territory & Location</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    Target City / Region <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    required
                    placeholder="e.g. Kochi, Kerala"
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
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="community" className="text-xs font-semibold">
                    Micro-Market / Zone
                  </Label>
                  <Input
                    id="community"
                    type="text"
                    placeholder="e.g. Fort Kochi Waterfront"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>
              </div>
            </div>

            {/* Support Modules */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Support & Training Modules
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Turnkey enablement services provided to the franchise asset
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSupportModule}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Module</span>
                </Button>
              </div>

              <div className="space-y-2">
                {supportModules.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={`e.g. ${
                        idx === 0
                          ? "Location Scouting & Feasibility Study"
                          : idx === 1
                          ? "Biophilic Architecture & Interior Styling"
                          : "Staff & Management Certification"
                      }`}
                      value={item}
                      onChange={(e) => updateSupportModule(idx, e.target.value)}
                      className="bg-secondary/40 h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSupportModule(idx)}
                      disabled={supportModules.length <= 1}
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Advantages */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Value Propositions & Advantages
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Distinct investor advantages and competitive moat
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdvantage}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Advantage</span>
                </Button>
              </div>

              <div className="space-y-2">
                {advantages.map((adv, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={`e.g. ${
                        idx === 0
                          ? "Proven High-Yield Retainer Model"
                          : idx === 1
                          ? "Low Capex with Turnkey Fitout"
                          : "Dedicated Operator Management"
                      }`}
                      value={adv}
                      onChange={(e) => updateAdvantage(idx, e.target.value)}
                      className="bg-secondary/40 h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdvantage(idx)}
                      disabled={advantages.length <= 1}
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Step 1</span>
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving Franchise..." : "Save & Proceed to Media"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.form>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Step 3: Media Upload & Institutional Dossier
                </h3>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleFinish}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Publish & Finish</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Upload hero visuals, high-resolution interior/exterior photography, and PDF investment dossiers for{" "}
              <strong className="text-foreground">{name}</strong>.
            </p>

            {createdFranchiseId ? (
              <MediaUploader
                propertyId={createdFranchiseId}
                existingMedia={existingMedia}
                onMediaUploaded={(newMedia) => {
                  setExistingMedia((prev) => [...prev, newMedia]);
                }}
                onMediaDeleted={(mediaId) => {
                  setExistingMedia((prev) =>
                    prev.filter((m) => m.id !== mediaId),
                  );
                }}
                onFinish={handleFinish}
              />
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-xs">
                  Please complete and save Step 1 & 2 before uploading media.
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Step 2</span>
              </Button>
              <Button onClick={handleFinish} className="gap-2">
                <span>Finish & View Catalog</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFranchiseForm;
