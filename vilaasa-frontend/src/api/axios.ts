import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token from localStorage based on portal & endpoint context
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If authorization header is already explicitly provided, respect it
    if (config.headers && config.headers.Authorization) {
      return config;
    }

    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const url = config.url || "";
    let token: string | null = null;

    if (url.startsWith("/vault") || pathname.startsWith("/vault")) {
      token =
        localStorage.getItem("vilaasa-vault-token") ||
        localStorage.getItem("vilaasa-admin-token");
    } else if (pathname.startsWith("/partner")) {
      token =
        localStorage.getItem("vilaasa-partner-token") ||
        localStorage.getItem("vilaasa-admin-token");
    } else if (
      pathname.startsWith("/admin") ||
      url.includes("/stats") ||
      url.includes("/timeline") ||
      url.includes("/status")
    ) {
      token = localStorage.getItem("vilaasa-admin-token");
    } else {
      // General fallback precedence
      token =
        localStorage.getItem("vilaasa-admin-token") ||
        localStorage.getItem("vilaasa-partner-token") ||
        localStorage.getItem("vilaasa-vault-token");
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle 401 Unauthorized per portal
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      const pathname =
        typeof window !== "undefined" ? window.location.pathname : "";

      if (pathname.startsWith("/vault")) {
        localStorage.removeItem("vilaasa-vault-token");
        localStorage.removeItem("vilaasa-vault-user");
        if (pathname !== "/vault/login") {
          window.location.href = "/vault/login";
        }
      } else if (pathname.startsWith("/partner")) {
        localStorage.removeItem("vilaasa-partner-token");
        localStorage.removeItem("vilaasa-partner-user");
        if (pathname !== "/partner/login") {
          window.location.href = "/partner/login";
        }
      } else if (pathname.startsWith("/admin")) {
        localStorage.removeItem("vilaasa-admin-token");
        localStorage.removeItem("vilaasa-admin-user");
        if (pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
