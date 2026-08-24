import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Building2,
  Users,
  Coins,
  TrendingUp,
  RefreshCw,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  VaultAdminOverview,
  VaultAdminAsset,
  VaultAdminInvestor,
  Property,
  ApiResponse,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VaultTab = "assets" | "investors" | "allocate";

export const AdminVaultManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VaultTab>("assets");
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [overview, setOverview] = useState<VaultAdminOverview | null>(null);

  // Assets Tab State
  const [assets, setAssets] = useState<VaultAdminAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [assetSearch, setAssetSearch] = useState<string>("");
  const [occupancyFilter, setOccupancyFilter] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [assetPage, setAssetPage] = useState<number>(1);
  const [assetMeta, setAssetMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Investors Tab State
  const [investors, setInvestors] = useState<VaultAdminInvestor[]>([]);
  const [loadingInvestors, setLoadingInvestors] = useState<boolean>(false);
  const [investorSearch, setInvestorSearch] = useState<string>("");
  const [investorPage, setInvestorPage] = useState<number>(1);

  // Available Properties for allocation
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);

  // Modals state
  const [quickValuationModal, setQuickValuationModal] = useState<{
    open: boolean;
    asset: VaultAdminAsset | null;
    currentValuation: string;
    monthlyRentalYield: string;
    submitting: boolean;
  }>({
    open: false,
    asset: null,
    currentValuation: "",
    monthlyRentalYield: "",
    submitting: false,
  });

  const [editAssetModal, setEditAssetModal] = useState<{
    open: boolean;
    asset: VaultAdminAsset | null;
    unitNumber: string;
    currentValuation: string;
    monthlyRentalYield: string;
    occupancyStatus: string;
    submitting: boolean;
  }>({
    open: false,
    asset: null,
    unitNumber: "",
    currentValuation: "",
    monthlyRentalYield: "",
    occupancyStatus: "OCCUPIED",
    submitting: false,
  });

  const [deleteAssetModal, setDeleteAssetModal] = useState<{
    open: boolean;
    assetId: string | null;
    deleting: boolean;
  }>({
    open: false,
    assetId: null,
    deleting: false,
  });

  const [onboardInvestorModal, setOnboardInvestorModal] = useState<{
    open: boolean;
    name: string;
    email: string;
    phone: string;
    phoneCode: string;
    password: string;
    submitting: boolean;
  }>({
    open: false,
    name: "",
    email: "",
    phone: "",
    phoneCode: "+91",
    password: "",
    submitting: false,
  });

  // Allocation Form State
  const [allocUserId, setAllocUserId] = useState<string>("");
  const [allocPropertyId, setAllocPropertyId] = useState<string>("");
  const [allocUnitNumber, setAllocUnitNumber] = useState<string>("");
  const [allocPurchaseDate, setAllocPurchaseDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [allocPurchasePrice, setAllocPurchasePrice] = useState<string>("");
  const [allocCurrentValuation, setAllocCurrentValuation] =
    useState<string>("");
  const [allocMonthlyRental, setAllocMonthlyRental] = useState<string>("");
  const [allocOccupancy, setAllocOccupancy] = useState<string>("OCCUPIED");
  const [submittingAlloc, setSubmittingAlloc] = useState<boolean>(false);

  // 1. Fetch Overview
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await api.get<ApiResponse<VaultAdminOverview>>(
        "/vault/admin/overview",
      );
      if (res.data.success) {
        setOverview(res.data.data);
      }
    } catch {
      toast.error("Failed to load Vault AUM overview");
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // 2. Fetch Assets
  const fetchAssets = useCallback(async () => {
    setLoadingAssets(true);
    try {
      const params: Record<string, string | number> = {
        page: assetPage,
        limit: 20,
      };
      if (assetSearch.trim()) params.search = assetSearch.trim();
      if (occupancyFilter) params.occupancyStatus = occupancyFilter;
      if (filterUserId) params.userId = filterUserId;

      const res = await api.get<ApiResponse<VaultAdminAsset[]>>(
        "/vault/admin/assets",
        { params },
      );
      if (res.data.success) {
        setAssets(res.data.data || []);
        if (res.data.meta) {
          setAssetMeta(res.data.meta);
        }
      }
    } catch {
      toast.error("Failed to load Vault assets");
    } finally {
      setLoadingAssets(false);
    }
  }, [assetPage, assetSearch, occupancyFilter, filterUserId]);

  // 3. Fetch Investors
  const fetchInvestors = useCallback(async () => {
    setLoadingInvestors(true);
    try {
      const params: Record<string, string | number> = {
        page: investorPage,
        limit: 50,
      };
      if (investorSearch.trim()) params.search = investorSearch.trim();

      const res = await api.get<ApiResponse<VaultAdminInvestor[]>>(
        "/vault/admin/investors",
        { params },
      );
      if (res.data.success) {
        setInvestors(res.data.data || []);
      }
    } catch {
      toast.error("Failed to load Vault investors");
    } finally {
      setLoadingInvestors(false);
    }
  }, [investorPage, investorSearch]);

  // 4. Fetch Properties List for dropdown
  const fetchPropertiesForSelect = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Property[]>>("/properties", {
        params: { limit: 100 },
      });
      if (res.data.success) {
        setPropertiesList(res.data.data || []);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchPropertiesForSelect();
  }, [fetchOverview, fetchPropertiesForSelect]);

  useEffect(() => {
    if (activeTab === "assets") {
      fetchAssets();
    } else if (activeTab === "investors") {
      fetchInvestors();
    } else if (activeTab === "allocate") {
      fetchInvestors();
    }
  }, [activeTab, fetchAssets, fetchInvestors]);

  // Formatters
  const formatCrores = (val?: number) => {
    if (!val || isNaN(val)) return "₹0.00 Cr";
    const cr = val / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(2)} L`;
  };

  const formatLakhs = (val?: number) => {
    if (!val || isNaN(val)) return "₹0 /mo";
    const lakhs = val / 100000;
    if (lakhs >= 1) return `₹${lakhs.toFixed(2)} L/mo`;
    return `₹${val.toLocaleString()}/mo`;
  };

  const formatCurrency = (val?: number, curr = "INR") => {
    if (val === undefined || val === null || isNaN(val)) return `${curr} 0`;
    return `${curr} ${val.toLocaleString()}`;
  };

  // Handlers: Quick Valuation Update
  const handleQuickValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickValuationModal.asset) return;

    setQuickValuationModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.patch<ApiResponse<VaultAdminAsset>>(
        `/vault/admin/assets/${quickValuationModal.asset.id}/valuation`,
        {
          currentValuation: Number(quickValuationModal.currentValuation),
          monthlyRentalYield: quickValuationModal.monthlyRentalYield
            ? Number(quickValuationModal.monthlyRentalYield)
            : undefined,
        },
      );

      if (res.data.success) {
        toast.success("Valuation and rental distributions updated!");
        setQuickValuationModal({
          open: false,
          asset: null,
          currentValuation: "",
          monthlyRentalYield: "",
          submitting: false,
        });
        fetchAssets();
        fetchOverview();
      }
    } catch {
      toast.error("Failed to update asset valuation");
    } finally {
      setQuickValuationModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handlers: Full Edit Asset
  const handleEditAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAssetModal.asset) return;

    setEditAssetModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.put<ApiResponse<VaultAdminAsset>>(
        `/vault/assets/${editAssetModal.asset.id}`,
        {
          unitNumber: editAssetModal.unitNumber,
          currentValuation: Number(editAssetModal.currentValuation),
          monthlyRentalYield: Number(editAssetModal.monthlyRentalYield || 0),
          occupancyStatus: editAssetModal.occupancyStatus,
        },
      );

      if (res.data.success) {
        toast.success("Asset allocation updated successfully");
        setEditAssetModal({
          open: false,
          asset: null,
          unitNumber: "",
          currentValuation: "",
          monthlyRentalYield: "",
          occupancyStatus: "OCCUPIED",
          submitting: false,
        });
        fetchAssets();
        fetchOverview();
      }
    } catch {
      toast.error("Failed to update asset allocation");
    } finally {
      setEditAssetModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handlers: Delete Asset
  const handleDeleteAsset = async () => {
    if (!deleteAssetModal.assetId) return;

    setDeleteAssetModal((prev) => ({ ...prev, deleting: true }));
    try {
      const res = await api.delete<ApiResponse<null>>(
        `/vault/assets/${deleteAssetModal.assetId}`,
      );
      if (res.data.success) {
        toast.success("Asset allocation removed from investor vault");
        setDeleteAssetModal({ open: false, assetId: null, deleting: false });
        fetchAssets();
        fetchOverview();
      }
    } catch {
      toast.error("Failed to remove vault asset");
    } finally {
      setDeleteAssetModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  const [showInvestorPassword, setShowInvestorPassword] =
    useState<boolean>(false);

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "Vilaasa@";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOnboardInvestorModal((prev) => ({ ...prev, password: pass }));
  };

  // Handlers: Onboard Investor
  const handleOnboardInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !onboardInvestorModal.email ||
      !onboardInvestorModal.name ||
      !onboardInvestorModal.password
    ) {
      toast.error("Please fill in all required investor fields");
      return;
    }

    setOnboardInvestorModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.post<
        ApiResponse<{ user: unknown; emailSent?: boolean }>
      >("/vault/admin/onboard-investor", {
        name: onboardInvestorModal.name.trim(),
        email: onboardInvestorModal.email.trim(),
        phone: onboardInvestorModal.phone.trim() || undefined,
        phoneCode: onboardInvestorModal.phoneCode,
        password: onboardInvestorModal.password,
      });

      if (res.data.success) {
        toast.success(
          `Investor account created! Access credentials have been emailed to ${onboardInvestorModal.email.trim()}.`,
          { duration: 6000 },
        );
        setOnboardInvestorModal({
          open: false,
          name: "",
          email: "",
          phone: "",
          phoneCode: "+91",
          password: "",
          submitting: false,
        });
        fetchInvestors();
        fetchOverview();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to onboard investor. Email may already be in use.";
      toast.error(msg);
    } finally {
      setOnboardInvestorModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handlers: Allocate Asset to Investor Form
  const handleAllocateAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocUserId || !allocPropertyId || !allocUnitNumber) {
      toast.error("Please select an investor, property, and unit number");
      return;
    }

    setSubmittingAlloc(true);
    try {
      const res = await api.post<ApiResponse<VaultAdminAsset>>("/vault/assets", {
        userId: allocUserId,
        propertyId: allocPropertyId,
        unitNumber: allocUnitNumber.trim(),
        purchaseDate: allocPurchaseDate,
        purchasePrice: Number(allocPurchasePrice),
        currentValuation: Number(allocCurrentValuation || allocPurchasePrice),
        monthlyRentalYield: allocMonthlyRental
          ? Number(allocMonthlyRental)
          : 0,
        occupancyStatus: allocOccupancy,
      });

      if (res.data.success) {
        toast.success("Asset assigned to investor portfolio successfully!");
        setAllocUnitNumber("");
        setAllocPurchasePrice("");
        setAllocCurrentValuation("");
        setAllocMonthlyRental("");
        fetchOverview();
        setActiveTab("assets");
      }
    } catch {
      toast.error("Failed to assign asset to investor portfolio");
    } finally {
      setSubmittingAlloc(false);
    }
  };

  const getOccupancyBadge = (status: string) => {
    switch (status) {
      case "OCCUPIED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "VACANT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "UNDER_MAINTENANCE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 text-primary/80 mb-1">
            <span className="h-px w-6 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
              Institutional Asset Custody
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            The Vault <span className="font-serif italic text-primary">Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Firm-wide HNW investor portfolios, periodic asset appraisals, and yield payouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchOverview();
              if (activeTab === "assets") fetchAssets();
              if (activeTab === "investors") fetchInvestors();
            }}
            title="Refresh Vault desk"
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loadingOverview || loadingAssets || loadingInvestors
                  ? "animate-spin text-primary"
                  : ""
              }`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() =>
              setOnboardInvestorModal({
                open: true,
                name: "",
                email: "",
                phone: "",
                phoneCode: "+91",
                password: "",
                submitting: false,
              })
            }
            className="gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            <span>Onboard New Investor</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: AUM Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span>Total Firm AUM</span>
          </div>
          <p className="text-lg font-bold text-foreground font-mono">
            {formatCrores(overview?.totalAum)}
          </p>
          <p className="text-[10px] text-muted-foreground">Current valuation</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Coins className="h-3.5 w-3.5 text-blue-400" />
            <span>Total Invested</span>
          </div>
          <p className="text-lg font-bold text-foreground font-mono">
            {formatCrores(overview?.totalInvested)}
          </p>
          <p className="text-[10px] text-muted-foreground">Acquisition cost</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Firm Appreciation</span>
          </div>
          <p className="text-lg font-bold text-emerald-400 font-mono">
            +{overview?.appreciationPercent || 0}%
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            +{formatCrores(overview?.totalAppreciation)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 text-purple-400" />
            <span>Monthly Distributions</span>
          </div>
          <p className="text-lg font-bold text-foreground font-mono">
            {formatLakhs(overview?.totalMonthlyRental)}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            {formatCrores(overview?.annualRentalIncome)}/yr
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-amber-400" />
            <span>VIP Investors</span>
          </div>
          <p className="text-lg font-bold text-foreground font-mono">
            {overview?.totalInvestors || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Custody accounts</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Allocated Units</span>
          </div>
          <p className="text-lg font-bold text-foreground font-mono">
            {overview?.totalUnits || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Active suites</p>
        </div>
      </div>

      {/* Occupancy Status Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
            Portfolio Custody Occupancy:
          </span>
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            Occupied: {overview?.byOccupancy?.OCCUPIED || 0}
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
            Vacant: {overview?.byOccupancy?.VACANT || 0}
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-purple-400">
            Under Maintenance: {overview?.byOccupancy?.UNDER_MAINTENANCE || 0}
          </span>
        </div>

        {filterUserId && (
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium text-[11px]">
              Filtered by single investor
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterUserId("")}
              className="h-6 px-2 text-[10px]"
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>

      {/* SECTION 2: Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-border">
        {[
          { id: "assets", label: "All Asset Allocations", icon: Building2 },
          { id: "investors", label: "Investor Directory", icon: Users },
          { id: "allocate", label: "New Asset Allocation", icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as VaultTab);
                if (tab.id !== "assets") setFilterUserId("");
              }}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL ASSETS TABLE */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search investor, unit number, property..."
                  value={assetSearch}
                  onChange={(e) => {
                    setAssetSearch(e.target.value);
                    setAssetPage(1);
                  }}
                  className="bg-secondary/40 pl-9 text-xs h-9"
                />
              </div>

              <select
                value={occupancyFilter}
                onChange={(e) => {
                  setOccupancyFilter(e.target.value);
                  setAssetPage(1);
                }}
                className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none h-9"
              >
                <option value="">All Occupancy Statuses</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="VACANT">Vacant</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              </select>
            </div>

            {(assetSearch || occupancyFilter || filterUserId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAssetSearch("");
                  setOccupancyFilter("");
                  setFilterUserId("");
                  setAssetPage(1);
                }}
                className="text-xs text-muted-foreground"
              >
                Reset Filters
              </Button>
            )}
          </div>

          {/* Assets Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Investor Client</th>
                    <th className="px-4 py-3.5 font-semibold">Property Asset</th>
                    <th className="px-4 py-3.5 font-semibold">Unit Number</th>
                    <th className="px-4 py-3.5 font-semibold">Purchase Price</th>
                    <th className="px-4 py-3.5 font-semibold">Current Valuation</th>
                    <th className="px-4 py-3.5 font-semibold">Capital Gain</th>
                    <th className="px-4 py-3.5 font-semibold">Monthly Rental</th>
                    <th className="px-4 py-3.5 font-semibold">Occupancy</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingAssets ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <p className="text-xs">Loading investor vault holdings...</p>
                        </div>
                      </td>
                    </tr>
                  ) : assets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Lock className="h-8 w-8 text-muted-foreground/40 stroke-1" />
                          <p className="text-sm font-medium">No vault assets found</p>
                          <p className="text-xs">
                            Assign luxury suites to VIP clients from the "New Asset Allocation" tab.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    assets.map((asset) => {
                      const isGain = asset.appreciation >= 0;

                      return (
                        <tr
                          key={asset.id}
                          className="hover:bg-secondary/20 transition-colors"
                        >
                          {/* Investor */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-foreground">
                              {asset.user?.name || "VIP Investor"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {asset.user?.email}
                            </p>
                          </td>

                          {/* Property */}
                          <td className="px-4 py-4">
                            <Link
                              to={`/property/${asset.property?.slug || asset.property?.id}`}
                              target="_blank"
                              className="font-medium text-foreground hover:text-primary hover:underline line-clamp-1"
                            >
                              {asset.property?.name}
                            </Link>
                            <p className="text-[10px] text-muted-foreground uppercase">
                              {asset.property?.type?.replace(/_/g, " ")} •{" "}
                              {asset.property?.location?.city}
                            </p>
                          </td>

                          {/* Unit Number */}
                          <td className="px-4 py-4 font-mono font-medium text-foreground">
                            {asset.unitNumber}
                          </td>

                          {/* Purchase Price */}
                          <td className="px-4 py-4 font-mono text-muted-foreground">
                            {formatCurrency(
                              asset.purchasePrice,
                              asset.property?.currency,
                            )}
                          </td>

                          {/* Current Valuation */}
                          <td className="px-4 py-4 font-mono font-semibold text-foreground">
                            {formatCurrency(
                              asset.currentValuation,
                              asset.property?.currency,
                            )}
                          </td>

                          {/* Capital Gain */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`font-semibold font-mono ${
                                isGain ? "text-emerald-400" : "text-destructive"
                              }`}
                            >
                              {isGain ? "+" : ""}
                              {asset.appreciationPercent}%
                            </span>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {isGain ? "+" : ""}
                              {formatCurrency(
                                asset.appreciation,
                                asset.property?.currency,
                              )}
                            </p>
                          </td>

                          {/* Monthly Rental */}
                          <td className="px-4 py-4 font-mono text-foreground">
                            {asset.monthlyRentalYield
                              ? formatCurrency(
                                  asset.monthlyRentalYield,
                                  asset.property?.currency,
                                )
                              : "—"}
                          </td>

                          {/* Occupancy */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getOccupancyBadge(
                                asset.occupancyStatus,
                              )}`}
                            >
                              {asset.occupancyStatus.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setQuickValuationModal({
                                    open: true,
                                    asset,
                                    currentValuation:
                                      asset.currentValuation.toString(),
                                    monthlyRentalYield:
                                      asset.monthlyRentalYield?.toString() || "",
                                    submitting: false,
                                  })
                                }
                                title="Quick Appraisal"
                                className="h-7 px-2 text-[10px] gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                              >
                                <TrendingUp className="h-3 w-3" />
                                <span>Appraise</span>
                              </Button>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditAssetModal({
                                    open: true,
                                    asset,
                                    unitNumber: asset.unitNumber,
                                    currentValuation:
                                      asset.currentValuation.toString(),
                                    monthlyRentalYield:
                                      asset.monthlyRentalYield?.toString() || "",
                                    occupancyStatus: asset.occupancyStatus,
                                    submitting: false,
                                  })
                                }
                                title="Edit Unit Allocation"
                                className="rounded-md border border-border bg-secondary/30 p-1.5 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteAssetModal({
                                    open: true,
                                    assetId: asset.id,
                                    deleting: false,
                                  })
                                }
                                title="Remove Allocation"
                                className="rounded-md border border-border bg-secondary/30 p-1.5 text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {assetMeta && assetMeta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3 text-xs text-muted-foreground">
                <div>
                  Showing Page {assetMeta.page} of {assetMeta.totalPages} (
                  {assetMeta.total} total allocations)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={assetMeta.page <= 1 || loadingAssets}
                    onClick={() => setAssetPage((p) => p - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      assetMeta.page >= assetMeta.totalPages || loadingAssets
                    }
                    onClick={() => setAssetPage((p) => p + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVESTOR DIRECTORY */}
      {activeTab === "investors" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search investor by name, email, phone..."
                value={investorSearch}
                onChange={(e) => setInvestorSearch(e.target.value)}
                className="bg-secondary/40 pl-9 text-xs h-9"
              />
            </div>
            <Button
              size="sm"
              onClick={() =>
                setOnboardInvestorModal({
                  open: true,
                  name: "",
                  email: "",
                  phone: "",
                  phoneCode: "+91",
                  password: "",
                  submitting: false,
                })
              }
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>Onboard Investor</span>
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Investor Profile</th>
                  <th className="px-4 py-3.5 font-semibold">Allocated Suites</th>
                  <th className="px-4 py-3.5 font-semibold">Total Invested</th>
                  <th className="px-4 py-3.5 font-semibold">Portfolio Value</th>
                  <th className="px-4 py-3.5 font-semibold">Appreciation</th>
                  <th className="px-4 py-3.5 font-semibold">Monthly Rental</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingInvestors ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-xs">Loading investor registry...</p>
                      </div>
                    </td>
                  </tr>
                ) : investors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <p className="text-xs">No registered Vault investors found.</p>
                    </td>
                  </tr>
                ) : (
                  investors.map((inv) => (
                    <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground">{inv.name}</p>
                        <p className="text-[11px] text-muted-foreground">{inv.email}</p>
                        {inv.phone && (
                          <p className="text-[10px] text-muted-foreground">
                            {inv.phoneCode || ""} {inv.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {inv.totalUnits} Units
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono">
                        {formatCrores(inv.totalInvested)}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold text-foreground">
                        {formatCrores(inv.currentValue)}
                      </td>
                      <td className="px-4 py-4 font-mono text-emerald-400 font-semibold">
                        +{inv.appreciationPercent}%
                      </td>
                      <td className="px-4 py-4 font-mono">
                        {formatLakhs(inv.monthlyRental)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFilterUserId(inv.id);
                              setActiveTab("assets");
                            }}
                            className="h-7 px-2 text-[10px] gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Assets</span>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setAllocUserId(inv.id);
                              setActiveTab("allocate");
                            }}
                            className="h-7 px-2 text-[10px] gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Asset</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALLOCATE ASSET FORM */}
      {activeTab === "allocate" && (
        <form
          onSubmit={handleAllocateAssetSubmit}
          className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6 max-w-3xl"
        >
          <div className="border-b border-border pb-3 flex items-center gap-2 text-primary">
            <Plus className="h-4 w-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Assign Estate Unit to Client Portfolio
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Investor Selection */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="allocUser" className="text-xs font-semibold">
                Select VIP Investor (Vault Client) <span className="text-primary">*</span>
              </Label>
              <select
                id="allocUser"
                required
                value={allocUserId}
                onChange={(e) => setAllocUserId(e.target.value)}
                className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
              >
                <option value="">— Select Registered Investor —</option>
                {investors.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Property Selection */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="allocProp" className="text-xs font-semibold">
                Select Trophy Property / Asset <span className="text-primary">*</span>
              </Label>
              <select
                id="allocProp"
                required
                value={allocPropertyId}
                onChange={(e) => setAllocPropertyId(e.target.value)}
                className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
              >
                <option value="">— Select Luxury Asset —</option>
                {propertiesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location?.city}, {p.location?.country}) —{" "}
                    {p.type.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Number */}
            <div className="space-y-1.5">
              <Label htmlFor="allocUnit" className="text-xs font-semibold">
                Unit / Suite Number <span className="text-primary">*</span>
              </Label>
              <Input
                id="allocUnit"
                type="text"
                required
                placeholder="e.g. Penthouse 42B or Suite 701"
                value={allocUnitNumber}
                onChange={(e) => setAllocUnitNumber(e.target.value)}
                className="bg-secondary/40 h-10"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-1.5">
              <Label htmlFor="allocDate" className="text-xs font-semibold">
                Purchase / Allocation Date <span className="text-primary">*</span>
              </Label>
              <Input
                id="allocDate"
                type="date"
                required
                value={allocPurchaseDate}
                onChange={(e) => setAllocPurchaseDate(e.target.value)}
                className="bg-secondary/40 h-10"
              />
            </div>

            {/* Purchase Price */}
            <div className="space-y-1.5">
              <Label htmlFor="allocPrice" className="text-xs font-semibold">
                Purchase Price (INR ₹) <span className="text-primary">*</span>
              </Label>
              <Input
                id="allocPrice"
                type="number"
                required
                min="0"
                placeholder="e.g. 50000000"
                value={allocPurchasePrice}
                onChange={(e) => setAllocPurchasePrice(e.target.value)}
                className="bg-secondary/40 h-10 font-mono"
              />
            </div>

            {/* Current Valuation */}
            <div className="space-y-1.5">
              <Label htmlFor="allocVal" className="text-xs font-semibold">
                Current Appraised Valuation (INR ₹)
              </Label>
              <Input
                id="allocVal"
                type="number"
                min="0"
                placeholder="Leave blank to match purchase price"
                value={allocCurrentValuation}
                onChange={(e) => setAllocCurrentValuation(e.target.value)}
                className="bg-secondary/40 h-10 font-mono"
              />
            </div>

            {/* Monthly Rental Yield */}
            <div className="space-y-1.5">
              <Label htmlFor="allocRent" className="text-xs font-semibold">
                Monthly Rental Distribution (INR ₹ / mo)
              </Label>
              <Input
                id="allocRent"
                type="number"
                min="0"
                placeholder="e.g. 250000"
                value={allocMonthlyRental}
                onChange={(e) => setAllocMonthlyRental(e.target.value)}
                className="bg-secondary/40 h-10 font-mono"
              />
            </div>

            {/* Occupancy Status */}
            <div className="space-y-1.5">
              <Label htmlFor="allocOccupancy" className="text-xs font-semibold">
                Occupancy Status
              </Label>
              <select
                id="allocOccupancy"
                value={allocOccupancy}
                onChange={(e) => setAllocOccupancy(e.target.value)}
                className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-10"
              >
                <option value="OCCUPIED">Occupied (Generating Rental)</option>
                <option value="VACANT">Vacant</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={submittingAlloc} className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>{submittingAlloc ? "Allocating..." : "Confirm Asset Allocation"}</span>
            </Button>
          </div>
        </form>
      )}

      {/* MODAL 1: Quick Valuation Modal */}
      {quickValuationModal.open && quickValuationModal.asset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Appraise Asset Valuation</span>
              </h3>
              <button
                onClick={() =>
                  setQuickValuationModal({
                    open: false,
                    asset: null,
                    currentValuation: "",
                    monthlyRentalYield: "",
                    submitting: false,
                  })
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Update market appraisal for unit{" "}
              <strong className="text-foreground">
                {quickValuationModal.asset.unitNumber}
              </strong>{" "}
              held by{" "}
              <strong className="text-foreground">
                {quickValuationModal.asset.user.name}
              </strong>
              . This immediately updates their private Vault portal.
            </p>

            <form onSubmit={handleQuickValuationSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="qVal" className="text-xs font-semibold">
                  Current Appraised Valuation (₹)
                </Label>
                <Input
                  id="qVal"
                  type="number"
                  required
                  min="0"
                  value={quickValuationModal.currentValuation}
                  onChange={(e) =>
                    setQuickValuationModal((prev) => ({
                      ...prev,
                      currentValuation: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 font-mono text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="qRent" className="text-xs font-semibold">
                  Monthly Rental Distribution (₹ / mo)
                </Label>
                <Input
                  id="qRent"
                  type="number"
                  min="0"
                  value={quickValuationModal.monthlyRentalYield}
                  onChange={(e) =>
                    setQuickValuationModal((prev) => ({
                      ...prev,
                      monthlyRentalYield: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 font-mono text-xs h-9"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuickValuationModal({
                      open: false,
                      asset: null,
                      currentValuation: "",
                      monthlyRentalYield: "",
                      submitting: false,
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={quickValuationModal.submitting}
                >
                  {quickValuationModal.submitting
                    ? "Updating..."
                    : "Save Appraisal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Edit Asset Modal */}
      {editAssetModal.open && editAssetModal.asset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground">
                Edit Asset Allocation
              </h3>
              <button
                onClick={() =>
                  setEditAssetModal({
                    open: false,
                    asset: null,
                    unitNumber: "",
                    currentValuation: "",
                    monthlyRentalYield: "",
                    occupancyStatus: "OCCUPIED",
                    submitting: false,
                  })
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditAssetSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="eUnit" className="text-xs font-semibold">
                  Unit Number
                </Label>
                <Input
                  id="eUnit"
                  type="text"
                  required
                  value={editAssetModal.unitNumber}
                  onChange={(e) =>
                    setEditAssetModal((prev) => ({
                      ...prev,
                      unitNumber: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="eVal" className="text-xs font-semibold">
                  Current Valuation (₹)
                </Label>
                <Input
                  id="eVal"
                  type="number"
                  required
                  min="0"
                  value={editAssetModal.currentValuation}
                  onChange={(e) =>
                    setEditAssetModal((prev) => ({
                      ...prev,
                      currentValuation: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 font-mono text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="eRent" className="text-xs font-semibold">
                  Monthly Rental Yield (₹)
                </Label>
                <Input
                  id="eRent"
                  type="number"
                  min="0"
                  value={editAssetModal.monthlyRentalYield}
                  onChange={(e) =>
                    setEditAssetModal((prev) => ({
                      ...prev,
                      monthlyRentalYield: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 font-mono text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="eOcc" className="text-xs font-semibold">
                  Occupancy Status
                </Label>
                <select
                  id="eOcc"
                  value={editAssetModal.occupancyStatus}
                  onChange={(e) =>
                    setEditAssetModal((prev) => ({
                      ...prev,
                      occupancyStatus: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none h-9"
                >
                  <option value="OCCUPIED">Occupied</option>
                  <option value="VACANT">Vacant</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditAssetModal({
                      open: false,
                      asset: null,
                      unitNumber: "",
                      currentValuation: "",
                      monthlyRentalYield: "",
                      occupancyStatus: "OCCUPIED",
                      submitting: false,
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={editAssetModal.submitting}
                >
                  {editAssetModal.submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirm Modal */}
      {deleteAssetModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-light text-foreground">
              Remove Asset from Investor Vault?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove this unit allocation? The investor
              will no longer see this property in their Vault portfolio.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deleteAssetModal.deleting}
                onClick={() =>
                  setDeleteAssetModal({
                    open: false,
                    assetId: null,
                    deleting: false,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteAssetModal.deleting}
                onClick={handleDeleteAsset}
              >
                {deleteAssetModal.deleting ? "Removing..." : "Remove Allocation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Onboard Investor Modal */}
      {onboardInvestorModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <span>Onboard Private Client Investor</span>
              </h3>
              <button
                onClick={() =>
                  setOnboardInvestorModal({
                    open: false,
                    name: "",
                    email: "",
                    phone: "",
                    phoneCode: "+91",
                    password: "",
                    submitting: false,
                  })
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Automated Email Notice */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  Automated Credential Dispatch
                </span>
                <p className="text-[10.5px] leading-relaxed">
                  Upon onboarding, an official private client dossier containing secure access credentials and the Vault portal link will be immediately dispatched to the investor's email.
                </p>
              </div>
            </div>

            <form onSubmit={handleOnboardInvestorSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="invName" className="text-xs font-semibold">
                  Investor Full Name <span className="text-primary">*</span>
                </Label>
                <Input
                  id="invName"
                  type="text"
                  required
                  placeholder="e.g. Sheikh Mansoor or Priya Sharma"
                  value={onboardInvestorModal.name}
                  onChange={(e) =>
                    setOnboardInvestorModal((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="invEmail" className="text-xs font-semibold">
                  Email Address (Login Username) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="invEmail"
                  type="email"
                  required
                  placeholder="e.g. investor@familyoffice.ae"
                  value={onboardInvestorModal.email}
                  onChange={(e) =>
                    setOnboardInvestorModal((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="invCode" className="text-xs font-semibold">
                    Code
                  </Label>
                  <Input
                    id="invCode"
                    type="text"
                    value={onboardInvestorModal.phoneCode}
                    onChange={(e) =>
                      setOnboardInvestorModal((prev) => ({
                        ...prev,
                        phoneCode: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="invPhone" className="text-xs font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="invPhone"
                    type="tel"
                    placeholder="9876543210"
                    value={onboardInvestorModal.phone}
                    onChange={(e) =>
                      setOnboardInvestorModal((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="invPass" className="text-xs font-semibold">
                    Temporary Access Password <span className="text-primary">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong Key</span>
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="invPass"
                    type={showInvestorPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min 6 characters (e.g. Vault2026@Secret)"
                    value={onboardInvestorModal.password}
                    onChange={(e) =>
                      setOnboardInvestorModal((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9 pr-9 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInvestorPassword(!showInvestorPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    title={showInvestorPassword ? "Hide password" : "Show password"}
                  >
                    {showInvestorPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOnboardInvestorModal({
                      open: false,
                      name: "",
                      email: "",
                      phone: "",
                      phoneCode: "+91",
                      password: "",
                      submitting: false,
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={onboardInvestorModal.submitting}
                  className="gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>
                    {onboardInvestorModal.submitting
                      ? "Onboarding & Emailing..."
                      : "Onboard & Send Credentials"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminVaultManagement;
