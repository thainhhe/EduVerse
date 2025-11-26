// services/googleDrive.service.js
const fs = require("fs");
const path = require("path");
const drive = require("../../config/googleDrive.config");

const googleDriveService = {
  uploadFile: async (file, folderId) => {
    try {
      // 1) Kiểm tra xem file gốc có phải Word không
      const isWord =
        file.mimetype === "application/msword" ||
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      // 2) Chuẩn bị metadata: nếu là Word -> đặt tên .pdf và mimeType đích là application/pdf
      const nameToUpload = isWord
        ? path.parse(file.filename).name + ".pdf"
        : `${Date.now()}-${file.originalname}`;

      const requestBody = {
        name: nameToUpload,
        parents: folderId ? [folderId] : undefined,
        mimeType: isWord ? "application/pdf" : file.mimetype,
      };

      // 3) Chuẩn bị media: body là stream từ file.path, mimeType luôn là mime gốc
      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      // 4) Upload lên Drive
      const response = await drive.files.create({
        requestBody,
        media,
        fields: "id, name, size, webViewLink, mimeType",
      });

      // 5) Sau khi upload thành công, set permission public (anyone with link)
      try {
        const permRes = await drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });
        console.log("Drive permission set:", permRes.status || "ok");
      } catch (permErr) {
        console.error(
          "Không thể đặt permission public:",
          permErr.message || permErr
        );
      }

      console.log("Upload lên Google Drive thành công:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi upload lên Google Drive:", error.message || error);
      throw error;
    } finally {
      // 6) Xóa file tạm sau khi upload (hoặc khi lỗi)
      try {
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (e) {
        console.error("Lỗi xóa file tạm:", file && file.path, e);
      }
    }
  },
};

module.exports = googleDriveService;
