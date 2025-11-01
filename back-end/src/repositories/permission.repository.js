const Permission = require("../models/Permission");

const permissionRepository = {
    findAll: async () => {
        return await Permission.find().exec();
    },
    create: async (data) => {
        return await Permission.create(data);
    },
};

module.exports = { permissionRepository };
