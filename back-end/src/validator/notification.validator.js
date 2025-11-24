const Yup = require("yup");

const notificationYupSchema = Yup.object().shape({
    receiverId: Yup.lazy((val) =>
        Array.isArray(val)
            ? Yup.array().of(Yup.string().required()).min(1, "Phải có ít nhất 1 người nhận")
            : Yup.string().nullable()
    ),

    senderId: Yup.string().nullable(),

    title: Yup.string().trim().max(200, "Tiêu đề quá dài").nullable(),

    type: Yup.string()
        .oneOf(["info", "warning", "alert", "success", "error"], "Loại thông báo không hợp lệ")
        .default("info"),

    message: Yup.string()
        .trim()
        .min(1, "Nội dung thông báo quá ngắn")
        .max(1000, "Nội dung quá dài")
        .required("message là bắt buộc"),

    link: Yup.string().url("Link không hợp lệ").nullable(),

    isGlobal: Yup.boolean().default(false),
});

module.exports = { notificationYupSchema };
