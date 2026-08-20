import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useAdminProperties } from "../hooks/useAdminProperties";
import {
  PropertyFilterParams,
  PropertyStatus,
  PropertyType,
} from "../types/admin.types";

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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Properties Portfolio
          </h2>
          <p className="text-xs text-[#a0a0a0]">
            Manage, filter, and edit prime residential and commercial real estate
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            title="Refresh list"
            className="flex items-center space-x-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-xs font-medium text-[#a0a0a0] hover:border-[#D4AF37] hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/properties/new"
            className="flex items-center space-x-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#b8952b] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 shadow-xl">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        >
          {/* Search Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#666666]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search estate name, city..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              className="w-full rounded-lg border border-[#2a2a2a] bg-[#181818] py-2 pl-9 pr-3 text-xs text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
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
            className="rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
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
            className="rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="RESIDENTIAL_VILLA">Residential Villa</option>
            <option value="RESIDENTIAL_APARTMENT">Residential Apartment</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="HERITAGE_ESTATE">Heritage Estate</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="FRANCHISE">Franchise</option>
            <option value="FARMLAND">Farmland</option>
          </select>

          {/* Country Input */}
          <input
            type="text"
            placeholder="Country (e.g. UAE, India)"
            value={filters.country || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, country: e.target.value, page: 1 }))
            }
            className="rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white placeholder-[#555555] focus:border-[#D4AF37] focus:outline-none"
          />

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
            className="rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </form>
      </div>

      {/* Properties Table */}
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#222222] bg-[#161616] text-[#a0a0a0]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Property Name</th>
                <th className="px-4 py-3.5 font-semibold">Type</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
                <th className="px-4 py-3.5 font-semibold">Location</th>
                <th className="px-4 py-3.5 font-semibold">Price</th>
                <th className="px-4 py-3.5 font-semibold">Beds / Baths</th>
                <th className="px-4 py-3.5 font-semibold">Created</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#a0a0a0]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                      <span>Loading luxury properties portfolio...</span>
                    </div>
                  </td>
                </tr>
              ) : properties && properties.length > 0 ? (
                properties.map((prop) => (
                  <tr
                    key={prop.id}
                    className="transition-colors hover:bg-[#181818]"
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      <Link
                        to={`/admin/properties/${prop.id}`}
                        className="font-semibold hover:text-[#D4AF37] transition-colors"
                      >
                        {prop.name}
                      </Link>
                      {prop.tagline && (
                        <div className="text-[11px] text-[#777777] line-clamp-1">
                          {prop.tagline}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[#a0a0a0]">
                      {prop.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                          prop.status,
                        )}`}
                      >
                        {prop.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#dcdcdc]">
                      {prop.location?.city}, {prop.location?.country}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-[#D4AF37]">
                      {prop.priceOnApplication
                        ? "POA"
                        : `${prop.currency} ${Number(
                            prop.price,
                          ).toLocaleString()}`}
                    </td>
                    <td className="px-4 py-4 text-[#a0a0a0]">
                      {prop.bedrooms ?? "-"} Beds / {prop.bathrooms ?? "-"} Baths
                    </td>
                    <td className="px-4 py-4 text-[#777777]">
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/properties/${prop.id}`}
                          title="View Details"
                          className="rounded p-1.5 text-[#a0a0a0] hover:bg-[#222222] hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/properties/${prop.id}/edit`}
                          title="Edit Property"
                          className="rounded p-1.5 text-[#a0a0a0] hover:bg-[#222222] hover:text-[#D4AF37] transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedPropertyId(prop.id);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Property"
                          className="rounded p-1.5 text-[#a0a0a0] hover:bg-[#222222] hover:text-[#ef4444] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#a0a0a0]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Filter className="h-8 w-8 text-[#444444]" />
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
                        className="text-xs text-[#D4AF37] underline"
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
          <div className="flex items-center justify-between border-t border-[#222222] px-6 py-4">
            <div className="text-xs text-[#a0a0a0]">
              Showing page <span className="font-semibold text-white">{meta.page}</span> of{" "}
              <span className="font-semibold text-white">{meta.totalPages}</span> ({meta.total}{" "}
              total listings)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={!meta.hasPrevPage}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: Math.max(1, (prev.page || 1) - 1),
                  }))
                }
                className="flex items-center space-x-1 rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#D4AF37] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <button
                disabled={!meta.hasNextPage}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page || 1) + 1,
                  }))
                }
                className="flex items-center space-x-1 rounded-lg border border-[#2a2a2a] bg-[#181818] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#D4AF37] disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Soft Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl">
            <div className="flex items-center space-x-3 text-[#ef4444]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Soft-Delete Property
              </h3>
            </div>
            <p className="text-xs text-[#a0a0a0]">
              Are you sure you want to soft-delete this property? This will flag
              the listing as <span className="text-[#D4AF37] font-semibold">isDeleted = true</span> and update its status to <span className="text-[#D4AF37] font-semibold">SOLD</span>.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedPropertyId(null);
                }}
                disabled={isDeleting}
                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#252525] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center space-x-2 rounded-lg bg-[#ef4444] px-4 py-2 text-xs font-bold text-white hover:bg-[#dc2626] transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Soft Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
