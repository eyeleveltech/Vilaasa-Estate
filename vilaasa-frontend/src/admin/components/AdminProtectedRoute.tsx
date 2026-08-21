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

  // If a Channel Partner accesses /admin/*, redirect to their dedicated /partner/dashboard
  if (user && user.role === "CHANNEL_PARTNER") {
    return <Navigate to="/partner/dashboard" replace />;
  }

  return <>{children}</>;
};
