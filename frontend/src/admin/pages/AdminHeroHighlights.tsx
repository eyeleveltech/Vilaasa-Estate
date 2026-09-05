import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  SlidersHorizontal,
  Compass,
  Building,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AdminHeroHighlight {
  id: string;
  name: string;
  tagline: string;
  linkUrl: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackendPropertyItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  tagline?: string;
  location?: {
    city?: string;
    country?: string;
    community?: string;
  };
}

const AVAILABLE_ICONS = [
  { name: "hotel_class", label: "Luxury Hotel / Resort" },
  { name: "park", label: "Nature & Farm Living" },
  { name: "spa", label: "Wellness & Spa" },
  { name: "villa", label: "Luxury Villa" },
  { name: "apartment", label: "Penthouse / Apartment" },
  { name: "stars", label: "Curated / Elite" },
  { name: "domain", label: "Estate / Domain" },
  { name: "explore", label: "Destination / Explore" },
  { name: "workspace_premium", label: "Premium Gold" },
  { name: "castle", label: "Heritage Estate" },
  { name: "deck", label: "Waterfront & Deck" },
  { name: "diamond", label: "Diamond Folio" },
];

export const AdminHeroHighlights: React.FC = () => {
  const [highlights, setHighlights] = useState<AdminHeroHighlight[]>([]);
  const [propertiesList, setPropertiesList] = useState<BackendPropertyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [modal, setModal] = useState<{
    open: boolean;
    isEditing: boolean;
    id?: string;
    name: string;
    tagline: string;
    linkUrl: string;
    icon: string;
    order: number;
    isActive: boolean;
    submitting: boolean;
  }>({
    open: false,
    isEditing: false,
    name: "",
    tagline: "",
    linkUrl: "",
    icon: "hotel_class",
    order: 1,
    isActive: true,
    submitting: false,
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<AdminHeroHighlight | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    try {
      const [hlRes, propRes] = await Promise.all([
        api.get("/hero-highlights/admin"),
        api.get("/properties?limit=50"),
      ]);

      if (hlRes.data.success) {
        setHighlights(hlRes.data.data);
      }

      if (propRes.data.success && Array.isArray(propRes.data.data)) {
        setPropertiesList(propRes.data.data);
      }
    } catch {
      toast.error("Failed to load hero highlights or property directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  // Handle Auto-fill from Backend Property
  const handleSelectProperty = (propertyId: string) => {
    const selected = propertiesList.find((p) => p.id === propertyId);
    if (!selected) return;

    let defaultIcon = "hotel_class";
    const typeUpper = (selected.type || "").toUpperCase();
    if (typeUpper.includes("VILLA")) defaultIcon = "villa";
    else if (typeUpper.includes("PENTHOUSE") || typeUpper.includes("APARTMENT")) defaultIcon = "apartment";
    else if (typeUpper.includes("FRANCHISE")) defaultIcon = "spa";
    else if (typeUpper.includes("FARM")) defaultIcon = "park";

    const locationText = selected.location?.city || selected.location?.community || selected.location?.country || "India / Dubai";
    const formattedType = (selected.type || "Luxury Estate").replace(/_/g, " ").toLowerCase();
    const formattedTagline = selected.tagline || `Exclusive ${formattedType} • ${locationText}`;

    setModal((prev) => ({
      ...prev,
      name: selected.name,
      tagline: formattedTagline,
      linkUrl: `/property/${selected.slug}`,
      icon: defaultIcon,
    }));

    toast.success(`Auto-filled details from "${selected.name}"`);
  };

  const activeHighlights = highlights.filter((h) => h.isActive);

  // Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.name.trim() || !modal.tagline.trim() || !modal.linkUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setModal((prev) => ({ ...prev, submitting: true }));
    try {
      if (modal.isEditing && modal.id) {
        await api.put(`/hero-highlights/${modal.id}`, {
          name: modal.name.trim(),
          tagline: modal.tagline.trim(),
          linkUrl: modal.linkUrl.trim(),
          icon: modal.icon,
          order: modal.order,
          isActive: modal.isActive,
        });
        toast.success("Hero highlight updated successfully!");
      } else {
        await api.post("/hero-highlights", {
          name: modal.name.trim(),
          tagline: modal.tagline.trim(),
          linkUrl: modal.linkUrl.trim(),
          icon: modal.icon,
          order: modal.order,
          isActive: modal.isActive,
        });
        toast.success("Hero highlight created successfully!");
      }

      setModal({
        open: false,
        isEditing: false,
        name: "",
        tagline: "",
        linkUrl: "",
        icon: "hotel_class",
        order: 1,
        isActive: true,
        submitting: false,
      });

      fetchHighlights();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to save hero highlight"
        : "Failed to save hero highlight";
      toast.error(message);
    } finally {
      setModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Quick Toggle Active Status
  const handleToggleActive = async (item: AdminHeroHighlight) => {
    try {
      if (!item.isActive && activeHighlights.length >= 3) {
        toast.error("Maximum 3 active highlights allowed. Please deactivate another one first.");
        return;
      }

      await api.put(`/hero-highlights/${item.id}`, {
        isActive: !item.isActive,
      });
      toast.success(
        `Highlight ${!item.isActive ? "activated" : "deactivated"}`,
      );
      fetchHighlights();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to toggle status"
        : "Failed to toggle status";
      toast.error(message);
    }
  };

  // Reorder Item
  const handleReorder = async (item: AdminHeroHighlight, direction: "up" | "down") => {
    const currentIndex = highlights.findIndex((h) => h.id === item.id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= highlights.length) return;

    const targetItem = highlights[targetIndex];

    try {
      await Promise.all([
        api.put(`/hero-highlights/${item.id}`, { order: targetItem.order }),
        api.put(`/hero-highlights/${targetItem.id}`, { order: item.order }),
      ]);
      fetchHighlights();
      toast.success("Highlight reordered");
    } catch {
      toast.error("Failed to reorder highlight");
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await api.delete(`/hero-highlights/${deleteConfirm.id}`);
      toast.success("Hero highlight deleted successfully");
      setDeleteConfirm(null);
      fetchHighlights();
    } catch {
      toast.error("Failed to delete hero highlight");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 text-primary/80 mb-1">
            <span className="h-px w-6 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
              Homepage Showcase Desk
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Hero Spotlight <span className="font-serif italic text-primary">Highlights</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure up to 3 spotlight experiences rendered directly below the main hero video on the homepage.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            onClick={() => {
              if (activeHighlights.length >= 3) {
                toast.error(
                  "You currently have 3 active highlights (maximum capacity). You can create inactive highlights or edit existing ones.",
                );
              }
              setModal({
                open: true,
                isEditing: false,
                name: "",
                tagline: "",
                linkUrl: "",
                icon: "hotel_class",
                order: highlights.length + 1,
                isActive: activeHighlights.length < 3,
                submitting: false,
              });
            }}
            size="sm"
            className="gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Spotlight</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchHighlights}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Live Homepage Preview Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-secondary/30">
          <div className="flex items-center space-x-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Live Homepage Hero Bar Preview
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-muted-foreground">Active Display:</span>
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
              {activeHighlights.length} of 3 Slots Active
            </span>
          </div>
        </div>

        {/* Mock Live Hero Bottom Bar */}
        <div className="p-6 bg-[#0a0a0c] border-b border-border flex flex-col items-center">
          <p className="text-[11px] text-muted-foreground/60 mb-3 tracking-widest uppercase font-mono">
            ── Viewers on Homepage see ──
          </p>

          <div className="w-full max-w-4xl rounded-lg border border-foreground/10 bg-background/80 backdrop-blur-md overflow-hidden shadow-2xl">
            {activeHighlights.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active highlights. Activate or add a highlight below to display on the hero video.
              </div>
            ) : (
              <div
                className={`grid ${
                  activeHighlights.length === 1
                    ? "grid-cols-1"
                    : activeHighlights.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-3"
                } divide-y sm:divide-y-0 sm:divide-x divide-foreground/10`}
              >
                {activeHighlights.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between px-6 py-4 group hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 pr-2 overflow-hidden text-left">
                      <span className="text-primary font-medium text-sm sm:text-base truncate">
                        {item.name}
                      </span>
                      <span className="text-foreground/60 text-[11px] truncate">
                        {item.tagline}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-2xl text-foreground/40 shrink-0">
                      {item.icon}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Highlights List & Configuration Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>Configured Highlights ({highlights.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-border bg-card/60"
              />
            ))}
          </div>
        ) : highlights.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Compass className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h4 className="font-semibold text-foreground">No Highlights Created</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Add your first spotlight experience or destination to display below the homepage video.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((item, index) => (
              <div
                key={item.id}
                className={`rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  item.isActive
                    ? "border-primary/40 bg-card"
                    : "border-border bg-card/40 opacity-75"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-bold font-mono text-foreground border border-border">
                        #{item.order}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.isActive ? "Active on Hero" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleReorder(item, "up")}
                        disabled={index === 0}
                        title="Move Left/Up"
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(item, "down")}
                        disabled={index === highlights.length - 1}
                        title="Move Right/Down"
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mt-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <span className="material-symbols-outlined text-xl">
                        {item.icon}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-border/60">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Target Link
                    </p>
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-primary hover:underline flex items-center gap-1 truncate mt-0.5"
                    >
                      <span className="truncate">{item.linkUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border mt-4">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto py-1.5 rounded-md border sm:border-transparent ${
                      item.isActive
                        ? "text-amber-400 hover:text-amber-300 border-amber-500/20 bg-amber-500/5 sm:bg-transparent"
                        : "text-emerald-400 hover:text-emerald-300 border-emerald-500/20 bg-emerald-500/5 sm:bg-transparent"
                    }`}
                  >
                    {item.isActive ? (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-end w-full sm:w-auto space-x-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setModal({
                          open: true,
                          isEditing: true,
                          id: item.id,
                          name: item.name,
                          tagline: item.tagline,
                          linkUrl: item.linkUrl,
                          icon: item.icon,
                          order: item.order,
                          isActive: item.isActive,
                          submitting: false,
                        })
                      }
                      className="h-7 px-2.5 text-xs gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(item)}
                      className="h-7 px-2 text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {modal.isEditing ? "Edit Hero Spotlight" : "Add Hero Spotlight"}
                </h3>
              </div>
              <button
                onClick={() => setModal((prev) => ({ ...prev, open: false }))}
                className="text-muted-foreground hover:text-foreground p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Primary Property / Franchise Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Choose Property or Franchise from Catalog <span className="text-primary">*</span></span>
                  <span className="text-[10px] text-muted-foreground font-normal">Live Backend Inventory</span>
                </Label>
                <select
                  required
                  value={
                    propertiesList.find((p) => `/property/${p.slug}` === modal.linkUrl || `/franchise/${p.slug}` === modal.linkUrl || p.name === modal.name)?.id || ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSelectProperty(e.target.value);
                    }
                  }}
                  className="w-full h-11 rounded-lg border border-border bg-secondary/30 px-3.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="" disabled>
                    -- Select an Estate / Franchise --
                  </option>
                  {propertiesList.map((p) => {
                    const locationStr =
                      p.location?.city ||
                      p.location?.community ||
                      p.location?.country ||
                      "Dubai / India";
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type.replace(/_/g, " ")} • {locationStr})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selected Entity Card Preview */}
              {modal.name ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <span className="material-symbols-outlined text-xl">
                          {modal.icon}
                        </span>
                      </div>
                      <div className="overflow-hidden text-left">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {modal.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {modal.tagline}
                        </p>
                        <p className="text-[10px] font-mono text-primary/80 truncate mt-0.5">
                          {modal.linkUrl}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Icon Options Bar */}
                  <div className="pt-2 border-t border-primary/10">
                    <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">
                      Select Icon Style:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {AVAILABLE_ICONS.slice(0, 6).map((ic) => (
                        <button
                          key={ic.name}
                          type="button"
                          onClick={() => setModal((prev) => ({ ...prev, icon: ic.name }))}
                          className={`flex flex-col items-center justify-center py-1.5 rounded border transition-all ${
                            modal.icon === ic.name
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-border/60 text-muted-foreground hover:bg-secondary"
                          }`}
                          title={ic.label}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {ic.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-5 text-center bg-secondary/10">
                  <Building className="mx-auto h-6 w-6 text-muted-foreground/40 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Please select a property or franchise above to populate this spotlight.
                  </p>
                </div>
              )}

              {/* Order & State */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label htmlFor="hlOrder" className="text-xs font-semibold">
                    Display Slot (1 - 3)
                  </Label>
                  <select
                    id="hlOrder"
                    value={modal.order}
                    onChange={(e) =>
                      setModal((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full h-9 rounded-md border border-border bg-secondary/30 px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={1}>Slot #1 (Left)</option>
                    <option value={2}>Slot #2 (Center)</option>
                    <option value={3}>Slot #3 (Right)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center space-y-1">
                  <Label className="text-xs font-semibold">Display State</Label>
                  <label className="flex items-center space-x-2 text-xs text-foreground cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={modal.isActive}
                      onChange={(e) =>
                        setModal((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Active on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setModal((prev) => ({ ...prev, open: false }))
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={modal.submitting}
                  className="font-semibold"
                >
                  {modal.submitting
                    ? "Saving..."
                    : modal.isEditing
                      ? "Update Spotlight"
                      : "Create Spotlight"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Delete Hero Spotlight?
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to remove{" "}
              <strong className="text-foreground">{deleteConfirm.name}</strong> from the hero showcase?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminHeroHighlights;
