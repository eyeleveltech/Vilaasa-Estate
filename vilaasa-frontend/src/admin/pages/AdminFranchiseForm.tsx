import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Eye,
  TrendingUp,
  Calculator,
  Layers,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Property,
  PropertyStatus,
  PropertyMedia,
  Currency,
  ApiResponse,
} from "../types/admin.types";
import { MediaUploader } from "../components/MediaUploader";
import { BrochureUploader } from "../components/BrochureUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const detectEcosystemIcon = (name: string): string => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("site") || lower.includes("location") || lower.includes("waterfront") || lower.includes("land") || lower.includes("real estate") || lower.includes("property")) return "storefront";
  if (lower.includes("architect") || lower.includes("design") || lower.includes("biophilic") || lower.includes("interior") || lower.includes("fitout") || lower.includes("build")) return "design_services";
  if (lower.includes("therapist") || lower.includes("train") || lower.includes("certif") || lower.includes("school") || lower.includes("academy") || lower.includes("doctor") || lower.includes("healer")) return "school";
  if (lower.includes("market") || lower.includes("distribut") || lower.includes("brand") || lower.includes("campaign") || lower.includes("pr") || lower.includes("advertis")) return "campaign";
  if (lower.includes("wellness") || lower.includes("ayurved") || lower.includes("spa") || lower.includes("treat") || lower.includes("heal")) return "spa";
  if (lower.includes("software") || lower.includes("tech") || lower.includes("pos") || lower.includes("crm") || lower.includes("booking") || lower.includes("digital")) return "devices";
  if (lower.includes("legal") || lower.includes("complian") || lower.includes("licens") || lower.includes("permit") || lower.includes("contract")) return "gavel";
  if (lower.includes("audit") || lower.includes("quality") || lower.includes("sop") || lower.includes("standard") || lower.includes("inspect")) return "verified_user";
  if (lower.includes("dining") || lower.includes("culinary") || lower.includes("restaurant") || lower.includes("f&b") || lower.includes("food") || lower.includes("kitchen")) return "restaurant";
  if (lower.includes("money") || lower.includes("financ") || lower.includes("invest") || lower.includes("yield") || lower.includes("capital")) return "payments";
  return "business_center";
};

export const detectBenefitIcon = (name: string): string => {
  const lower = (name || "").toLowerCase();
  if (lower.includes("hands-off") || lower.includes("operator") || lower.includes("manage") || lower.includes("foco") || lower.includes("turnkey")) return "verified_user";
  if (lower.includes("yield") || lower.includes("payout") || lower.includes("dividend") || lower.includes("return") || lower.includes("cash")) return "payments";
  if (lower.includes("growth") || lower.includes("appreciation") || lower.includes("roi") || lower.includes("compound") || lower.includes("scale")) return "trending_up";
  if (lower.includes("asset") || lower.includes("capital") || lower.includes("equity") || lower.includes("vault") || lower.includes("bank")) return "account_balance";
  if (lower.includes("protect") || lower.includes("risk") || lower.includes("safe") || lower.includes("sovereign") || lower.includes("shield")) return "shield";
  if (lower.includes("margin") || lower.includes("retainer") || lower.includes("profit") || lower.includes("revenue")) return "paid";
  return "stars";
};

const COMMON_ECOSYSTEM_ICONS = [
  { label: "Site / Storefront", icon: "storefront" },
  { label: "Design / Architecture", icon: "design_services" },
  { label: "Therapist / Training", icon: "school" },
  { label: "Marketing / Campaign", icon: "campaign" },
  { label: "Wellness / Spa", icon: "spa" },
  { label: "Tech / Digital Systems", icon: "devices" },
  { label: "Legal / Compliance", icon: "gavel" },
  { label: "Quality / SOP Audit", icon: "verified_user" },
  { label: "Dining / Culinary F&B", icon: "restaurant" },
  { label: "General Business", icon: "business_center" },
];

const COMMON_BENEFIT_ICONS = [
  { label: "Operator Managed", icon: "verified_user" },
  { label: "Guaranteed Yield", icon: "payments" },
  { label: "High ROI Growth", icon: "trending_up" },
  { label: "Capital Asset", icon: "account_balance" },
  { label: "Risk Protection", icon: "shield" },
  { label: "High Margin", icon: "paid" },
  { label: "Signature Star", icon: "stars" },
];

const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; dotColor: string; badgeClass: string; activeBorder: string; emoji: string }
> = {
  AVAILABLE: {
    label: "Available for Investment",
    dotColor: "bg-emerald-500",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    activeBorder: "border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    emoji: "🟢",
  },
  READY_TO_MOVE: {
    label: "Operational / Ready",
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
    label: "Reserved Allocation",
    dotColor: "bg-purple-400",
    badgeClass: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    activeBorder: "border-purple-400 text-purple-300 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]",
    emoji: "🟣",
  },
  SOLD: {
    label: "Fully Subscribed / Closed",
    dotColor: "bg-rose-500",
    badgeClass: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    activeBorder: "border-rose-500 text-rose-400 bg-rose-500/10 shadow-[0_0_12px_rgba(244,63,94,0.25)]",
    emoji: "🔴",
  },
};

const SECTIONS = [
  { id: 1, title: "Hero Section", shortTitle: "Hero", icon: Sparkles },
  { id: 2, title: "The Vision", shortTitle: "The Vision", icon: Eye },
  { id: 3, title: "Financial Blueprint", shortTitle: "Financials", icon: TrendingUp },
  { id: 4, title: "Financial Planning CTA", shortTitle: "Projector CTA", icon: Calculator },
  { id: 5, title: "Comprehensive Ecosystem", shortTitle: "Ecosystem", icon: Layers },
  { id: 6, title: "Key Benefits", shortTitle: "Key Benefits", icon: Award },
  { id: 7, title: "Book a Call CTA", shortTitle: "Call CTA", icon: Calendar },
  { id: 8, title: "Gallery & Media", shortTitle: "Gallery", icon: ImageIcon },
];

export const AdminFranchiseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<number>(1);
  const [createdFranchiseId, setCreatedFranchiseId] = useState<string | null>(
    id || null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [existingMedia, setExistingMedia] = useState<PropertyMedia[]>([]);

  // 1. Hero Section
  const [marketScope, setMarketScope] = useState<"DOMESTIC" | "INTERNATIONAL">(
    "DOMESTIC",
  );
  const [name, setName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [franchiseModel, setFranchiseModel] = useState<"FOCO" | "FOFO" | "FICO">("FOCO");
  const [status, setStatus] = useState<PropertyStatus>("AVAILABLE");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [minTicketSize, setMinTicketSize] = useState<string>("7000000");
  const [totalProjectCost, setTotalProjectCost] = useState<string>("250000000");
  const [expectedAnnualRoi, setExpectedAnnualRoi] = useState<string>("24");
  const [paybackPeriodYears, setPaybackPeriodYears] = useState<string>("3.5");
  const [lockInPeriodYears, setLockInPeriodYears] = useState<string>("3");
  const [yieldPayoutFrequency, setYieldPayoutFrequency] = useState<
    "MONTHLY" | "QUARTERLY" | "ANNUALLY"
  >("QUARTERLY");
  const [brochureUrl, setBrochureUrl] = useState<string>("");
  const [uploadingBrochure, setUploadingBrochure] = useState<boolean>(false);
  const brochureFileInputRef = useRef<HTMLInputElement>(null);
  const [city, setCity] = useState<string>("Kochi");
  const [country, setCountry] = useState<string>("India");
  const [community, setCommunity] = useState<string>("Fort Kochi Waterfront");

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
    const toastId = toast.loading("Uploading franchise memorandum...");

    try {
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success && res.data.data?.url) {
        setBrochureUrl(res.data.data.url);
        toast.success("Franchise brochure attached successfully!", { id: toastId });
      } else {
        toast.error("Failed to retrieve upload link", { id: toastId });
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

  // 2. The Vision
  const [visionHeadline, setVisionHeadline] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // 3. Financial Blueprint (100% Free to Text)
  const [customSpecs, setCustomSpecs] = useState<{ label: string; value: string }[]>([
    { label: "Total Project Cost", value: "₹25,00,00,000" },
    { label: "Min Ticket Size", value: "₹70,00,000" },
    { label: "Lock In Period", value: "3 Years" },
    { label: "Yield Payout", value: "Quarterly Guaranteed" },
  ]);

  // 5. Comprehensive Ecosystem (Modules with auto-icon & description)
  const [supportModules, setSupportModules] = useState<{ name: string; icon: string; description: string }[]>([
    {
      name: "Location Scouting & Waterfront Sourcing",
      icon: "storefront",
      description: "Demographic intelligence and prime commercial leasing in high-density HNW enclaves.",
    },
    {
      name: "Biophilic Architecture & Interior Styling",
      icon: "design_services",
      description: "Bespoke interior fitouts conforming to ultra-luxury global hospital and resort standards.",
    },
    {
      name: "Ayurveda Therapist University Certification",
      icon: "school",
      description: "Resident physician training and certified therapist onboarding from accredited academies.",
    },
    {
      name: "Global Luxury Marketing & HNW Distribution",
      icon: "campaign",
      description: "Exclusive patient and member pipeline generation via international private client channels.",
    },
  ]);

  // 6. Key Benefits (Free-to-text with auto-icon)
  const [advantages, setAdvantages] = useState<{ name: string; icon: string; description: string }[]>([
    {
      name: "100% Hands-Off Operator Management",
      icon: "verified_user",
      description: "Full turnkey operations, clinical oversight, and staff management handled under FOCO.",
    },
    {
      name: "Quarterly Guaranteed Yield Distributions",
      icon: "payments",
      description: "Predictable dividend distributions directly wired to investor institutional accounts.",
    },
    {
      name: "High-Margin Recurring Retainer Model",
      icon: "paid",
      description: "Membership renewals and premium customized treatment packages ensure robust operational cashflow.",
    },
  ]);

  const handleMarketScopeChange = (scope: "DOMESTIC" | "INTERNATIONAL") => {
    setMarketScope(scope);
    if (scope === "DOMESTIC") {
      setCountry("India");
      if (currency === "AED" || currency === "USD") {
        setCurrency("INR");
      }
      if (!city || city === "Dubai" || city === "Abu Dhabi") {
        setCity("Kochi");
        setCommunity("Fort Kochi Waterfront");
      }
    } else {
      if (!country || country.trim().toLowerCase() === "india") {
        setCountry("United Arab Emirates");
      }
      if (currency === "INR") {
        setCurrency("AED");
      }
      if (!city || city === "Kochi" || city === "Goa") {
        setCity("Dubai");
        setCommunity("Palm Jumeirah Wellness Hub");
      }
    }
  };

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
        setVisionHeadline(prop.visionHeadline || "");
        setDescription(prop.description || "");
        setFranchiseModel(
          (prop.franchiseModel as "FOCO" | "FOFO" | "FICO") || "FOCO",
        );
        setStatus(prop.status || "AVAILABLE");
        setCurrency(prop.currency || "INR");
        setMinTicketSize(
          prop.minTicketSize?.toString() || prop.price?.toString() || "0",
        );
        setTotalProjectCost(prop.totalProjectCost?.toString() || "");
        setExpectedAnnualRoi(prop.expectedAnnualRoi?.toString() || "24");
        setPaybackPeriodYears(prop.paybackPeriodYears?.toString() || "3.5");
        setLockInPeriodYears(prop.lockInPeriodYears?.toString() || "3");
        setYieldPayoutFrequency(
          (prop.yieldPayoutFrequency as "MONTHLY" | "QUARTERLY" | "ANNUALLY") ||
            "QUARTERLY",
        );
        setBrochureUrl(prop.brochureUrl || "");

        // Location
        if (prop.location) {
          const isDom = prop.location.country?.trim().toLowerCase() === "india";
          setMarketScope(isDom ? "DOMESTIC" : "INTERNATIONAL");
          setCity(prop.location.city || "");
          setCountry(
            prop.location.country || (isDom ? "India" : "United Arab Emirates"),
          );
          setCommunity(prop.location.community || "");
        }

        // 3. Financial Blueprint (customSpecs)
        if (prop.customSpecs && Array.isArray(prop.customSpecs) && prop.customSpecs.length > 0) {
          setCustomSpecs(prop.customSpecs);
        } else {
          setCustomSpecs([
            { label: "Total Project Cost", value: prop.totalProjectCost ? `${prop.currency} ${Number(prop.totalProjectCost).toLocaleString()}` : "₹25,00,00,000" },
            { label: "Min Ticket Size", value: prop.minTicketSize ? `${prop.currency} ${Number(prop.minTicketSize).toLocaleString()}` : "₹70,00,000" },
            { label: "Lock In Period", value: prop.lockInPeriodYears ? `${prop.lockInPeriodYears} Years` : "3 Years" },
            { label: "Yield Payout", value: prop.yieldPayoutFrequency ? `${prop.yieldPayoutFrequency} Guaranteed` : "Quarterly Guaranteed" },
          ]);
        }

        // 5. Comprehensive Ecosystem (supportModules)
        if (Array.isArray(prop.supportModules) && prop.supportModules.length > 0) {
          setSupportModules(
            prop.supportModules.map((item: any) => {
              if (typeof item === "object" && item !== null && item.name) {
                return {
                  name: item.name,
                  icon: item.icon || detectEcosystemIcon(item.name),
                  description: item.description || "",
                };
              }
              return {
                name: String(item),
                icon: detectEcosystemIcon(String(item)),
                description: String(item),
              };
            }),
          );
        }

        // 6. Key Benefits (advantages)
        if (Array.isArray(prop.advantages) && prop.advantages.length > 0) {
          setAdvantages(
            prop.advantages.map((item: any) => {
              if (typeof item === "object" && item !== null && item.name) {
                return {
                  name: item.name,
                  icon: item.icon || detectBenefitIcon(item.name),
                  description: item.description || "",
                };
              }
              return {
                name: String(item),
                icon: detectBenefitIcon(String(item)),
                description: String(item),
              };
            }),
          );
        }

        // 8. Media
        if (prop.media) {
          setExistingMedia(prop.media);
        }
      }
    } catch {
      toast.error("Failed to load franchise opportunity for editing");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      fetchFranchiseData();
    }
  }, [isEditMode, fetchFranchiseData]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Franchise brand name is required (Hero Section)");
      setActiveSection(1);
      return false;
    }
    if (!description.trim() || description.trim().length < 20) {
      toast.error("Vision description must be at least 20 characters (The Vision Section)");
      setActiveSection(2);
      return false;
    }
    if (!city.trim() || !country.trim()) {
      toast.error("Territory location (City & Country) is required (Hero Section)");
      setActiveSection(1);
      return false;
    }
    return true;
  };

  const handleSaveFranchise = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    setSaving(true);
    const cleanedCustomSpecs = customSpecs
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }));

    const cleanedSupportModules = supportModules
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        icon: m.icon.trim() || detectEcosystemIcon(m.name.trim()),
        description: m.description.trim() || undefined,
      }));

    const cleanedAdvantages = advantages
      .filter((a) => a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        icon: a.icon.trim() || detectBenefitIcon(a.name.trim()),
        description: a.description.trim() || undefined,
      }));

    const payload = {
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      visionHeadline: visionHeadline.trim() || undefined,
      type: "FRANCHISE",
      status,
      description: description.trim(),
      price: parseFloat(minTicketSize) || 0,
      currency,
      minTicketSize: parseFloat(minTicketSize) || 0,
      totalProjectCost: totalProjectCost ? parseFloat(totalProjectCost) : undefined,
      expectedAnnualRoi: expectedAnnualRoi ? parseFloat(expectedAnnualRoi) : undefined,
      paybackPeriodYears: paybackPeriodYears ? parseFloat(paybackPeriodYears) : undefined,
      lockInPeriodYears: lockInPeriodYears ? parseFloat(lockInPeriodYears) : undefined,
      yieldPayoutFrequency,
      franchiseModel,
      brochureUrl: brochureUrl.trim() || undefined,
      customSpecs: cleanedCustomSpecs,
      supportModules: cleanedSupportModules,
      advantages: cleanedAdvantages,
      location: {
        city: city.trim(),
        country: country.trim(),
        community: community.trim() || undefined,
      },
    };

    try {
      if (isEditMode && createdFranchiseId) {
        const res = await api.put<ApiResponse<Property>>(
          `/properties/${createdFranchiseId}`,
          payload,
        );
        if (res.data.success) {
          toast.success("Franchise specifications updated successfully!");
          return true;
        }
      } else {
        const res = await api.post<ApiResponse<Property>>(
          "/properties",
          payload,
        );
        if (res.data.success && res.data.data) {
          const newId = res.data.data.id;
          setCreatedFranchiseId(newId);
          toast.success("Franchise registered! You may now review sections or upload media.");
          setActiveSection(8); // Navigate to Gallery
          return true;
        }
      }
      return false;
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to save franchise";
      toast.error(errMsg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpec = (defaultLabel: string = "", defaultValue: string = "") => {
    setCustomSpecs([...customSpecs, { label: defaultLabel, value: defaultValue }]);
  };

  const handleAddEcosystemModule = () => {
    setSupportModules([
      ...supportModules,
      { name: "", icon: "business_center", description: "" },
    ]);
  };

  const handleAddBenefit = () => {
    setAdvantages([
      ...advantages,
      { name: "", icon: "stars", description: "" },
    ]);
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
              {isEditMode ? "Edit Franchise" : "New Franchise Asset"}
            </span>
            <span className="text-xs text-muted-foreground">
              Section {activeSection} of {SECTIONS.length}
            </span>
          </div>
          <h1 className="text-lg font-bold text-foreground truncate max-w-md mt-0.5">
            {name || "Untitled Franchise Model"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/franchises")}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveFranchise}
            disabled={saving}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-semibold px-4"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isEditMode ? "Save Changes" : "Register Franchise"}</span>
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
                  1. Hero Section & Brand Identification
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Top-level brand identification, operating model, yield payout parameters, and territory.
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
                {/* Franchise Name */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="franchiseName" className="text-xs font-semibold">
                    Franchise Brand Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="franchiseName"
                    placeholder="e.g. Wellness Resorts Kerala"
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
                    placeholder="e.g. High-Yield Luxury Wellness Investment"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="bg-secondary/40 h-10 text-sm"
                  />
                </div>

                {/* Franchise Model */}
                <div className="space-y-1.5">
                  <Label htmlFor="franchiseModel" className="text-xs font-semibold">
                    Operating Model
                  </Label>
                  <select
                    id="franchiseModel"
                    value={franchiseModel}
                    onChange={(e) =>
                      setFranchiseModel(e.target.value as "FOCO" | "FOFO" | "FICO")
                    }
                    className="w-full h-10 rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="FOCO">FOCO (Franchise Owned, Company Operated)</option>
                    <option value="FOFO">FOFO (Franchise Owned, Franchise Operated)</option>
                    <option value="FICO">FICO (Franchise Invested, Company Operated)</option>
                  </select>
                </div>

                {/* Opportunity Status with Color Indication */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="status" className="text-xs font-semibold">
                      Opportunity Status <span className="text-destructive">*</span>
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

                {/* Min Ticket Size */}
                <div className="space-y-1.5">
                  <Label htmlFor="minTicket" className="text-xs font-semibold">
                    Minimum Investment Ticket ({currency})
                  </Label>
                  <div className="flex gap-2">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-24 h-10 rounded-md border border-input bg-secondary/40 px-2.5 text-xs font-bold text-primary"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                    <Input
                      id="minTicket"
                      type="number"
                      placeholder="7000000"
                      value={minTicketSize}
                      onChange={(e) => setMinTicketSize(e.target.value)}
                      className="bg-secondary/40 h-10 font-mono text-sm font-semibold flex-1"
                    />
                  </div>
                </div>

                {/* Total Project Cost */}
                <div className="space-y-1.5">
                  <Label htmlFor="totalCost" className="text-xs font-semibold">
                    Total Project Cost ({currency})
                  </Label>
                  <Input
                    id="totalCost"
                    type="number"
                    placeholder="250000000"
                    value={totalProjectCost}
                    onChange={(e) => setTotalProjectCost(e.target.value)}
                    className="bg-secondary/40 h-10 font-mono text-sm"
                  />
                </div>

                {/* Payout Frequency */}
                <div className="space-y-1.5">
                  <Label htmlFor="payoutFreq" className="text-xs font-semibold">
                    Yield Payout Schedule
                  </Label>
                  <select
                    id="payoutFreq"
                    value={yieldPayoutFrequency}
                    onChange={(e) =>
                      setYieldPayoutFrequency(
                        e.target.value as "MONTHLY" | "QUARTERLY" | "ANNUALLY",
                      )
                    }
                    className="w-full h-10 rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="MONTHLY">Monthly Distribution</option>
                    <option value="QUARTERLY">Quarterly Distribution</option>
                    <option value="ANNUALLY">Annual Distribution</option>
                  </select>
                </div>

                {/* Expected Annual ROI */}
                <div className="space-y-1.5">
                  <Label htmlFor="annualRoi" className="text-xs font-semibold">
                    Target Annual ROI (%)
                  </Label>
                  <Input
                    id="annualRoi"
                    type="number"
                    step="0.1"
                    placeholder="24"
                    value={expectedAnnualRoi}
                    onChange={(e) => setExpectedAnnualRoi(e.target.value)}
                    className="bg-secondary/40 h-10 text-xs font-mono"
                  />
                </div>

                {/* Territory Location */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-semibold">
                    Territory City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g. Kochi, Dubai, Kumarakom"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-semibold">
                    Territory Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g. India, United Arab Emirates"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="community" className="text-xs font-semibold">
                    Territory Hub / Community Enclave
                  </Label>
                  <Input
                    id="community"
                    placeholder="e.g. Fort Kochi Waterfront, Palm Jumeirah Wellness Hub"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="bg-secondary/40 h-10"
                  />
                </div>

                {/* Brochure Direct PDF URL & Add Media */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="brochureUrl" className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Investment Memorandum / PDF Brochure URL</span>
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
              </div>
            </motion.div>
          )}

          {/* SECTION 2: THE VISION */}
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
                  2. The Vision (Brand Philosophy & Investment Thesis)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Articulate the brand ethos, guest proposition, and operator thesis for prospective partners.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="visionHeadline" className="text-xs font-semibold">
                    The Vision Headline
                  </Label>
                  <Input
                    id="visionHeadline"
                    placeholder="e.g. Where culinary artistry meets intelligent capital."
                    value={visionHeadline}
                    onChange={(e) => setVisionHeadline(e.target.value)}
                    className="bg-secondary/40 h-10 text-sm font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Prominently displayed above the editorial narrative in &quot;The Vision&quot; section.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description" className="text-xs font-semibold">
                      Vision Narrative & Investment Story <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-primary/80 font-mono">
                      Tip: Press Enter twice to split into multiple paragraphs
                    </span>
                  </div>
                  <textarea
                    id="description"
                    rows={8}
                    placeholder="First paragraph describing the brand concept, wellness heritage, and market validation...&#10;&#10;Second paragraph outlining operator pedigree, institutional capital protections, and revenue drivers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary font-sans resize-y"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Minimum 20 characters. Blank lines automatically split into separate paragraphs on the public page.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION 3: FINANCIAL BLUEPRINT */}
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
                    <TrendingUp className="h-4 w-4 text-primary" />
                    3. Financial Blueprint (Free to Text)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define any key financial metric or project milestone with complete free text flexibility.
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
                  <span>Add Metric</span>
                </Button>
              </div>

              {/* Quick Add Chips */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Add Standard Metrics (Click to insert editable row)
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Total Project Cost", defVal: "₹25,00,00,000" },
                    { label: "Min Ticket Size", defVal: "₹70,00,000" },
                    { label: "Lock In Period", defVal: "3 Years" },
                    { label: "Yield Payout", defVal: "Quarterly Guaranteed" },
                    { label: "Target Annual ROI", defVal: "24% Annually" },
                    { label: "Payback Period", defVal: "3.5 Years" },
                    { label: "Break-Even Horizon", defVal: "48 Months" },
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

              {/* Dynamic Key-Value Rows */}
              <div className="space-y-2.5 pt-2">
                {customSpecs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No blueprint metrics added yet. Click &quot;Add Metric&quot; or select one of the chips above.
                    </p>
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
                            Metric Label
                          </Label>
                          <Input
                            placeholder="e.g. Total Project Cost, Min Ticket Size"
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
                            placeholder="e.g. ₹25 Cr, 3 Years, 24% Annually"
                            value={spec.value}
                            onChange={(e) => {
                              const updated = [...customSpecs];
                              updated[idx].value = e.target.value;
                              setCustomSpecs(updated);
                            }}
                            className="bg-secondary/40 h-8 text-xs font-bold text-primary"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = customSpecs.filter((_, i) => i !== idx);
                            setCustomSpecs(updated);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors self-end mb-1"
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

          {/* SECTION 4: FINANCIAL PLANNING CTA TO WEALTH PROJECTOR */}
          {activeSection === 4 && (
            <motion.div
              key="sec-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  4. Financial Planning CTA (Wealth Projector Bridge)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Directs prospective franchise investors to the interactive multi-currency returns simulation tool.
                </p>
              </div>

              {/* Informative Preview Card */}
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-4 max-w-2xl mx-auto my-4 text-center">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">
                    Integrated Public Callout
                  </span>
                  <h4 className="text-xl font-light text-foreground">
                    Project Your <span className="italic text-primary font-serif">Returns</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                    Use our sophisticated Wealth Projector to estimate your potential returns across different currencies and geographies. Compare with traditional investments and make informed decisions.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
                    <Calculator className="h-4 w-4" />
                    <span>Links directly to /wealth-projector</span>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground/80 pt-2 border-t border-border/60">
                  Notice: This section is standard across all franchise dossiers to guarantee HNI interactive modelling.
                </p>
              </div>
            </motion.div>
          )}

          {/* SECTION 5: COMPREHENSIVE ECOSYSTEM */}
          {activeSection === 5 && (
            <motion.div
              key="sec-5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    5. Comprehensive Ecosystem (Support & Training)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Icons automatically match keywords in real-time. Free to enter any operational pillar or training asset.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddEcosystemModule}
                  className="gap-1.5 text-xs self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Ecosystem Module</span>
                </Button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Add Signature Pillars
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "Site Selection & Waterfront Sourcing", defDesc: "Demographic intelligence and prime commercial leasing in high-density HNW enclaves." },
                    { name: "Biophilic Architecture & Interior Styling", defDesc: "Bespoke interior fitouts conforming to ultra-luxury global hospital and resort standards." },
                    { name: "Therapist & Medical Academy Certification", defDesc: "Resident physician training and certified therapist onboarding from accredited academies." },
                    { name: "Global Luxury Marketing & Distribution", defDesc: "Exclusive patient and member pipeline generation via international private client channels." },
                    { name: "Clinical Audit & Quality Assurance", defDesc: "Rigorous SOP compliance and quarterly third-party medical audits." },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setSupportModules([
                          ...supportModules,
                          {
                            name: preset.name,
                            icon: detectEcosystemIcon(preset.name),
                            description: preset.defDesc,
                          },
                        ])
                      }
                      className="inline-flex items-center gap-1 text-[11px] py-1 px-2.5 rounded-full border border-border bg-secondary/40 text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-primary" />
                      <span>{preset.name.split(" ")[0]} {preset.name.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-3 pt-2">
                {supportModules.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No ecosystem pillars added yet. Click &quot;Add Ecosystem Module&quot; to begin.
                    </p>
                  </div>
                ) : (
                  supportModules.map((mod, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/30 text-primary shrink-0"
                          title={`Icon: ${mod.icon || "business_center"}`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {mod.icon || "business_center"}
                          </span>
                        </div>

                        <Input
                          placeholder="Pillar / Module Name (e.g. Site Selection & Waterfront Sourcing)"
                          value={mod.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...supportModules];
                            updated[idx].name = val;
                            if (!updated[idx].icon || updated[idx].icon === "business_center") {
                              updated[idx].icon = detectEcosystemIcon(val);
                            }
                            setSupportModules(updated);
                          }}
                          className="bg-secondary/40 h-9 text-xs font-semibold flex-1"
                        />

                        <select
                          value={mod.icon || "business_center"}
                          onChange={(e) => {
                            const updated = [...supportModules];
                            updated[idx].icon = e.target.value;
                            setSupportModules(updated);
                          }}
                          className="h-9 rounded-md border border-input bg-secondary/40 px-2 text-xs max-w-[150px]"
                        >
                          {COMMON_ECOSYSTEM_ICONS.map((p) => (
                            <option key={p.icon} value={p.icon}>
                              {p.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = supportModules.filter((_, i) => i !== idx);
                            setSupportModules(updated);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Input
                        placeholder="Context / Operational Scope (e.g. Turnkey location sourcing and municipal permit clearances)"
                        value={mod.description}
                        onChange={(e) => {
                          const updated = [...supportModules];
                          updated[idx].description = e.target.value;
                          setSupportModules(updated);
                        }}
                        className="bg-secondary/40 h-8 text-[11px] text-muted-foreground"
                      />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* SECTION 6: KEY BENEFITS (FOCO ADVANTAGE) */}
          {activeSection === 6 && (
            <motion.div
              key="sec-6"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    6. Key Benefits (The FOCO Advantage)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Free to text with auto-icon recognition. Clearly outline investor advantages, margins, and protections.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBenefit}
                  className="gap-1.5 text-xs self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Key Benefit</span>
                </Button>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 pt-2">
                {advantages.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl bg-secondary/10 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No benefits added yet. Click &quot;Add Key Benefit&quot; to highlight investor advantages.
                    </p>
                  </div>
                ) : (
                  advantages.map((adv, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <div className="flex gap-2 items-center">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 border border-primary/30 text-primary shrink-0"
                          title={`Icon: ${adv.icon || "stars"}`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {adv.icon || "stars"}
                          </span>
                        </div>

                        <Input
                          placeholder="Benefit Title (e.g. 100% Hands-Off Operator Management)"
                          value={adv.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...advantages];
                            updated[idx].name = val;
                            if (!updated[idx].icon || updated[idx].icon === "stars") {
                              updated[idx].icon = detectBenefitIcon(val);
                            }
                            setAdvantages(updated);
                          }}
                          className="bg-secondary/40 h-9 text-xs font-semibold flex-1"
                        />

                        <select
                          value={adv.icon || "stars"}
                          onChange={(e) => {
                            const updated = [...advantages];
                            updated[idx].icon = e.target.value;
                            setAdvantages(updated);
                          }}
                          className="h-9 rounded-md border border-input bg-secondary/40 px-2 text-xs max-w-[150px]"
                        >
                          {COMMON_BENEFIT_ICONS.map((p) => (
                            <option key={p.icon} value={p.icon}>
                              {p.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = advantages.filter((_, i) => i !== idx);
                            setAdvantages(updated);
                          }}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <Input
                        placeholder="Advantage Context (e.g. Full operator-backed operational management under the FOCO framework)"
                        value={adv.description}
                        onChange={(e) => {
                          const updated = [...advantages];
                          updated[idx].description = e.target.value;
                          setAdvantages(updated);
                        }}
                        className="bg-secondary/40 h-8 text-[11px] text-muted-foreground"
                      />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* SECTION 7: BOOK A CALL CTA */}
          {activeSection === 7 && (
            <motion.div
              key="sec-7"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  7. Book a Call CTA (Next Steps & Advisory Calendar)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Directs accredited partners to book a private briefing session with the acquisition team.
                </p>
              </div>

              {/* Informative Preview Card */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4 max-w-2xl mx-auto my-4 text-center">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">
                    Integrated Booking Funnel
                  </span>
                  <h4 className="text-xl font-light text-foreground">
                    Secure Your <span className="italic text-primary font-serif">Legacy</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 max-w-lg mx-auto leading-relaxed">
                    We provide end-to-end support to ensure your franchise asset performs at the highest level from day one.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Links directly to /calendar (Book a call today)</span>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground/80 pt-2 border-t border-border/60">
                  Notice: This CTA section automatically routes leads into your Admin Site Visits and Leads pipeline.
                </p>
              </div>
            </motion.div>
          )}

          {/* SECTION 8: GALLERY & MEDIA */}
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
                  <ImageIcon className="h-4 w-4 text-primary" />
                  8. Gallery & Media Assets
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload architectural photography, treatment suites, and PDF brochures. Edit image captions inline.
                </p>
              </div>

              {createdFranchiseId ? (
                <div className="space-y-8">
                  <MediaUploader
                    propertyId={createdFranchiseId}
                    existingMedia={existingMedia}
                    onMediaUploaded={() => {
                      api.get<ApiResponse<Property>>(`/properties/${createdFranchiseId}`).then((res) => {
                        if (res.data.success && res.data.data?.media) {
                          setExistingMedia(res.data.data.media);
                        }
                      });
                    }}
                  />

                  <div className="pt-6 border-t border-border">
                    <BrochureUploader
                      propertyId={createdFranchiseId}
                      currentBrochureUrl={brochureUrl}
                      onBrochureUploaded={(url) => {
                        setBrochureUrl(url);
                        toast.success("Franchise dossier PDF attached!");
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
                      Save Franchise First to Enable Direct Uploads
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Direct Cloudinary media streaming requires a registered franchise record. Click below to save your core details and unlock media uploads.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSaveFranchise}
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
              onClick={handleSaveFranchise}
              disabled={saving}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-semibold px-4"
            >
              {saving ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{isEditMode ? "Save All Changes" : "Complete & Register"}</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
