import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  ExternalLink,
  Share2,
  Download,
  CalendarCheck,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminProperties } from "../../admin/hooks/useAdminProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const PartnerInventory: React.FC = () => {
  const { properties, loading, fetchProperties } = useAdminProperties();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties({ limit: 50, sortBy: "newest" });
  }, [fetchProperties]);

  const filteredProperties = (properties || []).filter((p) => {
    if (p.type === "FRANCHISE" || p.customType?.toLowerCase() === "franchise") return false;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCopyClientLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/property/${slug || id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Client property dossier link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2500);
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
              Exclusive Inventory
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Luxury Property <span className="font-serif italic text-primary">Portfolio</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share private dossiers, book client viewings, and close institutional transactions
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by estate name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-input bg-secondary/40 px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none h-9"
          >
            <option value="">All Asset Types</option>
            <option value="RESIDENTIAL_VILLA">Residential Villa</option>
            <option value="RESIDENTIAL_APARTMENT">Apartment</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="HERITAGE_ESTATE">Heritage Estate</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          Loading institutional inventory...
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          No properties match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const heroMedia = prop.media && prop.media[0];
            const isCopied = copiedId === prop.id;

            return (
              <div
                key={prop.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Hero Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                    {heroMedia ? (
                      <img
                        src={heroMedia.url}
                        alt={prop.name}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
                        VILAASA
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10">
                        {prop.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-base text-foreground line-clamp-1">
                        {prop.name}
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-primary mr-1 shrink-0" />
                        <span className="truncate">
                          {prop.location?.city || "Dubai"}, {prop.location?.country || "UAE"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between border-y border-border/60 py-2.5 font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground block">
                          Listing Price
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {prop.currency} {Number(prop.price || 0).toLocaleString()}
                        </span>
                      </div>
                      {prop.rentalYieldPercent && (
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-muted-foreground block">
                            Rental Yield
                          </span>
                          <span className="text-xs font-semibold text-emerald-400">
                            {prop.rentalYieldPercent}% Net
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Specs Pills */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      {prop.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-primary/70" /> {prop.bedrooms} Beds
                        </span>
                      )}
                      {prop.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-primary/70" /> {prop.bathrooms} Baths
                        </span>
                      )}
                      {prop.totalAreaSqFt && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-primary/70" /> {Number(prop.totalAreaSqFt).toLocaleString()} Sq.Ft
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="border-t border-border/60 p-4 bg-secondary/20 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyClientLink(prop.slug, prop.id)}
                    className="flex-1 text-[11px] gap-1.5 h-8 font-semibold"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Link</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5 text-primary" />
                        <span>Share with VIP</span>
                      </>
                    )}
                  </Button>

                  <Button asChild size="sm" className="flex-1 text-[11px] gap-1.5 h-8 font-semibold">
                    <Link to={`/property/${prop.slug || prop.id}`} target="_blank">
                      <span>View Dossier</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
