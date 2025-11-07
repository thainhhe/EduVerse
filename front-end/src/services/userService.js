import api from "./api";

// Courses
export const getAllInstructor = () => api.get(`/users/instructor`);
