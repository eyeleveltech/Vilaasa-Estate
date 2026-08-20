import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { MediaUploader } from "../components/MediaUploader";
import { BrochureUploader } from "../components/BrochureUploader";
import {
  Property,
  Amenity,
  PropertyConfiguration,
  NearbyPlace,
  PropertyFinancialMetric,
  ApiResponse,
} from "../types/admin.types";

export const AdminPropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBrochureModal, setShowBrochureModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "media" | "configurations" | "amenities" | "nearby" | "financials"
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

  const fetchPropertyData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Find property by id or slug
      const listRes = await api.get<ApiResponse<Property[]>>("/properties", {
        params: { limit: 50 },
      });
      const match = listRes.data.data.find((p) => p.id === id || p.slug === id);

      if (match) {
        const detailRes = await api.get<ApiResponse<Property>>(
          `/properties/${match.slug}`,
        );
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
      const res = await api.get<ApiResponse<Amenity[]>>("/amenities");
      if (res.data.success) {
        setMasterAmenities(res.data.data);
      }
    } catch {
      // Catalog fetch fallback
    }
  }, []);

  useEffect(() => {
    fetchPropertyData();
    fetchMasterAmenities();
  }, [fetchPropertyData, fetchMasterAmenities]);

  // Handle Add Unit Configuration
  const handleAddConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    try {
      const res = await api.post(
        `/properties/${property.id}/configurations`,
        {
          unitType: newConfig.unitType,
          areaSqFt: parseFloat(newConfig.areaSqFt) || 0,
          viewType: newConfig.viewType || undefined,
          price: parseFloat(newConfig.price) || 0,
          isAvailable: newConfig.isAvailable,
        },
      );
      if (res.data.success) {
        toast.success("Unit configuration added");
        setShowConfigModal(false);
        setNewConfig({ unitType: "", areaSqFt: "", viewType: "", price: "", isAvailable: true });
        fetchPropertyData();
      }
    } catch (err: unknown) {
      toast.error("Failed to add configuration");
    }
  };

  const handleDeleteConfiguration = async (configId: string) => {
    if (!property) return;
    if (!confirm("Are you sure you want to remove this unit configuration?")) return;
    try {
      await api.delete(`/properties/${property.id}/configurations/${configId}`);
      toast.success("Configuration deleted");
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
        toast.success("Amenity assigned");
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

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
        <p className="text-xs text-[#a0a0a0]">Loading property dossier...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-8 text-center space-y-4">
        <p className="text-sm text-[#ef4444]">Property not found or was removed.</p>
        <Link
          to="/admin/properties"
          className="inline-flex items-center space-x-2 text-xs text-[#D4AF37] underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Properties</span>
        </Link>
      </div>
    );
  }

  const tabs = [
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

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/properties"
            className="inline-flex items-center space-x-1 text-xs text-[#a0a0a0] hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Properties</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {property.name}
            </h2>
            <span className="rounded-full border border-[#D4AF37]/30 bg-[#1a1a1a] px-2.5 py-0.5 text-[11px] font-semibold text-[#D4AF37]">
              {property.type.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-[#a0a0a0]">
            {property.location?.city}, {property.location?.country} • Views:{" "}
            <span className="font-mono text-white">{property.views}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/property/${property.slug}`}
            target="_blank"
            className="flex items-center space-x-1.5 rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs font-medium text-white hover:border-[#D4AF37] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Public Listing</span>
          </Link>
          <Link
            to={`/admin/properties/${property.id}/edit`}
            className="flex items-center space-x-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#b8952b] transition-all"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Property</span>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto border-b border-[#222222] pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "border border-[#D4AF37]/40 bg-[#1a1a1a] text-[#D4AF37] shadow-lg shadow-black/40"
                  : "text-[#a0a0a0] hover:bg-[#141414] hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Specifications Card */}
          <div className="space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl lg:col-span-2">
            <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3">
              Core Specifications
            </h3>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-xs">
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Price</span>
                <p className="font-mono text-base font-bold text-[#D4AF37]">
                  {property.priceOnApplication
                    ? "POA"
                    : `${property.currency} ${Number(
                        property.price,
                      ).toLocaleString()}`}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Status</span>
                <p className="font-semibold text-white">
                  {property.status.replace("_", " ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Total Built-up Area</span>
                <p className="font-semibold text-white">
                  {property.totalAreaSqFt
                    ? `${property.totalAreaSqFt.toLocaleString()} Sq.Ft.`
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Bedrooms</span>
                <p className="font-semibold text-white">{property.bedrooms ?? "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Bathrooms</span>
                <p className="font-semibold text-white">{property.bathrooms ?? "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Furnishing</span>
                <p className="font-semibold text-white">
                  {property.furnishingStatus.replace("_", " ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">RERA / Permit</span>
                <p className="font-semibold text-white">{property.reraNumber || "-"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Ownership</span>
                <p className="font-semibold text-white">{property.ownershipType || "Freehold"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">Possession Date</span>
                <p className="font-semibold text-white">
                  {property.possessionDate
                    ? new Date(property.possessionDate).toLocaleDateString()
                    : "Ready"}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#a0a0a0]">Official Brochure</span>
                  <button
                    type="button"
                    onClick={() => setShowBrochureModal(true)}
                    className="text-[10px] text-[#D4AF37] hover:underline"
                  >
                    {property.brochureUrl ? "Change" : "+ Upload"}
                  </button>
                </div>
                {property.brochureUrl ? (
                  <a
                    href={property.brochureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 font-semibold text-[#D4AF37] hover:underline"
                  >
                    <span>View / Download PDF</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-[#666666]">Not attached</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[#a0a0a0]">360 Virtual Tour</span>
                {property.virtualTour360Url ? (
                  <a
                    href={property.virtualTour360Url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 font-semibold text-[#D4AF37] hover:underline"
                  >
                    <span>Launch 360 Tour</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-[#666666]">Not attached</p>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#222222]">
              <span className="text-xs font-semibold text-[#a0a0a0]">
                Architectural Description
              </span>
              <p className="text-xs leading-relaxed text-[#dcdcdc] whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* Location & Yield Projections Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3">
                Location & Coordinates
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#a0a0a0]">City & Country:</span>{" "}
                  <span className="font-semibold text-white">
                    {property.location?.city}, {property.location?.country}
                  </span>
                </div>
                {property.location?.community && (
                  <div>
                    <span className="text-[#a0a0a0]">Community:</span>{" "}
                    <span className="text-white">{property.location.community}</span>
                  </div>
                )}
                {property.location?.addressLine && (
                  <div>
                    <span className="text-[#a0a0a0]">Address:</span>{" "}
                    <span className="text-white">{property.location.addressLine}</span>
                  </div>
                )}
                {property.location?.latitude && (
                  <div>
                    <span className="text-[#a0a0a0]">Geo-Coordinates:</span>{" "}
                    <span className="font-mono text-white">
                      {property.location.latitude}, {property.location.longitude}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-[#222222] pb-3">
                Investment Projections
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-[#181818] p-3 border border-[#262626]">
                  <span className="text-[11px] text-[#a0a0a0]">Rental Yield</span>
                  <p className="font-bold text-[#22c55e] text-base">
                    {property.rentalYieldPercent
                      ? `${property.rentalYieldPercent}% p.a.`
                      : "-"}
                  </p>
                </div>
                <div className="rounded-lg bg-[#181818] p-3 border border-[#262626]">
                  <span className="text-[11px] text-[#a0a0a0]">Expected IRR</span>
                  <p className="font-bold text-[#D4AF37] text-base">
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
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
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
        <div className="space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Unit Configurations & Layouts
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Individual floor layouts, dimensions, and prices
              </p>
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center space-x-1.5 rounded-lg bg-[#D4AF37] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Unit Configuration</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] text-[#a0a0a0]">
                <tr>
                  <th className="pb-3 font-semibold">Unit Type</th>
                  <th className="pb-3 font-semibold">Area</th>
                  <th className="pb-3 font-semibold">View Type</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Availability</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {property.configurations && property.configurations.length > 0 ? (
                  property.configurations.map((config) => (
                    <tr key={config.id} className="hover:bg-[#181818]">
                      <td className="py-3 font-medium text-white">
                        {config.unitType}
                      </td>
                      <td className="py-3 text-[#dcdcdc]">
                        {config.areaSqFt.toLocaleString()} Sq.Ft.
                      </td>
                      <td className="py-3 text-[#a0a0a0]">
                        {config.viewType || "-"}
                      </td>
                      <td className="py-3 font-mono font-bold text-[#D4AF37]">
                        {property.currency} {Number(config.price).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            config.isAvailable
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {config.isAvailable ? "Available" : "Sold"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => config.id && handleDeleteConfiguration(config.id)}
                          className="rounded p-1 text-[#a0a0a0] hover:text-[#ef4444]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#a0a0a0]">
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
                className="w-full max-w-md space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl"
              >
                <h4 className="text-sm font-bold text-white">Add Unit Configuration</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[#a0a0a0]">Unit Type *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4 BHK Presidential Penthouse"
                      value={newConfig.unitType}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, unitType: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">Area (Sq.Ft.) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 6200"
                      value={newConfig.areaSqFt}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, areaSqFt: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">View Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Arabian Gulf & Skyline View"
                      value={newConfig.viewType}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, viewType: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">Price *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 45000000"
                      value={newConfig.price}
                      onChange={(e) =>
                        setNewConfig({ ...newConfig, price: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="rounded border border-[#2a2a2a] px-3 py-1.5 text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#D4AF37] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b]"
                  >
                    Save Unit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: AMENITIES ================= */}
      {activeTab === "amenities" && (
        <div className="space-y-6 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
          <div className="border-b border-[#222222] pb-4">
            <h3 className="text-sm font-bold text-white">
              Assigned Luxury Amenities
            </h3>
            <p className="text-xs text-[#a0a0a0]">
              Assign curated amenities from the master catalog
            </p>
          </div>

          {/* Assign Amenity Picker Form */}
          <form
            onSubmit={handleAssignAmenity}
            className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1">
              <label className="text-xs text-[#a0a0a0]">Select Amenity</label>
              <select
                required
                value={selectedAmenityId}
                onChange={(e) => setSelectedAmenityId(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="">-- Choose from Master Catalog --</option>
                {masterAmenities.map((am) => (
                  <option key={am.id} value={am.id}>
                    {am.name} ({am.category || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-xs text-[#a0a0a0]">
                Custom Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Temperature controlled with underwater sound system"
                value={amenityDesc}
                onChange={(e) => setAmenityDesc(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedAmenityId}
              className="flex items-center space-x-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8952b] transition-all disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              <span>Assign</span>
            </button>
          </form>

          {/* Assigned Amenities Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.amenities && property.amenities.length > 0 ? (
              property.amenities.map((item) => (
                <div
                  key={item.amenityId}
                  className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#161616] p-3.5 shadow"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      {item.amenity.name}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-[#a0a0a0]">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveAmenity(item.amenityId)}
                    title="Remove amenity"
                    className="rounded p-1 text-[#a0a0a0] hover:text-[#ef4444]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-[#a0a0a0]">
                No amenities assigned to this property yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: NEARBY PLACES ================= */}
      {activeTab === "nearby" && (
        <div className="space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Nearby Connectivity & Landmarks
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Airports, marinas, private schools, and luxury dining
              </p>
            </div>
            <button
              onClick={() => setShowNearbyModal(true)}
              className="flex items-center space-x-1.5 rounded-lg bg-[#D4AF37] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Nearby Landmark</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.nearbyPlaces && property.nearbyPlaces.length > 0 ? (
              property.nearbyPlaces.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#161616] p-3.5"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]">
                      {place.category || "Landmark"}
                    </span>
                    <p className="text-xs font-bold text-white">{place.name}</p>
                    <p className="text-[11px] text-[#a0a0a0]">{place.distance}</p>
                  </div>
                  <button
                    onClick={() => place.id && handleDeleteNearby(place.id)}
                    className="rounded p-1 text-[#a0a0a0] hover:text-[#ef4444]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-[#a0a0a0]">
                No nearby places added yet.
              </div>
            )}
          </div>

          {/* Add Nearby Modal */}
          {showNearbyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleAddNearby}
                className="w-full max-w-md space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl"
              >
                <h4 className="text-sm font-bold text-white">Add Nearby Place</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[#a0a0a0]">Place Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dubai International Airport (DXB)"
                      value={newNearby.name}
                      onChange={(e) =>
                        setNewNearby({ ...newNearby, name: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">Drive Distance *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15 Mins Drive"
                      value={newNearby.distance}
                      onChange={(e) =>
                        setNewNearby({ ...newNearby, distance: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">Category</label>
                    <select
                      value={newNearby.category}
                      onChange={(e) =>
                        setNewNearby({ ...newNearby, category: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
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
                  <button
                    type="button"
                    onClick={() => setShowNearbyModal(false)}
                    className="rounded border border-[#2a2a2a] px-3 py-1.5 text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#D4AF37] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b]"
                  >
                    Save Landmark
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: FINANCIALS ================= */}
      {activeTab === "financials" && (
        <div className="space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                Financial Metrics & Growth Projections
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Capital growth, rental projections, and asset appreciation targets
              </p>
            </div>
            <button
              onClick={() => setShowFinancialModal(true)}
              className="flex items-center space-x-1.5 rounded-lg bg-[#D4AF37] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Metric</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {property.financialMetrics && property.financialMetrics.length > 0 ? (
              property.financialMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#161616] p-4"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#a0a0a0]">
                      {metric.label}
                    </span>
                    <p className="text-base font-bold text-[#D4AF37]">
                      {metric.value}
                    </p>
                    {metric.note && (
                      <p className="text-[11px] text-[#777777]">{metric.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => metric.id && handleDeleteFinancial(metric.id)}
                    className="rounded p-1 text-[#a0a0a0] hover:text-[#ef4444]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-[#a0a0a0]">
                No financial metrics added yet.
              </div>
            )}
          </div>

          {/* Add Financial Metric Modal */}
          {showFinancialModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <form
                onSubmit={handleAddFinancial}
                className="w-full max-w-md space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl"
              >
                <h4 className="text-sm font-bold text-white">Add Financial Metric</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[#a0a0a0]">Metric Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Projected Net Rental Yield"
                      value={newMetric.label}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, label: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">Value *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7.2% p.a."
                      value={newMetric.value}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, value: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#a0a0a0]">Note / Context</label>
                    <input
                      type="text"
                      placeholder="e.g. Tax-free in AED currency"
                      value={newMetric.note}
                      onChange={(e) =>
                        setNewMetric({ ...newMetric, note: e.target.value })
                      }
                      className="mt-1 w-full rounded border border-[#2a2a2a] bg-[#181818] p-2 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFinancialModal(false)}
                    className="rounded border border-[#2a2a2a] px-3 py-1.5 text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#D4AF37] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#b8952b]"
                  >
                    Save Metric
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Upload Brochure Modal */}
          {showBrochureModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg space-y-4 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                  <h4 className="text-sm font-bold text-white">
                    Update Property Brochure PDF
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowBrochureModal(false)}
                    className="text-xs text-[#a0a0a0] hover:text-white"
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
                  <button
                    type="button"
                    onClick={() => setShowBrochureModal(false)}
                    className="rounded border border-[#2a2a2a] px-4 py-2 text-xs text-white hover:bg-[#1a1a1a]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
