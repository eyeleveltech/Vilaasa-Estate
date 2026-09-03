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
  Filter,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useAdminProperties } from "../hooks/useAdminProperties";
import {
  PropertyFilterParams,
  PropertyStatus,
  PropertyType,
} from "../types/admin.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminPropertiesList: React.FC = () => {
  const { properties, loading, meta, fetchProperties, deleteProperty } =
    useAdminProperties();

  const [filters, setFilters] = useState<PropertyFilterParams>({
    status: "",
    type: "",
    country: "",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "newest",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadData = useCallback(() => {
    fetchProperties(filters);
  }, [fetchProperties, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const confirmDelete = async () => {
    if (!selectedPropertyId) return;
    setIsDeleting(true);
    const success = await deleteProperty(selectedPropertyId);
    setIsDeleting(false);
    if (success) {
      setDeleteModalOpen(false);
      setSelectedPropertyId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "UNDER_CONSTRUCTION":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "OFF_PLAN":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "READY_TO_MOVE":
        return "bg-teal-500/10 text-teal-400 border-teal-500/30";
      case "SOLD":
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
      case "RESERVED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
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
              Inventory Assets
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Properties <span className="font-serif italic text-primary">Portfolio</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, filter, and edit prime residential and commercial real estate
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            title="Refresh list"
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/admin/properties/new">
              <Plus className="h-4 w-4" />
              <span>Add Property</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        >
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search estate, city..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              className="bg-secondary/40 pl-9 text-xs h-9"
            />
          </div>

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
            <option value="OFF_PLAN">Off Plan</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
            <option value="SOLD">Sold</option>
            <option value="RESERVED">Reserved</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: e.target.value as PropertyType | "",
                page: 1,
              }))
            }
            className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="RESIDENTIAL_VILLA">Residential Villa</option>
            <option value="RESIDENTIAL_APARTMENT">Residential Apartment</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="HERITAGE_ESTATE">Heritage Estate</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="FARMLAND">Farmland</option>
          </select>

          {/* Market Scope Filter */}
          <select
            value={
              filters.country?.trim().toLowerCase() === "india"
                ? "DOMESTIC"
                : filters.country?.trim().toLowerCase() === "uae" ||
                  filters.country?.trim().toLowerCase() === "united arab emirates"
                ? "INTERNATIONAL"
                : ""
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "DOMESTIC") {
                setFilters((prev) => ({ ...prev, country: "India", page: 1 }));
              } else if (val === "INTERNATIONAL") {
                setFilters((prev) => ({ ...prev, country: "UAE", page: 1 }));
              } else {
                setFilters((prev) => ({ ...prev, country: "", page: 1 }));
              }
            }}
            className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Markets</option>
            <option value="DOMESTIC">Domestic</option>
            <option value="INTERNATIONAL">International</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy || "newest"}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as
                  | "price_asc"
                  | "price_desc"
                  | "newest"
                  | "oldest",
                page: 1,
              }))
            }
            className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </form>
      </div>

      {/* Properties Table (desktop) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/40 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Property Name</th>
                <th className="px-4 py-3.5 font-semibold">Type</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Market / Location</th>
                <th className="px-4 py-3.5 font-semibold">Price</th>
                <th className="px-4 py-3.5 font-semibold">Beds / Baths</th>
                <th className="px-4 py-3.5 font-semibold">Created</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Loading luxury properties portfolio...</span>
                    </div>
                  </td>
                </tr>
              ) : properties && properties.filter((p) => p.type !== "FRANCHISE" && p.customType?.toLowerCase() !== "franchise").length > 0 ? (
                properties.filter((p) => p.type !== "FRANCHISE" && p.customType?.toLowerCase() !== "franchise").map((prop) => (
                  <tr
                    key={prop.id}
                    className="transition-colors hover:bg-secondary/40"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">
                      <Link
                        to={`/admin/properties/${prop.id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {prop.name}
                      </Link>
                      {prop.tagline && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {prop.tagline}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-medium">
                      {prop.customType || prop.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                          prop.status,
                        )}`}
                      >
                        {prop.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      <div>
                        <span>
                          {prop.location?.city || "Unknown"}, {prop.location?.country || "UAE"}
                        </span>
                        <div className="mt-1">
                          {prop.location?.country?.trim().toLowerCase() === "india" ? (
                            <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
                              Domestic
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-medium text-sky-400">
                              International
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-primary">
                      {prop.priceOnApplication
                        ? "POA"
                        : `${prop.currency} ${Number(
                            prop.price,
                          ).toLocaleString()}`}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {prop.bedrooms ?? "-"} Beds / {prop.bathrooms ?? "-"} Baths
                    </td>
                    <td className="px-4 py-4 text-muted-foreground font-mono text-[11px]">
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Link
                          to={`/admin/properties/${prop.id}`}
                          title="View Details"
                          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/properties/${prop.id}/edit`}
                          title="Edit Property"
                          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedPropertyId(prop.id);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Property"
                          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No properties match your filter criteria.</p>
                      <button
                        onClick={() =>
                          setFilters({
                            status: "",
                            type: "",
                            country: "",
                            search: "",
                            page: 1,
                            limit: 10,
                            sortBy: "newest",
                          })
                        }
                        className="text-xs text-primary underline uppercase tracking-wider"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-secondary/20">
            <div className="text-xs text-muted-foreground">
              Showing page <span className="font-semibold text-foreground">{meta.page}</span> of{" "}
              <span className="font-semibold text-foreground">{meta.totalPages}</span> ({meta.total}{" "}
              total listings)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPrevPage}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, (prev.page || 1) - 1),
                  }))
                }
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) + 1,
                  }))
                }
                className="gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Card Grid (mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs">Loading properties...</span>
          </div>
        ) : properties && properties.filter((p) => p.type !== "FRANCHISE" && p.customType?.toLowerCase() !== "franchise").length > 0 ? (
          properties.filter((p) => p.type !== "FRANCHISE" && p.customType?.toLowerCase() !== "franchise").map((prop) => (
            <div
              key={prop.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    to={`/admin/properties/${prop.id}`}
                    className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                  >
                    {prop.name}
                  </Link>
                  {prop.tagline && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{prop.tagline}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(prop.status)}`}
                >
                  {prop.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Card Meta */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Type</span>
                  <p className="font-medium text-foreground mt-0.5">{prop.customType || prop.type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Price</span>
                  <p className="font-bold text-primary mt-0.5">
                    {prop.priceOnApplication ? "POA" : `${prop.currency} ${Number(prop.price).toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Location</span>
                  <p className="font-medium text-foreground mt-0.5">{prop.location?.city || "Unknown"}, {prop.location?.country || "UAE"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Beds / Baths</span>
                  <p className="font-medium text-foreground mt-0.5">{prop.bedrooms ?? "-"} / {prop.bathrooms ?? "-"}</p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-end gap-1 pt-1 border-t border-border/60">
                <Link
                  to={`/admin/properties/${prop.id}`}
                  title="View Details"
                  className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  to={`/admin/properties/${prop.id}/edit`}
                  title="Edit Property"
                  className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => { setSelectedPropertyId(prop.id); setDeleteModalOpen(true); }}
                  title="Delete Property"
                  className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-2 text-muted-foreground">
            <Filter className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No properties match your filter criteria.</p>
            <button
              onClick={() => setFilters({ status: "", type: "", country: "", search: "", page: 1, limit: 10, sortBy: "newest" })}
              className="text-xs text-primary underline uppercase tracking-wider"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Mobile Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!meta.hasPrevPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                className="gap-1 text-xs h-8"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="sm" disabled={!meta.hasNextPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                className="gap-1 text-xs h-8"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Soft Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center space-x-3 text-destructive">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Soft-Delete Property
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to soft-delete this property? This will flag
              the listing as <span className="text-primary font-semibold">isDeleted = true</span> and update its status to <span className="text-primary font-semibold">SOLD</span>.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedPropertyId(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Soft Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
