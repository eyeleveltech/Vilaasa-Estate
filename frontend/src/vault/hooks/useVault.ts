import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/axios";

/* -------------------- TYPES -------------------- */

export interface VaultSummary {
  totalProperties: number;
  totalInvested: number;
  currentPortfolioValue: number;
  totalAppreciation: number;
  appreciationPercent: number;
  monthlyRentalIncome: number;
  annualRentalIncome: number;
  annualizedYieldPercent: number;
  currency?: string;
}

export interface VaultAsset {
  id: string;
  unitNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValuation: number;
  monthlyRentalYield: number | null;
  occupancyStatus: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE";
  property: {
    id: string;
    name: string;
    slug: string;
    type: string;
    currency?: string;
    location: { city: string; country: string; community: string | null };
    media: Array<{ url: string; isFeatured: boolean }>;
  };
}

export interface VaultPortfolio {
  summary: VaultSummary;
  assets: VaultAsset[];
}

export interface VaultUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/* -------------------- HOOKS -------------------- */

/**
 * Hook to manage investor authentication for The Vault
 */
export function useVaultLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post<
        ApiResponse<{
          user: VaultUser;
          token: string;
        }>
      >("/vault/login", { email, password });

      if (res.data.success && res.data.data) {
        const { user, token } = res.data.data;
        localStorage.setItem("vilaasa-vault-token", token);
        localStorage.setItem("vilaasa-vault-user", JSON.stringify(user));
        toast.success(`Welcome to The Vault, ${user.name}`);
        navigate("/vault/dashboard");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Invalid investor credentials. Please verify your access details.";
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("vilaasa-vault-token");
    localStorage.removeItem("vilaasa-vault-user");
    toast.success("Signed out of The Vault");
    navigate("/vault/login");
  };

  return { login, logout, loading, error };
}

/**
 * Hook to fetch the currently authenticated investor's portfolio and summary
 */
export function useVaultPortfolio() {
  const [portfolio, setPortfolio] = useState<VaultPortfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("vilaasa-vault-token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      interface RawPortfolioResponse {
        summary: {
          totalPortfolioValue?: number;
          currentPortfolioValue?: number;
          totalInvested?: number;
          totalAppreciation?: number;
          appreciationPercent?: number;
          totalMonthlyRental?: number;
          monthlyRentalIncome?: number;
          annualizedYieldPercent?: number;
          totalUnits?: number;
          totalProperties?: number;
        };
        assets: Array<{
          id: string;
          unitNumber: string;
          occupancyStatus: "OCCUPIED" | "VACANT" | "UNDER_MAINTENANCE";
          purchaseDate: string;
          purchasePrice: number | string;
          currentValuation: number | string;
          monthlyRentalYield?: number | string | null;
          property: {
            id: string;
            slug?: string;
            name: string;
            type: string;
            currency?: string;
            city?: string;
            country?: string;
            community?: string | null;
            heroImage?: string | null;
            location?: { city: string; country: string; community: string | null };
            media?: Array<{ url: string; isFeatured: boolean }>;
          };
        }>;
      }

      const res = await api.get<ApiResponse<RawPortfolioResponse>>(
        "/vault/portfolio",
        { headers },
      );

      if (res.data.success && res.data.data) {
        const raw = res.data.data;
        const rawSummary = raw.summary || {};

        const mappedAssets: VaultAsset[] = (raw.assets || []).map((a) => {
          const prop = a.property;
          const loc = prop.location || {
            city: prop.city || "Dubai",
            country: prop.country || "UAE",
            community: prop.community || null,
          };

          const mediaList = prop.media || [];
          if (mediaList.length === 0 && prop.heroImage) {
            mediaList.push({ url: prop.heroImage, isFeatured: true });
          }

          return {
            id: a.id,
            unitNumber: a.unitNumber || "Private Holding",
            purchaseDate: a.purchaseDate,
            purchasePrice: Number(a.purchasePrice) || 0,
            currentValuation: Number(a.currentValuation) || 0,
            monthlyRentalYield: a.monthlyRentalYield ? Number(a.monthlyRentalYield) : null,
            occupancyStatus: a.occupancyStatus || "OCCUPIED",
            property: {
              id: prop.id,
              name: prop.name,
              slug: prop.slug || prop.id,
              type: prop.type || "RESIDENTIAL_VILLA",
              currency: prop.currency || "INR",
              location: loc,
              media: mediaList,
            },
          };
        });

        const totalInvested =
          rawSummary.totalInvested !== undefined
            ? Number(rawSummary.totalInvested)
            : mappedAssets.reduce((sum, a) => sum + a.purchasePrice, 0);

        const currentPortfolioValue =
          rawSummary.totalPortfolioValue !== undefined
            ? Number(rawSummary.totalPortfolioValue)
            : rawSummary.currentPortfolioValue !== undefined
              ? Number(rawSummary.currentPortfolioValue)
              : mappedAssets.reduce((sum, a) => sum + a.currentValuation, 0);

        const totalAppreciation =
          rawSummary.totalAppreciation !== undefined
            ? Number(rawSummary.totalAppreciation)
            : currentPortfolioValue - totalInvested;

        const appreciationPercent =
          rawSummary.appreciationPercent !== undefined
            ? Number(rawSummary.appreciationPercent)
            : totalInvested > 0
              ? (totalAppreciation / totalInvested) * 100
              : 0;

        const monthlyRentalIncome =
          rawSummary.totalMonthlyRental !== undefined
            ? Number(rawSummary.totalMonthlyRental)
            : rawSummary.monthlyRentalIncome !== undefined
              ? Number(rawSummary.monthlyRentalIncome)
              : mappedAssets.reduce((sum, a) => sum + (a.monthlyRentalYield || 0), 0);

        const annualRentalIncome = monthlyRentalIncome * 12;

        const annualizedYieldPercent =
          rawSummary.annualizedYieldPercent !== undefined
            ? Number(rawSummary.annualizedYieldPercent)
            : currentPortfolioValue > 0
              ? (annualRentalIncome / currentPortfolioValue) * 100
              : 0;

        const mappedSummary: VaultSummary = {
          totalProperties: rawSummary.totalUnits || rawSummary.totalProperties || mappedAssets.length,
          totalInvested,
          currentPortfolioValue,
          totalAppreciation,
          appreciationPercent,
          monthlyRentalIncome,
          annualRentalIncome,
          annualizedYieldPercent,
          currency: mappedAssets[0]?.property?.currency || "INR",
        };

        setPortfolio({
          summary: mappedSummary,
          assets: mappedAssets,
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to load investor portfolio";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
}

/**
 * Hook to fetch a single vault asset by ID
 */
export function useVaultAsset(id?: string) {
  const [asset, setAsset] = useState<VaultAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAsset = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("vilaasa-vault-token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await api.get<ApiResponse<VaultAsset>>(`/vault/assets/${id}`, {
          headers,
        });

        if (res.data.success && res.data.data) {
          setAsset(res.data.data);
        }
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || `Failed to load asset '${id}'`;
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  return { asset, loading, error };
}
