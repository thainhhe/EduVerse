import axios from "axios";
import { API_BASE_URL } from "@config/constants";
import { loadingManager } from "@/helper/loadingManager";
import Swal from "sweetalert2";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

const shouldSkipLoading = (config) => {
    // If skipLoading is explicitly false, we show the loading overlay (return false to NOT skip)
    if (config.skipLoading === false) {
        return false;
    }
    // Otherwise (true or undefined), we skip the loading overlay
    return true;
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
                Swal.fire({
                    icon: "error",
                    title: "Error...",
                    text: "Session expired. Please login again.",
                });
                window.location.href = "/";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
