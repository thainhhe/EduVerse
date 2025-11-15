import api from "./api";

export const sendChatQuery = async (message, history = []) => {
  try {
    const resp = await api.post("/chatbot/query", {
      message,
      history,
    });
    // `api` đã trả về response.data; structure: { success, message, data }
    if (resp && resp.success) {
      return resp.data || {};
    }
    throw new Error("Invalid chatbot response");
  } catch (err) {
    console.error("chatbotService.sendChatQuery error:", err?.message || err);
    return { reply: "Xin lỗi, tôi đang có lỗi. Vui lòng thử lại sau." };
  }
};

export default { sendChatQuery };
