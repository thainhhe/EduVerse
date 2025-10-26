const { forumService } = require("../../services/forum/forumService");
const { response, error_response } = require("../../utils/response.util");

const forumController = {
  createForum: async (req, res) => {
    try {
      const data = req.body;
      const result = await forumService.createForum(data);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  getAllForums: async (req, res) => {
    try {
      const result = await forumService.getAllForums();
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  getForumById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await forumService.getForumById(id);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  updateForum: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const result = await forumService.updateForum(id, data);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  deleteForum: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await forumService.deleteForum(id);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },
};

module.exports = { forumController };
