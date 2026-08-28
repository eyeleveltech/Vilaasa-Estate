import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Layers,
  DollarSign,
  BookOpen,
  Plus,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/api/axios";
import { ApiResponse, Property } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  FranchisePageData,
  DEFAULT_PAGE_DATA,
  GalleryItem,
  MetricBadge,
  SupportCard,
  BenefitCard,
  detectIconFromKeyword,
  COMMON_ICONS,
  HERO_PLACEHOLDERS,
  BLUEPRINT_PLACEHOLDERS,
  ECOSYSTEM_PLACEHOLDERS,
  BENEFIT_PLACEHOLDERS,
  autoFormatCurrencySymbol,
  normalizeFranchisePageData,
  prepareFranchisePagePayload,
} from "../lib/franchisePageHelpers";

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export const AdminFranchisePage: React.FC = () => {
  const { id: propertyId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [franchise, setFranchise] = useState<Property | null>(null);
  const [data, setData] = useState<FranchisePageData>(DEFAULT_PAGE_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);

  // Helper setter
  const setField = <K extends keyof FranchisePageData>(key: K, value: FranchisePageData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // Hero Image Selection Toggle
  const handleToggleHeroImage = (index: number) => {
    setData((prev) => {
      const target = prev.galleryImages[index];
      if (!target) return prev;
      const isCurrentlyHero = Boolean(target.isHero || (prev.heroImage && prev.heroImage === target.url));
      const nextHeroState = !isCurrentlyHero;
      const updated = prev.galleryImages.map((img, i) => ({
        ...img,
        isHero: i === index ? nextHeroState : false,
      }));
      const newHeroUrl = nextHeroState ? target.url : "";
      return {
        ...prev,
        heroImage: newHeroUrl,
        galleryImages: updated,
      };
    });
  };

  // Section 2: Hero Financial Metrics
  const handleAddHeroMetric = () => {
    const newBadge: MetricBadge = {
      id: `hero-${Date.now()}`,
      label: "",
      value: "",
    };
    setData((p) => ({ ...p, heroMetrics: [...p.heroMetrics, newBadge] }));
  };

  const handleRemoveHeroMetric = (index: number) => {
    setData((p) => ({
      ...p,
      heroMetrics: p.heroMetrics.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateHeroMetric = (index: number, field: "label" | "value", val: string) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setData((p) => {
      const updated = [...p.heroMetrics];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: formattedVal };
      }
      return { ...p, heroMetrics: updated };
    });
  };

  // Section 4: Financial Blueprint
  const handleAddBlueprintMetric = () => {
    const newMetric: MetricBadge = {
      id: `bp-${Date.now()}`,
      label: "",
      value: "",
    };
    setData((p) => ({ ...p, blueprintMetrics: [...p.blueprintMetrics, newMetric] }));
  };

  const handleRemoveBlueprintMetric = (index: number) => {
    setData((p) => ({
      ...p,
      blueprintMetrics: p.blueprintMetrics.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateBlueprintMetric = (index: number, field: "label" | "value", val: string) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setData((p) => {
      const updated = [...p.blueprintMetrics];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: formattedVal };
      }
      return { ...p, blueprintMetrics: updated };
    });
  };

  // Section 5: Comprehensive Ecosystem Cards
  const handleAddEcosystemCard = () => {
    const newCard: SupportCard = {
      id: `eco-${Date.now()}`,
      title: "",
      description: "",
      icon: "storefront",
    };
    setData((p) => ({ ...p, ecosystemCards: [...p.ecosystemCards, newCard] }));
  };

  const handleRemoveEcosystemCard = (index: number) => {
    setData((p) => ({
      ...p,
      ecosystemCards: p.ecosystemCards.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateEcosystemCard = (
    index: number,
    field: "title" | "description" | "icon",
    val: string,
    detectedIcon?: string
  ) => {
    setData((p) => {
      const updated = [...p.ecosystemCards];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: val,
          ...(detectedIcon ? { icon: detectedIcon } : {}),
        };
      }
      return { ...p, ecosystemCards: updated };
    });
  };

  // Section 6: Key Benefits Cards
  const handleAddBenefitCard = () => {
    const newBenefit: BenefitCard = {
      id: `ben-${Date.now()}`,
      title: "",
      description: "",
      icon: "volunteer_activism",
    };
    setData((p) => ({ ...p, benefitCards: [...p.benefitCards, newBenefit] }));
  };

  const handleRemoveBenefitCard = (index: number) => {
    setData((p) => ({
      ...p,
      benefitCards: p.benefitCards.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateBenefitCard = (
    index: number,
    field: "title" | "description" | "icon",
    val: string,
    detectedIcon?: string
  ) => {
    setData((p) => {
      const updated = [...p.benefitCards];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: val,
          ...(detectedIcon ? { icon: detectedIcon } : {}),
        };
      }
      return { ...p, benefitCards: updated };
    });
  };

  // Load existing content & franchise metadata
  useEffect(() => {
    if (!propertyId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const propRes = await api.get<ApiResponse<Property>>(`/properties/${propertyId}`);
        if (propRes.data.success && propRes.data.data) {
          setFranchise(propRes.data.data);
        }

        const pageRes = await api.get<ApiResponse<FranchisePageData | null>>(
          `/franchise/${propertyId}/page`
        );
        if (pageRes.data.success && pageRes.data.data) {
          const loaded = pageRes.data.data;
          setData(normalizeFranchisePageData(loaded));
        }
      } catch (err) {
        console.error("Error loading franchise page content:", err);
        toast.error("Failed to load franchise content");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [propertyId]);

  // Save all changes
  const handleSave = async () => {
    if (!propertyId) return;
    setSaving(true);

    try {
      const finalPayload = prepareFranchisePagePayload(data);
      const res = await api.put<ApiResponse<FranchisePageData>>(
        `/franchise/${propertyId}/page`,
        finalPayload
      );
      if (res.data.success) {
        toast.success("Franchise page content saved successfully!");
      } else {
        throw new Error(res.data.message || "Save failed");
      }
    } catch (err: unknown) {
      console.error("Error saving franchise page:", err);
      const errMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save page changes";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Gallery multi-image upload handler
  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !propertyId) return;
    setUploadingGallery(true);

    try {
      const newItems: GalleryItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "vilaasa/franchises/gallery");

        const res = await api.post<ApiResponse<{ url: string; id?: string }>>(
          "/media/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.success && res.data.data?.url) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          newItems.push({
            id: `gal-${Date.now()}-${i}`,
            url: res.data.data.url,
            caption: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            orderIndex: data.galleryImages.length + i,
          });
        }
      }

      setData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newItems],
      }));

      toast.success(`${newItems.length} gallery image(s) uploaded! Remember to save.`);
    } catch (err: unknown) {
      console.error("Gallery upload error:", err);
      toast.error("Failed to upload gallery images");
    } finally {
      setUploadingGallery(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading bespoke page editor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-24">
      {/* Top Bar Navigation */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/franchises"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Franchises</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
              {franchise?.name || "Franchise Showcase Page"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              <span>7 Public Sections</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure dynamic badges, editorial narrative, support ecosystem, and gallery images.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/franchises/${propertyId}`)}
          >
            Cancel
          </Button>

          {franchise && (
            <Button
              type="button"
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Link to={`/franchise/${franchise.slug || franchise.id}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Public Page</span>
              </Link>
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save All Changes</span>
          </Button>
        </div>
      </div>

      {/* 7 Editable Sections */}
      <div className="space-y-8">
        {/* SECTION 1: HERO */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              1. Hero Header &amp; SEO
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Page Title (SEO)</Label>
              <Input
                value={data.pageTitle}
                onChange={(e) => setField("pageTitle", e.target.value)}
                placeholder="e.g. Wellness Resorts Kerala — Ultra-luxury healing experiences"
                className="bg-secondary/40 h-10 text-sm mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Main Headline</Label>
                <Input
                  value={data.mainHeadline}
                  onChange={(e) => setField("mainHeadline", e.target.value)}
                  placeholder="e.g. Wellness Resorts"
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hero Subheading (Banner Subtitle)</Label>
                <textarea
                  rows={2}
                  value={data.subheading}
                  onChange={(e) => setField("subheading", e.target.value)}
                  placeholder="e.g. Ultra-luxury Ayurvedic wellness retreat overlooking lush valleys..."
                  className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HERO FINANCIAL METRICS */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              2. Hero Financial Metrics
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddHeroMetric}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Badge</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.heroMetrics.map((metric, idx) => {
              const heroPh = HERO_PLACEHOLDERS[idx] || { label: "e.g. METRIC NAME", value: "e.g. ₹1.5 Cr / 18%" };
              return (
                <div key={metric.id || idx} className="relative p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Badge #{idx + 1}</Label>
                    {data.heroMetrics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroMetric(idx)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Badge"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Label</Label>
                    <Input
                      value={metric.label}
                      onChange={(e) => handleUpdateHeroMetric(idx, "label", e.target.value)}
                      placeholder={heroPh.label}
                      className="bg-secondary/40 h-8 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Value</Label>
                    <Input
                      value={metric.value}
                      onChange={(e) => handleUpdateHeroMetric(idx, "value", e.target.value)}
                      placeholder={heroPh.value}
                      className="bg-secondary/40 h-8 text-xs text-primary font-bold mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: THE VISION */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              3. The Vision Story
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vision Headline</Label>
              <Input
                value={data.visionHeadline}
                onChange={(e) => setField("visionHeadline", e.target.value)}
                placeholder="e.g. Where culinary artistry meets intelligent capital."
                className="bg-secondary/40 h-10 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vision Story Narrative (Section 3 Body)</Label>
              <textarea
                rows={4}
                value={data.visionDescription}
                onChange={(e) => setField("visionDescription", e.target.value)}
                placeholder="Detail the brand story, wellness philosophy, and market opportunity..."
                className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: FINANCIAL BLUEPRINT */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              4. Financial Blueprint
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBlueprintMetric}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Metric</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.blueprintMetrics.map((metric, idx) => {
              const bpPh = BLUEPRINT_PLACEHOLDERS[idx] || { label: "e.g. METRIC PARAMETER", value: "e.g. ₹5 Cr / 5 Years" };
              return (
                <div key={metric.id || idx} className="relative p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Metric #{idx + 1}</Label>
                    {data.blueprintMetrics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBlueprintMetric(idx)}
                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Metric"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Label</Label>
                    <Input
                      value={metric.label}
                      onChange={(e) => handleUpdateBlueprintMetric(idx, "label", e.target.value)}
                      placeholder={bpPh.label}
                      className="bg-secondary/40 h-8 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Value</Label>
                    <Input
                      value={metric.value}
                      onChange={(e) => handleUpdateBlueprintMetric(idx, "value", e.target.value)}
                      placeholder={bpPh.value}
                      className="bg-secondary/40 h-8 text-xs text-foreground font-bold mt-1"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 5: SUPPORT & TRAINING */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              5. Comprehensive Ecosystem
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddEcosystemCard}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Card</span>
            </Button>
          </div>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Eyebrow</Label>
                <Input
                  value={data.ecosystemSubheading}
                  onChange={(e) => setField("ecosystemSubheading", e.target.value)}
                  placeholder="e.g. Comprehensive Ecosystem"
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Heading</Label>
                <Input
                  value={data.ecosystemHeading}
                  onChange={(e) => setField("ecosystemHeading", e.target.value)}
                  placeholder="e.g. Support & Training"
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Description</Label>
              <textarea
                rows={2}
                value={data.ecosystemDescription}
                onChange={(e) => setField("ecosystemDescription", e.target.value)}
                placeholder="e.g. Turnkey institutional development covering location scouting, biophilic architectural styling, therapist certification, and international marketing."
                className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.ecosystemCards.map((card, idx) => {
              const ecoPh = ECOSYSTEM_PLACEHOLDERS[idx] || { title: "e.g. Support Module Title", description: "e.g. Description of operational support..." };
              return (
                <div key={card.id || idx} className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30">
                        <span className="material-symbols-outlined text-lg">{card.icon || "storefront"}</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Card #{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={card.icon}
                        onChange={(e) => handleUpdateEcosystemCard(idx, "icon", e.target.value)}
                        className="bg-secondary/70 border border-border text-[11px] rounded px-2 py-1 text-muted-foreground"
                      >
                        {COMMON_ICONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                      {data.ecosystemCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEcosystemCard(idx)}
                          className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove Card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Title</Label>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const detected = detectIconFromKeyword(e.target.value, card.icon);
                        handleUpdateEcosystemCard(idx, "title", e.target.value, detected);
                      }}
                      placeholder={ecoPh.title}
                      className="bg-secondary/40 h-9 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Description</Label>
                    <textarea
                      rows={3}
                      value={card.description}
                      onChange={(e) => handleUpdateEcosystemCard(idx, "description", e.target.value)}
                      placeholder={ecoPh.description}
                      className="w-full bg-secondary/40 border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: KEY BENEFITS */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              6. Key Benefits
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddBenefitCard}
              className="gap-1.5 h-7 text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" />
              <span>Add Card</span>
            </Button>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Subheading</Label>
              <Input
                value={data.benefitsSubheading}
                onChange={(e) => setField("benefitsSubheading", e.target.value)}
                placeholder="e.g. The FOCO Advantage"
                className="bg-secondary/40 h-10 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
              <textarea
                rows={2}
                value={data.benefitsDescription}
                onChange={(e) => setField("benefitsDescription", e.target.value)}
                placeholder="e.g. Franchise Owned, Company Operated. A completely hands-off investment model designed for busy professionals."
                className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.benefitCards.map((card, idx) => {
              const benPh = BENEFIT_PLACEHOLDERS[idx] || { title: "e.g. Benefit Title", description: "e.g. Description of investor advantage..." };
              return (
                <div key={card.id || idx} className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30">
                        <span className="material-symbols-outlined text-lg">{card.icon || "volunteer_activism"}</span>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Benefit #{idx + 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={card.icon}
                        onChange={(e) => handleUpdateBenefitCard(idx, "icon", e.target.value)}
                        className="bg-secondary/70 border border-border text-[11px] rounded px-2 py-1 text-muted-foreground"
                      >
                        {COMMON_ICONS.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                      {data.benefitCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefitCard(idx)}
                          className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove Benefit"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Title</Label>
                    <Input
                      value={card.title}
                      onChange={(e) => {
                        const detected = detectIconFromKeyword(e.target.value, card.icon);
                        handleUpdateBenefitCard(idx, "title", e.target.value, detected);
                      }}
                      placeholder={benPh.title}
                      className="bg-secondary/40 h-9 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Description</Label>
                    <textarea
                      rows={4}
                      value={card.description}
                      onChange={(e) => handleUpdateBenefitCard(idx, "description", e.target.value)}
                      placeholder={benPh.description}
                      className="w-full bg-secondary/40 border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: GALLERY */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="border-b border-border/70 pb-3 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              7. Gallery Images
            </span>
          </div>
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {uploadingGallery ? "Uploading..." : "Click or drag to upload gallery images"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 20MB. Multiple files supported.</p>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={uploadingGallery}
                onChange={(e) => handleGalleryUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
          {data.galleryImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs border border-border/40 rounded-lg bg-secondary/10">
              No gallery images yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.galleryImages.map((img, idx) => {
                const isHero = Boolean(img.isHero || (data.heroImage && data.heroImage === img.url));
                return (
                  <div key={img.id || idx} className={`rounded-lg border bg-secondary/20 overflow-hidden flex flex-col transition-all ${isHero ? 'border-primary shadow-sm shadow-primary/20 ring-1 ring-primary' : 'border-border'}`}>
                    <div className="relative aspect-video bg-black/40 overflow-hidden">
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                      {isHero && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/95 text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Star className="h-3 w-3 fill-current text-gold-accent" />
                          <span>Hero Image</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setData((p) => {
                            const remaining = p.galleryImages.filter((_, i) => i !== idx);
                            const nextHero = isHero ? (remaining[0]?.url || "") : p.heroImage;
                            return {
                              ...p,
                              heroImage: nextHero,
                              galleryImages: remaining.map((g, gi) => ({ ...g, isHero: isHero && gi === 0 })),
                            };
                          })
                        }
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-3 space-y-2.5">
                      <Input
                        value={img.caption}
                        onChange={(e) => {
                          const updated = [...data.galleryImages];
                          updated[idx] = { ...updated[idx], caption: e.target.value };
                          setData((p) => ({ ...p, galleryImages: updated }));
                        }}
                        placeholder="Image caption"
                        className="bg-secondary/50 h-8 text-xs"
                      />
                      <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs select-none">
                        <input
                          type="checkbox"
                          checked={isHero}
                          onChange={() => handleToggleHeroImage(idx)}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span className={`flex items-center gap-1 text-[11px] ${isHero ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          <Star className={`h-3 w-3 ${isHero ? 'fill-primary text-primary' : ''}`} />
                          <span>Show as Hero Image</span>
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/franchises/${propertyId}`)}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider px-8"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save All Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminFranchisePage;
