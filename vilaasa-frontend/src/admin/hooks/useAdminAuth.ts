import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { AdminUser, ApiResponse } from "../types/admin.types";

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("vilaasa-admin-token"),
  );
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("vilaasa-admin-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("vilaasa-admin-token");
    const storedUser = localStorage.getItem("vilaasa-admin-user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await api.post<
        ApiResponse<{ user: AdminUser; token: string }>
      >("/auth/login", { email, password });

      if (res.data.success && res.data.data) {
        const { user: authUser, token: authToken } = res.data.data;
        
        localStorage.setItem("vilaasa-admin-token", authToken);
        localStorage.setItem("vilaasa-admin-user", JSON.stringify(authUser));
        if (authUser.role === "CHANNEL_PARTNER") {
          localStorage.setItem("vilaasa-partner-token", authToken);
          localStorage.setItem("vilaasa-partner-user", JSON.stringify(authUser));
        }
        
        setToken(authToken);
        setUser(authUser);

        if (authUser.role === "CHANNEL_PARTNER") {
          navigate("/partner/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
        return true;
      } else {
        toast.error(res.data.message || "Login failed");
        return false;
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Invalid email or password";
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("vilaasa-admin-token");
    localStorage.removeItem("vilaasa-admin-user");
    localStorage.removeItem("vilaasa-partner-token");
    localStorage.removeItem("vilaasa-partner-user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/admin/login");
  }, [navigate]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };
};
