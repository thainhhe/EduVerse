const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
class UserController {
    // Create a new user
    async createUser(req, res) {
        try {
            const { username, email, password, role } = req.body;

            // Check if user exists
            const userExists = await User.findOne({ $or: [{ email }, { username }] });
            if (userExists) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email or username",
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                role,
                created_by: req.user?._id,
            });

            // Remove password from response
            user.password = undefined;

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error creating user",
                error: error.message,
            });
        }
    }

    // Get all users with pagination and filters
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const role = req.query.role;
            const status = req.query.status;

            const query = {};

            // Add filters
            if (search) {
                query.$or = [
                    { username: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            if (role) query.role = role;
            if (status) query.status = status;

            // Execute query with pagination
            const users = await User.find(query)
                .select("-password")
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            // Get total count
            const total = await User.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching users",
                error: error.message,
            });
        }
    }

    // Get user by ID
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select("-password");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching user",
                error: error.message,
            });
        }
    }

    // Update user
    async updateUser(req, res) {
        try {
            const { username, email, role, status } = req.body;
            const userId = req.params.id;

            // Check if user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Update fields
            if (username) user.username = username;
            if (email) user.email = email;
            if (role) user.role = role;
            if (status) user.status = status;

            user.updated_by = req.user._id;

            // Save changes
            await user.save();

            // Remove password from response
            user.password = undefined;

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error updating user",
                error: error.message,
            });
        }
    }

    // Delete user
    async deleteUser(req, res) {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Soft delete by updating status
            user.status = "inactive";
            user.updated_by = req.user._id;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error deleting user",
                error: error.message,
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user._id;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect",
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error changing password",
                error: error.message,
            });
        }
    }
}

module.exports = new UserController();
