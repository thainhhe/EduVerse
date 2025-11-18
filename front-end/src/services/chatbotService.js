import api from "./api";

export const sendChatQuery = async (message, history = []) => {
  try {
    // api.post may return axios response or already-unwrapped response.data depending on wrapper.
    const raw = await api.post("/chatbot/query", { message, history });

    // normalize: try several shapes to find the useful payload
    const payload =
      // axios: raw.data
      raw && raw.data
        ? raw.data
        : // wrapper may already return { success, message, data }
        raw && raw.success !== undefined
        ? raw
        : // fallback to raw
          raw;

    // payload could be { success, message, data } or { reply } or { data: { reply } }
    const reply =
      payload?.reply ||
      payload?.data?.reply ||
      (typeof payload?.data === "string" ? payload.data : null) ||
      payload?.message ||
      null;

    if (reply != null) {
      return { reply: String(reply) };
    }

    // If nothing found, return full payload for debugging
    return { reply: JSON.stringify(payload || {}) };
  } catch (err) {
    console.error("chatbotService.sendChatQuery error:", err?.message || err);
    return { reply: "Xin lỗi, tôi đang có lỗi. Vui lòng thử lại sau." };
  }
};

export default { sendChatQuery };
