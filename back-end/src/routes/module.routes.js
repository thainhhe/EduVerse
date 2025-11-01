const express = require("express");
const { moduleController } = require("../controllers/module/module.controller");
const { validate_schema } = require("../utils/response.util");
const { moduleValidator } = require("../validator/module.validator");
const { verifyToken } = require("../middlewares/auth/authMiddleware");
const moduleRouter = express.Router();

moduleRouter.get("/course-module/:courseId", moduleController.getAllModuleInCourse);
moduleRouter.post("/create", verifyToken, validate_schema(moduleValidator.create), moduleController.createNewModule);
moduleRouter.put("/update/:id", verifyToken, validate_schema(moduleValidator.update), moduleController.updateModule);
moduleRouter.delete("/delete/:id", verifyToken, moduleController.deleteModule);

module.exports = moduleRouter;
