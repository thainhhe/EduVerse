const cloudinary = require("../config/cloudinary");
const { system_enum } = require("../config/enum/system.constant");
const fs = require("fs");

const response = (res, result) => {
  console.log("Response Utility - Result:", result);
  return res.status(result.status || 200).json({
    success: result.success ?? result.status < 400,
    message: result.message || "",
    data: result.data ?? null,
  });
};

const error_response = (res, error) => {
  // Thêm fallback phòng trường hợp system_enum bị undefined
  const statusCode =
    error?.status || system_enum?.STATUS_CODE?.INTERNAL_SERVER_ERROR || 500;
  const message =
    error?.message ||
    system_enum?.SYSTEM_MESSAGE?.SERVER_ERROR ||
    "Lỗi máy chủ nội bộ.";

  // Log chi tiết lỗi 500 ở server để debug
  if (statusCode === 500) {
    console.error("Chi tiết lỗi Internal Server Error:", error);
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    // Tùy chọn: chỉ trả về stack trace ở môi trường development
    ...(process.env.NODE_ENV === "development" &&
      error?.stack && { stack: error.stack }),
    ...(error?.errors && { errors: error.errors }), // Bao gồm lỗi validation nếu có
  });
};

const validate_schema = (schema) => async (req, res, next) => {
  try {
    await schema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    // Đảm bảo có fallback nếu system_enum không tồn tại
    const statusCode = system_enum?.STATUS_CODE?.BAD_REQUEST || 400;
    const message =
      system_enum?.SYSTEM_MESSAGE?.INVALID_INPUT ||
      "Dữ liệu đầu vào không hợp lệ.";
    return res.status(statusCode).json({
      success: false, // Thêm success: false
      message: message,
      errors: err.errors,
    });
  }
};

const getPublicIdFromUrl = (imageUrl) => {
    try {
        if (!imageUrl || typeof imageUrl !== "string") {
            throw new Error("Invalid image URL");
        }
        const urlParts = imageUrl.split("/");
        const uploadIndex = urlParts.indexOf("upload");
        if (uploadIndex === -1) {
            throw new Error("Invalid Cloudinary URL format");
        }
        const publicPath = urlParts.slice(uploadIndex + 1).join("/");
        const publicId = publicPath.replace(/\.[^/.]+$/, "");
        return publicId;
    } catch (error) {
        return null;
    }
};

const deleteImage = async (imgUrl) => {
    try {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (!publicId) {
            throw new Error("Missing public_id");
        }
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok") {
            throw new Error(`Cloudinary deletion failed: ${result.result}`);
        }
        return {
            success: true,
            message: "Ảnh đã được xóa thành công",
            public_id: publicId,
        };
    } catch (error) {
        console.error("❌ Lỗi khi xóa ảnh:", error.message);
        return {
            success: false,
            message: error.message,
        };
    }
};

const upLoadImage = async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: "course",
    });
    fs.unlinkSync(file.path);
    return result.secure_url;
};

module.exports = { response, error_response, validate_schema, upLoadImage, deleteImage };
