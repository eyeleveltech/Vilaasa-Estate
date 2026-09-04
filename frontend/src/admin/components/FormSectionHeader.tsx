import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FormSectionHeaderProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  isExpanded: boolean;
  isVisible: boolean;
  onToggleExpanded: () => void;
  onToggleVisibility: (visible: boolean) => void;
  actionButton?: React.ReactNode;
}

export const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  id,
  title,
  icon,
  subtitle,
  isExpanded,
  isVisible,
  onToggleExpanded,
  onToggleVisibility,
  actionButton,
}) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3 mb-5 cursor-pointer select-none"
      onClick={onToggleExpanded}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            id={`vis-${id}`}
            checked={isVisible}
            onChange={(e) => onToggleVisibility(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
            title="Toggle section visibility on public page"
          />
          <label
            htmlFor={`vis-${id}`}
            className="cursor-pointer select-none"
            title="Section visibility on public page"
          >
            {isVisible ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Public
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Hidden
              </span>
            )}
          </label>
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 truncate">
            {icon}
            {title}
          </span>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {actionButton}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          title={isExpanded ? "Collapse Section" : "Expand Section"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </Button>
      </div>
    </div>
  );
};
