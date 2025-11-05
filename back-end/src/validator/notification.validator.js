const Yup = require("yup");

const notificationYupSchema = Yup.object().shape({
    receiverId: Yup.array().of(Yup.string()).min(1, "Phải có ít nhất 1 người nhận").required("receiverId là bắt buộc"),

    senderId: Yup.string().nullable(),

    type: Yup.string().oneOf(["info", "warning", "alert"], "Loại thông báo không hợp lệ").required("type là bắt buộc"),

    message: Yup.string()
        .trim()
        .min(3, "Nội dung thông báo quá ngắn")
        .max(1000, "Nội dung quá dài")
        .required("message là bắt buộc"),

    isGlobal: Yup.boolean().default(false),
});

module.exports = { notificationYupSchema };
