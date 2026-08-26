import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Tag,
  Building2,
  Download,
  Clock,
  UserCheck,
  X,
  Plus,
  CheckCircle,
  MessageCircle,
  CalendarCheck,
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

export const AdminInquiriesList: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [expandedTimeline, setExpandedTimeline] = useState<
    Record<string, InquiryTimeline[]>
  >({});
  const [loadingTimeline, setLoadingTimeline] = useState<string | null>(null);

  // Status Update Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [modalStatus, setModalStatus] = useState<InquiryStatus>("NEW");
  const [modalNote, setModalNote] = useState<string>("");
  const [modalFollowUpDate, setModalFollowUpDate] = useState<string>("");
  const [modalFollowUpNotes, setModalFollowUpNotes] = useState<string>("");
  const [isSubmittingModal, setIsSubmittingModal] = useState<boolean>(false);

  // Site Visit Booking Modal State
  const [siteVisitInquiry, setSiteVisitInquiry] = useState<Inquiry | null>(null);
  const [visitPropertyId, setVisitPropertyId] = useState<string>("");
  const [visitDate, setVisitDate] = useState<string>("");
  const [visitTime, setVisitTime] = useState<string>("11:00 AM");
  const [visitNotes, setVisitNotes] = useState<string>("");
  const [isBookingVisit, setIsBookingVisit] = useState<boolean>(false);

  // Load properties for site visit booking dropdown
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
        // quiet error
      }
    };
    loadProps();
  }, []);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get<ApiResponse<Inquiry[]>>("/inquiries", {
        params,
      });

      if (res.data.success) {
        let filtered = res.data.data;
        // Filter for General Callback Inquiries, Contact Form, and Franchise Requests
        filtered = filtered.filter(
          (inq) =>
            !inq.propertyId ||
            inq.source === "CONTACT_FORM" ||
            inq.source === "CHANNEL_PARTNER_FORM" ||
            inq.source === "VAULT_CONCIERGE" ||
            inq.investmentType.toLowerCase() === "franchise",
        );

        if (investmentTypeFilter) {
          filtered = filtered.filter(
            (inq) =>
              inq.investmentType.toLowerCase() ===
              investmentTypeFilter.toLowerCase(),
          );
        }
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
        setInquiries(filtered);
      }
    } catch {
      toast.error("Failed to load client inquiries pipeline");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, investmentTypeFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const clearFilters = () => {
    setStatusFilter("");
    setInvestmentTypeFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

  // Toggle Timeline View
  const toggleTimeline = async (inquiryId: string) => {
    if (expandedRowId === inquiryId) {
      setExpandedRowId(null);
      return;
    }

    setExpandedRowId(inquiryId);

    // If timeline already cached, don't re-fetch
    if (expandedTimeline[inquiryId]) return;

    setLoadingTimeline(inquiryId);
    try {
      const res = await api.get<ApiResponse<InquiryTimeline[]>>(
        `/inquiries/${inquiryId}/timeline`,
      );
      if (res.data.success) {
        const sorted = [...res.data.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setExpandedTimeline((prev) => ({
          ...prev,
          [inquiryId]: sorted,
        }));
      }
    } catch {
      toast.error("Failed to fetch inquiry timeline");
    } finally {
      setLoadingTimeline(null);
    }
  };

  // Open Status Update Modal
  const openStatusModal = (inquiry: Inquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInquiry(inquiry);
    setModalStatus(inquiry.status);
    setModalNote("");
    setModalFollowUpDate(
      inquiry.followUpDate
        ? new Date(inquiry.followUpDate).toISOString().split("T")[0]
        : "",
    );
    setModalFollowUpNotes(inquiry.followUpNotes || "");
  };

  // Submit Status Update Modal
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    setIsSubmittingModal(true);
    try {
      // 1. Update Status
      const statusRes = await api.patch(
        `/inquiries/${selectedInquiry.id}/status`,
        {
          status: modalStatus,
          note: modalNote.trim() || undefined,
        },
      );

      if (!statusRes.data.success) {
        throw new Error("Failed to update status");
      }

      // 2. If follow up date provided, update follow-up
      if (modalFollowUpDate) {
        await api.patch(`/inquiries/${selectedInquiry.id}/follow-up`, {
          followUpDate: new Date(modalFollowUpDate).toISOString(),
          followUpNotes: modalFollowUpNotes.trim() || undefined,
        });
      }

      toast.success("Inquiry status & timeline updated successfully");

      // Refresh timeline cache for this inquiry
      const tlRes = await api.get<ApiResponse<InquiryTimeline[]>>(
        `/inquiries/${selectedInquiry.id}/timeline`,
      );
      if (tlRes.data.success) {
        const sorted = [...tlRes.data.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setExpandedTimeline((prev) => ({
          ...prev,
          [selectedInquiry.id]: sorted,
        }));
      }

      setSelectedInquiry(null);
      fetchInquiries();
    } catch {
      toast.error("Failed to update inquiry status");
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleBookSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteVisitInquiry) return;
    const propertyIdToUse = visitPropertyId || siteVisitInquiry.propertyId || properties[0]?.id;
    if (!propertyIdToUse) {
      toast.error("Please select a target estate for this inspection");
      return;
    }
    if (!visitDate) {
      toast.error("Please select a visit date");
      return;
    }

    setIsBookingVisit(true);
    try {
      const res = await api.post("/site-visits", {
        propertyId: propertyIdToUse,
        name: siteVisitInquiry.name,
        email: siteVisitInquiry.email,
        phone: siteVisitInquiry.phone,
        scheduledDate: visitDate,
        scheduledTime: visitTime,
        visitType: "real-estate-india",
        notes: visitNotes || `Converted from Inquiry (ID: ${siteVisitInquiry.id})`,
      });

      if (res.data.success) {
        // Also update inquiry status to SITE_VISIT_SCHEDULED
        await api.patch(`/inquiries/${siteVisitInquiry.id}/status`, {
          status: "SITE_VISIT_SCHEDULED",
          note: `Site visit scheduled for ${visitDate} at ${visitTime}`,
        });

        toast.success("Site inspection scheduled and inquiry status updated!");
        setSiteVisitInquiry(null);
        fetchInquiries();
      }
    } catch {
      toast.error("Failed to book site visit");
    } finally {
      setIsBookingVisit(false);
    }
  };

  // Client-Side CSV Export
  const exportToCSV = () => {
    if (inquiries.length === 0) {
      toast.error("No inquiries available to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Investment Type",
      "Investment Range",
      "Currency",
      "Project Name",
      "Source",
      "Status",
      "Created At",
    ];

    const rows = inquiries.map((inq) => [
      `"${(inq.name || "").replace(/"/g, '""')}"`,
      `"${(inq.email || "").replace(/"/g, '""')}"`,
      `"${(inq.phone || "").replace(/"/g, '""')}"`,
      `"${(inq.investmentType || "").replace(/"/g, '""')}"`,
      `"${(inq.investmentRange || "").replace(/"/g, '""')}"`,
      `"${inq.currency || "AED"}"`,
      `"${(inq.property?.name || "General Portfolio").replace(/"/g, '""')}"`,
      `"${(inq.source || "WEBSITE").replace(/_/g, " ")}"`,
      `"${inq.status || "NEW"}"`,
      `"${inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `inquiries_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${inquiries.length} inquiries to CSV`);
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "NEW":
        return {
          label: "Pending Callback",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "CONTACTED":
        return {
          label: "Contacted",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        };
      case "CLOSED_WON":
      case "QUALIFIED":
      case "SITE_VISIT_SCHEDULED":
      case "NEGOTIATING":
        return {
          label: "Completed",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "CLOSED_LOST":
        return {
          label: "Closed",
          className: "bg-red-500/10 text-red-400 border-red-500/30",
        };
      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 text-primary/80 mb-1">
            <span className="h-px w-6 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
              Concierge Communications
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Client Callback <span className="font-serif italic text-primary">Inquiries</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage callback requests, WhatsApp conversations, and convert inquiries to in-person site inspections.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInquiries}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-secondary/40 pl-9 text-xs h-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as InquiryStatus | "")
              }
              className="w-full appearance-none rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="NEW">Pending Callback</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED_WON">Completed</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Investment Type Filter */}
          <div className="relative">
            <select
              value={investmentTypeFilter}
              onChange={(e) => setInvestmentTypeFilter(e.target.value)}
              className="w-full appearance-none rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="real-estate">Real Estate</option>
              <option value="franchise">Franchise</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Date Range From */}
          <div>
            <Input
              type="date"
              title="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-secondary/40 text-xs h-9"
            />
          </div>

          {/* Date Range To & Clear */}
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              title="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-secondary/40 text-xs h-9 flex-1"
            />
            {(statusFilter ||
              investmentTypeFilter ||
              dateFrom ||
              dateTo ||
              search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="shrink-0 text-xs h-9"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Client Details</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Category & Budget</th>
                <th className="py-3 px-4">Target Property</th>
                <th className="py-3 px-4">Status & Follow-up</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                    <p>Loading inquiries pipeline...</p>
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No client inquiries match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => {
                  const isExpanded = expandedRowId === inquiry.id;
                  const timeline = expandedTimeline[inquiry.id] || [];

                  return (
                    <React.Fragment key={inquiry.id}>
                      <tr
                        onClick={() => toggleTimeline(inquiry.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? "bg-secondary/40" : "hover:bg-secondary/20"
                        }`}
                      >
                        {/* Expand Icon */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>

                        {/* Name & Source */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground">
                            {inquiry.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                            <Tag className="h-2.5 w-2.5 text-primary" />
                            <span>{(inquiry.source || "WEBSITE").replace(/_/g, " ")}</span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] space-y-0.5 text-muted-foreground">
                            <div className="flex items-center space-x-1 text-foreground/90">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{inquiry.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{inquiry.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Budget */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-foreground capitalize">
                            {(inquiry.investmentType || "").replace(/-/g, " ")}
                          </div>
                          <div className="font-mono text-[11px] font-bold text-primary">
                            {inquiry.currency || "AED"} {inquiry.investmentRange || "-"}
                          </div>
                        </td>

                        {/* Target Property */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-foreground flex items-center space-x-1.5">
                            <Building2 className="h-3.5 w-3.5 text-primary" />
                            <span>
                              {inquiry.property?.name || "General Portfolio"}
                            </span>
                          </div>
                          {inquiry.property?.location && (
                            <span className="text-[10px] text-muted-foreground">
                              {inquiry.property.location.city},{" "}
                              {inquiry.property.location.country}
                            </span>
                          )}
                        </td>

                        {/* Status & Follow-Up */}
                        <td className="py-3.5 px-4">
                          {(() => {
                            const badgeInfo = getStatusBadge(inquiry.status);
                            return (
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badgeInfo.className}`}
                              >
                                {badgeInfo.label}
                              </span>
                            );
                          })()}
                          {inquiry.followUpDate && (
                            <div className="mt-1 flex items-center space-x-1 text-[10px] text-primary">
                              <Clock className="h-3 w-3" />
                              <span>
                                Follow-up:{" "}
                                {new Date(
                                  inquiry.followUpDate,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp Button */}
                            <a
                              href={`https://wa.me/${(inquiry.phone || "").replace(/[^0-9+]/g, "").replace("+", "")}?text=${encodeURIComponent(
                                `Hello ${inquiry.name}, thank you for contacting Vilaasa Estates. How may our private wealth concierge assist your inquiry today?`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 w-7 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                              title="WhatsApp Client"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>

                            {/* Book Site Visit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSiteVisitInquiry(inquiry);
                                setVisitPropertyId(inquiry.propertyId || (properties[0]?.id || ""));
                                setVisitDate("");
                                setVisitTime("11:00 AM");
                                setVisitNotes("");
                              }}
                              className="h-7 px-2 text-[10px] border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-semibold"
                              title="Book In-Person Site Visit"
                            >
                              <CalendarCheck className="h-3 w-3 mr-1" />
                              Book Visit
                            </Button>

                            {/* Update Status Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => openStatusModal(inquiry, e)}
                              className="text-[11px] h-7 px-2.5 uppercase tracking-wider font-semibold"
                            >
                              Status
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Timeline Row */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={7}
                            className="bg-secondary/20 p-4 border-y border-border"
                          >
                            <div className="space-y-3 pl-8">
                              <div className="flex items-center justify-between border-b border-border pb-2">
                                <h4 className="text-xs font-semibold text-foreground flex items-center space-x-1.5 uppercase tracking-wider">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                  <span>Activity Timeline & Audit History</span>
                                </h4>
                                <span className="text-[11px] text-muted-foreground">
                                  Inquiry ID: {inquiry.id}
                                </span>
                              </div>

                              {loadingTimeline === inquiry.id ? (
                                <div className="py-4 text-xs text-muted-foreground flex items-center space-x-2">
                                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                                  <span>Loading timeline history...</span>
                                </div>
                              ) : timeline.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-2 italic">
                                  No status transitions logged yet.
                                </p>
                              ) : (
                                <div className="space-y-3 border-l-2 border-primary/30 pl-4 my-2">
                                  {timeline.map((item) => (
                                    <div
                                      key={item.id}
                                      className="relative text-xs space-y-1"
                                    >
                                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusBadge(
                                            item.toStatus as InquiryStatus,
                                          )}`}
                                        >
                                          {item.toStatus.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                          {new Date(
                                            item.createdAt,
                                          ).toLocaleString()}
                                        </span>
                                        {item.changedByName && (
                                          <span className="text-[10px] text-primary">
                                            by {item.changedByName}
                                          </span>
                                        )}
                                      </div>
                                      {item.note && (
                                        <p className="text-[11px] text-foreground/90 bg-card p-2 rounded-md border border-border mt-1">
                                          {item.note}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleStatusSubmit}
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Update Lead Pipeline Status
                </h3>
                <p className="text-xs text-muted-foreground">
                  Client: <strong className="text-foreground">{selectedInquiry.name}</strong> •{" "}
                  {selectedInquiry.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status Selector */}
              <div className="space-y-1">
                <Label className="text-xs">Select Inquiry Status *</Label>
                <select
                  value={modalStatus}
                  onChange={(e) =>
                    setModalStatus(e.target.value as InquiryStatus)
                  }
                  className="w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="NEW">Pending Callback</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED_WON">Completed</option>
                  <option value="CLOSED_LOST">Closed / Cancelled</option>
                </select>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <Label className="text-xs">Timeline Transition Note (Optional)</Label>
                <textarea
                  rows={3}
                  placeholder="e.g. Conducted advisory call, investor requesting private chauffeur for Dubai Marina penthouse tour."
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="w-full rounded-md border border-input bg-secondary/50 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Follow-up Date & Notes */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-border">
                <div className="space-y-1">
                  <Label className="text-xs">Schedule Follow-up Date</Label>
                  <Input
                    type="date"
                    value={modalFollowUpDate}
                    onChange={(e) => setModalFollowUpDate(e.target.value)}
                    className="bg-secondary/50 h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Follow-up Objective</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Send updated term sheet"
                    value={modalFollowUpNotes}
                    onChange={(e) => setModalFollowUpNotes(e.target.value)}
                    className="bg-secondary/50 h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedInquiry(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingModal}
              >
                {isSubmittingModal ? "Saving Changes..." : "Save Pipeline Update"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Book Site Visit Modal */}
      {siteVisitInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-purple-500/5">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-purple-400" />
                <h3 className="text-sm font-medium text-foreground">
                  Book In-Person Site Inspection
                </h3>
              </div>
              <button
                onClick={() => setSiteVisitInquiry(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBookSiteVisit} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-secondary/40 border border-border text-xs space-y-1">
                <div className="text-muted-foreground">
                  Client: <span className="text-foreground font-medium">{siteVisitInquiry.name}</span> ({siteVisitInquiry.phone})
                </div>
                <div className="text-muted-foreground">
                  Email: <span className="text-foreground font-medium">{siteVisitInquiry.email}</span>
                </div>
              </div>

              {/* Target Property */}
              <div className="space-y-1">
                <Label className="text-xs">Select Target Estate *</Label>
                <select
                  value={visitPropertyId}
                  onChange={(e) => setVisitPropertyId(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-input text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visit Date */}
              <div className="space-y-1">
                <Label className="text-xs">Inspection Date *</Label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="bg-secondary/50 h-9 text-xs"
                />
              </div>

              {/* Time Slot */}
              <div className="space-y-1">
                <Label className="text-xs">Inspection Time Slot *</Label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full h-9 px-3 rounded-md bg-secondary/50 border border-input text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="10:00 AM">10:00 AM (Morning Tour)</option>
                  <option value="11:00 AM">11:00 AM (Executive Preview)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Viewing)</option>
                  <option value="04:00 PM">04:00 PM (Sunset Viewing)</option>
                  <option value="06:00 PM">06:00 PM (Evening Tour)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label className="text-xs">Concierge &amp; Itinerary Notes (Optional)</Label>
                <textarea
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="e.g. Arrange private airport transfer and champagne welcome..."
                  rows={2}
                  className="w-full p-2.5 rounded-md bg-secondary/50 border border-input text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSiteVisitInquiry(null)}
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
          </div>
        </div>
      )}
    </motion.div>
  );
};
