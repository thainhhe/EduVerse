const crypto = require("crypto");

const userHelper = {
    format_user_information: (data) => {
        return {
            _id: data._id,
            username: data.username,
            email: data.email,
            avatar: data.avatar !== null ? data.avatar : "",
            role: data.role || "learner",
            isSuperAdmin: data.isSuperAdmin,
            job_title: data.job_title || "",
            subject_instructor: data.subject_instructor || "",
            bio: data.bio || "",
            introduction: data.introduction || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            permissions: data.permissions.length > 0 ? data.permissions.map((p) => p.name) : [],
            emailNotifications: data.emailNotifications,
            systemNotifications: data.systemNotifications,
            createAt: data.createAt,
            updateAt: data.updateAt,
        };
    },

    shuffleArray: (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = crypto.randomInt(0, i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    generatePassword: (length = 8) => {
        if (length < 4) throw new Error("Minimum length is 4 to include all character types");

        const lowers = "abcdefghijklmnopqrstuvwxyz";
        const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const digits = "0123456789";
        const specials = "!@#$%^&*()-_=+[]{}<>?~";

        const passwordChars = [
            lowers[crypto.randomInt(0, lowers.length)],
            uppers[crypto.randomInt(0, uppers.length)],
            digits[crypto.randomInt(0, digits.length)],
            specials[crypto.randomInt(0, specials.length)],
        ];

        const all = lowers + uppers + digits + specials;
        for (let i = passwordChars.length; i < length; i++) {
            passwordChars.push(all[crypto.randomInt(0, all.length)]);
        }

        return userHelper.shuffleArray(passwordChars).join("");
    },
};

module.exports = { userHelper };
