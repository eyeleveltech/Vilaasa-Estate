import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarCheck,
  Inbox,
  Percent,
  Compass,
  ArrowUpRight,
  Plus,
  Share2,
  PhoneCall,
} from "lucide-react";
import api from "../../api/axios";
import { useAdminProperties } from "../../admin/hooks/useAdminProperties";
import { useAdminAuth } from "../../admin/hooks/useAdminAuth";
import { StatsCard } from "../../admin/components/StatsCard";
import { Button } from "@/components/ui/button";
import { SiteVisit, ApiResponse } from "../../admin/types/admin.types";

export const PartnerDashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const { stats, statsLoading, properties, loading: propsLoading, fetchStats, fetchProperties } =
    useAdminProperties();

  const [siteVisitsWeekCount, setSiteVisitsWeekCount] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [recentSiteVisits, setRecentSiteVisits] = useState<SiteVisit[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const inquiryStatsRes = await api.get<ApiResponse<{ conversionRate: number }>>("/inquiries/stats");
      if (inquiryStatsRes.data.success) {
        setConversionRate(inquiryStatsRes.data.data.conversionRate || 0);
      }

      const siteVisitsRes = await api.get<ApiResponse<SiteVisit[]>>("/site-visits", {
        params: { limit: 5 },
      });
      if (siteVisitsRes.data.success) {
        setRecentSiteVisits(siteVisitsRes.data.data);
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
  }, []);

  useEffect(() => {
    fetchStats();
    fetchProperties({ limit: 4, sortBy: "newest" });
    fetchDashboardData();
  }, [fetchStats, fetchProperties, fetchDashboardData]);

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
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
            <span className="h-px w-5 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
              Authorized Partner Workspace
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Welcome, <span className="font-serif italic text-primary">{user?.name || "Partner"}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional portfolio inventory, client registrations &amp; private site viewings
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Button asChild size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Link to="/partner/site-visits">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Book Site Inspection</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Link to="/partner/inventory">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Browse Inventory</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Available Inventory"
          value={stats?.byStatus?.AVAILABLE || 0}
          icon={Building2}
          subtitle="Prime luxury assets ready for closing"
          loading={statsLoading}
        />
        <StatsCard
          title="Site Visits Booked"
          value={siteVisitsWeekCount}
          icon={CalendarCheck}
          subtitle="Scheduled VIP on-site viewings"
          loading={loadingDashboard}
        />
        <StatsCard
          title="Active Inquiries"
          value={stats?.totalInquiries ?? 0}
          icon={Inbox}
          subtitle="Total investor advisory leads"
          loading={statsLoading}
        />
        <StatsCard
          title="Conversion Efficiency"
          value={`${conversionRate}%`}
          icon={Percent}
          subtitle="Closed Won vs Total Leads"
          loading={loadingDashboard}
        />
      </div>

      {/* Main Tables Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 1: Scheduled Site Inspections */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <CalendarCheck className="h-4 w-4 text-emerald-400" />
                <span>Client Site Inspections</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Scheduled on-site private tours
              </p>
            </div>
            <Link
              to="/partner/site-visits"
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
                  <th className="py-2 px-3 font-semibold">Client</th>
                  <th className="py-2 px-3 font-semibold">Property</th>
                  <th className="py-2 px-3 font-semibold">Date &amp; Time</th>
                  <th className="py-2 px-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentSiteVisits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                      No site visits booked yet.
                    </td>
                  </tr>
                ) : (
                  recentSiteVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-secondary/30 transition-colors">
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
                        <div>{new Date(v.scheduledDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-muted-foreground">{v.scheduledTime}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusBadge(v.status)}`}>
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

        {/* Table 2: Featured Inventory Quick Dossiers */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-emerald-400" />
                <span>Featured Trophy Assets</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Prime off-market &amp; available listings
              </p>
            </div>
            <Link
              to="/partner/inventory"
              className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 uppercase tracking-wider"
            >
              <span>Full Portfolio</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {propsLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Loading portfolio assets...
              </div>
            ) : properties.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active properties available.
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
                          src={property.media[0].thumbnailUrl || property.media[0].url}
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
                        {property.location?.city || "Prime"} • {property.currency}{" "}
                        {Number(property.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0 text-[11px] h-7 px-2.5 gap-1">
                    <Link to={`/property/${property.slug || property.id}`} target="_blank">
                      <span>Dossier</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
