import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  UserPlus,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  X,
  Clock,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAdminProperties } from "../../admin/hooks/useAdminProperties";
import { Inquiry, ApiResponse } from "../../admin/types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const PartnerLeads: React.FC = () => {
  const { properties, fetchProperties } = useAdminProperties();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // New Lead Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    investmentType: "real-estate",
    investmentRange: "$5M - $10M",
    currency: "AED",
    propertyId: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Inquiry[]>>("/inquiries");
      if (res.data.success) {
        setInquiries(res.data.data);
      }
    } catch {
      toast.error("Failed to load client inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
    fetchProperties({ limit: 50 });
  }, [fetchInquiries, fetchProperties]);

  const handleRegisterLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in client contact information");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/inquiries", {
        ...formData,
        source: "CHANNEL_PARTNER_FORM",
      });
      if (res.data.success) {
        toast.success("VIP Client registered with priority partner tag");
        setModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          investmentType: "real-estate",
          investmentRange: "$5M - $10M",
          currency: "AED",
          propertyId: "",
          notes: "",
        });
        fetchInquiries();
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to register VIP lead";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CONTACTED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "QUALIFIED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "SITE_VISIT_SCHEDULED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "CLOSED_WON":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
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
              Institutional CRM
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Client Inquiries &amp; <span className="font-serif italic text-primary">Leads</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Register prospective high-net-worth buyers and protect your broker commission lock-in
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="gap-2 text-xs uppercase tracking-wider font-semibold"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register VIP Lead</span>
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Target Estate</th>
                <th className="py-3 px-4 font-semibold">Budget Tier</th>
                <th className="py-3 px-4 font-semibold">Contact Info</th>
                <th className="py-3 px-4 text-right font-semibold">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                    <p>Loading client pipeline...</p>
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No client leads registered yet. Click "Register VIP Lead" to record a prospect.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div>{inquiry.name}</div>
                      {inquiry.notes && (
                        <div className="text-[10px] text-muted-foreground font-normal line-clamp-1">
                          {inquiry.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground truncate max-w-[140px]">
                        {inquiry.property?.name || "General Portfolio"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{inquiry.currency} {inquiry.investmentRange || "Portfolio"}</div>
                      <div className="text-[10px] text-primary">{inquiry.investmentType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{inquiry.phone || "—"}</div>
                      <div className="text-[10px] text-muted-foreground">{inquiry.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadge(inquiry.status || "NEW")}`}>
                        {(inquiry.status || "NEW").replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Lead Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                <span>Register VIP Client Lead</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterLead} className="space-y-4">
              {/* Client Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client Full Name *
                </Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Birla"
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
                    placeholder="client@investor.com"
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone / WhatsApp *
                  </Label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 11223"
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
              </div>

              {/* Target Property */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Interested Property (Optional)
                </Label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">General Luxury Inquiries</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location?.city || "Dubai"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Investment Budget & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Budget Bracket
                  </Label>
                  <select
                    value={formData.investmentRange}
                    onChange={(e) => setFormData({ ...formData, investmentRange: e.target.value })}
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-9"
                  >
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $10M">$5M - $10M</option>
                    <option value="$10M - $25M">$10M - $25M</option>
                    <option value="$25M+">$25M+ Trophy Tier</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Currency
                  </Label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full rounded-md border border-input bg-secondary/40 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none h-9"
                  >
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client Investment Preferences &amp; Profile
                </Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Seeking high-yield beachfront villa in Palm Jumeirah"
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
                  <span>{submitting ? "Registering..." : "Lock In Client Lead"}</span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
