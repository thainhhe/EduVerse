import api from "./api";

// Courses
export const getMyCourses = () => api.get("/api/v1/courses/mine");
export const getCourse = (id) => api.get(`/api/v1/courses/${id}`);
export const createCourse = (payload) =>
  api.post("/api/v1/courses/create", payload);
export const updateCourse = (id, payload) =>
  api.put(`/api/v1/courses/update/${id}`, payload);
export const deleteCourse = (id) => api.delete(`/api/v1/courses/delete/${id}`);

// Modules
export const getModulesInCourse = (courseId) =>
  api.get(`/api/v1/module/course-module/${courseId}`);
export const createModule = (payload) =>
  api.post("/api/v1/module/create", payload);
export const updateModule = (id, payload) =>
  api.put(`/api/v1/module/update/${id}`, payload);
export const deleteModule = (id) => api.delete(`/api/v1/module/delete/${id}`);

// Lessons
export const getLessonsInModule = (moduleId) =>
  api.get(`/api/v1/lesson/${moduleId}`);
export const createLesson = (payload) =>
  api.post(`/api/v1/lesson/create`, payload);
export const updateLesson = (id, payload) =>
  api.put(`/api/v1/lesson/update/${id}`, payload);
export const deleteLesson = (id) => api.delete(`/api/v1/lesson/delete/${id}`);

// Quiz
export const getQuiz = (id) => api.get(`/api/v1/quiz/${id}`);
export const createQuiz = (payload) => api.post(`/api/v1/quiz`, payload);
export const updateQuiz = (id, payload) =>
  api.put(`/api/v1/quiz/${id}`, payload);
export const deleteQuiz = (id) => api.delete(`/api/v1/quiz/${id}`);
