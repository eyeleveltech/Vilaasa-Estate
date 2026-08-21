import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Building2,
  Clock,
  User,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  X,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAdminProperties } from "../../admin/hooks/useAdminProperties";
import { SiteVisit, ApiResponse } from "../../admin/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PartnerSiteVisits: React.FC = () => {
  const { properties, fetchProperties } = useAdminProperties();
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // New Booking Form State
  const [formData, setFormData] = useState({
    propertyId: "",
    name: "",
    email: "",
    phone: "",
    scheduledDate: "",
    scheduledTime: "11:00 AM",
    visitType: "real-estate",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<SiteVisit[]>>("/site-visits");
      if (res.data.success) {
        setSiteVisits(res.data.data);
      }
    } catch {
      toast.error("Failed to load site inspections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
    fetchProperties({ limit: 50 });
  }, [fetchVisits, fetchProperties]);

  const handleBookVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.name || !formData.email || !formData.scheduledDate) {
      toast.error("Please fill in all mandatory booking fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/site-visits", formData);
      if (res.data.success) {
        toast.success("Private inspection itinerary booked successfully");
        setModalOpen(false);
        setFormData({
          propertyId: "",
          name: "",
          email: "",
          phone: "",
          scheduledDate: "",
          scheduledTime: "11:00 AM",
          visitType: "real-estate",
          notes: "",
        });
        fetchVisits();
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to book site visit";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
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
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
            <span className="h-px w-5 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
              VIP Accompaniment
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Client Site <span className="font-serif italic text-primary">Inspections</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Coordinate private helicopter transfers, chauffeur escorts, and on-site walkthroughs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="gap-2 text-xs uppercase tracking-wider font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Book VIP Inspection</span>
          </Button>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Property Asset</th>
                <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                    <p>Loading scheduled inspections...</p>
                  </td>
                </tr>
              ) : siteVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No site visits scheduled yet. Click "Book VIP Inspection" to schedule.
                  </td>
                </tr>
              ) : (
                siteVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div>{visit.name}</div>
                      {visit.notes && (
                        <div className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                          {visit.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">
                        {visit.property?.name || "General Property"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {visit.property?.location?.city || "Prime Location"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{new Date(visit.scheduledDate).toLocaleDateString()}</div>
                      <div className="text-[10px] text-muted-foreground">{visit.scheduledTime}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{visit.phone || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">{visit.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadge(visit.status)}`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-400" />
                <span>Book VIP Client Site Inspection</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBookVisit} className="space-y-4">
              {/* Target Property */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Property *
                </Label>
                <select
                  required
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select an Estate...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location?.city || "Dubai"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client Full Name *
                </Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lord Sterling"
                  className="bg-secondary/40 text-xs h-9"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Client Email *
                  </Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@familyoffice.com"
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone / WhatsApp
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Inspection Date *
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Time Slot
                  </Label>
                  <select
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-9"
                  >
                    <option value="09:00 AM">09:00 AM (Morning Tour)</option>
                    <option value="11:00 AM">11:00 AM (Midday Briefing)</option>
                    <option value="02:30 PM">02:30 PM (Afternoon Tour)</option>
                    <option value="05:00 PM">05:00 PM (Sunset Inspection)</option>
                  </select>
                </div>
              </div>

              {/* VIP Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Special Protocols / Chauffeur Requests
                </Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Requires private chauffeur pickup from hotel"
                  className="bg-secondary/40 text-xs h-9"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="gap-2 text-xs uppercase tracking-wider font-semibold"
                >
                  <span>{submitting ? "Booking Itinerary..." : "Confirm Inspection"}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
