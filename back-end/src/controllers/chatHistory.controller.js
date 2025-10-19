const ChatHistory = require("../models/ChatHistory");

const getAllChatHistories = async (req, res) => {
    try {
        const chatHistories = await ChatHistory.find().populate("userId", "name email");
        return res.status(200).json(chatHistories);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const createChatHistory = async (req, res) => {
    try {
        const { messages } = req.body;
        const userId = req.userId || req.body.userId;

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        const newChatHistory = new ChatHistory({
            userId,
            messages: messages || [],
        });

        await newChatHistory.save();
        return res.status(201).json(newChatHistory);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { id, messageId } = req.params;
        const chatHistory = await ChatHistory.findById(id);

        if (!chatHistory) {
            return res.status(404).json({ message: "Chat history not found" });
        }

        chatHistory.messages = chatHistory.messages.filter((msg) => msg._id.toString() !== messageId);

        await chatHistory.save();
        return res.status(200).json(chatHistory);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateMessage = async (req, res) => {
    try {
        const { id, messageId } = req.params;
        const { message: newMessage } = req.body;

        const chatHistory = await ChatHistory.findById(id);
        if (!chatHistory) {
            return res.status(404).json({ message: "Chat history not found" });
        }

        const msg = chatHistory.messages.id(messageId);
        if (!msg) {
            return res.status(404).json({ message: "Message not found" });
        }

        msg.message = newMessage;
        await chatHistory.save();

        return res.status(200).json(chatHistory);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const addMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { sender, message } = req.body;

        const chatHistory = await ChatHistory.findById(id);
        if (!chatHistory) {
            return res.status(404).json({ message: "Chat history not found" });
        }

        chatHistory.messages.push({ sender, message });
        await chatHistory.save();

        return res.status(200).json(chatHistory);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllChatHistories,
    createChatHistory,
    deleteMessage,
    updateMessage,
    addMessage,
};
