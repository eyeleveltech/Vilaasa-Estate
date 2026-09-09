import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  const { user } = useAdminAuth();
  const token = localStorage.getItem("vilaasa-admin-token");

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Positive role verification: Only SUPER_ADMIN and ADMIN can access executive admin routes
  if (user && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    if (user.role === "CHANNEL_PARTNER") {
      return <Navigate to="/partner/dashboard" replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
