import api from "./api";

export const scoreService = {
  async checkQuizStatus(userId, quizId) {
    try {
      const res = await api.get(`score/check/${userId}/quiz/${quizId}`);
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi check quiz status:", error);
      return { success: false, message: "Lỗi khi kiểm tra trạng thái quiz" };
    }
  },

  async GetQuizByUseridQuizId(userId, quizId) {
    try {
      const res = await api.get(`score/user/${userId}/quiz/${quizId}`);
      return res;
    } catch (error) {
      console.error("❌ Lỗi khi get quiz staus:", error);
      return { success: false, message: "Lỗi khi get quiz" };
    }
  },
};
