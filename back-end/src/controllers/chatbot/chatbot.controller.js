// back-end/src/controllers/chatbot/chatbot.controller.js
const axios = require("axios");
const { response, error_response } = require("../../utils/response.util");
const { STATUS_CODE } = require("../../config/enum/system.constant");
const ChatHistory = require("../../models/ChatHistory");

const CHATBOT_SERVICE_URL = `${process.env.CHATBOT_SERVICE_URL}/query` || "http://localhost:5001/query";

const readRawBody = (req) =>
    new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => resolve(data));
        req.on("error", (err) => reject(err));
    });

const chatbotController = {
    async handleQuery(req, res) {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Content-Type-Options", "nosniff");

        let replyMessage = "";
        const userId = req.user ? req.user._id : null;

        // SAFE: avoid direct destructuring from possibly undefined req.body
        let message;
        try {
            if (req.body && typeof req.body === "object") {
                message = req.body.message;
            } else {
                // Debug help: log content-type when body missing
                console.warn(
                    "[chatbotController] req.body missing or not object. content-type:",
                    req.headers["content-type"]
                );
                // Try to read raw body as fallback (in case client omitted content-type)
                if (req.method === "POST") {
                    const raw = await readRawBody(req);
                    if (raw) {
                        try {
                            const parsed = JSON.parse(raw);
                            message = parsed && parsed.message;
                        } catch (e) {
                            // not JSON — keep message undefined
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("[chatbotController] error while reading body fallback:", e?.message || e);
        }

        if (!message) {
            return res.status(400).json({ success: false, message: "message is required" });
        }

        try {
            const resp = await axios.post(
                CHATBOT_SERVICE_URL,
                { message },
                { responseType: "stream", timeout: 0 }
            );

            resp.data.pipe(res);

            resp.data.on("data", (chunk) => {
                const lines = chunk
                    .toString()
                    .split("\n")
                    .filter((l) => l.trim() !== "");
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.type === "end" && data.reply) {
                            replyMessage = data.reply;
                        }
                    } catch (e) {
                        // ignore partial JSON
                    }
                }
            });

            resp.data.on("end", () => {
                if (userId && replyMessage) {
                    ChatHistory.create({
                        userId: userId,
                        messages: [
                            { sender: "user", message: message, timestamp: new Date() },
                            { sender: "bot", message: replyMessage, timestamp: new Date() },
                        ],
                    }).catch((err) =>
                        console.error("Failed to save chat history (async):", err?.message || err)
                    );
                }
            });

            resp.data.on("error", (err) => {
                console.error("Stream error from chatbot service:", err?.message || err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: "Lỗi kết nối dịch vụ AI" });
                } else {
                    try {
                        res.end();
                    } catch (e) {}
                }
            });

            req.on("close", () => {
                try {
                    if (resp && resp.data && typeof resp.data.destroy === "function") {
                        resp.data.destroy();
                    }
                } catch (e) {}
            });
        } catch (error) {
            console.error("chatbotController.handleQuery error:", error?.message || error);
            return res.status(500).json({ success: false, message: "Lỗi khi xử lý chatbot" });
        }
    },
};
module.exports = chatbotController;
