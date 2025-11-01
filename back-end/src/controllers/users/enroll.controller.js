const enrollmentServices = require("../../services/enrollment/enroll.services");
const { system_enum } = require("../../config/enum/system.constant");

const getAllEnrollments = async (req, res) => {
  try {
    const result = await enrollmentServices.getAllEnrollments();
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Controller Error - getAllEnrollments:", error);
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const getEnrollmentById = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    const result = await enrollmentServices.getEnrollmentById(enrollmentId);
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Controller Error - getEnrollmentById:", error);
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const getAllEnrollmentByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await enrollmentServices.getAllEnrollmentByUser(userId);
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Controller Error - getAllEnrollmentByUser:", error);
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const createEnrollment = async (req, res) => {
  try {
    const enrollData = req.body;
    const result = await enrollmentServices.createEnrollment(enrollData);
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
      ...(result.errors && { errors: result.errors }),
    });
  } catch (error) {
    console.error("Controller Error - createEnrollment:", error);
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    const enrollData = req.body;
    const result = await enrollmentServices.updateEnrollment(
      enrollmentId,
      enrollData
    );
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
      ...(result.errors && { errors: result.errors }),
    });
  } catch (error) {
    console.error("Controller Error - updateEnrollment:", error);
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    const result = await enrollmentServices.deleteEnrollment(enrollmentId);
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Controller Error - deleteEnrollment:", error);
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const getDetailedEnrollmentByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await enrollmentServices.getDetailedEnrollmentByUser(userId);
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
      ...(result.error && { error: result.error, stack: result.stack }),
    });
  } catch (error) {
    console.error("Controller Error - getDetailedEnrollmentByUser:", {
      message: error.message,
      stack: error.stack,
      userId: req.params.userId,
    });
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

const getDetailedEnrollmentByUserIdCourseId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const result =
      await enrollmentServices.getDetailedEnrollmentByUserIdCourseId(
        userId,
        courseId
      );
    return res.status(result.status).json({
      message: result.message,
      data: result.data,
      ...(result.error && { error: result.error, stack: result.stack }),
    });
  } catch (error) {
    console.error("Controller Error - getDetailedEnrollmentByUserIdCourseId:", {
      message: error.message,
      stack: error.stack,
      userId: req.params.userId,
      courseId: req.params.courseId,
    });
    return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getAllEnrollmentByUser,
  getDetailedEnrollmentByUser,
  getDetailedEnrollmentByUserIdCourseId,
};
