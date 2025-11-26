import api from "./api";

export const permissionService = {
    getAll: () => api.get("/users/permission"),
    assign: (data) => api.post("/users/permission", data),
};
