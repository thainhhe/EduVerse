const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const router = require("./src/routes/index.js");
const connectDB = require("./src/config/db.js");
const session = require("express-session");
const passport = require("./src/config/passport.js");
const cors = require("cors");
const Logger = require("./src/middlewares/system/loggerMiddleware.js");
const securityMiddleware = require("./src/middlewares/system/securityMiddleware");
const { system_enum } = require("./src/config/enum/system.constant.js");

// securityMiddleware(app);
app.get("/", async (req, res) => {
    try {
        res.send({ message: "Welcome to Eduverse!" });
    } catch (error) {
        res.send({ error: error.message });
    }
});

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

// --- MOVE body parsers BEFORE passport / routes ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret123",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(Logger);
app.use("/api/v1", router);

const http = require("http");
const socketUtil = require("./src/utils/socket.util");

const server = http.createServer(app);
const io = socketUtil.init(server);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (userId) => {
        if (userId) {
            socket.join(userId);
            socket.join("global");
            console.log(`User ${userId} joined room ${userId} and global`);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 9999;
server.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.log(system_enum.SYSTEM_MESSAGE.DB_CONNECTION_FAILED);
    }
});
