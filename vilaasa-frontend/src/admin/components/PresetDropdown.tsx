import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Wand2 } from "lucide-react";
import type { Preset } from "../lib/franchisePageHelpers";

interface PresetDropdownProps {
  presets: Preset[];
  onSelect: (preset: Preset | null) => void;
  triggerLabel?: string;
  /** If true, shows a "Create Custom" option which calls onSelect(null) */
  allowCustom?: boolean;
}

/**
 * A styled dropdown button that lists preset options.
 * Selecting a preset fires onSelect(preset).
 * Selecting "Create Custom" fires onSelect(null).
 */
export const PresetDropdown: React.FC<PresetDropdownProps> = ({
  presets,
  onSelect,
  triggerLabel = "Use Preset",
  allowCustom = true,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-primary/40 bg-primary/5 text-primary text-[11px] font-semibold hover:bg-primary/15 transition-colors"
      >
        <Wand2 className="h-3 w-3" />
        <span>{triggerLabel}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
          {allowCustom && (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors border-b border-border"
              >
                <span className="text-primary">✦</span>
                <span>Create Custom</span>
              </button>
            </>
          )}
          <div className="max-h-56 overflow-y-auto">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelect(preset);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-foreground hover:bg-secondary/60 transition-colors text-left"
              >
                {preset.icon && (
                  <span className="material-symbols-outlined text-sm text-muted-foreground shrink-0">
                    {preset.icon}
                  </span>
                )}
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetDropdown;
