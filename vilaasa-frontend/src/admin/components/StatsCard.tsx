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
    <div className="relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111111] p-6 shadow-xl transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-[#222222]" />
          ) : (
            <h3 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {value}
            </h3>
          )}
          {(subtitle || trend) && (
            <div className="flex items-center space-x-2 text-xs text-[#a0a0a0]">
              {trend && (
                <span className="font-medium text-[#22c55e]">{trend}</span>
              )}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#D4AF37]/20 bg-[#1a1a1a] text-[#D4AF37]">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#D4AF37]/5 blur-xl pointer-events-none" />
    </div>
  );
};
