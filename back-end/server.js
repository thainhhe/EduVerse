const express = require("express");
const app = express();
const router = require("./src/routes/index.js");
const connectDB = require("./src/config/db.js");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const Logger = require("./src/middlewares/loggerMiddleware.js");

app.get("/", async (req, res) => {
    try {
        res.send({ message: "Welcome to Eduverse!" });
    } catch (error) {
        res.send({ error: error.message });
    }
});

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "secret123",
        resave: false,
        saveUninitialized: false,
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
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});
