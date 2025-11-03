import api from "./api";

// Courses
export const getAllCoursePublished = () => api.get(`/courses`);
export const getMyCourses = () => api.get("/courses/mine");
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (payload) => api.post("/courses/create", payload);
export const updateCourse = (id, payload) =>
  api.put(`/courses/update/${id}`, payload);
export const deleteCourse = (id) => api.delete(`/courses/delete/${id}`);

// Courses By Admin
export const getAllCourse = () => api.get(`/admin/courses`);
// export const getMyCourses = () => api.get("/courses/mine");
export const getAllCourseById = (id) => api.get(`/admin/courses/${id}`);

// ✅ Approve course
export const approveCourse = (id) => api.put(`/admin/courses/${id}/approve`);

// ✅ Reject course
export const rejectCourse = (id, reason) =>
  api.put(`/admin/courses/${id}/reject`, { reasonReject: reason });

export const getModulesInCourse = async (courseId) => {
  try {
    return await api.get(`/modules/course-module/${courseId}`);
  } catch (err) {
    if (err?.response?.status === 404) {
      // normalize to successful empty response shape expected by UI
      return { data: { data: [] } };
    }
    throw err;
  }
};
export const getModuleById = (id) => api.get(`/modules/${id}`);
export const createModule = (payload) => api.post("/modules/create", payload);
export const updateModule = (id, payload) =>
  api.put(`/modules/update/${id}`, payload);
export const deleteModule = (id) => api.delete(`/modules/delete/${id}`);

// Lessons
export const getLessonsInModule = (moduleId) => api.get(`/lessons/${moduleId}`);
export const createLesson = (payload) => api.post(`/lessons/create`, payload);
export const updateLesson = (id, payload) =>
  api.put(`/lessons/update/${id}`, payload);
export const deleteLesson = (id) => api.delete(`/lessons/delete/${id}`);

// Quiz
export const getQuizById = (id) => api.get(`/quiz/${id}`);
export const getAllQuizzes = () => api.get(`/quiz`);
export const createQuiz = (payload) => api.post(`/quiz`, payload);
export const updateQuiz = (id, payload) => api.put(`/quiz/${id}`, payload);
export const deleteQuiz = (id) => api.delete(`/quiz/${id}`);
