const express = require("express");
const {
    getAllPermissions,
    addPermission,
    deletePermission,
    updatePermission,
} = require("../controllers/permission.controller");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");
const { ROLE, PERMISSIONS } = require("../config/permissions.constants");
const permissionRouter = express.Router();

permissionRouter.get(
    "/",
    verifyToken,
    checkPermission([ROLE.ADMIN], [PERMISSIONS.ACCESS_PERMISSION_SETTINGS]),
    getAllPermissions
);
permissionRouter.post("/create", addPermission);
permissionRouter.delete("/delete/:id", deletePermission);
permissionRouter.put("/update/:id", updatePermission);

module.exports = permissionRouter;
