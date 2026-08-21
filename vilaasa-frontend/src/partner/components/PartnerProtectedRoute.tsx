import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../admin/hooks/useAdminAuth";

interface PartnerProtectedRouteProps {
  children: React.ReactNode;
}

export const PartnerProtectedRoute: React.FC<PartnerProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  const { user } = useAdminAuth();
  const token = localStorage.getItem("vilaasa-admin-token");

  if (!token) {
    return <Navigate to="/partner/login" state={{ from: location }} replace />;
  }

  // Both Channel Partners and Super Admins can view the partner portal
  if (user && user.role !== "CHANNEL_PARTNER" && user.role !== "SUPER_ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
