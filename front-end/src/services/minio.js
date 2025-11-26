import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const minioApi = axios.create({
    baseURL: API_BASE_URL,
});

export const uploadDocument = async (file, data, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(data));

    return minioApi.post("/upload/document", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

export const uploadVideo = async (file, data, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data", JSON.stringify(data));

    return minioApi.post("/upload/video", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
};

export const getFiles = async () => {
    const response = await minioApi.get("/files");
    return response.data;
};

export const getFilesByLessonId = async (lessonId) => {
    const response = await minioApi.get(`/files/lesson/${lessonId}`);
    return response.data;
};

export const getFileById = async (id) => {
    const response = await minioApi.get(`/files/${id}`);
    return response.data;
};

export const deleteFile = async (id) => {
    const response = await minioApi.delete(`/files/${id}`);
    return response.data;
};

export const searchFiles = async (query) => {
    const response = await minioApi.get(`/files/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

export const getStreamUrl = (id) => {
    return `${API_BASE_URL}/stream/${id}`;
};
export const getDownloadUrl = (id) => {
    return `${API_BASE_URL}/stream/download/${id}`;
};

export default minioApi;
