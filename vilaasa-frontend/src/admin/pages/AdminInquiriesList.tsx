import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Tag,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { Inquiry, InquiryStatus, ApiResponse } from "../types/admin.types";

export const AdminInquiriesList: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [search, setSearch] = useState<string>("");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get<ApiResponse<Inquiry[]>>("/inquiries", {
        params,
      });

      if (res.data.success) {
        setInquiries(res.data.data);
      }
    } catch {
      toast.error("Failed to load client inquiries pipeline");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusChange = async (
    id: string,
    newStatus: InquiryStatus,
    notes?: string,
  ) => {
    setUpdatingId(id);
    try {
      const res = await api.patch<ApiResponse<Inquiry>>(
        `/inquiries/${id}/status`,
        {
          status: newStatus,
          notes: notes || undefined,
        },
      );
      if (res.data.success) {
        toast.success(`Inquiry status updated to ${newStatus}`);
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === id ? { ...inq, status: newStatus } : inq,
          ),
        );
      }
    } catch {
      toast.error("Failed to update inquiry status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CONTACTED":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "QUALIFIED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "SITE_VISIT_SCHEDULED":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      case "NEGOTIATING":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "CLOSED_WON":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "CLOSED_LOST":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Client Inquiries Pipeline
          </h2>
          <p className="text-xs text-[#a0a0a0]">
            Ultra-high-net-worth investor engagement & private lead tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchInquiries}
            title="Refresh inquiries"
            className="flex items-center space-x-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-xs font-medium text-[#a0a0a0] hover:border-[#D4AF37] hover:text-white transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#666666]">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search client name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] py-2 pl-9 pr-3 text-xs text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as InquiryStatus | "")
            }
            className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="">All Pipeline Stages</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="SITE_VISIT_SCHEDULED">SITE VISIT SCHEDULED</option>
            <option value="NEGOTIATING">NEGOTIATING</option>
            <option value="CLOSED_WON">CLOSED WON (Deal Closed)</option>
            <option value="CLOSED_LOST">CLOSED LOST</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#222222] bg-[#161616] text-[#a0a0a0]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Client Name</th>
                <th className="px-4 py-3.5 font-semibold">Contact Info</th>
                <th className="px-4 py-3.5 font-semibold">Investment Focus</th>
                <th className="px-4 py-3.5 font-semibold">Target Budget</th>
                <th className="px-4 py-3.5 font-semibold">Project / Asset</th>
                <th className="px-4 py-3.5 font-semibold">Status Stage</th>
                <th className="px-4 py-3.5 font-semibold">Date</th>
                <th className="px-4 py-3.5 text-right font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#a0a0a0]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                      <span>Loading private inquiries pipeline...</span>
                    </div>
                  </td>
                </tr>
              ) : inquiries && inquiries.length > 0 ? (
                inquiries.map((inq) => {
                  const isExpanded = expandedRowId === inq.id;
                  return (
                    <React.Fragment key={inq.id}>
                      <tr
                        onClick={() =>
                          setExpandedRowId(isExpanded ? null : inq.id)
                        }
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? "bg-[#1c1c1c]" : "hover:bg-[#161616]"
                        }`}
                      >
                        <td className="px-5 py-4 font-semibold text-white">
                          {inq.name}
                        </td>
                        <td className="px-4 py-4 text-[#a0a0a0]">
                          <div className="text-white">{inq.email}</div>
                          <div className="text-[11px] text-[#777777]">
                            {inq.phone}
                          </div>
                        </td>
                        <td className="px-4 py-4 uppercase font-mono text-[11px] text-[#D4AF37]">
                          {inq.investmentType}
                        </td>
                        <td className="px-4 py-4 font-mono font-medium text-[#dcdcdc]">
                          {inq.investmentRange} ({inq.currency})
                        </td>
                        <td className="px-4 py-4 text-white">
                          {inq.property ? (
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                              <span>{inq.property.name}</span>
                            </span>
                          ) : (
                            <span className="text-[#666666]">General Portfolio</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                              inq.status,
                            )}`}
                          >
                            {inq.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#777777]">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button className="rounded p-1 text-[#a0a0a0] hover:text-white">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#141414]">
                          <td colSpan={8} className="p-5 border-b border-[#262626]">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                              {/* Contact & Campaign Meta */}
                              <div className="space-y-2 text-xs">
                                <h5 className="font-bold uppercase tracking-wider text-[#D4AF37]">
                                  Lead Acquisition Metadata
                                </h5>
                                <div className="space-y-1 text-[#dcdcdc]">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-3.5 w-3.5 text-[#a0a0a0]" />
                                    <span>{inq.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-3.5 w-3.5 text-[#a0a0a0]" />
                                    <span>{inq.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Tag className="h-3.5 w-3.5 text-[#a0a0a0]" />
                                    <span>Source: {inq.source}</span>
                                  </div>
                                  {inq.utmSource && (
                                    <div className="text-[11px] text-[#a0a0a0]">
                                      UTM: {inq.utmSource} / {inq.utmCampaign}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Client Notes */}
                              <div className="space-y-2 text-xs">
                                <h5 className="font-bold uppercase tracking-wider text-[#D4AF37]">
                                  Private Advisory Notes
                                </h5>
                                <p className="rounded-lg bg-[#0d0d0d] p-3 text-xs text-[#dcdcdc] border border-[#222222] min-h-[60px]">
                                  {inq.notes || "No special client requests noted."}
                                </p>
                              </div>

                              {/* Quick Stage Update */}
                              <div className="space-y-2 text-xs">
                                <h5 className="font-bold uppercase tracking-wider text-[#D4AF37]">
                                  Update Lead Stage
                                </h5>
                                <div className="flex items-center space-x-2">
                                  <select
                                    disabled={updatingId === inq.id}
                                    value={inq.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        inq.id,
                                        e.target.value as InquiryStatus,
                                      )
                                    }
                                    className="rounded-lg border border-[#333333] bg-[#1a1a1a] px-3 py-2 text-xs font-semibold text-white focus:border-[#D4AF37] focus:outline-none"
                                  >
                                    <option value="NEW">NEW</option>
                                    <option value="CONTACTED">CONTACTED</option>
                                    <option value="QUALIFIED">QUALIFIED</option>
                                    <option value="SITE_VISIT_SCHEDULED">
                                      SITE VISIT SCHEDULED
                                    </option>
                                    <option value="NEGOTIATING">NEGOTIATING</option>
                                    <option value="CLOSED_WON">CLOSED WON</option>
                                    <option value="CLOSED_LOST">CLOSED LOST</option>
                                  </select>
                                  {updatingId === inq.id && (
                                    <span className="text-[11px] text-[#D4AF37] animate-pulse">
                                      Updating...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#a0a0a0]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="h-8 w-8 text-[#444444]" />
                      <p className="text-sm font-medium">No client inquiries found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
