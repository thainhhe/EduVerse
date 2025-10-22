const {
    STATUS_CODE,
    INPUT_ERROR,
    USER_ERROR_MESSAGE,
    AUTH_ERROR_MESSAGE,
    SYSTEM_ERROR_MESSAGE,
} = require("../../config/enum");
const { ROLE } = require("../../config/permissions.constants");
const { userRepository } = require("../../repositories/userRepository");

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
            return res.status(STATUS_CODE.BAD_REQUEST).json({ message: INPUT_ERROR.MISSING_FIELDS });

        const existedEmail = await userRepository.findByEmail(data.email.trim());
        if (existedEmail) {
            return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: INPUT_ERROR.EXISTING_EMAIL });
        }
        const hashPassword = await authUtils.hashPassword(data.password);
        const newUser = await userRepository.createUser({
            username: data.username,
            email: data.email,
            password: hashPassword,
            role: data.role || ROLE.LEARNER,
            created_by: req.user?._id,
        });
        const userData = {
            ...newUser._doc,
            password: "xxxxxx",
        };
        return res.status(STATUS_CODE.OK).json(userData);
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: SYSTEM_ERROR_MESSAGE.SERVER_ERROR });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userRepository.findByEmail(email);
        if (!user) {
            return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: USER_ERROR_MESSAGE.USER_NOT_FOUND });
        }
        const isMatch = await authUtils.comparePasswords(password, user.password);
        if (!isMatch) {
            return res.status().json({ message: AUTH_ERROR_MESSAGE.INVALID_CREDENTIALS });
        }
        const token = authUtils.token(user._id);
        const userData = {
            ...user._doc,
            password: "xxxxxx",
            token: token,
        };
        return res.status(STATUS_CODE.OK).json(userData);
    } catch (error) {
        return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: SYSTEM_ERROR_MESSAGE.SERVER_ERROR });
    }
};

module.exports = { register, login };
