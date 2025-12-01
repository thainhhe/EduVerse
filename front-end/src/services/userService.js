import api from "./api";

// Get all users (admin)
export const getAllUsers = () => api.get(`/admin/manage-user`);
export const getUserById = (id) => api.get(`/admin/manage-user/${id}`);

// Instructors
export const getAllInstructor = () => api.get(`/users/instructor`);
export const getPopularInstructors = (limit = 4) => api.get(`/users/instructor/popular?limit=${limit}`);

// User actions (admin)
export const lockUser = (userId) => api.put(`/admin/manage-user/lock/${userId}`);
export const unlockUser = (userId) => api.put(`/admin/manage-user/unlock/${userId}`);
export const deleteUser = (userId) => api.delete(`/admin/manage-user/banned/${userId}`);

// Permissions
export const getPermissions = () => api.get(`/users/permission`);
export const assignPermission = (payload) => api.put(`/users/permission`, payload);
export const invitePermission = (payload) => api.post(`/users/permission/invite`, payload);

export default {
    getAllUsers,
    getUserById,
    getAllInstructor,
    getPopularInstructors,
    lockUser,
    unlockUser,
    deleteUser,
    getPermissions,
    assignPermission,
    invitePermission,
};
