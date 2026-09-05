import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Search,
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  CalendarCheck,
  Building2,
  Download,
  Clock,
  UserCheck,
  X,
  Plus,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Inquiry,
  InquiryStatus,
  InquiryTimeline,
  Property,
  ApiResponse,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_COLORS: Record<InquiryStatus, { bg: string; text: string; border: string }> = {
  NEW: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  CONTACTED: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  QUALIFIED: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  SITE_VISIT_SCHEDULED: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  NEGOTIATING: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  CLOSED_WON: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  CLOSED_LOST: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
};

const ALL_STATUSES: InquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "SITE_VISIT_SCHEDULED",
  "NEGOTIATING",
  "CLOSED_WON",
  "CLOSED_LOST",
];

export const AdminPropertyViewingsList: React.FC = () => {
  const [viewings, setViewings] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 20;

  // Status / Note Modal State
  const [selectedViewing, setSelectedViewing] = useState<Inquiry | null>(null);
  const [modalStatus, setModalStatus] = useState<InquiryStatus>("NEW");
  const [modalNote, setModalNote] = useState<string>("");
  const [modalFollowUpDate, setModalFollowUpDate] = useState<string>("");
  const [modalFollowUpNotes, setModalFollowUpNotes] = useState<string>("");
  const [isSubmittingModal, setIsSubmittingModal] = useState<boolean>(false);

  // Quick Site Visit Modal State
  const [siteVisitViewing, setSiteVisitViewing] = useState<Inquiry | null>(null);
  const [visitDate, setVisitDate] = useState<string>("");
  const [visitTime, setVisitTime] = useState<string>("11:00 AM");
  const [visitNotes, setVisitNotes] = useState<string>("");
  const [isBookingVisit, setIsBookingVisit] = useState<boolean>(false);

  // Fetch properties for filter dropdown
  useEffect(() => {
    const loadProps = async () => {
      try {
        const res = await api.get<ApiResponse<Property[]>>("/properties", {
          params: { limit: 100 },
        });
        if (res.data.success) {
          setProperties(res.data.data);
        }
      } catch {
        // quiet fallback
      }
    };
    loadProps();
  }, []);

  const fetchViewingRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        investmentType: "real-estate",
      };
      if (statusFilter) params.status = statusFilter;
      if (selectedPropertyId) params.propertyId = selectedPropertyId;
      if (search.trim()) params.search = search.trim();

      const res = await api.get<ApiResponse<Inquiry[]>>("/inquiries", {
        params,
      });

      if (res.data.success) {
        let filtered = res.data.data;
        // Strictly filter for records where a specific property was viewed/unlocked
        filtered = filtered.filter(
          (inq) =>
            Boolean(inq.propertyId) ||
            Boolean(inq.property) ||
            inq.source === "PROPERTY_DETAIL",
        );

        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          filtered = filtered.filter(
            (inq) => new Date(inq.createdAt).getTime() >= from,
          );
        }
        if (dateTo) {
          const to = new Date(dateTo).setHours(23, 59, 59, 999);
          filtered = filtered.filter(
            (inq) => new Date(inq.createdAt).getTime() <= to,
          );
        }
        setViewings(filtered);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages || 1);
          setTotalCount(res.data.meta.total || filtered.length);
        } else {
          setTotalPages(Math.ceil(filtered.length / limit) || 1);
          setTotalCount(filtered.length);
        }
      }
    } catch {
      toast.error("Failed to load property viewing records");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, selectedPropertyId, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchViewingRecords();
  }, [fetchViewingRecords]);

  // Compute key summary metrics
  const metrics = useMemo(() => {
    const total = viewings.length;
    const today = new Date().toDateString();
    const todayCount = viewings.filter(
      (v) => new Date(v.createdAt).toDateString() === today,
    ).length;

    // Property frequency
    const propCount: Record<string, { count: number; name: string }> = {};
    viewings.forEach((v) => {
      if (v.property?.name) {
        if (!propCount[v.property.name]) {
          propCount[v.property.name] = { count: 0, name: v.property.name };
        }
        propCount[v.property.name].count += 1;
      }
    });
    const sortedProps = Object.values(propCount).sort((a, b) => b.count - a.count);
    const topProperty = sortedProps[0]?.name || "N/A";

    const scheduled = viewings.filter(
      (v) => v.status === "SITE_VISIT_SCHEDULED" || Boolean(v.followUpDate),
    ).length;

    return { total, todayCount, topProperty, scheduled };
  }, [viewings]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViewing) return;

    setIsSubmittingModal(true);
    try {
      const res = await api.patch<ApiResponse<Inquiry>>(
        `/inquiries/${selectedViewing.id}/status`,
        {
          status: modalStatus,
          notes: modalNote.trim() || undefined,
        },
      );

      if (modalFollowUpDate) {
        await api.post(`/inquiries/${selectedViewing.id}/follow-up`, {
          followUpDate: modalFollowUpDate,
          followUpNotes: modalFollowUpNotes.trim() || undefined,
        });
      }

      if (res.data.success) {
        toast.success("Viewing record updated successfully");
        setSelectedViewing(null);
        fetchViewingRecords();
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleBookSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteVisitViewing || !siteVisitViewing.propertyId) {
      toast.error("Property information missing on this record");
      return;
    }
    if (!visitDate) {
      toast.error("Please select an inspection date");
      return;
    }

    setIsBookingVisit(true);
    try {
      const res = await api.post("/site-visits", {
        propertyId: siteVisitViewing.propertyId,
        name: siteVisitViewing.name,
        email: siteVisitViewing.email,
        phone: siteVisitViewing.phone,
        scheduledDate: visitDate,
        scheduledTime: visitTime,
        visitType: "real-estate-india",
        notes: visitNotes || `Converted from Property Viewing unlock (Inquiry ID: ${siteVisitViewing.id})`,
        inquiryId: siteVisitViewing.id,
      });

      if (res.data.success) {
        // Also update the viewing status to SITE_VISIT_SCHEDULED
        await api.patch(`/inquiries/${siteVisitViewing.id}/status`, {
          status: "SITE_VISIT_SCHEDULED",
          notes: `Site visit scheduled for ${visitDate} at ${visitTime}`,
        });

        toast.success("Site inspection scheduled and client record linked!");
        setSiteVisitViewing(null);
        fetchViewingRecords();
      }
    } catch {
      toast.error("Failed to book site visit");
    } finally {
      setIsBookingVisit(false);
    }
  };

  const exportCSV = () => {
    if (viewings.length === 0) {
      toast.error("No viewing records to export");
      return;
    }

    const headers = [
      "ID",
      "Property Name",
      "Property City",
      "Client Name",
      "Email",
      "Phone",
      "Budget Range",
      "Status",
      "Unlocked Date",
    ];

    const rows = viewings.map((v) => [
      v.id,
      `"${v.property?.name || "General Property"}"`,
      `"${v.property?.location?.city || "N/A"}"`,
      `"${v.name}"`,
      `"${v.email}"`,
      `"${v.phone}"`,
      `"${v.investmentRange}"`,
      `"${v.status}"`,
      `"${new Date(v.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vilaasa-property-viewings-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Property viewing records exported");
  };

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-wide text-foreground">
                Property Viewing Records
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-sans">
                Real-time logs of visitors who verified OTP to unlock and view estate dossiers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="border-border/60 hover:bg-accent/40 font-sans"
          >
            <Download className="mr-2 h-4 w-4 text-emerald-400" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchViewingRecords}
            disabled={loading}
            className="border-border/60 hover:bg-accent/40 font-sans"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Total Unlocked</span>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-light text-foreground">{metrics.total}</span>
            <span className="text-xs text-muted-foreground ml-2 font-sans">Verified Leads</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Today's Unlocks</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-light text-foreground">{metrics.todayCount}</span>
            <span className="text-xs text-muted-foreground ml-2 font-sans">New Today</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Top Viewed Estate</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-medium text-foreground truncate block">{metrics.topProperty}</span>
            <span className="text-xs text-muted-foreground font-sans">Highest Engagement</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Scheduled Next Steps</span>
            <CalendarCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-light text-foreground">{metrics.scheduled}</span>
            <span className="text-xs text-muted-foreground ml-2 font-sans">Active Follow-ups</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4 space-y-4 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client, email, estate..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-background/50 border-border/60 text-sm"
            />
          </div>

          {/* Property Filter */}
          <div>
            <select
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md bg-background/50 border border-border/60 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Estates &amp; Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as InquiryStatus | "");
                setPage(1);
              }}
              className="w-full h-10 px-3 rounded-md bg-background/50 border border-border/60 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Pipeline Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="bg-background/50 border-border/60 text-xs"
              title="From date"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="bg-background/50 border-border/60 text-xs"
              title="To date"
            />
          </div>
        </div>

        {(search || selectedPropertyId || statusFilter || dateFrom || dateTo) && (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedPropertyId("");
                setStatusFilter("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-7"
            >
              <X className="mr-1 h-3 w-3" /> Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Main Table (desktop) */}
      <div className="hidden md:block rounded-xl border border-border/50 bg-card/20 backdrop-blur-md overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              <tr>
                <th className="py-3.5 px-4">Estate Unlocked</th>
                <th className="py-3.5 px-4">Visitor / Client</th>
                <th className="py-3.5 px-4">Budget Range</th>
                <th className="py-3.5 px-4">Viewing Date &amp; Time</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading viewing records...
                  </td>
                </tr>
              ) : viewings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No property viewing records found.
                  </td>
                </tr>
              ) : (
                viewings.map((viewing) => {
                  const statusStyle = STATUS_COLORS[viewing.status] || STATUS_COLORS.NEW;
                  const propertyThumbnail = viewing.property?.media?.[0]?.url;

                  return (
                    <tr
                      key={viewing.id}
                      className="hover:bg-accent/20 transition-colors group"
                    >
                      {/* Property Unlocked */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-background border border-border/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {propertyThumbnail ? (
                              <img
                                src={propertyThumbnail}
                                alt={viewing.property?.name || "Estate"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-emerald-400/60" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block group-hover:text-primary transition-colors">
                              {viewing.property?.name || "Vilaasa Estate Portfolio"}
                            </span>
                            {viewing.property?.location && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 text-muted-foreground/70" />
                                {viewing.property.location.city}, {viewing.property.location.country}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">{viewing.name}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> OTP Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <a
                              href={`mailto:${viewing.email}`}
                              className="hover:text-primary transition-colors flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" /> {viewing.email}
                            </a>
                            <button
                              onClick={() => handleCopy(viewing.email, `email-${viewing.id}`)}
                              className="text-muted-foreground/50 hover:text-muted-foreground"
                              title="Copy email"
                            >
                              {copiedId === `email-${viewing.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {viewing.phone}
                          </div>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/50 border border-border/50 text-foreground">
                          {viewing.investmentRange || "Undisclosed"}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="text-xs text-foreground block">
                            {new Date(viewing.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[11px] text-muted-foreground block font-mono">
                            {new Date(viewing.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedViewing(viewing);
                            setModalStatus(viewing.status);
                            setModalNote("");
                            setModalFollowUpDate(
                              viewing.followUpDate ? viewing.followUpDate.split("T")[0] : "",
                            );
                            setModalFollowUpNotes(viewing.followUpNotes || "");
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} hover:opacity-80 transition-opacity`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {viewing.status.replace(/_/g, " ")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="flex items-center justify-between border-t border-border/50 px-5 py-3.5 text-xs text-muted-foreground bg-card/40">
          <div className="flex items-center space-x-2">
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {viewings.length}
              </span>{" "}
              of <span className="font-semibold text-foreground">{totalCount}</span>{" "}
              records
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="px-2 border-border/60"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="px-2 border-border/60"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View (viewing records) */}
      <div className="md:hidden space-y-3 font-sans">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
            <span className="text-xs">Loading viewing records...</span>
          </div>
        ) : viewings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-2 text-muted-foreground">
            <Eye className="h-8 w-8 opacity-30" />
            <p className="text-sm">No property viewing records found.</p>
          </div>
        ) : (
          viewings.map((viewing) => {
            const statusStyle = STATUS_COLORS[viewing.status] || STATUS_COLORS.NEW;
            const propertyThumbnail = viewing.property?.media?.[0]?.url;
            return (
              <div key={viewing.id} className="rounded-xl border border-border/50 bg-card/20 backdrop-blur-md p-4 space-y-3">
                {/* Property + Client header */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-background border border-border/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {propertyThumbnail ? (
                      <img src={propertyThumbnail} alt={viewing.property?.name || "Estate"} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5 text-emerald-400/60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm truncate">{viewing.property?.name || "Vilaasa Estate Portfolio"}</p>
                    {viewing.property?.location && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{viewing.property.location.city}, {viewing.property.location.country}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedViewing(viewing);
                      setModalStatus(viewing.status);
                      setModalNote("");
                      setModalFollowUpDate(viewing.followUpDate ? viewing.followUpDate.split("T")[0] : "");
                      setModalFollowUpNotes(viewing.followUpNotes || "");
                    }}
                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} hover:opacity-80`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {viewing.status.replace(/_/g, " ")}
                  </button>
                </div>

                {/* Client + Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Client</p>
                    <p className="font-medium text-foreground mt-0.5">{viewing.name}</p>
                    <p className="text-muted-foreground text-[10px]">{viewing.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Budget</p>
                    <p className="font-medium text-foreground mt-0.5">{viewing.investmentRange || "Undisclosed"}</p>
                    <p className="text-muted-foreground text-[10px]">{new Date(viewing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        <div className="flex items-center justify-between border border-border/50 rounded-xl px-4 py-3 text-xs text-muted-foreground bg-card/40 mt-3">
          <div className="flex flex-col">
            <span>{viewings.length} of {totalCount} records</span>
            <span className="font-mono">Page {page} of {totalPages}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="px-2 border-border/60"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="px-2 border-border/60"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal 1: Update Status & Private Notes */}
      <AnimatePresence>
        {selectedViewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden font-sans"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-lg font-medium text-foreground">
                  Update Viewing Record Status
                </h3>
                <button
                  onClick={() => setSelectedViewing(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Client &amp; Estate
                  </Label>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {selectedViewing.name} • {selectedViewing.property?.name || "Portfolio"}
                  </p>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Pipeline Stage
                  </Label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as InquiryStatus)}
                    className="w-full mt-1.5 h-10 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Internal Concierge Note (Optional)
                  </Label>
                  <textarea
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="e.g., Client requested video walkthrough of the penthouse..."
                    rows={3}
                    className="w-full mt-1.5 p-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Follow-up Date
                    </Label>
                    <Input
                      type="date"
                      value={modalFollowUpDate}
                      onChange={(e) => setModalFollowUpDate(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedViewing(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingModal}
                    className="bg-primary text-primary-foreground"
                  >
                    {isSubmittingModal ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Convert to Site Visit */}
      <AnimatePresence>
        {siteVisitViewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden font-sans"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-purple-500/5">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-medium text-foreground">
                    Book In-Person Site Visit
                  </h3>
                </div>
                <button
                  onClick={() => setSiteVisitViewing(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleBookSiteVisit} className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-background/50 border border-border/60 text-xs space-y-1">
                  <div className="text-muted-foreground">
                    Client: <span className="text-foreground font-medium">{siteVisitViewing.name}</span> ({siteVisitViewing.phone})
                  </div>
                  <div className="text-muted-foreground">
                    Property: <span className="text-purple-400 font-medium">{siteVisitViewing.property?.name || "Vilaasa Estate"}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Visit Date *
                  </Label>
                  <Input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Time Slot *
                  </Label>
                  <select
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full mt-1.5 h-10 px-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="10:00 AM">10:00 AM (Morning Tour)</option>
                    <option value="11:00 AM">11:00 AM (Executive Preview)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon Viewing)</option>
                    <option value="04:00 PM">04:00 PM (Sunset Viewing)</option>
                    <option value="06:00 PM">06:00 PM (Evening Tour)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    Visit Notes (Optional)
                  </Label>
                  <textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="e.g., Client requested VIP chauffeur pick up from airport..."
                    rows={2}
                    className="w-full mt-1.5 p-3 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSiteVisitViewing(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isBookingVisit}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isBookingVisit ? "Scheduling..." : "Confirm Site Visit"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPropertyViewingsList;
