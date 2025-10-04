import api from "./api";

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/auth/profile", userData);
    return response;
  },
};
