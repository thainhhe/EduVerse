const express = require("express");
const enrollmentController = require("../controllers/users/enroll.controller");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const enrollRouter = express.Router();

enrollRouter.get("/", verifyToken, enrollmentController.getAllEnrollments);
enrollRouter.get("/:id", verifyToken, enrollmentController.getEnrollmentById);
enrollRouter.post("/", verifyToken, enrollmentController.createEnrollment);
enrollRouter.put("/:id", verifyToken, enrollmentController.updateEnrollment);
enrollRouter.delete("/:id", verifyToken, enrollmentController.deleteEnrollment);
enrollRouter.get(
  "/user/:userId",
  verifyToken,
  enrollmentController.getAllEnrollmentByUser
);
enrollRouter.get(
  "/user/:userId/detail",
  // verifyToken,
  enrollmentController.getDetailedEnrollmentByUser
);
enrollRouter.get(
  "/user/:userId/course/:courseId/detail",
  enrollmentController.getDetailedEnrollmentByUserIdCourseId
);
// Progress recalculation APIs
enrollRouter.post(
  "/progress/recalculate",
  enrollmentController.recalculateProgress
);
enrollRouter.get("/", verifyToken, enrollmentController.getAllEnrollments);
enrollRouter.get("/:id", verifyToken, enrollmentController.getEnrollmentById);
enrollRouter.post("/", verifyToken, enrollmentController.createEnrollment);
enrollRouter.put("/:id", verifyToken, enrollmentController.updateEnrollment);
enrollRouter.delete("/:id", verifyToken, enrollmentController.deleteEnrollment);
enrollRouter.get(
  "/user/:userId",
  verifyToken,
  enrollmentController.getAllEnrollmentByUser
);
enrollRouter.get(
  "/user/:userId/detail",
  verifyToken,
  enrollmentController.getDetailedEnrollmentByUser
);
// Get enrollment by userId and courseId
enrollRouter.get(
  "/user/:userId/course/:courseId",
  verifyToken,
  enrollmentController.getEnrollmentByUserAndCourse
);
enrollRouter.get(
  "/user/:userId/course/:courseId/detail",
  enrollmentController.getDetailedEnrollmentByUserIdCourseId
);
module.exports = enrollRouter;
