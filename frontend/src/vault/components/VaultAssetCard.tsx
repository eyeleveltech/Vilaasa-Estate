import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { VaultAsset } from "../hooks/useVault";
import { formatPortfolioValue } from "../utils/formatCurrency";
import { DEFAULT_PROPERTY_IMAGE } from "@/types/property";

interface VaultAssetCardProps {
  asset: VaultAsset;
  index?: number;
}

export const VaultAssetCard: React.FC<VaultAssetCardProps> = ({
  asset,
  index = 0,
}) => {
  const currency = asset.property.currency || "INR";
  const appreciation = asset.currentValuation - asset.purchasePrice;
  const isPositive = appreciation >= 0;
  const appreciationPercent =
    asset.purchasePrice > 0
      ? ((appreciation / asset.purchasePrice) * 100).toFixed(1)
      : "0.0";

  const purchaseDateStr = (() => {
    try {
      const d = new Date(asset.purchaseDate);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return "2024";
    }
  })();

  const heroImage =
    asset.property.media?.find((m) => m.isFeatured)?.url ||
    asset.property.media?.[0]?.url ||
    DEFAULT_PROPERTY_IMAGE;

  const getOccupancyBadge = (status: string) => {
    switch (status) {
      case "OCCUPIED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "VACANT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "UNDER_MAINTENANCE":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg sm:flex-row"
    >
      {/* Property Hero Image */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-secondary sm:aspect-auto sm:w-48 md:w-56">
        <img
          src={heroImage}
          alt={asset.property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase backdrop-blur-md ${getOccupancyBadge(
              asset.occupancyStatus,
            )}`}
          >
            {asset.occupancyStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Header & Location */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
            <div>
              <h3 className="font-serif text-lg font-normal tracking-tight text-foreground transition-colors group-hover:text-primary">
                {asset.property.name}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 text-primary mr-1 shrink-0" />
                <span className="truncate">
                  {asset.property.location.community
                    ? `${asset.property.location.community}, `
                    : ""}
                  {asset.property.location.city}, {asset.property.location.country}
                </span>
              </div>
            </div>

            {/* Unit Identifier */}
            <div className="shrink-0 font-mono text-[11px] font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded border border-border/80 self-start mt-1 sm:mt-0">
              {asset.unitNumber}
            </div>
          </div>

          {/* Value Flow Row */}
          <div className="my-3.5 rounded-lg bg-secondary/30 p-3 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Acquired Cost
                </span>
                <span className="font-mono text-xs font-medium text-foreground">
                  {formatPortfolioValue(asset.purchasePrice, currency)}
                </span>
              </div>

              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mx-2" />

              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Current Valuation
                </span>
                <span className="font-mono text-sm font-semibold text-primary">
                  {formatPortfolioValue(asset.currentValuation, currency)}
                </span>
              </div>

              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Appreciation
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {appreciationPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metrics & Purchase Date */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span>Since {purchaseDateStr}</span>
          </div>

          {asset.monthlyRentalYield !== null && asset.monthlyRentalYield > 0 ? (
            <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
              <Coins className="h-3.5 w-3.5" />
              <span>
                {formatPortfolioValue(asset.monthlyRentalYield, currency)}/mo
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Capital Asset
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VaultAssetCard;
