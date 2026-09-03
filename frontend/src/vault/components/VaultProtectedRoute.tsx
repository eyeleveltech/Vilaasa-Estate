import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface JwtPayload {
  exp?: number;
  userId?: string;
  role?: string;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const VaultProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const token = localStorage.getItem("vilaasa-vault-token");

  if (!token) {
    return <Navigate to="/vault/login" state={{ from: location }} replace />;
  }

  const payload = parseJwt(token);

  // If token has expired, purge and redirect to login
  if (payload?.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("vilaasa-vault-token");
    localStorage.removeItem("vilaasa-vault-user");
    return <Navigate to="/vault/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default VaultProtectedRoute;
