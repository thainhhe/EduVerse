// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "@services/authService";
import { toast } from "react-toastify";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          // Try to get current user from backend (if implemented)
          const res = await authService.getCurrentUser();
          // authService returns response.data (api wrapper), so handle multiple shapes
          const currentUser =
            res?.user || res?.data?.user || res?.data?.data?.user || res;
          if (currentUser) setUser(currentUser);
        } catch (err) {
          // failed to restore session -> clear tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);

      const accessToken =
        res?.accessToken ||
        res?.token ||
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.data?.data?.accessToken ||
        res?.data?.data?.token;

      const refreshToken =
        res?.refreshToken ||
        res?.data?.refreshToken ||
        res?.data?.data?.refreshToken;

      const userFromRes =
        res?.user ||
        res?.data?.user ||
        res?.data?.data?.user ||
        res?.data ||
        null;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      if (userFromRes) {
        setUser(userFromRes);
        toast.success("Đăng nhập thành công!");
        return { success: true, user: userFromRes };
      }

      if (accessToken) {
        setUser(null);
        toast.success("Đăng nhập thành công!");
        return { success: true, user: null };
      }

      return { success: false, error: "Invalid response from server" };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);

      // same extraction as login
      const accessToken =
        res?.accessToken ||
        res?.token ||
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.data?.data?.accessToken ||
        res?.data?.data?.token;

      const refreshToken =
        res?.refreshToken ||
        res?.data?.refreshToken ||
        res?.data?.data?.refreshToken;

      const userFromRes =
        res?.user ||
        res?.data?.user ||
        res?.data?.data?.user ||
        res?.data ||
        null;

      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      if (userFromRes) {
        setUser(userFromRes);
        toast.success("Đăng ký thành công!");
        return { success: true };
      }

      // If no user returned, consider registration success (some backends don't auto-login)
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Đăng ký thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // call backend logout if endpoint exists, otherwise just clear local
      try {
        await authService.logout();
      } catch (e) {
        // ignore network errors on logout
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  const hasPermission = useCallback(
    (requiredPermissions) => {
      if (!user || !user.permissions) {
        return false;
      }
      return requiredPermissions.every((permission) =>
        user.permissions.includes(permission)
      );
    },
    [user]
  );

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
