const fs = require("fs");
const path = require("path");
const { system_enum } = require("../../config/enum/system.constant");

const logDir = "E:\\logs";
const logFile = path.join(logDir, "system.log");

const logService = {
    readLogs: (limit = null) => {
        try {
            if (!fs.existsSync(logFile)) {
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            }
            const data = fs.readFileSync(logFile, "utf8").trim();
            if (!data)
                return {
                    status: system_enum.STATUS_CODE.NOT_FOUND,
                    message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
                };
            const lines = data.split("\n").filter((l) => l.trim() !== "");
            return {
                status: system_enum.STATUS_CODE.OK,
                message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                data: limit ? lines.slice(-limit) : lines,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
    clearLogs: () => {
        try {
            if (fs.existsSync(logFile)) {
                fs.writeFileSync(logFile, "");
                return {
                    status: system_enum.STATUS_CODE.OK,
                    message: system_enum.SYSTEM_MESSAGE.SUCCESS,
                };
            }
            return {
                status: system_enum.STATUS_CODE.NOT_FOUND,
                message: system_enum.SYSTEM_MESSAGE.NOT_FOUND,
            };
        } catch (error) {
            throw new Error(error);
        }
    },
};

module.exports = { logService };
