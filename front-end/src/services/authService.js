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

  // accept optional id; if id provided call /user/profile/:id which matches backend router
  getCurrentUser: async (id = null) => {
    if (id) {
      const response = await api.get(`/users/profile/${id}`);
      // api interceptor returns response.data already
      return response;
    }

    // fallback: try common endpoints
    const endpoints = ["/auth/me", "/auth/profile", "/users/me"];
    for (const ep of endpoints) {
      try {
        const data = await api.get(ep);
        return data;
      } catch (err) {
        if (err?.response?.status === 404) continue;
        throw err;
      }
    }

    const e = new Error("Current user endpoint not found");
    e.response = { status: 404 };
    throw e;
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
