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

app.use(express.json());
app.use(Logger);
app.use("/api/v1", router);

const PORT = process.env.PORT || 9999;
app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.log(system_enum.SYSTEM_MESSAGE.DB_CONNECTION_FAILED);
    }
});
