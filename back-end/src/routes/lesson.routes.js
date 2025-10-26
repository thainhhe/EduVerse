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

module.exports = lessonRouter;
