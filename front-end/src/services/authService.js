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
    try {
      await api.post("/auth/logout");
    } catch (e) {}
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
    if (!id) {
      try {
        const me = await api.get("/auth/me");
        return me;
      } catch (e) {
        return null;
      }
    }
    const res = await api.get(`/users/profile/${id}`);
    return res;
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
