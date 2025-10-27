const express = require("express");
const { courseController } = require("../controllers/course/course.controller");
const { validate_schema } = require("../utils/response.util");
const { courseValidator } = require("../validator/course.validator");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

const courseRouter = express.Router();

courseRouter.get("/mine", verifyToken, courseController.getMyCourses);

courseRouter.get("/", courseController.getAllCourse);
courseRouter.get("/:id", courseController.getCourseById);
courseRouter.post(
  "/create",
  verifyToken,
  validate_schema(courseValidator.createCourseSchema),
  courseController.createCourse
);
courseRouter.put(
  "/update/:id",
  verifyToken,
  validate_schema(courseValidator.updateCourseSchema),
  courseController.updateCourse
);
courseRouter.delete("/delete/:id", verifyToken, courseController.deleteCourse);
// Get courses of current authenticated instructor
// courseRouter.get("/mine", verifyToken, courseController.getMyCourses);

module.exports = courseRouter;
