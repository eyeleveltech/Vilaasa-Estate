import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, RefreshCw, ArrowLeft, Plus } from "lucide-react";
import { useVaultPortfolio } from "../hooks/useVault";
import { VaultAssetCard } from "../components/VaultAssetCard";
import { Button } from "@/components/ui/button";

export const VaultPortfolio: React.FC = () => {
  const { portfolio, loading, error, refetch } = useVaultPortfolio();

  const totalCount = portfolio?.assets?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <span className="h-px w-5 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
              Portfolio Assets
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl font-serif">
            Investment <span className="italic text-primary">Portfolio</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {totalCount} {totalCount === 1 ? "Property Holding" : "Property Holdings"} Registered Under Folio
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Valuations</span>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Link to="/contact">
              <Plus className="h-3.5 w-3.5" />
              <span>Acquire New Asset</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Assets Grid (1 col mobile, 2 col desktop) */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : !portfolio?.assets || portfolio.assets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/50 p-16 text-center">
          <ShieldCheck className="mx-auto h-14 w-14 text-[#D4AF37]/60 mb-4" />
          <h3 className="font-serif text-xl font-light text-foreground">
            No Holdings Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            You do not have any registered properties in your Vault portfolio.
            Contact your relationship director to register newly acquired assets.
          </p>
          <Button asChild size="sm">
            <Link to="/contact">Contact Relationship Director</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {portfolio.assets.map((asset, index) => (
            <VaultAssetCard key={asset.id} asset={asset} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default VaultPortfolio;
