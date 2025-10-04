import api from "./api";

export const courseService = {
  getAllCourses: async (params) => {
    const response = await api.get("/courses", { params });
    return response;
  },

  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response;
  },

  createCourse: async (courseData) => {
    const response = await api.post("/courses", courseData);
    return response;
  },

  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response;
  },

  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response;
  },

  enrollCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response;
  },

  getMyCourses: async () => {
    const response = await api.get("/courses/my-courses");
    return response;
  },

  rateCourse: async (courseId, rating, review) => {
    const response = await api.post(`/courses/${courseId}/rate`, {
      rating,
      review,
    });
    return response;
  },
};
