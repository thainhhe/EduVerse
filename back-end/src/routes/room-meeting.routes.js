const express = require("express");
const { room_meting_controller } = require("../controllers/room-meeting/room-meting.controller");
const { validate_schema } = require("../utils/response.util");
const roomValidator = require("../validator/room-meeting.validator");

const roomRouter = express.Router();
roomRouter.get("/", room_meting_controller.getAll);
roomRouter.get("/:courseId", room_meting_controller.get_room_by_courseId);
roomRouter.post("/create", validate_schema(roomValidator), room_meting_controller.create_room);
roomRouter.put("/update/:id", validate_schema(roomValidator), room_meting_controller.update_room);
roomRouter.delete("/delete/:id", room_meting_controller.delete_room);

module.exports = roomRouter;
