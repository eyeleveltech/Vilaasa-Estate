import React, { useState, useEffect, useCallback } from "react";
import { Save, RotateCcw, X, Clock } from "lucide-react";

interface DraftSaveBarProps {
  /** Unique key for this form's draft in localStorage */
  storageKey: string;
  /** Current form state to auto-save */
  formState: unknown;
  /** Called when the user clicks "Restore Draft" — passes back the saved state */
  onRestore: (savedState: unknown) => void;
  /** Delay in ms before auto-saving after last change (default: 2000ms) */
  debounceMs?: number;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

/**
 * Sticky bottom-left draft auto-save banner.
 * - Auto-saves formState to localStorage after debounce delay.
 * - Shows "Draft auto-saved X minutes ago" and a "Restore Draft" button.
 * - Offers "Discard Draft" to clear from storage.
 */
export const DraftSaveBar: React.FC<DraftSaveBarProps> = ({
  storageKey,
  formState,
  onRestore,
  debounceMs = 2000,
}) => {
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { timestamp: number; data: unknown };
        if (parsed?.timestamp && parsed?.data) {
          setHasDraft(true);
          setLastSaved(parsed.timestamp);
          setShowRestorePrompt(true);
        }
      }
    } catch {
      // Invalid JSON, clear it
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Update relative time label every 30s
  useEffect(() => {
    if (!lastSaved) return;
    setRelativeTime(formatRelativeTime(lastSaved));
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastSaved));
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  // Auto-save with debounce
  const saveDebounced = useCallback(() => {
    const timer = setTimeout(() => {
      try {
        const payload = { timestamp: Date.now(), data: formState };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setLastSaved(payload.timestamp);
        setHasDraft(true);
        setShowRestorePrompt(false); // restore prompt dismissed once user starts editing
      } catch {
        // Storage quota exceeded — silently ignore
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [formState, storageKey, debounceMs]);

  useEffect(() => {
    const cleanup = saveDebounced();
    return cleanup;
  }, [saveDebounced]);

  const handleRestore = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { timestamp: number; data: unknown };
        onRestore(parsed.data);
        setShowRestorePrompt(false);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setLastSaved(null);
    setShowRestorePrompt(false);
  };

  // Restore prompt — shown once on mount if draft exists
  if (showRestorePrompt && hasDraft && lastSaved) {
    return (
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-card shadow-xl px-4 py-3 text-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 shrink-0">
          <Save className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Unsaved draft found</p>
          <p className="text-muted-foreground">Saved {formatRelativeTime(lastSaved)}</p>
        </div>
        <button
          type="button"
          onClick={handleRestore}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 font-semibold transition-colors border border-amber-500/30"
        >
          <RotateCcw className="h-3 w-3" />
          Restore
        </button>
        <button
          type="button"
          onClick={handleDiscard}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Discard draft"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Auto-save status pill — shown after first auto-save
  if (lastSaved && !showRestorePrompt) {
    return (
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm shadow-sm px-3 py-1.5 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3 text-emerald-400 shrink-0" />
        <span>Draft saved {relativeTime}</span>
        {hasDraft && (
          <button
            type="button"
            onClick={handleDiscard}
            className="ml-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            title="Discard draft"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default DraftSaveBar;
