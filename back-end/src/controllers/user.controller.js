const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const data = req.body;
        if (
            !data.username ||
            !data.email ||
            !data.password ||
            data.username.trim() === "" ||
            data.email.trim() === "" ||
            data.password.trim() === ""
        )
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });

        const existedEmail = await User.findOne({ email: data.email.trim() }).exec();
        if (existedEmail) {
            return res.status(500).json("Email đã tồn tại");
        }
        const hashPassword = await bcrypt.hash(data.password, parseInt(process.env.SALT_JWT));
        const newUser = await User.create({
            username: data.username.trim(),
            password: hashPassword,
            email: data.email.trim(),
            avatar: req.file ? req.file.path : null,
        });
        const userData = {
            ...newUser._doc,
            password: "xxxxxx",
        };
        return res.status(201).json(userData);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(500).json({ message: "Người dùng không tồn tại" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(500).json({ message: "Sai mật khẩu" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        const userData = {
            ...user._doc,
            password: "xxxxxx",
            token: token,
        };
        return res.status(200).json(userData);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        if (users === null) {
            throw new Error("List user is empty");
        }
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const data = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                username: data.name,
                avatar: req.file ? req.file.path : data.avatar,
            },
            { new: true }
        ).select("-password");
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(updatedUser);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

const assignPermissions = async (req, res) => {
    try {
        const userId = req.params.id;
        const { permissions } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.permissions = permissions;
        await user.save();
        return res.status(200).json({ message: "Permissions assigned successfully", user });
    } catch (error) {
        return res.status(500).json({ message: error.toString() });
    }
};

module.exports = {
    register,
    login,
    getAllUsers,
    updateProfile,
    getProfile,
    assignPermissions,
};
