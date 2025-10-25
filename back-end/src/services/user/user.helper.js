const userHelper = {
    format_user_information: (data) => {
        return {
            _id: data._id,
            username: data.username,
            email: data.email,
            avatar: data.avatar !== null ? data.avatar : "",
            permissions: data.permissions.length > 0 ? data.permissions.map((p) => p.name) : [],
            emailNotifications: data.emailNotifications,
            systemNotifications: data.systemNotifications,
            createAt: data.createAt,
            updateAt: data.updateAt,
        };
    },
};

module.exports = { userHelper };
