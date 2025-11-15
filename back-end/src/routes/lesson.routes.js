const express = require("express");
const { lessonController } = require("../controllers/lesson/lesson.controller");
const { validate_schema } = require("../utils/response.util");
const { lessonValidator } = require("../validator/lesson.validator");
const { verifyToken } = require("../middlewares/auth/authMiddleware");

const lessonRouter = express.Router();
lessonRouter.get("/:moduleId", lessonController.getLessonInModule);
lessonRouter.post("/create", verifyToken, validate_schema(lessonValidator.lesson), lessonController.createLesson);
lessonRouter.put("/update/:id", verifyToken, validate_schema(lessonValidator.lesson), lessonController.updateLesson);
lessonRouter.delete("/delete/:id", verifyToken, lessonController.deleteLesson);

// add routes for marking and unmarking lesson completion
lessonRouter.post('/:lessonId/complete', lessonController.markLessonCompleted);
lessonRouter.post('/:lessonId/uncomplete', lessonController.unmarkLessonCompleted);
// Check if lesson is completed by user
lessonRouter.get('/:lessonId/completion/:userId', lessonController.checkLessonCompletion);

module.exports = lessonRouter;
