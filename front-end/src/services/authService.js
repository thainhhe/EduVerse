import api from "./api";
import { API_BASE_URL } from "@/config/constants";

const authService = {
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data ?? res;
  },

  register: async (payload) => {
    const res = await api.post("/auth/register", payload);
    return res.data ?? res;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // keep forgot password endpoint (adjust if backend differs)
  forgotPassword: async (email) => {
    const res = await api.post("/users/forgot-password", { email });
    return res.data ?? res;
  },

  // reset password (backend standard)
  resetPassword: async (token, password) => {
    const res = await api.post("/users/reset-password", {
      token,
      password,
    });
    return res.data ?? res;
  },

  // verify OTP (new)
  verifyOtp: async (payload) => {
    // payload example: { email, otp } or adjust to backend expected shape
    const res = await api.post("/users/verify-otp", payload);
    return res.data ?? res;
  },

  // get user profile by id (if id omitted, try /profile)
  getCurrentUser: async (id) => {
    const path = id ? `/users/profile/${id}` : `/users/profile`;
    const res = await api.get(path);
    return res.data ?? res;
  },

  // update profile by id
  updateProfile: async (id, payload) => {
    const res = await api.put(`/users/profile/update/${id}`, payload);
    return res.data ?? res;
  },

  googleSignIn: () => {
    const base = (API_BASE_URL || "").replace(/\/+$/, "");
    // backend exposes /auth/google on the API base (API_BASE_URL already includes )
    const url = `${base}/auth/google`;
    window.location.href = url;
  },

  handleGoogleCallbackTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
};

export default authService;
