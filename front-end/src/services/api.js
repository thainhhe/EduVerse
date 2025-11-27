import axios from "axios";
import { API_BASE_URL } from "@config/constants";
import { loadingManager } from "@/helper/loadingManager";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// List of endpoints that should not trigger the loading overlay
const SILENT_ENDPOINTS = [
    "/notifications", // Polling notifications
    "/chat", // Real-time chat
    "/messages",
    "/complete",
    "/uncomplete",
    "/quiz",
];

const shouldSkipLoading = (config) => {
    if (config.skipLoading) return true;
    return SILENT_ENDPOINTS.some((endpoint) => config.url?.includes(endpoint));
};

api.interceptors.request.use(
    (config) => {
        if (!shouldSkipLoading(config)) {
            loadingManager.start();
        }
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const currentCourseId = sessionStorage.getItem("currentCourseId");
        if (!currentCourseId) return config;
        if (config.method === "get") {
            config.params = {
                ...config.params,
                courseId: currentCourseId,
            };
        } else {
            if (config.data instanceof FormData) {
                config.data.append("currentCourseId", currentCourseId);
            } else {
                config.data = { ...config.data, currentCourseId };
            }
        }
        return config;
    },
    (error) => {
        loadingManager.stop();
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        if (!shouldSkipLoading(response.config)) {
            loadingManager.stop();
        }
        return response.data;
    },
    async (error) => {
        if (!shouldSkipLoading(error.config || {})) {
            loadingManager.stop();
        }
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
