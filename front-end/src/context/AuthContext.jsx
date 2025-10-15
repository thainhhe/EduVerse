// src/context/AuthContext.jsx

import { createContext, useState, useEffect, useCallback } from "react";
import { authService } from "@services/authService";
import { toast } from "react-toastify";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let mockUserData = null;

    if (email === "learner@eduverse.com" && password === "password123") {
      mockUserData = {
        name: "Test Learner",
        email: "learner@eduverse.com",
        role: "student",
        permissions: ["read:courses", "access_dashboard"],
      };
    } else if (
      email === "instructor@eduverse.com" &&
      password === "password123"
    ) {
      mockUserData = {
        name: "Test Instructor",
        email: "instructor@eduverse.com",
        role: "instructor",
        permissions: [
          "read:courses",
          "create:courses",
          "edit:courses",
          "access_dashboard",
        ],
      };
    } else if (email === "admin@eduverse.com" && password === "password123") {
      mockUserData = {
        name: "Test Admin",
        email: "admin@eduverse.com",
        role: "admin",
        permissions: [
          "read:courses",
          "create:courses",
          "edit:courses",
          "delete:courses",
          "manage:users",
          "access_dashboard",
        ],
      };
    }

    if (mockUserData) {
      setUser(mockUserData);
      toast.success("Đăng nhập thành công!");
      return { success: true };
    } else {
      toast.error("Sai email hoặc mật khẩu.");
      return { success: false, error: "Invalid credentials" };
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

  const logout = async () => {
    setUser(null);
    toast.success("Đăng xuất thành công!");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
