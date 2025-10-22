const Permission = require("../../models/Permission");

const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        return res.status(200).json(permissions);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const addPermission = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) return res.status(400).json({ message: "Name and description are required" });
        const newPermission = new Permission({ name, description });
        await newPermission.save();
        return res.status(201).json(newPermission);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const deletePermission = async (req, res) => {
    try {
        const permissionId = req.params.id;
        const deletedPermission = await Permission.findByIdAndDelete(permissionId);
        if (!deletedPermission) {
            return res.status(404).json({ message: "Permission not found" });
        }
        return res.status(200).json({ message: "Permission deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const updatePermission = async (req, res) => {
    try {
        const permissionId = req.params.id;
        const { name, description } = req.body;
        const updatedPermission = await Permission.findByIdAndUpdate(
            permissionId,
            { name, description },
            { new: true }
        );
        if (!updatedPermission) {
            return res.status(404).json({ message: "Permission not found" });
        }
        return res.status(200).json(updatedPermission);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

module.exports = {
    getAllPermissions,
    addPermission,
    deletePermission,
    updatePermission,
};
