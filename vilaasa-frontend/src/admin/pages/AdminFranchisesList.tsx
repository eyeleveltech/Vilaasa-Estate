import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Store,
  Building2,
  TrendingUp,
  Clock,
  Coins,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Property,
  PropertyStatus,
  ApiResponse,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminFranchisesList: React.FC = () => {
  const [franchises, setFranchises] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<{
    franchiseModel: "FOCO" | "FOFO" | "FICO" | "";
    status: PropertyStatus | "";
    search: string;
    page: number;
    limit: number;
  }>({
    franchiseModel: "",
    status: "",
    search: "",
    page: 1,
    limit: 12,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        type: "FRANCHISE",
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.franchiseModel) params.franchiseModel = filters.franchiseModel;
      if (filters.status) params.status = filters.status;
      if (filters.search.trim()) params.search = filters.search.trim();

      const res = await api.get<ApiResponse<Property[]>>("/properties", {
        params,
      });

      if (res.data.success) {
        setFranchises(res.data.data || []);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      }
    } catch {
      toast.error("Failed to load franchise opportunities");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const confirmDelete = async () => {
    if (!selectedFranchiseId) return;
    setIsDeleting(true);
    try {
      const res = await api.delete<ApiResponse<{ id: string }>>(
        `/properties/${selectedFranchiseId}`,
      );
      if (res.data.success) {
        toast.success("Franchise asset archived successfully");
        setDeleteModalOpen(false);
        setSelectedFranchiseId(null);
        fetchFranchises();
      }
    } catch {
      toast.error("Failed to delete franchise asset");
    } finally {
      setIsDeleting(false);
    }
  };

  const getModelBadge = (model?: string | null) => {
    switch (model) {
      case "FOCO":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "FOFO":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "FICO":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "UNDER_CONSTRUCTION":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "RESERVED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "SOLD":
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
  };

  const formatCurrency = (val?: number | string | null, curr = "INR") => {
    if (val === undefined || val === null) return "₹0";
    const num = Number(val);
    if (isNaN(num)) return `${curr} 0`;
    return `${curr} ${num.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-3 text-primary/80 mb-1">
            <span className="h-px w-6 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[11px] font-bold">
              Institutional Franchises
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Franchise <span className="font-serif italic text-primary">Portfolio</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, curate, and scale luxury franchise opportunities and operator models
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFranchises}
            title="Refresh list"
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/admin/franchises/new">
              <Plus className="h-4 w-4" />
              <span>Add Franchise</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4"
        >
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search franchise name, city..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              className="bg-secondary/40 pl-9 text-xs h-9"
            />
          </div>

          {/* Model Filter */}
          <select
            value={filters.franchiseModel || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                franchiseModel: e.target.value as "FOCO" | "FOFO" | "FICO" | "",
                page: 1,
              }))
            }
            className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Models (FOCO / FOFO / FICO)</option>
            <option value="FOCO">FOCO (Company Operated)</option>
            <option value="FOFO">FOFO (Franchise Operated)</option>
            <option value="FICO">FICO (Investor Operated)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value as PropertyStatus | "",
                page: 1,
              }))
            }
            className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
            <option value="RESERVED">Reserved</option>
            <option value="SOLD">Sold Out</option>
          </select>

          {/* Clear button */}
          {(filters.franchiseModel || filters.status || filters.search) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  franchiseModel: "",
                  status: "",
                  search: "",
                  page: 1,
                  limit: 12,
                })
              }
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </form>
      </div>

      {/* Franchises Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Franchise Brand</th>
                <th className="px-4 py-3.5 font-semibold">Model</th>
                <th className="px-4 py-3.5 font-semibold">Min Ticket Size</th>
                <th className="px-4 py-3.5 font-semibold">Expected ROI</th>
                <th className="px-4 py-3.5 font-semibold">Payback Period</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-xs">Loading franchise dossiers...</p>
                    </div>
                  </td>
                </tr>
              ) : franchises.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Store className="h-8 w-8 text-muted-foreground/50 stroke-1" />
                      <p className="text-sm font-medium">No franchise assets found</p>
                      <p className="text-xs">
                        Adjust your filters or add a new luxury franchise brand.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                franchises.map((item) => {
                  const heroImg =
                    item.media?.find((m) => m.isFeatured)?.url ||
                    item.media?.[0]?.url ||
                    null;
                  const ticket = item.minTicketSize ?? item.price;
                  const roi = item.expectedAnnualRoi ?? item.rentalYieldPercent;

                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-secondary/20"
                    >
                      {/* Name & Tagline */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                            {heroImg ? (
                              <img
                                src={heroImg}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Store className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/admin/franchises/${item.id}`}
                              className="font-medium text-foreground transition-colors hover:text-primary hover:underline line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {item.tagline ||
                                `${item.location.city}, ${item.location.country}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Model Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getModelBadge(
                            item.franchiseModel,
                          )}`}
                        >
                          {item.franchiseModel || "FOCO"}
                        </span>
                      </td>

                      {/* Min Ticket */}
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-primary" />
                          <span>{formatCurrency(ticket, item.currency)}</span>
                        </div>
                      </td>

                      {/* Expected ROI */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>{roi ? `${roi}% p.a.` : "24% p.a."}</span>
                        </div>
                      </td>

                      {/* Payback Period */}
                      <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {item.paybackPeriodYears
                              ? `${item.paybackPeriodYears} Years`
                              : "3.5 Years"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${getStatusBadge(
                            item.status,
                          )}`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/admin/franchises/${item.id}`}
                            title="View Franchise Dossier"
                            className="rounded-md border border-border bg-secondary/30 p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            to={`/admin/franchises/${item.id}/edit`}
                            title="Edit Franchise"
                            className="rounded-md border border-border bg-secondary/30 p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFranchiseId(item.id);
                              setDeleteModalOpen(true);
                            }}
                            title="Archive Franchise"
                            className="rounded-md border border-border bg-secondary/30 p-1.5 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(meta.page - 1) * meta.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{meta.total}</span>{" "}
              franchise opportunities
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page <= 1 || loading}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page >= meta.totalPages || loading}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-light text-foreground">
              Archive Franchise Opportunity?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to archive this franchise? It will be removed
              from active investor showcases and directory listings.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedFranchiseId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={confirmDelete}
              >
                {isDeleting ? "Archiving..." : "Archive Franchise"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminFranchisesList;
