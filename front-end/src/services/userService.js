import api from "./api";

// Instructors
export const getAllInstructor = () => api.get(`/users/instructor`);
export const getPopularInstructors = (limit = 4) =>
  api.get(`/users/instructor/popular?limit=${limit}`);

// Permissions
export const getPermissions = () => api.get(`/users/permission`);
export const assignPermission = (payload) =>
  api.put(`/users/permission`, payload);
export const invitePermission = (payload) =>
  api.post(`/users/permission/invite`, payload);

export default {
  getAllInstructor,
  getPopularInstructors,
  getPermissions,
  assignPermission,
  invitePermission,
};
