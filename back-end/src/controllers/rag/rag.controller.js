// src/controllers/rag/rag.controller.js
const ragService = require("../../services/rag/rag.service");

// --- THAY ĐỔI CÁCH IMPORT ---
// const { sendSuccess, sendError } = require("../../utils/response.util"); // XÓA DÒNG NÀY
const { response, error_response } = require("../../utils/response.util"); // <-- THÊM DÒNG NÀY

/**
 * Xử lý yêu cầu lấy dữ liệu đồng bộ cho RAG
 */
const getRagSyncData = async (req, res) => {
  try {
    console.log("Internal RAG Sync: Bắt đầu lấy dữ liệu tổng hợp...");
    const data = await ragService.getSyncData();
    console.log("Internal RAG Sync: Lấy dữ liệu thành công.");

    // --- THAY ĐỔI CÁCH GỌI HÀM ---
    // sendSuccess(res, data, "Dữ liệu RAG đã được tổng hợp thành công"); // XÓA DÒNG NÀY

    // Sử dụng hàm 'response' từ response.util.js
    response(res, {
      success: true,
      data: data,
      message: "Dữ liệu RAG đã được tổng hợp thành công",
    }); // <-- THÊM DÒNG NÀY
  } catch (error) {
    console.error("Lỗi khi tổng hợp dữ liệu RAG:", error);

    // --- THAY ĐỔI CÁCH GỌI HÀM --- (Đây là dòng 18 bị lỗi)
    // sendError(res, 500, error.message || "Lỗi máy chủ nội bộ"); // XÓA DÒNG NÀY

    // Sử dụng hàm 'error_response' từ response.util.js
    error_response(res, error); // <-- THÊM DÒNG NÀY
  }
};

module.exports = {
  getRagSyncData,
};
