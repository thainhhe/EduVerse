// src/routes/PermissionBasedRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

const PermissionBasedRoute = ({ allowedPermissions }) => {
  const { user, isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(allowedPermissions)) {
    // Chuyển hướng về trang dashboard nếu không có quyền
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PermissionBasedRoute;
