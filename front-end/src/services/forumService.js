import api from "./api";

// Courses
export const getForumByCourseId = (id) => api.get(`/forum/course/${id}`);

export const updateForum = (id, payload) => api.put(`/forum/update/${id}`, payload);
