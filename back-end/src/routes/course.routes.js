const express = require("express");
const { courseController } = require("../controllers/course/course.controller");
const { validate_schema } = require("../utils/response.util");
const { courseValidator } = require("../validator/course.validator");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const upload = require("../middlewares/system/upload.middleware");
const {
  checkPermission,
} = require("../middlewares/system/permissionMiddleware");

const courseRouter = express.Router();

courseRouter.get("/mine", verifyToken, courseController.getMyCourses);
courseRouter.get("/", courseController.getAllCourse);
courseRouter.get("/:id", courseController.getCourseById);

courseRouter.get("/learner/common", courseController.getAllCourseForLearner);
courseRouter.get(
  "/instructor/:id",
  // verifyToken,
  // checkPermission(["admin", "instructor"], ["manage_course"]),
  courseController.getAllCourseInstructor
);
courseRouter.post(
  "/create",
  verifyToken,
  checkPermission(["admin", "instructor"], ["manage_course"]),
  validate_schema(courseValidator.createCourseSchema),
  upload.single("thumbnail"),
  courseController.createCourse
);
courseRouter.put(
  "/update/:id",
  verifyToken,
  checkPermission(["admin", "instructor"], ["manage_course"]),
  validate_schema(courseValidator.updateCourseSchema),
  upload.single("thumbnail"),
  courseController.updateCourse
);
courseRouter.delete(
  "/delete/:id",
  verifyToken,
  checkPermission(["admin", "instructor"], ["manage_course"]),
  courseController.deleteCourse
);

//get course by category
courseRouter.get("/category/:categoryId", courseController.getCourseByCategory);

module.exports = courseRouter;
