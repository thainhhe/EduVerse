import api from "./api";

// Instructors
export const getAllInstructor = () => api.get(`/users/instructor`);

// Permissions
export const getPermissions = () => api.get(`/users/permission`);
export const assignPermission = (payload) =>
  api.put(`/users/permission`, payload);
export const invitePermission = (payload) =>
  api.post(`/users/permission/invite`, payload);

export default {
  getAllInstructor,
  getPermissions,
  assignPermission,
  invitePermission,
};
