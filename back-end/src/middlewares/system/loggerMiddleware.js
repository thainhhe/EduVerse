const morgan = require("morgan");
const Log = require("../../models/Log");

const Logger = (req, res, next) => {
    const start = process.hrtime();
    res.on("finish", async () => {
        const diff = process.hrtime(start);
        const responseTime = diff[0] * 1e3 + diff[1] / 1e6;

        const logData = {
            userId: req?.userId || null,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: responseTime.toFixed(2),
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        };

        try {
            await Log.create(logData);
        } catch (err) {
            console.error("Log save error:", err.message);
        }
    });

    next();
};

module.exports = Logger;
