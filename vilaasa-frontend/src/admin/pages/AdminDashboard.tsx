import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle,
  Inbox,
  Clock,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useAdminProperties } from "../hooks/useAdminProperties";
import { StatsCard } from "../components/StatsCard";

export const AdminDashboard: React.FC = () => {
  const { stats, statsLoading, properties, loading, fetchStats, fetchProperties } =
    useAdminProperties();

  useEffect(() => {
    fetchStats();
    fetchProperties({ limit: 5, sortBy: "newest" });
  }, [fetchStats, fetchProperties]);

  const availableCount = stats?.byStatus?.AVAILABLE || 0;
  const recentInquiriesCount = stats?.recentInquiries?.length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CONTACTED":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "QUALIFIED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "CLOSED_WON":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "CLOSED_LOST":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "UNDER_CONSTRUCTION":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "SOLD":
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Executive Overview
          </h2>
          <p className="text-xs text-[#a0a0a0]">
            Real-time portfolio metrics across Dubai & India ultra-luxury estates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/properties/new"
            className="inline-flex items-center space-x-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#b8952b] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Luxury Property</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Properties"
          value={stats?.totalProperties ?? 0}
          icon={Building2}
          subtitle="Portfolio assets under management"
          loading={statsLoading}
        />
        <StatsCard
          title="Available Inventory"
          value={availableCount}
          icon={CheckCircle}
          subtitle="Ready for private client acquisition"
          loading={statsLoading}
        />
        <StatsCard
          title="Total Inquiries"
          value={stats?.totalInquiries ?? 0}
          icon={Inbox}
          subtitle="Ultra-high-net-worth investor leads"
          loading={statsLoading}
        />
        <StatsCard
          title="Recent Active Inquiries"
          value={recentInquiriesCount}
          icon={Clock}
          subtitle="Pending priority engagement"
          loading={statsLoading}
        />
      </div>

      {/* Tables Section: Inquiries & Properties */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Inquiries Table */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recent Client Inquiries
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Latest high-intent luxury buyer inquiries
              </p>
            </div>
            <Link
              to="/admin/inquiries"
              className="flex items-center space-x-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] text-[#a0a0a0]">
                <tr>
                  <th className="pb-3 font-semibold">Client Name</th>
                  <th className="pb-3 font-semibold">Interest / Property</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {statsLoading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#a0a0a0]">
                      Loading recent inquiries...
                    </td>
                  </tr>
                ) : stats?.recentInquiries && stats.recentInquiries.length > 0 ? (
                  stats.recentInquiries.slice(0, 5).map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="transition-colors hover:bg-[#181818]"
                    >
                      <td className="py-3 font-medium text-white">
                        <div>{inquiry.name}</div>
                        <div className="text-[11px] text-[#777777]">
                          {inquiry.email}
                        </div>
                      </td>
                      <td className="py-3 text-[#dcdcdc]">
                        {inquiry.property?.name || inquiry.investmentType}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                            inquiry.status,
                          )}`}
                        >
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#777777]">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#a0a0a0]">
                      No recent inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Properties Table */}
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Recent Properties
              </h3>
              <p className="text-xs text-[#a0a0a0]">
                Latest luxury listings in the platform
              </p>
            </div>
            <Link
              to="/admin/properties"
              className="flex items-center space-x-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222] text-[#a0a0a0]">
                <tr>
                  <th className="pb-3 font-semibold">Estate Name</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#a0a0a0]">
                      Loading properties...
                    </td>
                  </tr>
                ) : properties && properties.length > 0 ? (
                  properties.slice(0, 5).map((property) => (
                    <tr
                      key={property.id}
                      className="transition-colors hover:bg-[#181818]"
                    >
                      <td className="py-3 font-medium text-white">
                        <Link
                          to={`/admin/properties/${property.id}`}
                          className="hover:text-[#D4AF37]"
                        >
                          {property.name}
                        </Link>
                        <div className="text-[11px] text-[#777777]">
                          {property.location?.city},{" "}
                          {property.location?.country}
                        </div>
                      </td>
                      <td className="py-3 text-[#a0a0a0]">
                        {property.type.replace("_", " ")}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                            property.status,
                          )}`}
                        >
                          {property.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-semibold text-[#D4AF37]">
                        {property.priceOnApplication
                          ? "POA"
                          : `${property.currency} ${Number(
                              property.price,
                            ).toLocaleString()}`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#a0a0a0]">
                      No properties found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
