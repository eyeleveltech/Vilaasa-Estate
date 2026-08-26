import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  ArrowLeft,
  Edit2,
  ExternalLink,
  Coins,
  TrendingUp,
  Clock,
  Lock,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  Inbox,
  Image as ImageIcon,
  FileText,
  Mail,
  Phone,
  Tag,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Property,
  Inquiry,
  ApiResponse,
} from "../types/admin.types";
import { MediaUploader } from "../components/MediaUploader";
import { Button } from "@/components/ui/button";

type DetailTab = "overview" | "media" | "inquiries";

export const AdminFranchiseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [franchise, setFranchise] = useState<Property | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingInquiries, setLoadingInquiries] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const fetchFranchise = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      if (res.data.success && res.data.data) {
        setFranchise(res.data.data);
      }
    } catch {
      toast.error("Failed to load franchise details");
      navigate("/admin/franchises");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchFranchiseInquiries = useCallback(async () => {
    if (!id) return;
    setLoadingInquiries(true);
    try {
      const res = await api.get<ApiResponse<Inquiry[]>>("/inquiries", {
        params: { propertyId: id, limit: 50 },
      });
      if (res.data.success) {
        setInquiries(res.data.data || []);
      }
    } catch {
      // quiet fallback
    } finally {
      setLoadingInquiries(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFranchise();
    fetchFranchiseInquiries();
  }, [fetchFranchise, fetchFranchiseInquiries]);

  const getModelBadge = (model?: string | null) => {
    switch (model) {
      case "FOCO":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "FOFO":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "FICO":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  const formatCurrency = (val?: number | string | null, curr = "INR") => {
    if (val === undefined || val === null) return "₹0";
    const num = Number(val);
    if (isNaN(num)) return `${curr} 0`;
    return `${curr} ${num.toLocaleString()}`;
  };

  if (loading || !franchise) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading franchise dossier...</p>
      </div>
    );
  }

  const heroImg =
    franchise.media?.find((m) => m.isFeatured)?.url ||
    franchise.media?.[0]?.url ||
    null;
  const ticket = franchise.minTicketSize ?? franchise.price;
  const roi = franchise.expectedAnnualRoi ?? franchise.rentalYieldPercent;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="space-y-1">
          <Link
            to="/admin/franchises"
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Franchises</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
              {franchise.name}
            </h2>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold tracking-wider uppercase ${getModelBadge(
                franchise.franchiseModel,
              )}`}
            >
              {franchise.franchiseModel || "FOCO"} Model
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>
              {franchise.location.community
                ? `${franchise.location.community}, `
                : ""}
              {franchise.location.city}, {franchise.location.country}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link
              to={`/franchise/${franchise.slug || franchise.id}`}
              target="_blank"
            >
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              <span>Public Showcase</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to={`/admin/franchises/${franchise.id}/edit`}>
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Franchise</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-border">
        {[
          { id: "overview", label: "Executive Overview", icon: Store },
          {
            id: "media",
            label: `Media & Gallery (${franchise.media?.length || 0})`,
            icon: ImageIcon,
          },
          {
            id: "inquiries",
            label: `Investor Leads (${inquiries.length})`,
            icon: Inbox,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DetailTab)}
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

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Financial KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span>Min Ticket</span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                {formatCurrency(ticket, franchise.currency)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Expected ROI</span>
              </div>
              <p className="text-sm font-semibold text-emerald-400 font-mono">
                {roi ? `${roi}% Annually` : "24% Annually"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <span>Payback</span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                {franchise.paybackPeriodYears
                  ? `${franchise.paybackPeriodYears} Years`
                  : "3.5 Years"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Lock-in</span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                {franchise.lockInPeriodYears
                  ? `${franchise.lockInPeriodYears} Years`
                  : "3.0 Years"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                <span>Payout</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {franchise.yieldPayoutFrequency || "Quarterly"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Store className="h-3.5 w-3.5 text-primary" />
                <span>Total Capex</span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                {formatCurrency(franchise.totalProjectCost, franchise.currency)}
              </p>
            </div>
          </div>

          {/* Hero Banner & Description */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Architectural Vision & Business Model
                </h3>
                {franchise.visionHeadline && (
                  <p className="text-base font-medium text-foreground">
                    &quot;{franchise.visionHeadline}&quot;
                  </p>
                )}
                {franchise.tagline && (
                  <p className="text-xs font-medium text-primary italic">
                    {franchise.tagline}
                  </p>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {franchise.description}
                </p>
              </div>

              {/* Financial Blueprint (Custom Specs) */}
              {Array.isArray(franchise.customSpecs) && franchise.customSpecs.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>Financial Blueprint (Admin Defined)</span>
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                      Public Dossier Metrics
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {franchise.customSpecs.map((spec: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-secondary/30 border border-border"
                      >
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                          {spec.label}
                        </p>
                        <p className="text-sm font-bold text-primary mt-0.5">
                          {spec.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support & Training Modules */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Comprehensive Ecosystem (Support & Training)</span>
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Operator-backed
                  </span>
                </div>
                {Array.isArray(franchise.supportModules) &&
                franchise.supportModules.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {franchise.supportModules.map((module: any, idx) => {
                      const name = typeof module === "object" && module !== null ? module.name : String(module);
                      const icon = typeof module === "object" && module !== null && module.icon ? module.icon : "storefront";
                      const desc = typeof module === "object" && module !== null ? module.description : null;
                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-2.5 rounded-lg bg-secondary/30 p-3 border border-border"
                        >
                          <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">
                            {icon}
                          </span>
                          <div>
                            <span className="text-xs text-foreground font-semibold block">
                              {name}
                            </span>
                            {desc && (
                              <span className="text-[11px] text-muted-foreground block mt-0.5 leading-relaxed">
                                {desc}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No support modules configured. Edit franchise to add modules.
                  </p>
                )}
              </div>

              {/* Advantages & Competitive Moat */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Key Benefits (The FOCO Advantage)</span>
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Institutional Moat
                  </span>
                </div>
                {Array.isArray(franchise.advantages) &&
                franchise.advantages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {franchise.advantages.map((adv: any, idx) => {
                      const name = typeof adv === "object" && adv !== null ? adv.name : String(adv);
                      const icon = typeof adv === "object" && adv !== null && adv.icon ? adv.icon : "verified_user";
                      const desc = typeof adv === "object" && adv !== null ? adv.description : null;
                      return (
                        <div
                          key={idx}
                          className="flex items-start space-x-2.5 rounded-lg bg-emerald-500/5 p-3 border border-emerald-500/20"
                        >
                          <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0 mt-0.5">
                            {icon}
                          </span>
                          <div>
                            <span className="text-xs text-foreground font-semibold block">
                              {name}
                            </span>
                            {desc && (
                              <span className="text-[11px] text-muted-foreground block mt-0.5 leading-relaxed">
                                {desc}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No advantage points configured. Edit franchise to add value propositions.
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar Photo & Territory Info */}
            <div className="space-y-6">
              {/* Photo Box */}
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="relative aspect-video w-full bg-secondary">
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={franchise.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Store className="h-8 w-8 stroke-1" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    Featured Visual
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-foreground uppercase">
                      {franchise.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                    <span className="text-muted-foreground">Operating Model</span>
                    <span className="font-semibold text-primary">
                      {franchise.franchiseModel || "FOCO"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                    <span className="text-muted-foreground">Listed Date</span>
                    <span className="text-muted-foreground">
                      {new Date(franchise.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Views</span>
                    <span className="font-semibold text-foreground">
                      {franchise.views || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Territory Dossier */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Expansion Territory</span>
                </h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">City/Region:</strong>{" "}
                    {franchise.location.city}
                  </p>
                  <p>
                    <strong className="text-foreground">Country:</strong>{" "}
                    {franchise.location.country}
                  </p>
                  {franchise.location.community && (
                    <p>
                      <strong className="text-foreground">Micro-market:</strong>{" "}
                      {franchise.location.community}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Media */}
      {activeTab === "media" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Franchise Media & Document Assets
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage hero imagery, interior suites, and PDF investment brochures
              </p>
            </div>
          </div>

          <MediaUploader
            propertyId={franchise.id}
            existingMedia={franchise.media || []}
            onMediaUploaded={(newMedia) => {
              setFranchise((prev) =>
                prev
                  ? {
                      ...prev,
                      media: [...(prev.media || []), newMedia],
                    }
                  : null,
              );
            }}
            onMediaDeleted={(mediaId) => {
              setFranchise((prev) =>
                prev
                  ? {
                      ...prev,
                      media: (prev.media || []).filter((m) => m.id !== mediaId),
                    }
                  : null,
              );
            }}
            onFinish={() => {
              toast.success("Media gallery updated");
            }}
          />
        </motion.div>
      )}

      {/* Tab 3: Inquiries */}
      {activeTab === "inquiries" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Franchise Investor Pipeline
              </h3>
              <p className="text-xs text-muted-foreground">
                Client leads and capital allocation requests specifically tied to {franchise.name}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/inquiries">
                <span>View Full Pipeline</span>
              </Link>
            </Button>
          </div>

          {loadingInquiries ? (
            <div className="py-12 text-center text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
              <p className="text-xs">Loading franchise inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground space-y-2">
              <Inbox className="h-8 w-8 mx-auto text-muted-foreground/40 stroke-1" />
              <p className="text-sm font-medium">No investor inquiries yet</p>
              <p className="text-xs">
                Inquiries submitted on the public franchise dossier will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Investor Name</th>
                    <th className="px-4 py-3 font-semibold">Contact Info</th>
                    <th className="px-4 py-3 font-semibold">Investment Range</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {inq.name}
                      </td>
                      <td className="px-4 py-3.5 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3 text-primary" />
                          <span>{inq.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3 text-primary" />
                          <span>{inq.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-foreground">
                        {inq.investmentRange}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-full bg-primary/10 border border-primary/30 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                          <Link to="/admin/inquiries">Review</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AdminFranchiseDetail;
