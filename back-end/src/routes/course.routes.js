const express = require("express");
const { courseController } = require("../controllers/course/course.controller");
const { validate_schema } = require("../utils/response.util");
const { courseValidator } = require("../validator/course.validator");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const upload = require("../middlewares/system/upload.middleware");

const courseRouter = express.Router();

courseRouter.get("/", courseController.getAllCourse);
courseRouter.get("/common", courseController.getAllCourseForLearner);
courseRouter.get("/:id", courseController.getCourseById);
courseRouter.get("/instructor/:id", verifyToken, courseController.getAllCourseInstructor);
courseRouter.post(
    "/create",
    verifyToken,
    validate_schema(courseValidator.createCourseSchema),
    upload.single("thumbnail"),
    courseController.createCourse
);
courseRouter.put(
    "/update/:id",
    verifyToken,
    validate_schema(courseValidator.updateCourseSchema),
    upload.single("thumbnail"),
    courseController.updateCourse
);
courseRouter.delete("/delete/:id", verifyToken, courseController.deleteCourse);

module.exports = courseRouter;
