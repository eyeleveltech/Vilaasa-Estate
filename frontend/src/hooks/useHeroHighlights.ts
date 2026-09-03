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

const fallbackHighlights: HeroHighlightItem[] = [
  {
    id: "default-1",
    name: "Carlton",
    tagline: "Luxury Experiences • Andhra Pradesh",
    linkUrl: "/property/carlton",
    icon: "hotel_class",
    order: 1,
    isActive: true,
  },
  {
    id: "default-2",
    name: "Oxygen Forest",
    tagline: "Luxury Farm Living • Hyderabad",
    linkUrl: "/property/oxygen-forest",
    icon: "park",
    order: 2,
    isActive: true,
  },
  {
    id: "default-3",
    name: "Ayurvedic Sanctuary",
    tagline: "Holistic Wellness • Kerala",
    linkUrl: "/franchise/carlton-wellness-spa",
    icon: "spa",
    order: 3,
    isActive: true,
  },
];

export function useHeroHighlights() {
  const [highlights, setHighlights] = useState<HeroHighlightItem[]>(fallbackHighlights);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchHighlights() {
      try {
        const res = await api.get("/hero-highlights");
        if (isMounted && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setHighlights(res.data.data);
        }
      } catch (err) {
        console.warn("[HeroHighlights] Using fallback highlights:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHighlights();

    return () => {
      isMounted = false;
    };
  }, []);

  return { highlights, loading };
}
