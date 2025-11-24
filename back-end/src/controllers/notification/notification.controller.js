const { notificationService } = require("../../services/notification/notification.service");
const { error_response, response } = require("../../utils/response.util");

const notificationController = {
    getAll: async (req, res) => {
        try {
            const result = await notificationService.getAll();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    get_global: async (req, res) => {
        try {
            const result = await notificationService.getGlobal();
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    get_by_senderId: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await notificationService.getBySenderId(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    get_by_receiveId: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await notificationService.getByReceiverId(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    create_notification: async (req, res) => {
        try {
            const data = req.body;
            const result = await notificationService.create(data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    update_notification: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await notificationService.update(id, data);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    delete_notification: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await notificationService.delete(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    mark_as_read: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await notificationService.markAsRead(id);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
    mark_all_as_read: async (req, res) => {
        try {
            const userId = req.params.userId;
            const result = await notificationService.markAllAsRead(userId);
            return response(res, result);
        } catch (error) {
            return error_response(res, error);
        }
    },
};

module.exports = { notificationController };
