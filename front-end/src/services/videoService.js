import api from "./api";

export const videoService = {
  // getVideosByCourse: async (courseId) => {
  //   const response = await api.get(`/courses/${courseId}/videos`);
  //   return response;
  // },

  getVideoById: async (videoId) => {
    const response = await api.get(`/material/${videoId}/view`);
    return response;
  },

  uploadVideo: async (formData) => {
    return await api.post("/material", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // updateVideoProgress: async (videoId, progress) => {
  //   const response = await api.post(`/videos/${videoId}/progress`, {
  //     progress,
  //   });
  //   return response;
  // },

  // markVideoComplete: async (videoId) => {
  //   const response = await api.post(`/videos/${videoId}/complete`);
  //   return response;
  // },
};
