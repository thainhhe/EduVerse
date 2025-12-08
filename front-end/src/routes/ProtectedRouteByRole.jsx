import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";

const ProtectedRouteByRole = ({ allowedRoles }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="p-10 text-center text-lg font-bold">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
};

export default ProtectedRouteByRole;
