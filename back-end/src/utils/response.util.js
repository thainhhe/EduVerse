const cloudinary = require("../config/cloudinary");
const { system_enum } = require("../config/enum/system.constant");
const fs = require("fs");

const response = (res, result) => {
    return res.status(result.status || 200).json({
        success: result.success ?? result.status < 400,
        message: result.message || "",
        data: result.data ?? null,
    });
};

const error_response = (res, error) => {
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
    });
};

const validate_schema = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (err) {
        return res.status(system_enum.STATUS_CODE.BAD_REQUEST).json({
            message: system_enum.SYSTEM_MESSAGE.INVALID_INPUT,
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
