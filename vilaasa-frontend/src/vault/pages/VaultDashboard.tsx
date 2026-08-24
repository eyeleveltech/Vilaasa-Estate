import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Coins,
  Percent,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useVaultPortfolio, VaultUser } from "../hooks/useVault";
import { formatPortfolioValue, formatAppreciation } from "../utils/formatCurrency";
import { VaultAssetCard } from "../components/VaultAssetCard";
import { VaultOverview } from "@/components/vault/VaultOverview";
import { Button } from "@/components/ui/button";

export const VaultDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio, loading, error } = useVaultPortfolio();

  const savedUserJson =
    typeof window !== "undefined"
      ? localStorage.getItem("vilaasa-vault-user")
      : null;
  const user: VaultUser | null = savedUserJson
    ? JSON.parse(savedUserJson)
    : null;

  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const currency = portfolio?.summary.currency || "INR";
  const summary = portfolio?.summary;
  const isAppreciationPositive = (summary?.totalAppreciation || 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-1">
            <span className="h-px w-5 bg-current" />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">
              Private Wealth Desk
            </span>
          </div>
          <h2 className="text-2xl font-light tracking-tight text-foreground sm:text-3xl font-serif">
            Welcome back,{" "}
            <span className="italic text-primary">
              {user?.name || "Distinguished Investor"}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-mono">
            <Calendar className="h-3.5 w-3.5 text-primary/70" />
            <span>Portfolio active as of {todayStr}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Button asChild size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Link to="/vault/portfolio">
              <Building2 className="h-3.5 w-3.5" />
              <span>Full Portfolio</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <Link to="/contact">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Advisory Concierge</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Grid (2 cols mobile, 3 cols desktop) */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-border bg-card/60 p-5"
            />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 — Total Properties */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Properties Owned
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {summary.totalProperties}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Active trophy holdings in custodial vault
              </p>
            </div>
          </div>

          {/* Card 2 — Total Invested */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Invested
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {formatPortfolioValue(summary.totalInvested, currency)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Historical acquisition capital deployed
              </p>
            </div>
          </div>

          {/* Card 3 — Current Portfolio Value */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Current Valuation
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-mono text-2xl font-semibold tracking-tight text-primary">
                {formatPortfolioValue(summary.currentPortfolioValue, currency)}
              </div>
              <p
                className={`text-[11px] font-mono mt-0.5 font-medium ${
                  isAppreciationPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatAppreciation(
                  summary.totalAppreciation,
                  summary.appreciationPercent,
                  currency,
                )}
              </p>
            </div>
          </div>

          {/* Card 4 — Total Appreciation */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Capital Gain
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                  isAppreciationPositive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {isAppreciationPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`font-mono text-2xl font-semibold tracking-tight ${
                  isAppreciationPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isAppreciationPositive ? "+" : ""}
                {formatPortfolioValue(summary.totalAppreciation, currency)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Unrealized growth: {isAppreciationPositive ? "+" : ""}
                {summary.appreciationPercent.toFixed(1)}% net
              </p>
            </div>
          </div>

          {/* Card 5 — Monthly Rental Income */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Monthly Rental Yield
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {formatPortfolioValue(summary.monthlyRentalIncome, currency)}
                <span className="text-xs text-muted-foreground font-sans font-normal">
                  /month
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Annual projected:{" "}
                {formatPortfolioValue(summary.annualRentalIncome, currency)}
              </p>
            </div>
          </div>

          {/* Card 6 — Annualized Yield */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Annualized Yield
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                {summary.annualizedYieldPercent.toFixed(1)}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Gross dividend return across portfolio
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Interactive Vault Overview & Wealth Analytics */}
      <VaultOverview onNavigate={(sec) => navigate(`/vault/${sec}`)} />

      {/* Recent Assets Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-light text-foreground">
              Your Real Estate Holdings
            </h3>
            <p className="text-xs text-muted-foreground">
              Active luxury properties registered under your custodial folio
            </p>
          </div>
          {portfolio?.assets && portfolio.assets.length > 3 && (
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Link to="/vault/portfolio">
                <span>View All ({portfolio.assets.length})</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-xl border border-border bg-card/60"
              />
            ))}
          </div>
        ) : !portfolio?.assets || portfolio.assets.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-[#D4AF37]/60 mb-3" />
            <h4 className="font-serif text-lg text-foreground font-light">
              No Registered Vault Assets
            </h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6">
              You do not have any property units assigned to your portfolio yet.
              Please connect with your Senior Relationship Director.
            </p>
            <Button asChild size="sm">
              <Link to="/contact">Contact Relationship Manager</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {portfolio.assets.slice(0, 3).map((asset, index) => (
              <VaultAssetCard key={asset.id} asset={asset} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VaultDashboard;
