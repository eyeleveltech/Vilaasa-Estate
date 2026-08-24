import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Sparkles,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { ChannelPartner, ApiResponse } from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const AdminChannelPartners: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">(
    "PENDING",
  );
  const [partners, setPartners] = useState<ChannelPartner[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Global counts for the stats bar
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Onboard Partner Modal State
  const [onboardModal, setOnboardModal] = useState({
    open: false,
    name: "",
    email: "",
    phone: "",
    phoneCode: "+91",
    company: "",
    city: "",
    licenseNumber: "",
    experience: "5+ Years",
    password: "",
    submitting: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  // Confirm Action Dialog
  const [actionDialog, setActionDialog] = useState<{
    partner: ChannelPartner;
    newStatus: "APPROVED" | "REJECTED";
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch partner counts for the stats bar
  const fetchStats = useCallback(async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        api.get<ApiResponse<ChannelPartner[]>>("/channel-partners", {
          params: { limit: 1 },
        }),
        api.get<ApiResponse<ChannelPartner[]>>("/channel-partners", {
          params: { status: "PENDING", limit: 1 },
        }),
        api.get<ApiResponse<ChannelPartner[]>>("/channel-partners", {
          params: { status: "APPROVED", limit: 1 },
        }),
        api.get<ApiResponse<ChannelPartner[]>>("/channel-partners", {
          params: { status: "REJECTED", limit: 1 },
        }),
      ]);

      setStats({
        total: allRes.data.meta?.total || 0,
        pending: pendingRes.data.meta?.total || 0,
        approved: approvedRes.data.meta?.total || 0,
        rejected: rejectedRes.data.meta?.total || 0,
      });
    } catch {
      // quiet stats fallback
    }
  }, []);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        status: activeTab,
        page,
        limit: 20,
      };
      if (search.trim()) params.search = search.trim();

      const res = await api.get<ApiResponse<ChannelPartner[]>>(
        "/channel-partners",
        { params },
      );

      if (res.data.success) {
        setPartners(res.data.data);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages || 1);
          setTotalCount(res.data.meta.total || res.data.data.length);
        } else {
          setTotalPages(Math.ceil(res.data.data.length / 20) || 1);
          setTotalCount(res.data.data.length);
        }
      }
    } catch {
      toast.error("Failed to load channel partners directory");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchPartners();
    fetchStats();
  }, [fetchPartners, fetchStats]);

  // Generate Strong Random Password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "Vilaasa@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setOnboardModal((prev) => ({ ...prev, password: pwd }));
    setShowPassword(true);
    toast.success("Generated secure temporary partner key");
  };

  // Direct Channel Partner Onboarding Submit
  const handleOnboardPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardModal.name || !onboardModal.email || !onboardModal.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setOnboardModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await api.post("/channel-partners/admin/onboard", {
        name: onboardModal.name.trim(),
        email: onboardModal.email.trim(),
        phone: onboardModal.phone.trim() || undefined,
        phoneCode: onboardModal.phoneCode,
        company: onboardModal.company.trim() || undefined,
        city: onboardModal.city.trim() || undefined,
        licenseNumber: onboardModal.licenseNumber.trim() || undefined,
        experience: onboardModal.experience || undefined,
        password: onboardModal.password,
      });

      if (res.data.success) {
        toast.success("Channel Partner onboarded & login credentials emailed successfully!");
        setOnboardModal({
          open: false,
          name: "",
          email: "",
          phone: "",
          phoneCode: "+91",
          company: "",
          city: "",
          licenseNumber: "",
          experience: "5+ Years",
          password: "",
          submitting: false,
        });
        setActiveTab("APPROVED");
        fetchPartners();
        fetchStats();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to onboard channel partner");
    } finally {
      setOnboardModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handle Approve/Reject Action
  const handleConfirmAction = async () => {
    if (!actionDialog) return;

    setIsProcessing(true);
    try {
      const res = await api.patch(
        `/channel-partners/${actionDialog.partner.id}/status`,
        {
          status: actionDialog.newStatus,
        },
      );

      if (res.data.success) {
        if (actionDialog.newStatus === "APPROVED") {
          toast.success(
            `Partner approved. Login credentials & institutional welcome email sent.`,
          );
        } else {
          toast.success(`Channel partner application rejected.`);
        }
        setActionDialog(null);
        fetchPartners();
        fetchStats();
      }
    } catch {
      toast.error("Failed to update partner application status");
    } finally {
      setIsProcessing(false);
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
              Broker Relations
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Channel Partner Network & <span className="font-serif italic text-primary">Onboarding</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review broker agency applications, provision institutional credentials, and manage portal access.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            onClick={() => {
              generateRandomPassword();
              setOnboardModal((prev) => ({ ...prev, open: true }));
            }}
            size="sm"
            className="gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Onboard Partner</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchPartners();
              fetchStats();
            }}
            className="gap-1.5 text-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Top KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">
            Total Applications
          </p>
          <p className="font-display text-2xl font-light text-foreground mt-1">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.18em] flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Pending Review</span>
          </p>
          <p className="font-display text-2xl font-light text-amber-300 mt-1">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.18em] flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Approved Partners</span>
          </p>
          <p className="font-display text-2xl font-light text-emerald-300 mt-1">
            {stats.approved}
          </p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.18em] flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Rejected</span>
          </p>
          <p className="font-display text-2xl font-light text-red-300 mt-1">
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        {/* Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab("PENDING");
              setPage(1);
            }}
            className={`rounded-md px-3.5 py-2 text-xs uppercase tracking-[0.1em] font-medium transition-all ${
              activeTab === "PENDING"
                ? "border border-primary/40 bg-primary/10 text-primary shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Pending Review ({stats.pending})
          </button>
          <button
            onClick={() => {
              setActiveTab("APPROVED");
              setPage(1);
            }}
            className={`rounded-md px-3.5 py-2 text-xs uppercase tracking-[0.1em] font-medium transition-all ${
              activeTab === "APPROVED"
                ? "border border-primary/40 bg-primary/10 text-primary shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => {
              setActiveTab("REJECTED");
              setPage(1);
            }}
            className={`rounded-md px-3.5 py-2 text-xs uppercase tracking-[0.1em] font-medium transition-all ${
              activeTab === "REJECTED"
                ? "border border-primary/40 bg-primary/10 text-primary shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search partner, company, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-secondary/40 pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Partners Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Partner Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company / Agency</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Applied Date</th>
                {activeTab === "PENDING" && (
                  <th className="py-3 px-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && partners.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "PENDING" ? 7 : 6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                    <p>Loading channel partner applications...</p>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "PENDING" ? 7 : 6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    No channel partner applications found under this tab.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                          {partner.name.charAt(0).toUpperCase()}
                        </span>
                        <span>{partner.name}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] space-y-0.5 text-muted-foreground">
                        <div className="flex items-center space-x-1 text-foreground/90">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{partner.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{partner.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground flex items-center space-x-1.5">
                        <Building className="h-3.5 w-3.5 text-primary" />
                        <span>{partner.company || "Independent Broker"}</span>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        <Briefcase className="mr-1 h-3 w-3 text-muted-foreground" />
                        <span>{partner.experience || "3-5 years"}</span>
                      </span>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-foreground">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span>{partner.city || "Dubai / Mumbai"}</span>
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions (Pending Only) */}
                    {activeTab === "PENDING" && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              setActionDialog({
                                partner,
                                newStatus: "APPROVED",
                              })
                            }
                            className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setActionDialog({
                                partner,
                                newStatus: "REJECTED",
                              })
                            }
                            className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground bg-secondary/20">
          <div>
            Showing <span className="font-semibold text-foreground">{partners.length}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> partners
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
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                {actionDialog.newStatus === "APPROVED"
                  ? "Approve Channel Partner"
                  : "Reject Application"}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to{" "}
              <strong
                className={
                  actionDialog.newStatus === "APPROVED"
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {actionDialog.newStatus.toLowerCase()}
              </strong>{" "}
              <strong className="text-foreground">
                {actionDialog.partner.name}
              </strong>
              {actionDialog.partner.company
                ? ` from ${actionDialog.partner.company}`
                : ""}
              ?
            </p>
            <p className="text-[11px] text-muted-foreground bg-secondary/40 p-3 rounded-md border border-border">
              {actionDialog.newStatus === "APPROVED"
                ? "This will automatically provision their Channel Partner credentials and send an official welcome email."
                : "This will mark the application as rejected."}
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
                onClick={handleConfirmAction}
                disabled={isProcessing}
                variant={actionDialog.newStatus === "APPROVED" ? "default" : "destructive"}
              >
                {isProcessing ? "Processing..." : `Yes, ${actionDialog.newStatus}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Onboard Channel Partner Modal */}
      {onboardModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Onboard Channel Partner
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Provision partner credentials &amp; institutional portal access
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setOnboardModal({
                    open: false,
                    name: "",
                    email: "",
                    phone: "",
                    phoneCode: "+91",
                    company: "",
                    city: "",
                    licenseNumber: "",
                    experience: "5+ Years",
                    password: "",
                    submitting: false,
                  })
                }
                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Automated Email Notice */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  Automated Credential Dispatch
                </span>
                <p className="text-[10.5px] leading-relaxed">
                  Upon creation, an official institutional partner welcome dossier containing secure login credentials and the Partner Portal URL will be immediately dispatched to the partner's email.
                </p>
              </div>
            </div>

            <form onSubmit={handleOnboardPartnerSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="partName" className="text-xs font-semibold">
                    Partner Full Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="partName"
                    type="text"
                    required
                    placeholder="e.g. Tariq Al-Mansoor"
                    value={onboardModal.name}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="partCompany" className="text-xs font-semibold">
                    Agency / Brokerage Name
                  </Label>
                  <Input
                    id="partCompany"
                    type="text"
                    placeholder="e.g. Knight Frank or Luxury Realty"
                    value={onboardModal.company}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="partEmail" className="text-xs font-semibold">
                  Email Address (Login Username) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="partEmail"
                  type="email"
                  required
                  placeholder="e.g. partner@brokerage.com"
                  value={onboardModal.email}
                  onChange={(e) =>
                    setOnboardModal((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="bg-secondary/40 text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="partCode" className="text-xs font-semibold">
                    Code
                  </Label>
                  <Input
                    id="partCode"
                    type="text"
                    value={onboardModal.phoneCode}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        phoneCode: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label htmlFor="partPhone" className="text-xs font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="partPhone"
                    type="tel"
                    placeholder="9876543210"
                    value={onboardModal.phone}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="partCity" className="text-xs font-semibold">
                    Operating Territory / City
                  </Label>
                  <Input
                    id="partCity"
                    type="text"
                    placeholder="e.g. Dubai, Mumbai, London"
                    value={onboardModal.city}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="partLicense" className="text-xs font-semibold">
                    RERA / Broker License No.
                  </Label>
                  <Input
                    id="partLicense"
                    type="text"
                    placeholder="e.g. RERA-BRN-9982"
                    value={onboardModal.licenseNumber}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        licenseNumber: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="partPass" className="text-xs font-semibold">
                    Temporary Access Password <span className="text-primary">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Generate Strong Key</span>
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="partPass"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min 6 characters (e.g. Vilaasa@Partner2026)"
                    value={onboardModal.password}
                    onChange={(e) =>
                      setOnboardModal((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="bg-secondary/40 text-xs h-9 pr-9 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOnboardModal({
                      open: false,
                      name: "",
                      email: "",
                      phone: "",
                      phoneCode: "+91",
                      company: "",
                      city: "",
                      licenseNumber: "",
                      experience: "5+ Years",
                      password: "",
                      submitting: false,
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={onboardModal.submitting}
                  className="gap-1.5 font-semibold"
                >
                  {onboardModal.submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Onboard &amp; Dispatch Key</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
