const yup = require("yup");
const { module_enum } = require("../config/enum/module.constants");

const moduleValidator = {
    create: yup.object({
        title: yup
            .string()
            .trim()
            .min(3, module_enum.MODULE_MESSAGE.MIN_TITLE)
            .max(100, module_enum.MODULE_MESSAGE.MAX_TITLE)
            .required(module_enum.MODULE_MESSAGE.REQUIRED_TITLE),

        description: yup.string().trim().max(500, module_enum.MODULE_MESSAGE.MAX_DESCRIPTION).nullable(),

        courseId: yup.string().required(module_enum.MODULE_MESSAGE.REQUIRED_COURSE_ID),

        content: yup.string().nullable().max(5000, module_enum.MODULE_MESSAGE.MAX_CONTENT),

        order: yup
            .number()
            .integer(module_enum.MODULE_MESSAGE.ORDER_INVALID)
            .required(module_enum.MODULE_MESSAGE.REQUIRED_ORDER),
    }),

    update: yup.object({
        title: yup
            .string()
            .trim()
            .min(3, module_enum.MODULE_MESSAGE.MIN_TITLE)
            .max(100, module_enum.MODULE_MESSAGE.MAX_TITLE)
            .optional(),

        description: yup.string().trim().max(500, module_enum.MODULE_MESSAGE.MAX_DESCRIPTION).optional(),

        content: yup.string().max(5000, module_enum.MODULE_MESSAGE.MAX_CONTENT).optional(),

        order: yup.number().integer(module_enum.MODULE_MESSAGE.ORDER_INVALID).optional(),
    }),
};

module.exports = { moduleValidator };
