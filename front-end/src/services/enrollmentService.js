import api from "./api";

export const enrollmentService = {
  getEnrollmentsByUser: async (userId) => {
    const res = await api.get(`/enrollment/user/${userId}`);
    return res.data;
  },

  createEnrollment: async (data) => {
    const res = await api.post(`/enrollment`, data);
    return res.data;
  },

  deleteEnrollment: async (id) => {
    const res = await api.delete(`/enrollment/${id}`);
    return res.data;
  },
};
