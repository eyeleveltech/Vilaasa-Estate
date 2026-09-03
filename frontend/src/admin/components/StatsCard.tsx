import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  loading = false,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5 shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-xl flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-secondary" />
          ) : (
            <h3 className="font-display text-2xl font-light tracking-tight text-foreground">
              {value}
            </h3>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground pt-2 mt-1 border-t border-border/40 truncate">
          {trend && (
            <span className="font-medium text-emerald-400">{trend}</span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}

      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 blur-xl pointer-events-none" />
    </div>
  );
};
