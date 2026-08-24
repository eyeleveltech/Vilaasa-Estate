import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/api/axios";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/* -------------------- TYPES -------------------- */

export interface OverviewAsset {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  category: "real-estate" | "franchise";
  location: string;
  unitNumber: string;
  value: number;
  purchasePrice: number;
  currentEstimate: number;
  status: string;
  roi: number;
  image: string;
  tenancy?: {
    status: "occupied" | "vacant";
    tenant?: string;
    leaseExpiry?: string;
    rentStatus?: "paid" | "overdue" | "pending";
  };
  construction?: {
    structureProgress: number;
    interiorProgress: number;
    overallProgress: number;
  };
}

export interface VaultOverviewData {
  portfolioData: {
    totalValue: number;
    totalROI: number;
    monthlyIncome: number;
    assets: OverviewAsset[];
  };
  nextPayment: {
    amount: number;
    dueDate: string;
    property: string;
  };
  actionItems: Array<{
    id: string;
    type: "lease" | "construction" | "payment" | "document";
    message: string;
    urgency: "high" | "medium" | "low";
  }>;
}

export interface TenancyAsset {
  id: string;
  propertyId: string;
  name: string;
  unitNumber: string;
  location: string;
  image: string;
  status: "occupied" | "vacant";
  tenant?: {
    id?: string;
    name: string;
    leaseStart: string;
    leaseExpiry: string;
    monthlyRent: number;
    rentStatus: "paid" | "overdue" | "pending";
    lastPayment?: string;
  };
}

export interface VaultDocumentItem {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  size: string;
  icon: string;
  date: string;
  property?: string;
}

export interface PaymentItem {
  id: string;
  property: string;
  milestone: string;
  amount: number;
  dueDate: string;
  status: "upcoming" | "pending" | "completed";
  paidAmount?: number;
  totalAmount?: number;
}

export interface PaymentProgressItem {
  property: string;
  paid: number;
  total: number;
}

export interface VaultPaymentsData {
  payments: PaymentItem[];
  paymentProgress: PaymentProgressItem[];
}

export interface VaultConstructionAsset {
  id: string;
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  location: string;
  image: string;
  structureProgress: number;
  interiorProgress: number;
  overallProgress: number;
  lastUpdate: string;
  milestones: Array<{
    id: string;
    name: string;
    status: string;
    targetDate: string;
  }>;
  gallery: Array<{
    id: string;
    imageUrl: string;
    date: string;
    caption?: string;
  }>;
}

export interface ConciergeServiceRequest {
  id: string;
  type: string;
  property: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  description: string;
}

export interface ConciergePropertyOption {
  id: string;
  name: string;
}

export interface NomineeItem {
  id: string;
  name: string;
  relationship: string;
  email?: string | null;
  phone?: string | null;
  share: number;
  isPrimary: boolean;
}

export interface LegacyDocumentItem {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadedAt: string;
}

/* -------------------- HOOKS -------------------- */

/**
 * 1. Overview Hook
 */
export function useVaultOverview() {
  const [data, setData] = useState<VaultOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<VaultOverviewData>>("/vault/overview");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load Vault overview";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}

/**
 * 2. Tenancy Hook
 */
export function useVaultTenancy() {
  const [assets, setAssets] = useState<TenancyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenancy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<TenancyAsset[]>>("/vault/tenancy");
      if (res.data.success) {
        setAssets(res.data.data || []);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load tenancy assets";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenancy();
  }, [fetchTenancy]);

  return { assets, loading, error, refetch: fetchTenancy };
}

/**
 * 3. Documents Hook
 */
export function useVaultDocuments() {
  const [documents, setDocuments] = useState<VaultDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<VaultDocumentItem[]>>("/vault/documents");
      if (res.data.success) {
        setDocuments(res.data.data || []);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load document repository";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch: fetchDocuments };
}

/**
 * 4. Payments Hook
 */
export function useVaultPayments() {
  const [data, setData] = useState<VaultPaymentsData>({
    payments: [],
    paymentProgress: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<VaultPaymentsData>>("/vault/payments");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load payment milestones";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { data, loading, error, refetch: fetchPayments };
}

/**
 * 5. Construction Hook
 */
export function useVaultConstruction() {
  const [assets, setAssets] = useState<VaultConstructionAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConstruction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<VaultConstructionAsset[]>>(
        "/vault/construction",
      );
      if (res.data.success) {
        setAssets(res.data.data || []);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load construction feed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConstruction();
  }, [fetchConstruction]);

  return { assets, loading, error, refetch: fetchConstruction };
}

/**
 * 6. Concierge Hook
 */
export function useVaultConcierge() {
  const [requests, setRequests] = useState<ConciergeServiceRequest[]>([]);
  const [properties, setProperties] = useState<ConciergePropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConcierge = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<
        ApiResponse<{
          requests: ConciergeServiceRequest[];
          properties: ConciergePropertyOption[];
        }>
      >("/vault/concierge");
      if (res.data.success) {
        setRequests(res.data.data.requests || []);
        setProperties(res.data.data.properties || []);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load concierge requests";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = async (payload: {
    type: string;
    propertyId?: string;
    description: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<ConciergeServiceRequest>>(
        "/vault/concierge",
        payload,
      );
      if (res.data.success) {
        toast.success("Bespoke concierge request dispatched to Private Client Desk");
        fetchConcierge();
        return res.data.data;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit request";
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchConcierge();
  }, [fetchConcierge]);

  return {
    requests,
    properties,
    loading,
    submitting,
    error,
    refetch: fetchConcierge,
    submitRequest,
  };
}

/**
 * 7. Nominees & Legacy Hook
 */
export function useVaultNominees() {
  const [nominees, setNominees] = useState<NomineeItem[]>([]);
  const [legacyDocs, setLegacyDocs] = useState<LegacyDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nomRes, legRes] = await Promise.all([
        api.get<ApiResponse<NomineeItem[]>>("/vault/nominees"),
        api.get<ApiResponse<LegacyDocumentItem[]>>("/vault/legacy-documents"),
      ]);

      if (nomRes.data.success) {
        setNominees(nomRes.data.data || []);
      }
      if (legRes.data.success) {
        setLegacyDocs(legRes.data.data || []);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load succession data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNominee = async (payload: {
    name: string;
    relationship: string;
    email?: string;
    phone?: string;
    share: number;
    isPrimary: boolean;
  }) => {
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<NomineeItem>>("/vault/nominees", payload);
      if (res.data.success) {
        toast.success("Nominee added to succession ledger");
        fetchAll();
        return res.data.data;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to add nominee";
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNominee = async (id: string) => {
    try {
      const res = await api.delete<ApiResponse<null>>(`/vault/nominees/${id}`);
      if (res.data.success) {
        toast.success("Nominee removed from succession ledger");
        fetchAll();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete nominee";
      toast.error(msg);
    }
  };

  const addLegacyDoc = async (payload: {
    name: string;
    type: string;
    fileUrl: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<LegacyDocumentItem>>(
        "/vault/legacy-documents",
        payload,
      );
      if (res.data.success) {
        toast.success("Legacy document registered in encrypted depository");
        fetchAll();
        return res.data.data;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save legacy document";
      toast.error(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLegacyDoc = async (id: string) => {
    try {
      const res = await api.delete<ApiResponse<null>>(`/vault/legacy-documents/${id}`);
      if (res.data.success) {
        toast.success("Legacy document deleted");
        fetchAll();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to remove document";
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    nominees,
    legacyDocs,
    loading,
    submitting,
    error,
    refetch: fetchAll,
    addNominee,
    deleteNominee,
    addLegacyDoc,
    deleteLegacyDoc,
  };
}
