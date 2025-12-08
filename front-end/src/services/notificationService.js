import api from "./api";

const notificationService = {
    getAll: async () => {
        const res = await api.get("/notifications");
        return res;
    },

    getGlobal: async () => {
        const res = await api.get("/notifications/global");
        return res;
    },

    getByReceiverId: async (id, params = {}) => {
        const res = await api.get(`/notifications/receiver/${id}`, { params });
        return res;
    },

    markAsRead: async (id) => {
        const res = await api.put(`/notifications/read/${id}`);
        return res;
    },

    markAllAsRead: async (userId) => {
        const res = await api.put(`/notifications/read-all/${userId}`);
        return res;
    },

    delete: async (id) => {
        const res = await api.delete(`/notifications/delete/${id}`);
        return res;
    },

    create: async (data) => {
        const res = await api.post("/notifications/create", data);
        return res;
    },
};

export default notificationService;
