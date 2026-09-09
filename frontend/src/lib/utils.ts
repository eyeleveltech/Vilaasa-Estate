import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deduplicates and formats distance and travelTime for nearby places / commute displays.
 * Prevents redundant displays like:
 *   "12 MINUTES drive" (primary) + "12 MINUTES" (secondary)
 *   "15 mins" + "15 mins"
 *   "Nearby" + "10 mins" (promotes "10 mins" to primary)
 */
export function getDisplayProximity(
  distance?: string | null,
  travelTime?: string | null
): { primary: string; secondary: string | null } {
  const d = (distance || "").trim();
  const t = (travelTime || "").trim();

  // If both empty
  if (!d && !t) return { primary: "Nearby", secondary: null };

  // If only distance
  if (d && !t) return { primary: d, secondary: null };

  // If only travelTime
  if (!d && t) return { primary: t, secondary: null };

  // If distance is generic "Nearby" but travelTime is specific
  if (d.toLowerCase() === "nearby" && t) {
    return { primary: t, secondary: null };
  }

  // Normalization helper for redundancy check
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const dNorm = normalize(d);
  const tNorm = normalize(t);

  // Strip generic modifiers like "drive", "driving", "away", "mins", "minutes" to check if the core value is the same
  const stripModifiers = (s: string) =>
    s
      .toLowerCase()
      .replace(/\b(drive|driving|mins?|minutes?|hrs?|hours?|walk|walking|away)\b/gi, "")
      .replace(/[^a-z0-9]/gi, "")
      .trim();

  const dCore = stripModifiers(d);
  const tCore = stripModifiers(t);

  const isRedundant =
    dNorm === tNorm ||
    dNorm.includes(tNorm) ||
    tNorm.includes(dNorm) ||
    Boolean(dCore && dCore === tCore);

  if (isRedundant) {
    // Pick the cleaner/better string
    const primary = d.length >= t.length ? d : t;
    return { primary, secondary: null };
  }

  // Truly distinct info (e.g. distance = "8 km", travelTime = "10 minutes")
  return { primary: d, secondary: t };
}
