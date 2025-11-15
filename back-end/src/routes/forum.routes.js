const express = require("express");
const { validate_schema } = require("../utils/response.util");
const { loginSchema, registerSchema } = require("../validator/auth.validator");
const { authController } = require("../controllers/auth/auth.controller");
const { createForumSchema } = require("../validator/forum.validator");
const { forumController } = require("../controllers/forum/forum.controller");

const forumRouter = express.Router();
forumRouter.get("/", forumController.getAllForums);
forumRouter.get("/:forumId", forumController.getForumById);
forumRouter.get("/course/:courseId", forumController.getForumByCourseId);

forumRouter.post("/create-forum", validate_schema(createForumSchema), forumController.createForum);

forumRouter.put("/update/:id", validate_schema(createForumSchema), forumController.updateForum);

module.exports = forumRouter;
