import api from "./api";

// Courses
export const getForumByCourseId = (id) => api.get(`/forum/course/${id}`);
