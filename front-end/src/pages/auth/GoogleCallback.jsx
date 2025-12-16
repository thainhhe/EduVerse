import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "react-toastify";

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const qp = new URLSearchParams(location.search);
        const frag = location.hash?.startsWith("#")
            ? new URLSearchParams(location.hash.slice(1))
            : new URLSearchParams();

        // accept common param names
        const accessToken =
            qp.get("accessToken") || qp.get("token") || frag.get("accessToken") || frag.get("token");
        const refreshToken = qp.get("refreshToken") || frag.get("refreshToken");

        if (accessToken) {
            authService.handleGoogleCallbackTokens({ accessToken, refreshToken });
            // redirect to front page (or read VITE_FRONTEND_URL if backend redirects elsewhere)
            navigate("/", { replace: true });
            setTimeout(() => window.location.reload(), 200);
        } else {
            toast.error("Google login failed or token missing.");
            navigate("/login", { replace: true });
        }
    }, [location.search, location.hash]);

    return <div className="min-h-screen flex items-center justify-center">Processing Google login...</div>;
};

export default GoogleCallback;
