import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { SiteVisit, Property, ApiResponse } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdminSiteVisits: React.FC = () => {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Confirm Action Dialog
  const [actionDialog, setActionDialog] = useState<{
    visit: SiteVisit;
    newStatus: "COMPLETED" | "CANCELLED";
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Side Panel: Available Slots Checker
  const [showSlotsDrawer, setShowSlotsDrawer] = useState<boolean>(false);
  const [checkerPropertyId, setCheckerPropertyId] = useState<string>("");
  const [checkerDate, setCheckerDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [slotsData, setSlotsData] = useState<{
    allSlots: string[];
    bookedSlots: string[];
    availableSlots: string[];
  } | null>(null);

  // Fetch properties for filter & slot checker
  useEffect(() => {
    const loadProperties = async () => {
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
    loadProperties();
  }, []);

  const fetchSiteVisits = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 20,
      };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get<ApiResponse<SiteVisit[]>>("/site-visits", {
        params,
      });

      if (res.data.success) {
        let list = res.data.data;
        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          list = list.filter(
            (v) => new Date(v.scheduledDate).getTime() >= from,
          );
        }
        if (dateTo) {
          const to = new Date(dateTo).setHours(23, 59, 59, 999);
          list = list.filter((v) => new Date(v.scheduledDate).getTime() <= to);
        }

        setVisits(list);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages || 1);
          setTotalCount(res.data.meta.total || list.length);
        } else {
          setTotalPages(Math.ceil(list.length / 20) || 1);
          setTotalCount(list.length);
        }
      }
    } catch {
      toast.error("Failed to load site inspection bookings");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchSiteVisits();
  }, [fetchSiteVisits]);

  // Update Status Action
  const handleUpdateStatus = async () => {
    if (!actionDialog) return;

    setIsProcessingAction(true);
    try {
      const res = await api.patch(
        `/site-visits/${actionDialog.visit.id}/status`,
        {
          status: actionDialog.newStatus,
        },
      );

      if (res.data.success) {
        toast.success(
          `Site visit marked as ${actionDialog.newStatus.toLowerCase()} successfully`,
        );
        setActionDialog(null);
        fetchSiteVisits();
      }
    } catch {
      toast.error("Failed to update site visit status");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Check Slots
  const handleCheckSlots = async () => {
    if (!checkerDate) {
      toast.error("Please pick a date to check available slots");
      return;
    }

    setSlotsLoading(true);
    try {
      const params: Record<string, string> = { date: checkerDate };
      if (checkerPropertyId) params.propertyId = checkerPropertyId;

      const res = await api.get<
        ApiResponse<{
          allSlots: string[];
          bookedSlots: string[];
          availableSlots: string[];
        }>
      >("/site-visits/slots", { params });

      if (res.data.success) {
        setSlotsData(res.data.data);
      }
    } catch {
      toast.error("Failed to check inspection slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "NO_SHOW":
      default:
        return "bg-muted text-muted-foreground border-border";
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
              Concierge Itinerary
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Private Estate <span className="font-serif italic text-primary">Site Inspections</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage scheduled VIP visits, check real-time calendar slot availability, and track inspection outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowSlotsDrawer(true);
              handleCheckSlots();
            }}
            className="gap-1.5 text-xs"
          >
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Check Slot Availability</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchSiteVisits}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search visitor, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-secondary/40 pl-9 text-xs h-9"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="">All Inspection Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
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
            {(statusFilter || dateFrom || dateTo || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("");
                  setDateFrom("");
                  setDateTo("");
                  setSearch("");
                }}
                className="shrink-0 text-xs h-9"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Site Visits Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Estate / Property</th>
                <th className="py-3 px-4">Scheduled Date & Time</th>
                <th className="py-3 px-4">Visit Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                    <p>Loading scheduled inspections...</p>
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No site visits match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    {/* Visitor Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground flex items-center space-x-2">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{visit.name}</span>
                      </div>
                      {visit.notes && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 max-w-xs truncate">
                          Note: {visit.notes}
                        </p>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] space-y-0.5 text-muted-foreground">
                        <div className="flex items-center space-x-1 text-foreground/90">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{visit.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{visit.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Property */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground flex items-center space-x-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {visit.property?.name || "General Property Dossier"}
                        </span>
                      </div>
                      {visit.property?.location && (
                        <span className="text-[10px] text-muted-foreground">
                          {visit.property.location.city},{" "}
                          {visit.property.location.country}
                        </span>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-foreground font-semibold flex items-center space-x-1.5">
                        <CalendarIcon className="h-3 w-3 text-primary" />
                        <span>
                          {new Date(visit.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{visit.scheduledTime}</span>
                      </div>
                    </td>

                    {/* Visit Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                        {visit.visitType.replace(/-/g, " ")}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                          visit.status,
                        )}`}
                      >
                        {visit.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {visit.status === "CONFIRMED" ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              setActionDialog({
                                visit,
                                newStatus: "COMPLETED",
                              })
                            }
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              setActionDialog({
                                visit,
                                newStatus: "CANCELLED",
                              })
                            }
                            className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            title="Mark as Cancelled"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60 italic">
                          Archived
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground bg-secondary/20">
          <div>
            Showing <span className="font-semibold text-foreground">{visits.length}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> site inspections
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <span className="font-mono text-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-base font-semibold text-foreground">
              Confirm Status Change
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to mark the private inspection for{" "}
              <strong className="text-foreground">{actionDialog.visit.name}</strong>{" "}
              at{" "}
              <strong className="text-primary">
                {actionDialog.visit.property?.name || "Estate"}
              </strong>{" "}
              as{" "}
              <strong
                className={
                  actionDialog.newStatus === "COMPLETED"
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {actionDialog.newStatus}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActionDialog(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUpdateStatus}
                disabled={isProcessingAction}
                variant={actionDialog.newStatus === "COMPLETED" ? "default" : "destructive"}
              >
                {isProcessingAction ? "Updating..." : `Yes, Confirm`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Side Panel: Available Slots Checker Drawer */}
      {showSlotsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="relative h-full w-full max-w-md border-l border-border bg-card p-6 shadow-2xl space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Slot Availability Checker
                  </h3>
                </div>
                <button
                  onClick={() => setShowSlotsDrawer(false)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs">
                    Select Property (Optional)
                  </Label>
                  <select
                    value={checkerPropertyId}
                    onChange={(e) => setCheckerPropertyId(e.target.value)}
                    className="w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">-- All Properties & Estates --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    Target Inspection Date
                  </Label>
                  <Input
                    type="date"
                    value={checkerDate}
                    onChange={(e) => setCheckerDate(e.target.value)}
                    className="bg-secondary/50 text-xs h-9"
                  />
                </div>

                <Button
                  onClick={handleCheckSlots}
                  disabled={slotsLoading}
                  className="w-full"
                >
                  {slotsLoading ? "Checking Slots..." : "Fetch Real-Time Slots"}
                </Button>
              </div>

              {/* Results View */}
              {slotsData && (
                <div className="space-y-4 border-t border-border pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Schedule for {new Date(checkerDate).toLocaleDateString()}
                  </h4>

                  {/* Available Chips */}
                  <div className="space-y-2">
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        Available Inspection Slots (
                        {slotsData.availableSlots.length})
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slotsData.availableSlots.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 italic">
                          No available slots for this date.
                        </p>
                      ) : (
                        slotsData.availableSlots.map((slot) => (
                          <span
                            key={slot}
                            className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400"
                          >
                            {slot}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Booked Chips */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] text-red-400 font-semibold flex items-center space-x-1">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>
                        Booked Slots ({slotsData.bookedSlots.length})
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slotsData.bookedSlots.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 italic">
                          No booked slots on this date.
                        </p>
                      ) : (
                        slotsData.bookedSlots.map((slot) => (
                          <span
                            key={slot}
                            className="inline-flex items-center rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 line-through opacity-75"
                          >
                            {slot}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowSlotsDrawer(false)}
              className="w-full"
            >
              Close Panel
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
