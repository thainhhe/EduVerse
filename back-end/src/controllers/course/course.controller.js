const { courseService } = require("../../services/course/course.service");
const { response, error_response } = require("../../utils/response.util");

const courseController = {
  getAllCourse: async (req, res) => {
    try {
      const result = await courseService.getAllCourse();
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  getCourseById: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await courseService.getCourseById(id);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  createCourse: async (req, res) => {
    try {
      const data = req.body;
      const result = await courseService.createCourse(data);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  updateCourse: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const result = await courseService.updateCourse(id, data);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await courseService.deleteCourse(id);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },

  async getMyCourses(req, res) {
    try {
      const result = await courseService.getCoursesByInstructorId(req.userId);
      return response(res, result);
    } catch (error) {
      return error_response(res, error);
    }
  },
};

module.exports = { courseController };
