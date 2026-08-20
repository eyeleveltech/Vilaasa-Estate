import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import {
  Property,
  PropertyFilterParams,
  ApiResponse,
  PropertyStats,
} from "../types/admin.types";

export const useAdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchProperties = useCallback(
    async (params: PropertyFilterParams = {}) => {
      setLoading(true);
      try {
        // Clean out empty string params
        const cleanParams: Record<string, string | number> = {};
        Object.entries(params).forEach(([key, val]) => {
          if (val !== "" && val !== undefined && val !== null) {
            cleanParams[key] = val;
          }
        });

        const res = await api.get<ApiResponse<Property[]>>("/properties", {
          params: cleanParams,
        });

        if (res.data.success) {
          setProperties(res.data.data);
          if (res.data.meta) {
            setMeta(res.data.meta);
          }
        }
      } catch (err: unknown) {
        const errorMsg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load properties";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get<ApiResponse<PropertyStats>>("/properties/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to load property analytics";
      toast.error(errorMsg);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const deleteProperty = async (id: string): Promise<boolean> => {
    try {
      const res = await api.delete<ApiResponse<{ id: string }>>(
        `/properties/${id}`,
      );
      if (res.data.success) {
        toast.success("Property soft-deleted successfully");
        setProperties((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete property";
      toast.error(errorMsg);
      return false;
    }
  };

  return {
    properties,
    loading,
    stats,
    statsLoading,
    meta,
    fetchProperties,
    fetchStats,
    deleteProperty,
  };
};
