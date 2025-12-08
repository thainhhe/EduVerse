// src/context/AuthContext.jsx

import React, { createContext, useCallback, useEffect, useState } from "react";
import authService from "@/services/authService";
import { toast } from "react-toastify";

export const AuthContext = createContext(null);

function parseJwt(token) {
    try {
        const [, payloadBase64] = token.split(".");
        if (!payloadBase64) return null;
        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
        return payload;
    } catch (e) {
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                const payload = parseJwt(accessToken);
                const userId = payload?.id ?? payload?._id ?? payload?.sub ?? null;

                if (!userId) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    setLoading(false);
                    return;
                }

                try {
                    const currentUser = await authService.getCurrentUser(userId);

                    const normalized = currentUser?.data?.user ?? currentUser?.data ?? currentUser;

                    if (normalized) {
                        setUser(normalized);
                    }
                } catch (err) {
                    const status = err?.response?.status;
                    if (status === 401 || status === 403) {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                    } else {
                        console.warn("getCurrentUser failed (non-auth):", err);
                    }
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
                res?.refreshToken || res?.data?.refreshToken || res?.data?.data?.refreshToken;

            const userFromRes = res?.user || res?.data?.user || res?.data?.data?.user || res?.data || null;

            if (accessToken) localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

            let finalUser = userFromRes;
            if (!finalUser && accessToken) {
                try {
                    const me = await authService.getCurrentUser();
                    finalUser = me?.data?.user ?? me?.data ?? me ?? null;
                } catch (e) {
                    finalUser = null;
                }
            }

            if (finalUser) {
                setUser(finalUser);
                toast.success("Login successful!");
                return { success: true, user: finalUser };
            }

            if (accessToken) {
                setUser(null);
                toast.success("Login successful!");
                return { success: true, user: null };
            }

            return { success: false, error: "Invalid response from server" };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Login failed";
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const res = await authService.register(userData);

            const accessToken =
                res?.accessToken ||
                res?.token ||
                res?.data?.accessToken ||
                res?.data?.token ||
                res?.data?.data?.accessToken ||
                res?.data?.data?.token;

            const refreshToken =
                res?.refreshToken || res?.data?.refreshToken || res?.data?.data?.refreshToken;

            const userFromRes = res?.user || res?.data?.user || res?.data?.data?.user || res?.data || null;

            // Disable auto-login after registration
            // if (accessToken) localStorage.setItem("accessToken", accessToken);
            // if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

            // let finalUser = userFromRes;
            // if (!finalUser && accessToken) {
            //     try {
            //         const me = await authService.getCurrentUser();
            //         finalUser = me?.data?.user ?? me?.data ?? me ?? null;
            //     } catch (e) {
            //         finalUser = null;
            //     }
            // }

            // if (finalUser) {
            //     setUser(finalUser);
            //     toast.success("Registration successful!");
            //     return { success: true };
            // }

            toast.success("Registration successful! Please log in.");
            return { success: true };
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || "Registration failed";
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        try {
            authService.logout();

            setUser(null);
            toast.success("Logout successful!");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const hasPermission = useCallback(
        (requiredPermissions) => {
            if (!user || !user.permissions) return false;
            return requiredPermissions.every((permission) => user.permissions.includes(permission));
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
        setUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
