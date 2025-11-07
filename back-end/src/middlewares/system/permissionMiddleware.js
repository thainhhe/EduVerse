const User = require("../../models/User");

const checkPermission = (requiredRoles = [], requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            const user = await User.findById(userId).populate("permissions");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (user.isSuperAdmin) return next();
            const hasRole = requiredRoles.length === 0 || requiredRoles.includes(user.role);
            const hasPermission =
                requiredPermissions.length === 0 || user.permissions.some((p) => requiredPermissions.includes(p.name));
            if (!hasRole || !hasPermission) {
                return res.status(403).json({ message: "Forbidden: Insufficient role or permission" });
            }
            next();
        } catch (error) {
            console.error("Permission check error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};

module.exports = { checkPermission };
