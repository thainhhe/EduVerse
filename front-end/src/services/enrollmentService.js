import api from "./api";

export const enrollmentService = {
  getEnrollmentsByUser: async (userId) => {
    const res = await api.get(`/enrollment/user/${userId}`);
    return res.data;
  },

  getDetailCourseEnrollmentsByUser: async (userId, courseId) => {
    const res = await api.get(
      `/enrollment/user/${userId}/course/${courseId}/detail`
    );
    return res.data;
  },

  createEnrollment: async (data) => {
    console.log("Enrollment data:", data);
    const res = await api.post(`/enrollment`, data);
    console.log("Enrollment created:", res.data);
    return res.data;
  },

  deleteEnrollment: async (id) => {
    const res = await api.delete(`/enrollment/${id}`);
    return res.data;
  },
};
