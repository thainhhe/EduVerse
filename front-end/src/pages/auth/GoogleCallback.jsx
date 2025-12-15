import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "@/services/authService";
import { toast } from "react-toastify";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const qp = new URLSearchParams(location.search);
      const frag = location.hash?.startsWith("#")
        ? new URLSearchParams(location.hash.slice(1))
        : new URLSearchParams();

      // accept both accessToken and token param names
      const accessToken =
        qp.get("accessToken") ||
        qp.get("token") ||
        frag.get("accessToken") ||
        frag.get("token");
      const refreshToken = qp.get("refreshToken") || frag.get("refreshToken");

      if (accessToken) {
        authService.handleGoogleCallbackTokens({ accessToken, refreshToken });

        // Fetch user info to get role for proper redirection
        try {
          const userInfo = await authService.getCurrentUser();
          const user = userInfo?.data?.user || userInfo?.data || userInfo;

          const role = user?.role || "learner"; // fallback to learner

          // Redirect based on role
          if (role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else if (role === "instructor") {
            navigate("/mycourses", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        } catch (error) {
          console.error("Failed to fetch user info:", error);
          toast.error("Failed to fetch user information. Redirecting to home.");
          navigate("/", { replace: true });
          setTimeout(() => window.location.reload(), 200);
        }
      } else {
        toast.error("Google login failed or token missing.");
        navigate("/login", { replace: true });
      }
    };

    handleGoogleCallback();
  }, [location.search, location.hash, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Processing Google login...
    </div>
  );
};

export default GoogleCallback;
