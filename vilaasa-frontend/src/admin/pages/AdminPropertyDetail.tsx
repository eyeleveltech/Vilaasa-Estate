import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Image as ImageIcon,
  Layers,
  Sparkles,
  MapPin,
  TrendingUp,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
  ExternalLink,
  DollarSign,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { MediaUploader } from "../components/MediaUploader";
import { BrochureUploader } from "../components/BrochureUploader";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  Property,
  Amenity,
  PropertyConfiguration,
  NearbyPlace,
  PropertyFinancialMetric,
  ApiResponse,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminVaultAsset {
  id: string;
  userId: string;
  unitNumber: string;
  purchaseDate: string;
  purchasePrice: number | string;
  currentValuation: number | string;
  monthlyRentalYield: number | string | null;
  occupancyStatus: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE";
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  property?: {
    id: string;
    name: string;
  };
  propertyId?: string;
}

export const AdminPropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAdminAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBrochureModal, setShowBrochureModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "configurations" | "amenities" | "nearby" | "financials" | "vault"
  >("overview");

  // Master amenities list for picker
  const [masterAmenities, setMasterAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityId, setSelectedAmenityId] = useState<string>("");
  const [amenityDesc, setAmenityDesc] = useState<string>("");

  // New configuration form state
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [newConfig, setNewConfig] = useState({
    unitType: "",
    areaSqFt: "",
    viewType: "",
    price: "",
    isAvailable: true,
  });

  // New nearby place form state
  const [showNearbyModal, setShowNearbyModal] = useState<boolean>(false);
  const [newNearby, setNewNearby] = useState({
    name: "",
    distance: "",
    category: "Airport",
  });

  // New financial metric form state
  const [showFinancialModal, setShowFinancialModal] = useState<boolean>(false);
  const [newMetric, setNewMetric] = useState({
    label: "",
    value: "",
    note: "",
    icon: "savings",
  });

  // Vault assets state
  const [vaultAssets, setVaultAssets] = useState<AdminVaultAsset[]>([]);
  const [showVaultModal, setShowVaultModal] = useState<boolean>(false);
  const [editingVaultAsset, setEditingVaultAsset] = useState<AdminVaultAsset | null>(null);
  const [newVaultAsset, setNewVaultAsset] = useState({
    userId: "",
    unitNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: "",
    currentValuation: "",
    monthlyRentalYield: "",
    occupancyStatus: "OCCUPIED" as "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE",
  });

  const fetchPropertyData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const detailRes = await api.get<ApiResponse<Property>>(
        `/properties/${id}`,
      );
      if (detailRes.data.success && detailRes.data.data) {
        setProperty(detailRes.data.data);
      }
    } catch {
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMasterAmenities = useCallback(async () => {
    try {
      const res = await api.get<
        ApiResponse<Record<string, Amenity[]> | Amenity[]>
      >("/amenities");
      if (res.data.success && res.data.data) {
        if (Array.isArray(res.data.data)) {
          setMasterAmenities(res.data.data);
        } else if (typeof res.data.data === "object") {
          const flatList: Amenity[] = [];
          Object.values(res.data.data).forEach((group) => {
            if (Array.isArray(group)) flatList.push(...group);
          });
          setMasterAmenities(flatList);
        }
      }
    } catch {
      // quiet fallback
    }
  }, []);

  useEffect(() => {
    fetchPropertyData();
    fetchMasterAmenities();
  }, [fetchPropertyData, fetchMasterAmenities]);

  // Handle Add Configuration
  const handleAddConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      const payload = {
        unitType: newConfig.unitType,
        areaSqFt: parseFloat(newConfig.areaSqFt),
        viewType: newConfig.viewType || undefined,
        price: parseFloat(newConfig.price),
        isAvailable: newConfig.isAvailable,
      };
      const res = await api.post(
        `/properties/${property.id}/configurations`,
        payload,
      );
      if (res.data.success) {
        toast.success("Unit configuration added");
        setShowConfigModal(false);
        setNewConfig({
          unitType: "",
          areaSqFt: "",
          viewType: "",
          price: "",
          isAvailable: true,
        });
        fetchPropertyData();
      }
    } catch {
      toast.error("Failed to add configuration");
    }
  };

  const handleDeleteConfiguration = async (configId: string) => {
    if (!property) return;
    try {
      await api.delete(`/properties/${property.id}/configurations/${configId}`);
      toast.success("Unit layout deleted");
      fetchPropertyData();
    } catch {
      toast.error("Failed to delete configuration");
    }
  };

  // Handle Assign Amenity
  const handleAssignAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !selectedAmenityId) return;
    try {
      const res = await api.post(`/properties/${property.id}/amenities`, {
        amenityId: selectedAmenityId,
        description: amenityDesc.trim() || undefined,
      });
      if (res.data.success) {
        toast.success("Amenity assigned to property");
        setSelectedAmenityId("");
        setAmenityDesc("");
        fetchPropertyData();
      }
    } catch {
      toast.error("Failed to assign amenity");
    }
  };

  const handleRemoveAmenity = async (amenityId: string) => {
    if (!property) return;
    try {
      await api.delete(`/properties/${property.id}/amenities/${amenityId}`);
      toast.success("Amenity unlinked");
      fetchPropertyData();
    } catch {
      toast.error("Failed to remove amenity");
    }
  };

  // Handle Add Nearby Place
  const handleAddNearby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      const res = await api.post(`/properties/${property.id}/nearby`, newNearby);
      if (res.data.success) {
        toast.success("Nearby place added");
        setShowNearbyModal(false);
        setNewNearby({ name: "", distance: "", category: "Airport" });
        fetchPropertyData();
      }
    } catch {
      toast.error("Failed to add nearby place");
    }
  };

  const handleDeleteNearby = async (placeId: string) => {
    if (!property) return;
    try {
      await api.delete(`/properties/${property.id}/nearby/${placeId}`);
      toast.success("Nearby landmark removed");
      fetchPropertyData();
    } catch {
      toast.error("Failed to delete nearby place");
    }
  };

  // Handle Add Financial Metric
  const handleAddFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      const res = await api.post(
        `/properties/${property.id}/financials`,
        newMetric,
      );
      if (res.data.success) {
        toast.success("Financial metric added");
        setShowFinancialModal(false);
        setNewMetric({ label: "", value: "", note: "", icon: "savings" });
        fetchPropertyData();
      }
    } catch {
      toast.error("Failed to add financial metric");
    }
  };

  const handleDeleteFinancial = async (metricId: string) => {
    if (!property) return;
    try {
      await api.delete(`/properties/${property.id}/financials/${metricId}`);
      toast.success("Metric removed");
      fetchPropertyData();
    } catch {
      toast.error("Failed to delete metric");
    }
  };

  const handleBrochureUpdate = async (newUrl: string) => {
    if (!property) return;
    try {
      await api.put(`/properties/${property.id}`, { brochureUrl: newUrl || null });
      setProperty({ ...property, brochureUrl: newUrl || null });
      toast.success(newUrl ? "Official brochure updated" : "Brochure removed");
      setShowBrochureModal(false);
    } catch {
      toast.error("Failed to update property brochure");
    }
  };

  // Fetch Vault Assets for this property
  const fetchVaultAssets = useCallback(async () => {
    const propId = property?.id || id;
    if (!propId) return;
    try {
      const res = await api.get<ApiResponse<AdminVaultAsset[]>>("/vault/assets", {
        params: { propertyId: propId },
      });
      if (res.data.success && res.data.data) {
        setVaultAssets(res.data.data);
      }
    } catch {
      // quiet fallback
    }
  }, [id, property?.id]);

  useEffect(() => {
    if (authUser?.role === "SUPER_ADMIN") {
      fetchVaultAssets();
    }
  }, [authUser?.role, fetchVaultAssets]);

  // Handle Create Vault Asset
  const handleCreateVaultAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    if (!newVaultAsset.userId.trim() || !newVaultAsset.unitNumber.trim()) {
      toast.error("Please fill in Investor User ID and Unit Number");
      return;
    }

    try {
      const res = await api.post("/vault/assets", {
        userId: newVaultAsset.userId.trim(),
        propertyId: property.id,
        unitNumber: newVaultAsset.unitNumber.trim(),
        purchaseDate: newVaultAsset.purchaseDate,
        purchasePrice: Number(newVaultAsset.purchasePrice) || Number(property.price),
        currentValuation:
          Number(newVaultAsset.currentValuation) || Number(property.price),
        monthlyRentalYield: Number(newVaultAsset.monthlyRentalYield) || 0,
        occupancyStatus: newVaultAsset.occupancyStatus,
      });

      if (res.data.success) {
        toast.success("Asset added to investor vault");
        setShowVaultModal(false);
        setNewVaultAsset({
          userId: "",
          unitNumber: "",
          purchaseDate: new Date().toISOString().split("T")[0],
          purchasePrice: "",
          currentValuation: "",
          monthlyRentalYield: "",
          occupancyStatus: "OCCUPIED",
        });
        fetchVaultAssets();
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to assign asset to investor vault";
      toast.error(errorMsg);
    }
  };

  // Handle Update Vault Asset
  const handleUpdateVaultAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVaultAsset) return;

    try {
      const res = await api.put(`/vault/assets/${editingVaultAsset.id}`, {
        unitNumber: editingVaultAsset.unitNumber,
        currentValuation: Number(editingVaultAsset.currentValuation),
        monthlyRentalYield: Number(editingVaultAsset.monthlyRentalYield) || 0,
        occupancyStatus: editingVaultAsset.occupancyStatus,
      });

      if (res.data.success) {
        toast.success("Vault asset updated successfully");
        setEditingVaultAsset(null);
        fetchVaultAssets();
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to update vault asset";
      toast.error(errorMsg);
    }
  };

  // Handle Delete Vault Asset
  const handleDeleteVaultAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to remove this asset from the investor vault?")) {
      return;
    }
    try {
      await api.delete(`/vault/assets/${assetId}`);
      toast.success("Vault asset removed");
      fetchVaultAssets();
    } catch {
      toast.error("Failed to remove vault asset");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading property dossier...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <p className="text-sm text-destructive">Property not found or was removed.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/properties">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Back to Properties</span>
          </Link>
        </Button>
      </div>
    );
  }

  const tabs: Array<{ id: typeof activeTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "media", label: `Media (${property.media?.length || 0})`, icon: ImageIcon },
    {
      id: "configurations",
      label: `Units (${property.configurations?.length || 0})`,
      icon: Layers,
    },
    {
      id: "amenities",
      label: `Amenities (${property.amenities?.length || 0})`,
      icon: Sparkles,
    },
    {
      id: "nearby",
      label: `Nearby (${property.nearbyPlaces?.length || 0})`,
      icon: MapPin,
    },
    {
      id: "financials",
      label: `Financials (${property.financialMetrics?.length || 0})`,
      icon: TrendingUp,
    },
  ];

  if (authUser?.role === "SUPER_ADMIN") {
    tabs.push({
      id: "vault",
      label: `Vault (${vaultAssets.length})`,
      icon: ShieldCheck,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/properties"
            className="inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1 uppercase tracking-wider"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Properties</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
              {property.name}
            </h2>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {property.customType || property.type.replace(/_/g, " ")}
            </span>
          </div>
          {property.tagline && (
            <p className="text-xs text-primary font-medium">{property.tagline}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {property.location?.city}, {property.location?.country} • Views:{" "}
            <span className="font-mono text-foreground">{property.views}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to={`/property/${property.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              <span>Public Listing</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs">
            <Link to={`/admin/properties/${property.id}/edit`}>
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Property</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto border-b border-border pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 rounded-md px-3.5 py-2 text-xs uppercase tracking-[0.1em] font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "border border-primary/40 bg-primary/10 text-primary shadow-sm font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Specifications Card */}
          <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xl lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">
              Core Specifications
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">Price</span>
                <p className="font-mono text-base font-bold text-primary">
                  {property.priceOnApplication
                    ? "POA"
                    : `${property.currency} ${Number(
                        property.price,
                      ).toLocaleString()}`}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold text-foreground">
                  {property.status.replace(/_/g, " ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Total Built-up Area</span>
                <p className="font-semibold text-foreground">
                  {property.totalAreaSqFt
                    ? `${property.totalAreaSqFt.toLocaleString()} Sq.Ft.`
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Bedrooms</span>
                <p className="font-semibold text-foreground">{property.bedrooms ?? "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Bathrooms</span>
                <p className="font-semibold text-foreground">{property.bathrooms ?? "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Furnishing</span>
                <p className="font-semibold text-foreground">
                  {property.furnishingStatus.replace(/_/g, " ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">RERA / Permit</span>
                <p className="font-semibold text-foreground">{property.reraNumber || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Ownership</span>
                <p className="font-semibold text-foreground">{property.ownershipType || "Freehold"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Possession Date</span>
                <p className="font-semibold text-foreground">
                  {property.possessionDate
                    ? new Date(property.possessionDate).toLocaleDateString()
                    : "Ready"}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Official Brochure</span>
                  <button
                    type="button"
                    onClick={() => setShowBrochureModal(true)}
                    className="text-[10px] text-primary hover:underline uppercase tracking-wider font-semibold"
                  >
                    {property.brochureUrl ? "Change" : "+ Upload"}
                  </button>
                </div>
                {property.brochureUrl ? (
                  <a
                    href={property.brochureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 font-semibold text-primary hover:underline"
                  >
                    <span>View / Download PDF</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-muted-foreground/60">Not attached</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">360 Virtual Tour</span>
                {property.virtualTour360Url ? (
                  <a
                    href={property.virtualTour360Url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 font-semibold text-primary hover:underline"
                  >
                    <span>Launch 360 Tour</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-muted-foreground/60">Not attached</p>
                )}
              </div>
            </div>

            {property.customSpecs && property.customSpecs.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Custom & At-a-Glance Specifications
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {property.customSpecs.map((spec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-secondary/40 border border-border">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        {spec.label}
                      </span>
                      <p className="font-semibold text-foreground mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concept, Vision & Editorial Verdict */}
            <div className="space-y-4 pt-4 border-t border-border">
              {property.visionHeadline && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    Concept & Vision Headline
                  </span>
                  <h4 className="text-sm font-bold text-foreground">
                    {property.visionHeadline}
                  </h4>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Concept & Vision Narrative
                </span>
                <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {property.verdictQuote && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>The Vilaasa Verdict</span>
                  </div>
                  <p className="text-xs italic text-foreground/90">
                    &quot;{property.verdictQuote}&quot;
                  </p>
                  {(property.verdictAuthor || property.verdictTitle) && (
                    <p className="text-[11px] text-muted-foreground">
                      — {property.verdictAuthor}
                      {property.verdictTitle ? `, ${property.verdictTitle}` : ""}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location & Yield Projections Card */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">
                Location & Coordinates
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">City & Country:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {property.location?.city}, {property.location?.country}
                  </span>
                </div>
                {property.location?.community && (
                  <div>
                    <span className="text-muted-foreground">Community:</span>{" "}
                    <span className="text-foreground">{property.location.community}</span>
                  </div>
                )}
                {property.location?.addressLine && (
                  <div>
                    <span className="text-muted-foreground">Address:</span>{" "}
                    <span className="text-foreground">{property.location.addressLine}</span>
                  </div>
                )}
                {property.location?.latitude && (
                  <div>
                    <span className="text-muted-foreground">Geo-Coordinates:</span>{" "}
                    <span className="font-mono text-foreground">
                      {property.location.latitude}, {property.location.longitude}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-3">
                Investment Projections
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-secondary/50 p-3 border border-border">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase">Rental Yield</span>
                  <p className="font-bold text-emerald-400 text-base mt-1">
                    {property.rentalYieldPercent
                      ? `${property.rentalYieldPercent}% p.a.`
                      : "-"}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 border border-border">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase">Expected IRR</span>
                  <p className="font-bold text-primary text-base mt-1">
                    {property.expectedIrrPercent
                      ? `${property.expectedIrrPercent}%`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MEDIA ================= */}
      {activeTab === "media" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xl">
          <MediaUploader
            propertyId={property.id}
            existingMedia={property.media || []}
            onMediaUploaded={() => fetchPropertyData()}
            onMediaDeleted={() => fetchPropertyData()}
          />
        </div>
      )}

      {/* ================= TAB 3: CONFIGURATIONS ================= */}
      {activeTab === "configurations" && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Unit Configurations & Layouts
              </h3>
              <p className="text-xs text-muted-foreground">
                Individual floor layouts, dimensions, and prices
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowConfigModal(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Unit Configuration</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Unit Type</th>
                  <th className="py-2.5 px-3 font-semibold">Area</th>
                  <th className="py-2.5 px-3 font-semibold">View Type</th>
                  <th className="py-2.5 px-3 font-semibold">Price</th>
                  <th className="py-2.5 px-3 font-semibold">Availability</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {property.configurations && property.configurations.length > 0 ? (
                  property.configurations.map((config) => (
                    <tr key={config.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-foreground">
                        {config.unitType}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {config.areaSqFt > 0 ? `${config.areaSqFt.toLocaleString()} Sq.Ft.` : "-"}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {config.viewType || "-"}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-primary">
                        {property.currency} {Number(config.price).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                            config.isAvailable
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          {config.isAvailable ? "Available" : "Sold"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => config.id && handleDeleteConfiguration(config.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground text-xs">
                      No unit configurations added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Config Modal */}
          {showConfigModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleAddConfiguration}
                className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl"
              >
                <h4 className="text-sm font-semibold text-foreground">Add Unit Configuration</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <Label className="text-xs">Unit Type *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. 4 BHK Presidential Penthouse"
                      value={newConfig.unitType}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, unitType: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Area (Sq.Ft.) *</Label>
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 6200"
                      value={newConfig.areaSqFt}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, areaSqFt: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">View Type</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Arabian Gulf & Skyline View"
                      value={newConfig.viewType}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, viewType: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price *</Label>
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 45000000"
                      value={newConfig.price}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, price: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfigModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Unit
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: AMENITIES ================= */}
      {activeTab === "amenities" && (
        <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="border-b border-border pb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Assigned Luxury Amenities
            </h3>
            <p className="text-xs text-muted-foreground">
              Assign curated amenities from the master catalog
            </p>
          </div>

          {/* Assign Amenity Picker Form */}
          <form
            onSubmit={handleAssignAmenity}
            className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Select Amenity</Label>
              <select
                required
                value={selectedAmenityId}
                onChange={(e) => setSelectedAmenityId(e.target.value)}
                className="w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">-- Choose from Master Catalog --</option>
                {(Array.isArray(masterAmenities) ? masterAmenities : []).map(
                  (am) => (
                    <option key={am.id} value={am.id}>
                      {am.name} ({am.category || "General"})
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <Label className="text-xs">
                Custom Description (Optional)
              </Label>
              <Input
                type="text"
                placeholder="e.g. Temperature controlled with underwater sound system"
                value={amenityDesc}
                onChange={(e) => setAmenityDesc(e.target.value)}
                className="bg-secondary/50 h-9 text-xs"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!selectedAmenityId}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Assign</span>
            </Button>
          </form>

          {/* Assigned Amenities Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.amenities && property.amenities.length > 0 ? (
              property.amenities.map((item) => (
                <div
                  key={item.amenityId}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3.5 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20 text-primary shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-lg">
                        {item.amenity.iconKey || "star"}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">
                        {item.amenity.name}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAmenity(item.amenityId)}
                    title="Remove amenity"
                    className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                No amenities assigned to this property yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: NEARBY PLACES ================= */}
      {activeTab === "nearby" && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Nearby Connectivity & Landmarks
              </h3>
              <p className="text-xs text-muted-foreground">
                Airports, marinas, private schools, and luxury dining
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowNearbyModal(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Nearby Landmark</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.nearbyPlaces && property.nearbyPlaces.length > 0 ? (
              property.nearbyPlaces.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3.5 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
                        {place.category || "Landmark"}
                      </span>
                      {place.travelTime && (
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                          {place.travelTime}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground">{place.name}</p>
                    <p className="text-[11px] text-muted-foreground">{place.distance}</p>
                    {place.description && (
                      <p className="text-[10px] text-muted-foreground/80 italic">{place.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => place.id && handleDeleteNearby(place.id)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                No nearby places added yet.
              </div>
            )}
          </div>

          {/* Add Nearby Modal */}
          {showNearbyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleAddNearby}
                className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl"
              >
                <h4 className="text-sm font-semibold text-foreground">Add Nearby Place</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <Label className="text-xs">Place Name *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Dubai International Airport (DXB)"
                      value={newNearby.name}
                      onChange={(e) =>
                        setNewNearby({ ...newNearby, name: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Drive Distance *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. 15 Mins Drive"
                      value={newNearby.distance}
                      onChange={(e) =>
                        setNewNearby({ ...newNearby, distance: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <select
                      value={newNearby.category}
                      onChange={(e) =>
                        setNewNearby({ ...newNearby, category: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Airport">Airport</option>
                      <option value="Metro">Metro / Transit</option>
                      <option value="School">Private Academy / School</option>
                      <option value="Hospital">Medical Centre</option>
                      <option value="Dining">Fine Dining</option>
                      <option value="Leisure">Yacht Club / Marina</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNearbyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Landmark
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: FINANCIALS ================= */}
      {activeTab === "financials" && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Financial Metrics & Growth Projections
              </h3>
              <p className="text-xs text-muted-foreground">
                Capital growth, rental projections, and asset appreciation targets
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowFinancialModal(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Metric</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.financialMetrics && property.financialMetrics.length > 0 ? (
              property.financialMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {metric.label}
                    </span>
                    <p className="text-base font-bold text-primary font-mono mt-0.5">
                      {metric.value}
                    </p>
                    {metric.note && (
                      <p className="text-[11px] text-muted-foreground">{metric.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => metric.id && handleDeleteFinancial(metric.id)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                No financial metrics added yet.
              </div>
            )}
          </div>

          {/* Add Financial Metric Modal */}
          {showFinancialModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleAddFinancial}
                className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl"
              >
                <h4 className="text-sm font-semibold text-foreground">Add Financial Metric</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <Label className="text-xs">Metric Label *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Projected Net Rental Yield"
                      value={newMetric.label}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, label: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Value *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. 7.2% p.a."
                      value={newMetric.value}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, value: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Note / Context</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Tax-free in AED currency"
                      value={newMetric.note}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, note: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFinancialModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Metric
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Vault Assets Tab Panel (SUPER_ADMIN only) */}
      {activeTab === "vault" && authUser?.role === "SUPER_ADMIN" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                    <span>Assign to Investor Portfolio</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Assign specific units of this trophy asset to private investor portfolios &amp; set yields
                  </p>
                </div>
                <Button
                  onClick={() => setShowVaultModal(true)}
                  size="sm"
                  className="gap-1.5 text-xs font-semibold uppercase tracking-wider bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Assign to Investor</span>
                </Button>
              </div>

              {/* Vault Assets Table */}
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-foreground">
                    <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Investor Folio</th>
                        <th className="py-3 px-4 font-semibold">Unit Number</th>
                        <th className="py-3 px-4 font-semibold">Purchase Price</th>
                        <th className="py-3 px-4 font-semibold">Current Valuation</th>
                        <th className="py-3 px-4 font-semibold">Monthly Rental</th>
                        <th className="py-3 px-4 font-semibold">Occupancy</th>
                        <th className="py-3 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {vaultAssets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-muted-foreground">
                            No investor holdings registered for this property yet. Click "Assign to Investor" to add a unit.
                          </td>
                        </tr>
                      ) : (
                        vaultAssets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-foreground">
                                {asset.user?.name || "Client Investor"}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                                {asset.user?.email || asset.userId}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                              {asset.unitNumber}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              {property.currency} {Number(asset.purchasePrice).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                              {property.currency} {Number(asset.currentValuation).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-emerald-400">
                              {asset.monthlyRentalYield
                                ? `${property.currency} ${Number(asset.monthlyRentalYield).toLocaleString()}/mo`
                                : "—"}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                  asset.occupancyStatus === "OCCUPIED"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                    : asset.occupancyStatus === "VACANT"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-red-500/10 text-red-400 border-red-500/30"
                                }`}
                              >
                                {asset.occupancyStatus.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingVaultAsset(asset)}
                                  className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                                  title="Edit Valuation / Status"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVaultAsset(asset.id)}
                                  className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Remove Holding"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Add Vault Asset Modal */}
          {showVaultModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleCreateVaultAsset}
                className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                    <span>Assign Unit to Investor Vault</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowVaultModal(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="col-span-full">
                    <Label className="text-xs">Investor User ID / Email *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. user_cm123... or investor user id"
                      value={newVaultAsset.userId}
                      onChange={(e) =>
                        setNewVaultAsset({ ...newVaultAsset, userId: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Unit Identifier *</Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Tower A, Floor 18, Suite 4BHK"
                      value={newVaultAsset.unitNumber}
                      onChange={(e) =>
                        setNewVaultAsset({ ...newVaultAsset, unitNumber: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Purchase Date *</Label>
                    <Input
                      type="date"
                      required
                      value={newVaultAsset.purchaseDate}
                      onChange={(e) =>
                        setNewVaultAsset({ ...newVaultAsset, purchaseDate: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Purchase Price ({property.currency}) *</Label>
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 45000000"
                      value={newVaultAsset.purchasePrice}
                      onChange={(e) =>
                        setNewVaultAsset({ ...newVaultAsset, purchasePrice: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Current Valuation ({property.currency}) *</Label>
                    <Input
                      type="number"
                      required
                      placeholder="e.g. 51000000"
                      value={newVaultAsset.currentValuation}
                      onChange={(e) =>
                        setNewVaultAsset({ ...newVaultAsset, currentValuation: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Monthly Rental Yield ({property.currency})</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 250000"
                      value={newVaultAsset.monthlyRentalYield}
                      onChange={(e) =>
                        setNewVaultAsset({ ...newVaultAsset, monthlyRentalYield: e.target.value })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Occupancy Status *</Label>
                    <select
                      value={newVaultAsset.occupancyStatus}
                      onChange={(e) =>
                        setNewVaultAsset({
                          ...newVaultAsset,
                          occupancyStatus: e.target.value as "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE",
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-9"
                    >
                      <option value="OCCUPIED">Occupied (Tenant Active)</option>
                      <option value="VACANT">Vacant (Available)</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVaultModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Assign to Vault
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Vault Asset Modal */}
          {editingVaultAsset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleUpdateVaultAsset}
                className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Update Vault Asset Valuation &amp; Yield
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingVaultAsset(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <Label className="text-xs">Unit Identifier</Label>
                    <Input
                      type="text"
                      required
                      value={editingVaultAsset.unitNumber}
                      onChange={(e) =>
                        setEditingVaultAsset({
                          ...editingVaultAsset,
                          unitNumber: e.target.value,
                        })
                      }
                      className="mt-1 bg-secondary/40 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Current Valuation ({property.currency}) *</Label>
                    <Input
                      type="number"
                      required
                      value={editingVaultAsset.currentValuation}
                      onChange={(e) =>
                        setEditingVaultAsset({
                          ...editingVaultAsset,
                          currentValuation: e.target.value,
                        })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Monthly Rental Yield ({property.currency})</Label>
                    <Input
                      type="number"
                      value={editingVaultAsset.monthlyRentalYield || ""}
                      onChange={(e) =>
                        setEditingVaultAsset({
                          ...editingVaultAsset,
                          monthlyRentalYield: e.target.value,
                        })
                      }
                      className="mt-1 bg-secondary/40 h-9 font-mono"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Occupancy Status</Label>
                    <select
                      value={editingVaultAsset.occupancyStatus}
                      onChange={(e) =>
                        setEditingVaultAsset({
                          ...editingVaultAsset,
                          occupancyStatus: e.target.value as "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE",
                        })
                      }
                      className="mt-1 w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-9"
                    >
                      <option value="OCCUPIED">Occupied (Tenant Active)</option>
                      <option value="VACANT">Vacant (Available)</option>
                      <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingVaultAsset(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Save Updates
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Upload Brochure Modal */}
          {showBrochureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Update Property Brochure PDF
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowBrochureModal(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <BrochureUploader
                  value={property.brochureUrl || ""}
                  onChange={handleBrochureUpdate}
                  folder={`vilaasa/${property.id}`}
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBrochureModal(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
    </motion.div>
  );
};
