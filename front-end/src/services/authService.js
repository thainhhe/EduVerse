import api from "./api";
import { API_BASE_URL } from "@/config/constants";

const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res;
  },

  register: async (payload) => {
    const res = await api.post("/auth/register", payload);
    return res;
  },

  logout: async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  forgotPassword: async (email) => {
    const res = await api.post("/users/reset-password", { email });
    return res;
  },

  resetPassword: async (token, password) => {
    const res = await api.post("/users/reset-password", {
      token,
      password,
    });
    return res;
  },

  verifyOtp: async (payload) => {
    // backend: POST /api/v1/users/verify-otp
    const res = await api.post("/users/verify-otp", payload);
    return res;
  },

  getCurrentUser: async (id) => {
    // nếu caller truyền id thì dùng luôn
    if (id) {
      const res = await api.get(`/users/profile/${id}`);
      return res;
    }

    // lấy accessToken từ localStorage
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;

      // base64url -> base64
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      // decode base64 and handle unicode
      const decoded = decodeURIComponent(
        Array.prototype.map
          .call(atob(payloadBase64), (c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const payload = JSON.parse(decoded);
      const userId = payload.id || payload._id || payload.sub || payload.userId;
      if (!userId) return null;

      const res = await api.get(`/users/profile/${userId}`);
      return res;
    } catch (e) {
      return null;
    }
  },

  updateProfile: async (id, payload) => {
    const res = await api.put(`/users/profile/${id}`, payload); // backend has PUT /profile/:id
    return res;
  },

  googleSignIn: () => {
    const base = (API_BASE_URL || "").replace(/\/+$/, "");
    const url = `${base}/auth/google`;
    window.location.href = url;
  },

  handleGoogleCallbackTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
};

export default authService;
