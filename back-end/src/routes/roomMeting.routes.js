const express = require("express");
const { getAllRooms, createRoom } = require("../controllers/roomMeting.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const roomMetingRouter = express.Router();

roomMetingRouter.get("/", verifyToken, getAllRooms);
roomMetingRouter.post("/create", verifyToken, createRoom);

module.exports = roomMetingRouter;
