const fs = require("fs");
const path = require("path");

const logDir = "E:\\logs";
const logFile = path.join(logDir, "system.log");

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const hideSensitiveData = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    const cloned = { ...obj };
    const sensitiveKeys = ["password", "pass", "oldPassword", "newPassword", "confirmPassword"];

    for (const key of Object.keys(cloned)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            cloned[key] = "******";
        } else if (typeof cloned[key] === "object") {
            cloned[key] = hideSensitiveData(cloned[key]);
        }
    }

    return cloned;
};

const loggerMiddleware = (req, res, next) => {
    if (req.method === "GET") {
        return next();
    }

    const now = new Date().toISOString();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const safeBody = hideSensitiveData(req.body);

    const logEntry = `[${now}] [${req.method}] ${req.originalUrl} | IP: ${ip} | User: ${
        req.user ? JSON.stringify(req.user) : "Unauthenticated"
    } | Body: ${JSON.stringify(safeBody)}\n`;

    fs.appendFile(logFile, logEntry, (err) => {
        if (err) console.error("❌ Ghi log lỗi:", err);
    });
    next();
};

module.exports = loggerMiddleware;
