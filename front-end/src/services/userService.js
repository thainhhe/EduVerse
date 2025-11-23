import api from "./api";

// Instructors
export const getAllInstructor = () => api.get(`/users/instructor`);

// Permissions
export const getPermissions = () => api.get(`/users/permission`);
export const assignPermission = (payload) =>
  api.put(`/users/permission`, payload);
export const invitePermission = (payload) =>
  api.post(`/users/permission/invite`, payload);

export const getAllUser = () => api.get(`/admin/manage-user`);
export const deleteUser = (id) => api.delete(`/admin/manage-user/banned/${id}`);
export default {
  getAllInstructor,
  getPermissions,
  assignPermission,
  invitePermission,
  getAllUser,
};
