import { useState, useEffect } from "react";
import api from "@/api/axios";

export interface HeroHighlightItem {
  id: string;
  name: string;
  tagline: string;
  linkUrl: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export function useHeroHighlights() {
  const [highlights, setHighlights] = useState<HeroHighlightItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchHighlights() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/hero-highlights");
        if (isMounted) {
          if (res.data.success && Array.isArray(res.data.data)) {
            // Sort by order ascending and ensure active items only
            const activeItems = res.data.data
              .filter((item: HeroHighlightItem) => item.isActive !== false)
              .sort((a: HeroHighlightItem, b: HeroHighlightItem) => a.order - b.order);
            setHighlights(activeItems);
          } else {
            setHighlights([]);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load hero highlights from API";
          console.error("[HeroHighlights] Failed to load highlights:", message);
          setError(message);
          setHighlights([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHighlights();

    return () => {
      isMounted = false;
    };
  }, []);

  return { highlights, loading, error };
}
