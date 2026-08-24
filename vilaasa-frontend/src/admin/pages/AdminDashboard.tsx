import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Inbox,
  ArrowUpRight,
  Plus,
  CalendarCheck,
  Users,
  Percent,
  Compass,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Coins,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAdminProperties } from "../hooks/useAdminProperties";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { StatsCard } from "../components/StatsCard";
import { Button } from "@/components/ui/button";
import {
  SiteVisit,
  ChannelPartner,
  VaultAdminOverview,
  ApiResponse,
} from "../types/admin.types";

export const AdminDashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const {
    stats,
    statsLoading,
    properties,
    loading: propsLoading,
    fetchStats,
    fetchProperties,
  } = useAdminProperties();

  // Phase 4 KPI Data
  const [siteVisitsWeekCount, setSiteVisitsWeekCount] = useState<number>(0);
  const [pendingPartnersCount, setPendingPartnersCount] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [vaultOverview, setVaultOverview] = useState<VaultAdminOverview | null>(
    null,
  );

  // Phase 4 Tables Data
  const [recentSiteVisits, setRecentSiteVisits] = useState<SiteVisit[]>([]);
  const [pendingPartners, setPendingPartners] = useState<ChannelPartner[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      // 1. Fetch Inquiries Stats (Conversion Rate)
      const inquiryStatsRes = await api.get<
        ApiResponse<{ conversionRate: number }>
      >("/inquiries/stats");
      if (inquiryStatsRes.data.success) {
        setConversionRate(inquiryStatsRes.data.data.conversionRate || 0);
      }

      // 2. Fetch Super Admin Specifics (Pending Partners & Vault Overview)
      if (isSuperAdmin) {
        const [pendingPartnersRes, vaultRes] = await Promise.all([
          api.get<ApiResponse<ChannelPartner[]>>("/channel-partners", {
            params: { status: "PENDING", limit: 4 },
          }),
          api.get<ApiResponse<VaultAdminOverview>>("/vault/admin/overview"),
        ]);

        if (pendingPartnersRes.data.success) {
          setPendingPartners(pendingPartnersRes.data.data);
          setPendingPartnersCount(
            pendingPartnersRes.data.meta?.total ||
              pendingPartnersRes.data.data.length,
          );
        }

        if (vaultRes.data.success) {
          setVaultOverview(vaultRes.data.data);
        }
      }

      // 3. Fetch Recent Site Visits
      const siteVisitsRes = await api.get<ApiResponse<SiteVisit[]>>(
        "/site-visits",
        { params: { limit: 5 } },
      );
      if (siteVisitsRes.data.success) {
        setRecentSiteVisits(siteVisitsRes.data.data);
        // Calculate visits this week
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const count = siteVisitsRes.data.data.filter(
          (v) => new Date(v.scheduledDate).getTime() >= oneWeekAgo,
        ).length;
        setSiteVisitsWeekCount(count);
      }
    } catch {
      // quiet fallback
    } finally {
      setLoadingDashboard(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchStats();
    fetchProperties({ limit: 5, sortBy: "newest" });
    fetchDashboardData();
  }, [fetchStats, fetchProperties, fetchDashboardData]);

  const formatCrores = (val?: number) => {
    if (!val || isNaN(val)) return "₹0.00 Cr";
    const cr = val / 10000000;
    if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
    const lakhs = val / 100000;
    return `₹${lakhs.toFixed(2)} L`;
  };

  // Quick Action: Approve / Reject Partner
  const handlePartnerAction = async (
    id: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    try {
      const res = await api.patch(`/channel-partners/${id}/status`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(
          newStatus === "APPROVED"
            ? "Partner approved & welcome credentials dispatched"
            : "Application rejected",
        );
        fetchDashboardData();
      }
    } catch {
      toast.error("Failed to update partner application");
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
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CONTACTED":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "QUALIFIED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
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
      {/* Header with Luxury Brand Title & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5 text-primary/80 mb-1">
            <span className="h-px w-5 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
              {isSuperAdmin ? "Executive Command" : "Partner Concierge"}
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            {isSuperAdmin ? "Portfolio" : "Broker"}{" "}
            <span className="font-serif italic text-primary">Intelligence</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time portfolio metrics across Dubai & India ultra-luxury developments
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          {isSuperAdmin ? (
            <Button asChild size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <Link to="/admin/properties/new">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Property</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
              <Link to="/admin/site-visits">
                <CalendarCheck className="h-3.5 w-3.5" />
                <span>Book Inspection</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          isSuperAdmin ? "lg:grid-cols-3 xl:grid-cols-6" : "lg:grid-cols-4"
        }`}
      >
        <StatsCard
          title="Total Properties"
          value={stats?.totalProperties ?? 0}
          icon={Building2}
          subtitle="Portfolio assets listed"
          loading={statsLoading}
        />
        {isSuperAdmin && (
          <>
            <StatsCard
              title="The Vault AUM"
              value={formatCrores(vaultOverview?.totalAum)}
              icon={Lock}
              subtitle="Private client custody AUM"
              loading={loadingDashboard}
            />
            <StatsCard
              title="Active Investors"
              value={vaultOverview?.totalInvestors || 0}
              icon={Users}
              subtitle="Registered Vault accounts"
              loading={loadingDashboard}
            />
          </>
        )}
        <StatsCard
          title="Site Visits This Week"
          value={siteVisitsWeekCount}
          icon={CalendarCheck}
          subtitle="Scheduled VIP on-site viewings"
          loading={loadingDashboard}
        />
        {isSuperAdmin ? (
          <StatsCard
            title="Pending Partners"
            value={pendingPartnersCount}
            icon={Users}
            subtitle="Broker applications review"
            loading={loadingDashboard}
          />
        ) : (
          <StatsCard
            title="Available Inventory"
            value={stats?.byStatus?.AVAILABLE || 0}
            icon={Compass}
            subtitle="Prime estates ready for acquisition"
            loading={statsLoading}
          />
        )}
        <StatsCard
          title="Inquiry Conversion"
          value={`${conversionRate}%`}
          icon={Percent}
          subtitle="Closed Won vs Total Leads"
          loading={loadingDashboard}
        />
      </div>

      {/* Super Admin Quick Channel Partner Gateway Bar */}
      {isSuperAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Channel Partner &amp; Institutional Network
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Onboard broker partners, provision institutional credentials, and oversee client portfolios.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="gap-1.5 shrink-0 text-xs font-semibold uppercase tracking-wider">
            <Link to="/admin/channel-partners">
              <span>Channel Partners</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Main Dual-Column Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 1: Recent Site Inspections */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <CalendarCheck className="h-4 w-4 text-primary" />
                <span>Recent Site Inspections</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Scheduled private on-site viewings
              </p>
            </div>
            <Link
              to="/admin/site-visits"
              className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 uppercase tracking-wider"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="py-2 px-3 font-semibold">Visitor</th>
                  <th className="py-2 px-3 font-semibold">Estate</th>
                  <th className="py-2 px-3 font-semibold">Date & Time</th>
                  <th className="py-2 px-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentSiteVisits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      No site visits booked yet.
                    </td>
                  </tr>
                ) : (
                  recentSiteVisits.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{v.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                          {v.email}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-foreground truncate max-w-[140px]">
                          {v.property?.name || "General Property"}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>
                          {new Date(v.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {v.scheduledTime}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusBadge(
                            v.status,
                          )}`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Super Admin (Pending Partners) OR Channel Partner (Featured Inventory) */}
        {isSuperAdmin ? (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Pending Partner Approvals</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Broker agencies awaiting institutional verification
                </p>
              </div>
              <Link
                to="/admin/channel-partners"
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 uppercase tracking-wider"
              >
                <span>View All</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Partner</th>
                    <th className="py-2 px-3 font-semibold">Company & City</th>
                    <th className="py-2 px-3 font-semibold">Applied Date</th>
                    <th className="py-2 px-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pendingPartners.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-xs text-muted-foreground"
                      >
                        No pending channel partner applications.
                      </td>
                    </tr>
                  ) : (
                    pendingPartners.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {p.phone}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-foreground truncate max-w-[120px]">
                            {p.company || "Independent"}
                          </div>
                          <div className="text-[10px] text-primary">
                            {p.city || "Dubai / Mumbai"}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() =>
                                handlePartnerAction(p.id, "APPROVED")
                              }
                              className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                              title="Approve Partner"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handlePartnerAction(p.id, "REJECTED")
                              }
                              className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all"
                              title="Reject Partner"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <Inbox className="h-4 w-4 text-primary" />
                  <span>Recent Client Inquiries</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ultra-high-net-worth investor advisory requests
                </p>
              </div>
              <Link
                to="/admin/inquiries"
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 uppercase tracking-wider"
              >
                <span>Pipeline</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {stats?.recentInquiries?.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No recent inquiries.
                </div>
              ) : (
                (stats?.recentInquiries || []).slice(0, 5).map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/30 p-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground">
                        {inquiry.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {inquiry.currency || "AED"} {inquiry.investmentRange || "Portfolio"} •{" "}
                        {(inquiry.source || "WEBSITE").replace(/_/g, " ")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold shrink-0 ml-2 ${getStatusBadge(
                        inquiry.status || "NEW",
                      )}`}
                    >
                      {(inquiry.status || "NEW").replace(/_/g, " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Row 2 (Super Admin Only): Portfolio Estates & Client Leads */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Luxury Estates */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Recent Luxury Estates</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Latest portfolio additions
                </p>
              </div>
              <Link
                to="/admin/properties"
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 uppercase tracking-wider"
              >
                <span>View All</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {propsLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading estates...
                </div>
              ) : properties.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No properties added yet.
                </div>
              ) : (
                properties.slice(0, 4).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/30 p-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary border border-border">
                        {property.media && property.media[0] ? (
                          <img
                            src={
                              property.media[0].thumbnailUrl ||
                              property.media[0].url
                            }
                            alt={property.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground font-mono">
                            VILAASA
                          </div>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {property.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {property.location?.city || "Prime Location"}
                          {property.location?.country ? `, ${property.location.country}` : ""} •{" "}
                          {property.currency}{" "}
                          {Number(property.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/admin/properties/${property.slug || property.id}`}
                      className="shrink-0 text-xs font-semibold text-primary hover:underline uppercase tracking-wider ml-2"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Inquiries Table */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                  <Inbox className="h-4 w-4 text-primary" />
                  <span>Recent Client Inquiries</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  HNW buyer advisory submissions
                </p>
              </div>
              <Link
                to="/admin/inquiries"
                className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 uppercase tracking-wider"
              >
                <span>Pipeline</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {stats?.recentInquiries?.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No recent inquiries.
                </div>
              ) : (
                (stats?.recentInquiries || []).slice(0, 4).map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/30 p-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="truncate">
                      <p className="text-xs font-semibold text-foreground">
                        {inquiry.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {inquiry.currency || "AED"} {inquiry.investmentRange || "Portfolio"} •{" "}
                        {(inquiry.source || "WEBSITE").replace(/_/g, " ")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold shrink-0 ml-2 ${getStatusBadge(
                        inquiry.status || "NEW",
                      )}`}
                    >
                      {(inquiry.status || "NEW").replace(/_/g, " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
