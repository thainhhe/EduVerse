const Yup = require("yup");

const roomValidator = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(3, "Tên phòng phải có ít nhất 3 ký tự")
        .max(100, "Tên phòng không được vượt quá 100 ký tự")
        .required("Vui lòng nhập tên phòng"),
    link: Yup.string().nullable(),
});

module.exports = roomValidator;
