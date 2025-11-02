const enrollmentServices = require("../../services/enrollment/enroll.services");
const { system_enum } = require("../../config/enum/system.constant");
const { response, error_response } = require("../../utils/response.util");

const getAllEnrollments = async (req, res) => {
    try {
        const result = await enrollmentServices.getAllEnrollments();
        return res.status(result.status).json({
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error('Controller Error - getAllEnrollments:', error);
        return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
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
        console.error('Controller Error - getEnrollmentById:', error);
        return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
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
        console.error('Controller Error - getAllEnrollmentByUser:', error);
        return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
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
            ...(result.errors && { errors: result.errors })
        });
    } catch (error) {
        console.error('Controller Error - createEnrollment:', error);
        return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
        });
    }
};

const updateEnrollment = async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const enrollData = req.body;
        const result = await enrollmentServices.updateEnrollment(enrollmentId, enrollData);
        return res.status(result.status).json({
            message: result.message,
            data: result.data,
            ...(result.errors && { errors: result.errors })
        });
    } catch (error) {
        console.error('Controller Error - updateEnrollment:', error);
        return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
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
        console.error('Controller Error - deleteEnrollment:', error);
        return res.status(system_enum.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: system_enum.SYSTEM_MESSAGE.INTERNAL_SERVER_ERROR,
            ...(process.env.NODE_ENV === 'development' && {
                error: error.message,
                stack: error.stack
            })
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
            userId,
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

// Recalculate progress for specific enrollment
const recalculateProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.body;

        if (!userId || !courseId) {
            return error_response(res, {
                status: 400,
                message: 'userId and courseId are required'
            });
        }

        const result = await enrollmentServices.recalculateProgress(userId, courseId);
        return response(res, {
            status: 200,
            success: true,
            message: 'Progress recalculated successfully',
            data: result
        });
    } catch (error) {
        console.error('Controller Error - recalculateProgress:', error);
        if (error.message === 'Enrollment not found') {
            return error_response(res, {
                status: 404,
                message: error.message
            });
        }
        return error_response(res, {
            status: 500,
            message: 'Failed to recalculate progress'
        });
    }
};

// Get enrollment by userId and courseId
const getEnrollmentByUserAndCourse = async (req, res) => {
    try {
        console.log('🔍 req.body:', req.body); // ✅ Log ra xem
        console.log('🔍 req.headers:', req.headers); // ✅ Check header
        const { userId, courseId } = req.params;

        if (!userId || !courseId) {
            return res.status(400).json({ message: 'userId and courseId are required' });
        }
        const enrollment = await enrollmentServices.getEnrollmentByUserAndCourse(userId, courseId);
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        return res.status(200).json({
            message: 'Enrollment retrieved successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Controller Error - getEnrollmentByUserAndCourse:', error);
        return res.status(500).json({ message: 'Internal server error' });
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
    recalculateProgress,
    getEnrollmentByUserAndCourse
};