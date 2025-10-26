const yup = require("yup");

const createForumSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(200, "Tiêu đề không được vượt quá 200 ký tự")
    .required("Tiêu đề không được để trống"),

  description: yup
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .nullable(),

  //   courseId: yup
  //     .string()
  //     .matches(/^[0-9a-fA-F]{24}$/, "courseId không hợp lệ (phải là ObjectId)")
  //     .required("courseId là bắt buộc"),
});

const updateForumSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(200, "Tiêu đề không được vượt quá 200 ký tự")
    .optional(),

  description: yup
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .nullable()
    .optional(),

  //   courseId: yup
  //     .string()
  //     .matches(/^[0-9a-fA-F]{24}$/, "courseId không hợp lệ")
  //     .optional(),
});

module.exports = {
  createForumSchema,
  updateForumSchema,
};
