const { manage_user_service } = require("../../../services/admin/manage-user/manage-user.service");
const { error_response, response } = require("../../../utils/response.util");

const manage_user_controller = {
    getAll: async (req, res) => {
        try {
            const result = await manage_user_service.getAllUser();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    getUserById: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await manage_user_service.getUserById(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    create_user: async (req, res) => {
        try {
            const data = req.body;
            const file = req.file || null;
            const result = await manage_user_service.createUser(data, file);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    update_user: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const file = req.file || null;
            const result = await manage_user_service.updateUser(id, data, file);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    banned_account: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await manage_user_service.banUser(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    lock_user: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await manage_user_service.lockUser(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },

    unlock_user: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await manage_user_service.unlockUser(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { manage_user_controller };
