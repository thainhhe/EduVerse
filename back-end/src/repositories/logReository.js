const Log = require("../models/Log");

const logRepository = {
    async getAllLog() {
        return await Log.find();
    },
};

module.exports = { logRepository };
