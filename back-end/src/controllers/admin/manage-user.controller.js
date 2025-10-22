const { USER_ERROR_MESSAGE, STATUS_CODE } = require("../../config/enum");
const { userRepository } = require("../../repositories/userRepository");

const getAllUsers = async (req, res) => {
    try {
        const users = await userRepository.findAll();
        return res.status(STATUS_CODE.OK).json({ usersList: users });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: error.toString() });
    }
};

const assignPermissions = async (req, res) => {
    try {
        const userId = req.params.id;
        const { permissions } = req.body;
        const user = await userRepository.findById(userId);
        if (!user) {
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: USER_ERROR_MESSAGE.USER_NOT_FOUND });
        }
        user.permissions = permissions;
        await userRepository.save(user);
        return res.status(STATUS_CODE.OK).json({ message: "Permissions assigned successfully", user });
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: error.toString() });
    }
};
