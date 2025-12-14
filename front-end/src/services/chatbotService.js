import api from "./api";

// Thay đổi hàm để nhận callback xử lý từng chunk
export const streamChatQuery = async (
  message,
  history = [],
  onChunk = () => {},
  onEnd = () => {},
  onError = () => {}
) => {
  const url =
    api && api.defaults && api.defaults.baseURL
      ? api.defaults.baseURL + "/chatbot/query"
      : "/chatbot/query";

  // 1. Khởi tạo headers cơ bản
  const headers = {
    "Content-Type": "application/json",
  };

  // 2. Lấy Authorization token an toàn từ axios defaults (nếu có)
  // Lưu ý: api.defaults.headers.common thường chứa Authorization
  if (api?.defaults?.headers?.common?.["Authorization"]) {
    headers["Authorization"] = api.defaults.headers.common["Authorization"];
  }
  // Hoặc fallback lấy từ localStorage nếu bạn lưu token ở đó (ví dụ: 'accessToken')
  else {
    const token = localStorage.getItem("accessToken"); // Thay 'accessToken' bằng key thực tế của bạn
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers, // Sử dụng biến headers đã chuẩn hóa
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      let errBody = null;
      try {
        errBody = await response.json();
      } catch (e) {}
      throw new Error(
        (errBody && errBody.message) || `HTTP ${response.status}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let fullResponse = "";
    let stopped = false;

    const processLines = (lines) => {
      for (const line of lines) {
        if (!line || !line.trim()) continue;
        try {
          const data = JSON.parse(line.trim());
          if (data.type === "text" && data.content) {
            onChunk(data.content);
            fullResponse += data.content;
          } else if (data.type === "end") {
            if (data.reply) fullResponse = data.reply;
            onEnd({ reply: fullResponse });
            stopped = true;
            return;
          } else if (data.type === "error") {
            onError(data.message || "Unknown error from AI service");
            stopped = true;
            return;
          }
        } catch (e) {
          // ignore malformed JSON line (may be partial)
        }
      }
    };

    // Read the stream
    while (!stopped) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n");
      buffer = parts.pop(); // remain partial
      processLines(parts);

      if (stopped) {
        try {
          await reader.cancel();
        } catch (e) {}
        break;
      }
    }

    // Process any leftover buffer
    if (!stopped && buffer && buffer.trim()) {
      processLines([buffer]);
    }

    if (!stopped) {
      onEnd({ reply: fullResponse });
    }
  } catch (err) {
    onError(err?.message || "Lỗi kết nối. Vui lòng thử lại.");
  }
};

// Vẫn export mặc định theo cấu trúc cũ
export default { streamChatQuery };
