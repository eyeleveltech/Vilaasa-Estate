import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  ArrowLeft,
  DollarSign,
  Sparkles,
  Save,
  BookOpen,
  Layers,
  CheckCircle2,
  Upload,
  Trash2,
  Plus,
  Star,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Property, ApiResponse } from "../types/admin.types";
import {
  FranchisePageData,
  DEFAULT_PAGE_DATA,
  DEFAULT_FRANCHISE_SECTION_VISIBILITY,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SortableArrayItem } from "../components/SortableArrayItem";
import { DraftSaveBar } from "../components/DraftSaveBar";
import { BrochureUploader } from "../components/BrochureUploader";
import { FormSectionHeader } from "../components/FormSectionHeader";

/* -------------------------------------------------------------------------- */
/*                                HELPER UTILS                                */
/* -------------------------------------------------------------------------- */

const parseValueToNumber = (val: string | undefined, defaultNum: number): number => {
  if (!val) return defaultNum;
  const cleaned = val.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return defaultNum;
  if (/cr/i.test(val)) return num * 10000000;
  if (/l|lac|lakh/i.test(val)) return num * 100000;
  if (/k/i.test(val)) return num * 1000;
  if (/m/i.test(val)) return num * 1000000;
  return num;
};

/* -------------------------------------------------------------------------- */
/*                           SECTION NAV CONFIG                               */
/* -------------------------------------------------------------------------- */

const FRANCHISE_SECTIONS = [
  { id: "sec-hero", label: "1. Hero & SEO" },
  { id: "sec-hero-metrics", label: "2. Hero Metrics" },
  { id: "sec-vision", label: "3. Vision Story" },
  { id: "sec-blueprint", label: "4. Blueprint" },
  { id: "sec-ecosystem", label: "5. Ecosystem" },
  { id: "sec-benefits", label: "6. Benefits" },
  { id: "sec-gallery", label: "7. Gallery" },
];

const DEFAULT_FRANCHISE_SECTION_EXPANDED: Record<string, boolean> = {
  "sec-hero": true,
  "sec-hero-metrics": true,
  "sec-vision": true,
  "sec-blueprint": true,
  "sec-ecosystem": true,
  "sec-benefits": true,
  "sec-gallery": true,
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export const AdminFranchiseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [property, setProperty] = useState<Property | null>(null);
  const [pageData, setPageData] = useState<FranchisePageData>(DEFAULT_PAGE_DATA);
  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingGallery, setUploadingGallery] = useState<boolean>(false);
  const [brochureUrl, setBrochureUrl] = useState<string>("");

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    DEFAULT_FRANCHISE_SECTION_EXPANDED
  );

  const sectionVisibility = pageData.sectionVisibility || DEFAULT_FRANCHISE_SECTION_VISIBILITY;

  const toggleSectionExpanded = (secId: string) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const toggleSectionVisibility = (secId: string, visible: boolean) => {
    setPageData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...(prev.sectionVisibility || DEFAULT_FRANCHISE_SECTION_VISIBILITY),
        [secId]: visible,
      },
    }));
  };

  const handleToggleAllSections = () => {
    const allExpanded = Object.values(expandedSections).every(Boolean);
    const nextState: Record<string, boolean> = {};
    Object.keys(DEFAULT_FRANCHISE_SECTION_EXPANDED).forEach((k) => {
      nextState[k] = !allExpanded;
    });
    setExpandedSections(nextState);
  };

  const draftKey = `vilaasa_franchise_draft_${id || "new"}`;

  /* -------------------------- DnD Sensors ------------------------------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /* ---------------------- Section Validation Indicators ----------------- */
  const sectionStatus = {
    "sec-hero": pageData.mainHeadline.trim().length >= 2,
    "sec-hero-metrics": sectionVisibility["sec-hero-metrics"] === false || pageData.heroMetrics.some((m) => m.label.trim()),
    "sec-vision": sectionVisibility["sec-vision"] === false || pageData.visionHeadline.trim().length > 0,
    "sec-blueprint": sectionVisibility["sec-blueprint"] === false || pageData.blueprintMetrics.some((m) => m.label.trim()),
    "sec-ecosystem": sectionVisibility["sec-ecosystem"] === false || pageData.ecosystemCards.some((c) => c.title.trim()),
    "sec-benefits": sectionVisibility["sec-benefits"] === false || pageData.benefitCards.some((c) => c.title.trim()),
    "sec-gallery": sectionVisibility["sec-gallery"] === false || pageData.galleryImages.length > 0,
  } as Record<string, boolean>;

  /* -------------------------- Fetch Initial Data -------------------------- */
  const fetchFranchiseData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [propRes, pageRes] = await Promise.all([
        api.get<ApiResponse<Property>>(`/properties/${id}`),
        api.get<ApiResponse<FranchisePageData | null>>(`/franchise/${id}/page`),
      ]);

      if (propRes.data.success && propRes.data.data) {
        setProperty(propRes.data.data);
        setBrochureUrl(propRes.data.data.brochureUrl || "");
      }

      if (pageRes.data.success && pageRes.data.data) {
        const normalized = normalizeFranchisePageData(pageRes.data.data);
        if (
          (!pageRes.data.data.sectionVisibility || Object.keys(pageRes.data.data.sectionVisibility).length === 0) &&
          propRes.data.data?.sectionVisibility
        ) {
          normalized.sectionVisibility = {
            ...DEFAULT_FRANCHISE_SECTION_VISIBILITY,
            ...(propRes.data.data.sectionVisibility as Record<string, boolean>),
          };
        }
        setPageData(normalized);
      }
    } catch (err) {
      console.error("Failed to load franchise details:", err);
      toast.error("Could not load franchise data. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchFranchiseData();
  }, [fetchFranchiseData]);

  /* -------------------- Draft Restore Handler ---------------------------- */
  const handleDraftRestore = (savedState: unknown) => {
    try {
      const restored = normalizeFranchisePageData(savedState as Partial<FranchisePageData>);
      setPageData(restored);
      toast.success("Draft restored!");
    } catch {
      toast.error("Failed to restore draft.");
    }
  };

  /* -------------------- Generic DnD reorder helper ----------------------- */
  const reorderArray = <T,>(arr: T[], activeId: string, overId: string): T[] => {
    const activeIdx = arr.findIndex((item: unknown) => (item as { id: string }).id === activeId);
    const overIdx = arr.findIndex((item: unknown) => (item as { id: string }).id === overId);
    if (activeIdx < 0 || overIdx < 0) return arr;
    return arrayMove(arr, activeIdx, overIdx);
  };

  /* -------------------- Generic clone helper ----------------------------- */
  const cloneItem = <T extends { id: string }>(arr: T[], index: number): T[] => {
    const original = arr[index];
    if (!original) return arr;
    const cloned = { ...original, id: `${original.id}-clone-${Date.now()}` };
    const result = [...arr];
    result.splice(index + 1, 0, cloned);
    return result;
  };

  /* ------------------------ Array Mutator Handlers ------------------------ */

  // ── Section 2: Hero Financial Metrics ──────────────────────────────────
  const handleAddHeroMetric = (preset?: { label: string }) => {
    const newBadge: MetricBadge = {
      id: `hero-${Date.now()}`,
      label: preset?.label || "",
      value: "",
    };
    setPageData((p) => ({ ...p, heroMetrics: [...p.heroMetrics, newBadge] }));
  };

  const handleRemoveHeroMetric = (index: number) => {
    setPageData((p) => ({
      ...p,
      heroMetrics: p.heroMetrics.filter((_, idx) => idx !== index),
    }));
  };

  const handleCloneHeroMetric = (index: number) => {
    setPageData((p) => ({ ...p, heroMetrics: cloneItem(p.heroMetrics, index) }));
  };

  const handleUpdateHeroMetric = (index: number, field: "label" | "value", val: string) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setPageData((p) => {
      const updated = [...p.heroMetrics];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: formattedVal };
      }
      return { ...p, heroMetrics: updated };
    });
  };

  const handleDragEndHeroMetrics = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPageData((p) => ({
      ...p,
      heroMetrics: reorderArray(p.heroMetrics, String(active.id), String(over.id)),
    }));
  };

  // ── Section 4: Financial Blueprint ────────────────────────────────────
  const handleAddBlueprintMetric = (preset?: { label: string }) => {
    const newMetric: MetricBadge = {
      id: `bp-${Date.now()}`,
      label: preset?.label || "",
      value: "",
    };
    setPageData((p) => ({ ...p, blueprintMetrics: [...p.blueprintMetrics, newMetric] }));
  };

  const handleRemoveBlueprintMetric = (index: number) => {
    setPageData((p) => ({
      ...p,
      blueprintMetrics: p.blueprintMetrics.filter((_, idx) => idx !== index),
    }));
  };

  const handleCloneBlueprintMetric = (index: number) => {
    setPageData((p) => ({ ...p, blueprintMetrics: cloneItem(p.blueprintMetrics, index) }));
  };

  const handleUpdateBlueprintMetric = (index: number, field: "label" | "value", val: string) => {
    const formattedVal = field === "value" ? autoFormatCurrencySymbol(val) : val;
    setPageData((p) => {
      const updated = [...p.blueprintMetrics];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: formattedVal };
      }
      return { ...p, blueprintMetrics: updated };
    });
  };

  const handleDragEndBlueprintMetrics = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPageData((p) => ({
      ...p,
      blueprintMetrics: reorderArray(p.blueprintMetrics, String(active.id), String(over.id)),
    }));
  };

  // ── Section 5: Ecosystem Cards ────────────────────────────────────────
  const handleAddEcosystemCard = (preset?: { label: string; icon?: string } | null) => {
    const newCard: SupportCard = {
      id: `eco-${Date.now()}`,
      title: preset?.label || "",
      description: "",
      icon: preset?.icon || "storefront",
    };
    setPageData((p) => ({ ...p, ecosystemCards: [...p.ecosystemCards, newCard] }));
  };

  const handleRemoveEcosystemCard = (index: number) => {
    setPageData((p) => ({
      ...p,
      ecosystemCards: p.ecosystemCards.filter((_, idx) => idx !== index),
    }));
  };

  const handleCloneEcosystemCard = (index: number) => {
    setPageData((p) => ({ ...p, ecosystemCards: cloneItem(p.ecosystemCards, index) }));
  };

  const handleUpdateEcosystemCard = (
    index: number,
    field: "title" | "description" | "icon",
    val: string,
    detectedIcon?: string
  ) => {
    setPageData((p) => {
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

  const handleDragEndEcosystemCards = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPageData((p) => ({
      ...p,
      ecosystemCards: reorderArray(p.ecosystemCards, String(active.id), String(over.id)),
    }));
  };

  // ── Section 6: Benefit Cards ──────────────────────────────────────────
  const handleAddBenefitCard = (preset?: { label: string; icon?: string } | null) => {
    const newCard: BenefitCard = {
      id: `ben-${Date.now()}`,
      title: preset?.label || "",
      description: "",
      icon: preset?.icon || "volunteer_activism",
    };
    setPageData((p) => ({ ...p, benefitCards: [...p.benefitCards, newCard] }));
  };

  const handleRemoveBenefitCard = (index: number) => {
    setPageData((p) => ({
      ...p,
      benefitCards: p.benefitCards.filter((_, idx) => idx !== index),
    }));
  };

  const handleCloneBenefitCard = (index: number) => {
    setPageData((p) => ({ ...p, benefitCards: cloneItem(p.benefitCards, index) }));
  };

  const handleUpdateBenefitCard = (
    index: number,
    field: "title" | "description" | "icon",
    val: string,
    detectedIcon?: string
  ) => {
    setPageData((p) => {
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

  const handleDragEndBenefitCards = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setPageData((p) => ({
      ...p,
      benefitCards: reorderArray(p.benefitCards, String(active.id), String(over.id)),
    }));
  };

  // ── Section 7: Hero Image Selection Toggle ────────────────────────────
  const handleToggleHeroImage = (index: number) => {
    setPageData((prev) => {
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

  /* ---------------------------- Save Handler ------------------------------ */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const resolvedName = pageData.mainHeadline.trim() || pageData.pageTitle.trim();
    if (!resolvedName || resolvedName.length < 2) {
      toast.error("Please enter a Main Headline or Page Title in Section 1 (min. 2 characters)");
      return;
    }

    const invalidSections = Object.entries(sectionStatus)
      .filter(([key, isValid]) => {
        if (sectionVisibility[key] === false) return false;
        return !isValid;
      })
      .map(([key]) => key);

    if (invalidSections.length > 0) {
      toast.error("Please complete the required active sections before publishing.");
      return;
    }

    const minTicket = parseValueToNumber(
      pageData.heroMetrics[0]?.value || pageData.blueprintMetrics[1]?.value,
      35000000
    );
    const totalCost = parseValueToNumber(pageData.blueprintMetrics[0]?.value, 120000000);
    const roi = parseValueToNumber(pageData.heroMetrics[1]?.value, 24);
    const payback = parseValueToNumber(pageData.heroMetrics[2]?.value, 3);
    const lockIn = parseValueToNumber(pageData.blueprintMetrics[2]?.value, 2);

    const cleanDescription =
      pageData.visionDescription.trim().length >= 5
        ? pageData.visionDescription.trim()
        : `${resolvedName} - Luxury franchise asset opportunity with institutional management.`;

    const finalPagePayload = prepareFranchisePagePayload(pageData);
    const heroImageUrl = finalPagePayload.heroImage;

    const propertyPayload = {
      name: resolvedName,
      type: "FRANCHISE",
      customType: "Wellness Resort",
      tagline: pageData.subheading.trim() || undefined,
      description: cleanDescription,
      price: minTicket,
      minTicketSize: minTicket,
      totalProjectCost: totalCost,
      currency: "INR" as const,
      status: "AVAILABLE" as const,
      franchiseModel: "FOCO" as const,
      expectedAnnualRoi: roi,
      rentalYieldPercent: roi,
      paybackPeriodYears: payback,
      lockInPeriodYears: lockIn,
      yieldPayoutFrequency: "QUARTERLY" as const,
      brochureUrl: brochureUrl.trim() || undefined,
      sectionVisibility: pageData.sectionVisibility || DEFAULT_FRANCHISE_SECTION_VISIBILITY,
      location: {
        city: "Wayanad",
        country: "India",
      },
      ...(pageData.galleryImages.length > 0
        ? {
            media: pageData.galleryImages.map((img, idx) => ({
              url: img.url,
              altText: img.caption || `${resolvedName} Image ${idx + 1}`,
              orderIndex: idx,
              isFeatured: Boolean(
                img.isHero || (heroImageUrl && img.url === heroImageUrl) || idx === 0
              ),
            })),
          }
        : {}),
    };

    setSaving(true);
    const toastId = toast.loading(isEditMode ? "Updating franchise..." : "Creating franchise...");

    try {
      if (isEditMode && id) {
        await api.put(`/properties/${id}`, propertyPayload);
        await api.put(`/franchise/${id}/page`, finalPagePayload);
        toast.success("Franchise updated successfully!", { id: toastId });
        localStorage.removeItem(draftKey);
        navigate(`/admin/franchises/${id}`);
      } else {
        const res = await api.post<ApiResponse<Property>>("/properties", propertyPayload);
        if (res.data.success && res.data.data) {
          const newId = res.data.data.id;
          await api.put(`/franchise/${newId}/page`, finalPagePayload);
          toast.success("Franchise registered successfully!", { id: toastId });
          localStorage.removeItem(draftKey);
          navigate(`/admin/franchises/${newId}`);
        } else {
          throw new Error(res.data.message || "Failed to create franchise");
        }
      }
    } catch (err: unknown) {
      console.error("Save franchise error:", err);
      const resp = (err as { response?: { data?: { message?: string; errors?: string[] } } })?.response?.data;
      let errMsg = resp?.message || (err instanceof Error ? err.message : "Failed to save franchise");
      if (resp?.errors && Array.isArray(resp.errors)) {
        errMsg = resp.errors.join(", ");
      }
      toast.error(errMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    const MAX_GALLERY_SIZE = 2 * 1024 * 1024; // 2MB
    const oversized = fileArr.filter((f) => f.size > MAX_GALLERY_SIZE);
    if (oversized.length > 0) {
      toast.error(
        `Image(s) exceed 2MB limit: ${oversized.map((f) => f.name).join(", ")}. Please upload images under 2MB.`
      );
      return;
    }
    setUploadingGallery(true);
    const toastId = toast.loading(`Uploading ${fileArr.length} image(s)...`);
    try {
      const newItems: GalleryItem[] = [];
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "vilaasa/franchises/gallery");
        const res = await api.post<ApiResponse<{ url: string }>>(
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
            orderIndex: pageData.galleryImages.length + i,
          });
        }
      }
      setPageData((p) => ({ ...p, galleryImages: [...p.galleryImages, ...newItems] }));
      toast.success(`${newItems.length} image(s) uploaded!`, { id: toastId });
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.error("Gallery upload failed. Make sure the backend server is running.", { id: toastId });
    } finally {
      setUploadingGallery(false);
    }
  };

  /* -------------------- Drag-over gallery handler ---------------------- */
  const handleGalleryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleGalleryUpload(e.dataTransfer.files);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">Loading franchise details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-32 min-w-0 overflow-x-hidden w-full">

      {/* Draft Save Bar */}
      <DraftSaveBar
        storageKey={draftKey}
        formState={pageData}
        onRestore={handleDraftRestore}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <Link
            to="/admin/franchises"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Franchises</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate max-w-[240px] sm:max-w-xl">
              {isEditMode
                ? `Edit Franchise — ${pageData.mainHeadline || pageData.pageTitle || "Opportunity"}`
                : "Create Franchise"}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isEditMode
              ? "Customize dynamic metrics, editorial story, support ecosystem, and gallery images."
              : "Register and configure a luxury franchise asset opportunity for global investors."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(isEditMode ? `/admin/franchises/${id}` : "/admin/franchises")}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            size="sm"
            className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isEditMode ? "Save Changes" : "Create Franchise"}</span>
          </Button>
        </div>
      </div>

      {/* ── Sticky Step Nav with Validation Indicators & Collapse Toggle ── */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-md py-2.5 px-3 rounded-xl border border-border/80 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar min-w-0">
          {FRANCHISE_SECTIONS.map((sec, idx) => {
            const done = sectionStatus[sec.id];
            const isVis = sectionVisibility[sec.id] !== false;
            return (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
                  done
                    ? "bg-secondary/40 text-foreground hover:bg-secondary/70 border border-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-border/50"
                } ${!isVis ? "opacity-60 border-dashed" : ""}`}
              >
                {done ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                    {idx + 1}
                  </span>
                )}
                <span>{sec.label}</span>
                {!isVis && <span className="text-[9px] text-amber-400/80 font-normal">(Hidden)</span>}
              </a>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleAllSections}
          className="text-[11px] h-7 px-2.5 shrink-0 border-border text-muted-foreground hover:text-foreground hidden sm:flex"
        >
          {Object.values(expandedSections).every(Boolean) ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      {/* 7-Section Page Content Body */}
      <div className="space-y-8">

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 1: HERO                                                  */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-hero" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-hero"
            title="1. Hero Header & SEO"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            subtitle="SEO title, banner headline, and hero marketing introduction."
            isExpanded={expandedSections["sec-hero"]}
            isVisible={sectionVisibility["sec-hero"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-hero")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-hero", v)}
          />
          {expandedSections["sec-hero"] && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Page Title (SEO)</Label>
                <Input
                  value={pageData.pageTitle}
                  onChange={(e) => setPageData((p) => ({ ...p, pageTitle: e.target.value }))}
                  placeholder="e.g. Wellness Resorts Kerala — Ultra-luxury healing experiences"
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Main Headline *</Label>
                  <Input
                    value={pageData.mainHeadline}
                    onChange={(e) => setPageData((p) => ({ ...p, mainHeadline: e.target.value }))}
                    placeholder="e.g. Wellness Resorts"
                    className="bg-secondary/40 h-10 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hero Subheading (Banner Subtitle)</Label>
                  <textarea
                    rows={2}
                    value={pageData.subheading}
                    onChange={(e) => setPageData((p) => ({ ...p, subheading: e.target.value }))}
                    placeholder="e.g. Ultra-luxury Ayurvedic wellness retreat overlooking lush valleys..."
                    className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 2: HERO FINANCIAL METRICS                                */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-hero-metrics" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-hero-metrics"
            title="2. Hero Financial Metrics"
            icon={<DollarSign className="h-3.5 w-3.5" />}
            subtitle="High-impact investment metrics shown on the hero banner."
            isExpanded={expandedSections["sec-hero-metrics"]}
            isVisible={sectionVisibility["sec-hero-metrics"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-hero-metrics")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-hero-metrics", v)}
            actionButton={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAddHeroMetric();
                  setExpandedSections((p) => ({ ...p, "sec-hero-metrics": true }));
                }}
                className="h-8 w-8 p-0 border-border text-muted-foreground hover:border-primary hover:text-primary"
                title="Add Metric Badge"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
          {expandedSections["sec-hero-metrics"] && (
            <div>
              {pageData.heroMetrics.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground">No hero metrics added. Click &quot;+&quot; above to add metrics.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndHeroMetrics}>
                  <SortableContext items={pageData.heroMetrics.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                      {pageData.heroMetrics.map((metric, idx) => {
                        const heroPh = HERO_PLACEHOLDERS[idx] || { label: "e.g. METRIC NAME", value: "e.g. ₹1.5 Cr / 18%" };
                        return (
                          <SortableArrayItem
                            key={metric.id}
                            id={metric.id}
                            onClone={() => handleCloneHeroMetric(idx)}
                            onRemove={() => handleRemoveHeroMetric(idx)}
                            canRemove={pageData.heroMetrics.length > 1}
                          >
                            <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                Badge #{idx + 1}
                              </Label>
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
                          </SortableArrayItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 3: THE VISION                                            */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-vision" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-vision"
            title="3. The Vision Story"
            icon={<BookOpen className="h-3.5 w-3.5" />}
            subtitle="Editorial brand concept, wellness philosophy, and market opportunity."
            isExpanded={expandedSections["sec-vision"]}
            isVisible={sectionVisibility["sec-vision"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-vision")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-vision", v)}
          />
          {expandedSections["sec-vision"] && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vision Headline</Label>
                <Input
                  value={pageData.visionHeadline}
                  onChange={(e) => setPageData((p) => ({ ...p, visionHeadline: e.target.value }))}
                  placeholder="e.g. Where culinary artistry meets intelligent capital."
                  className="bg-secondary/40 h-10 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vision Story Narrative (Section 3 Body)</Label>
                <textarea
                  rows={4}
                  value={pageData.visionDescription}
                  onChange={(e) => setPageData((p) => ({ ...p, visionDescription: e.target.value }))}
                  placeholder="Detail the brand story, wellness philosophy, and market opportunity..."
                  className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                />
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 4: FINANCIAL BLUEPRINT                                   */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-blueprint" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-blueprint"
            title="4. Financial Blueprint"
            icon={<DollarSign className="h-3.5 w-3.5" />}
            subtitle="Deep financial metrics, ticket sizes, lock-in, and payback period."
            isExpanded={expandedSections["sec-blueprint"]}
            isVisible={sectionVisibility["sec-blueprint"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-blueprint")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-blueprint", v)}
            actionButton={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAddBlueprintMetric();
                  setExpandedSections((p) => ({ ...p, "sec-blueprint": true }));
                }}
                className="h-8 w-8 p-0 border-border text-muted-foreground hover:border-primary hover:text-primary"
                title="Add Metric"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
          {expandedSections["sec-blueprint"] && (
            <div>
              <p className="text-[11px] text-muted-foreground mb-4 bg-amber-500/10 border border-amber-500/20 p-2 rounded-md">
                <strong>Note:</strong> To avoid investor confusion, please clearly distinguish between the <strong>Base Franchise Fee / Booking Amount</strong> (e.g., ₹15 Lakh) and the <strong>Total Capital Required / Ticket Size</strong> (e.g., ₹40 Lakh). Use separate metrics for each.
              </p>
              {pageData.blueprintMetrics.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground">No blueprint metrics added. Click &quot;+&quot; above to add metrics.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndBlueprintMetrics}>
                  <SortableContext items={pageData.blueprintMetrics.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                      {pageData.blueprintMetrics.map((metric, idx) => {
                        const bpPh = BLUEPRINT_PLACEHOLDERS[idx] || { label: "e.g. METRIC PARAMETER", value: "e.g. ₹5 Cr / 5 Years" };
                        return (
                          <SortableArrayItem
                            key={metric.id}
                            id={metric.id}
                            onClone={() => handleCloneBlueprintMetric(idx)}
                            onRemove={() => handleRemoveBlueprintMetric(idx)}
                            canRemove={pageData.blueprintMetrics.length > 1}
                          >
                            <div className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 space-y-2">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                Metric #{idx + 1}
                              </Label>
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
                          </SortableArrayItem>
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 5: SUPPORT & TRAINING (ECOSYSTEM)                        */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-ecosystem" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-ecosystem"
            title="5. Comprehensive Ecosystem"
            icon={<Layers className="h-3.5 w-3.5" />}
            subtitle="Operational support modules, site selection, training, and marketing."
            isExpanded={expandedSections["sec-ecosystem"]}
            isVisible={sectionVisibility["sec-ecosystem"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-ecosystem")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-ecosystem", v)}
            actionButton={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAddEcosystemCard(null);
                  setExpandedSections((p) => ({ ...p, "sec-ecosystem": true }));
                }}
                className="h-8 w-8 p-0 border-border text-muted-foreground hover:border-primary hover:text-primary"
                title="Add Ecosystem Card"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
          {expandedSections["sec-ecosystem"] && (
            <div>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Eyebrow</Label>
                    <Input
                      value={pageData.ecosystemSubheading}
                      onChange={(e) => setPageData((p) => ({ ...p, ecosystemSubheading: e.target.value }))}
                      placeholder="e.g. Comprehensive Ecosystem"
                      className="bg-secondary/40 h-10 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Heading</Label>
                    <Input
                      value={pageData.ecosystemHeading}
                      onChange={(e) => setPageData((p) => ({ ...p, ecosystemHeading: e.target.value }))}
                      placeholder="e.g. Support & Training"
                      className="bg-secondary/40 h-10 text-sm mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Description</Label>
                  <textarea
                    rows={2}
                    value={pageData.ecosystemDescription}
                    onChange={(e) => setPageData((p) => ({ ...p, ecosystemDescription: e.target.value }))}
                    placeholder="e.g. Turnkey institutional development covering location scouting, biophilic architectural styling, therapist certification, and international marketing."
                    className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                  />
                </div>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndEcosystemCards}>
                <SortableContext items={pageData.ecosystemCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {pageData.ecosystemCards.map((card, idx) => {
                      const ecoPh = ECOSYSTEM_PLACEHOLDERS[idx] || { title: "e.g. Support Module Title", description: "e.g. Description of operational support..." };
                      return (
                        <SortableArrayItem
                          key={card.id}
                          id={card.id}
                          onClone={() => handleCloneEcosystemCard(idx)}
                          onRemove={() => handleRemoveEcosystemCard(idx)}
                          canRemove={pageData.ecosystemCards.length > 1}
                        >
                          <div className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30">
                                <span className="material-symbols-outlined text-lg">{card.icon || "storefront"}</span>
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Card #{idx + 1}</span>
                              <select
                                value={card.icon}
                                onChange={(e) => handleUpdateEcosystemCard(idx, "icon", e.target.value)}
                                className="w-full sm:w-auto sm:ml-auto bg-secondary/70 border border-border text-[11px] rounded px-2 py-1 text-muted-foreground min-w-0"
                              >
                                {COMMON_ICONS.map((ic) => (
                                  <option key={ic} value={ic}>{ic}</option>
                                ))}
                              </select>
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
                        </SortableArrayItem>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 6: KEY BENEFITS                                          */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-benefits" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-benefits"
            title="6. Key Benefits"
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            subtitle="The FOCO advantage, investor safeguards, and institutional benefits."
            isExpanded={expandedSections["sec-benefits"]}
            isVisible={sectionVisibility["sec-benefits"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-benefits")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-benefits", v)}
            actionButton={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAddBenefitCard(null);
                  setExpandedSections((p) => ({ ...p, "sec-benefits": true }));
                }}
                className="h-8 w-8 p-0 border-border text-muted-foreground hover:border-primary hover:text-primary"
                title="Add Benefit Card"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
          {expandedSections["sec-benefits"] && (
            <div>
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Section Subheading</Label>
                  <Input
                    value={pageData.benefitsSubheading}
                    onChange={(e) => setPageData((p) => ({ ...p, benefitsSubheading: e.target.value }))}
                    placeholder="e.g. The FOCO Advantage"
                    className="bg-secondary/40 h-10 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                  <textarea
                    rows={2}
                    value={pageData.benefitsDescription}
                    onChange={(e) => setPageData((p) => ({ ...p, benefitsDescription: e.target.value }))}
                    placeholder="e.g. Franchise Owned, Company Operated. A completely hands-off investment model designed for busy professionals."
                    className="w-full bg-secondary/40 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mt-1 resize-y"
                  />
                </div>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndBenefitCards}>
                <SortableContext items={pageData.benefitCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {pageData.benefitCards.map((card, idx) => {
                      const benPh = BENEFIT_PLACEHOLDERS[idx] || { title: "e.g. Benefit Title", description: "e.g. Description of investor advantage..." };
                      return (
                        <SortableArrayItem
                          key={card.id}
                          id={card.id}
                          onClone={() => handleCloneBenefitCard(idx)}
                          onRemove={() => handleRemoveBenefitCard(idx)}
                          canRemove={pageData.benefitCards.length > 1}
                        >
                          <div className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30">
                                <span className="material-symbols-outlined text-lg">{card.icon || "volunteer_activism"}</span>
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Benefit #{idx + 1}</span>
                              <select
                                value={card.icon}
                                onChange={(e) => handleUpdateBenefitCard(idx, "icon", e.target.value)}
                                className="w-full sm:w-auto sm:ml-auto bg-secondary/70 border border-border text-[11px] rounded px-2 py-1 text-muted-foreground min-w-0"
                              >
                                {COMMON_ICONS.map((ic) => (
                                  <option key={ic} value={ic}>{ic}</option>
                                ))}
                              </select>
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
                        </SortableArrayItem>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* SECTION 7: MEDIA & GALLERY                                       */}
        {/* ---------------------------------------------------------------- */}
        <section id="sec-gallery" className="rounded-xl border border-border bg-card p-6 shadow-sm scroll-mt-24">
          <FormSectionHeader
            id="sec-gallery"
            title="7. Media & Gallery"
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            subtitle="Official franchise brochure and architectural photography."
            isExpanded={expandedSections["sec-gallery"]}
            isVisible={sectionVisibility["sec-gallery"] !== false}
            onToggleExpanded={() => toggleSectionExpanded("sec-gallery")}
            onToggleVisibility={(v) => toggleSectionVisibility("sec-gallery", v)}
          />
          {expandedSections["sec-gallery"] && (
            <div>
              <div className="mb-8">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Official Franchise Brochure (PDF)
                </Label>
                <BrochureUploader
                  value={brochureUrl}
                  onChange={(url) => {
                    setBrochureUrl(url);
                    toast.success("Brochure attached!");
                  }}
                />
              </div>

              <div className="mb-6">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Gallery Images
                </Label>
                <label
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors"
                  onDragOver={handleGalleryDragOver}
                  onDrop={handleGalleryDrop}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {uploadingGallery ? "Uploading..." : "Click or drag-and-drop to upload gallery images"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 2MB each. Multiple files supported.</p>
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
              {pageData.galleryImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs border border-border/40 rounded-lg bg-secondary/10">
                  No gallery images yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pageData.galleryImages.map((img, idx) => {
                    const isHero = Boolean(img.isHero || (pageData.heroImage && pageData.heroImage === img.url));
                    return (
                      <div
                        key={img.id || idx}
                        className={`rounded-lg border bg-secondary/20 overflow-hidden flex flex-col transition-all ${isHero ? "border-primary shadow-sm shadow-primary/20 ring-1 ring-primary" : "border-border"}`}
                      >
                        <div className="relative aspect-video bg-black/40 overflow-hidden">
                          <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                          {isHero && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary/95 text-primary-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                              <Star className="h-3 w-3 fill-current" />
                              <span>Hero Image</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setPageData((p) => {
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
                              const updated = [...pageData.galleryImages];
                              updated[idx] = { ...updated[idx], caption: e.target.value };
                              setPageData((p) => ({ ...p, galleryImages: updated }));
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
                            <span className={`flex items-center gap-1 text-[11px] ${isHero ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                              <Star className={`h-3 w-3 ${isHero ? "fill-primary text-primary" : ""}`} />
                              <span>Show as Hero Image</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

      {/* ── Sticky Bottom Actions ── */}
      <div className="sticky bottom-0 z-30 w-full border-t border-border bg-card/95 backdrop-blur-md shadow-2xl py-3.5 px-4 sm:px-6 mt-8 rounded-t-xl">
        <div className="flex flex-col-reverse sm:flex-row w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(isEditMode ? `/admin/franchises/${id}` : "/admin/franchises")}
            className="text-xs h-9 w-full sm:w-auto border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs font-semibold h-9 px-6 shadow-sm shadow-primary/20 w-full sm:w-auto"
          >
            {saving ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{isEditMode ? "Save Changes" : "Create Franchise"}</span>
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminFranchiseForm;
