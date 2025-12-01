const systemService = require("../../services/admin/system.services");
const { response, error_response, upLoadImage } = require("../../utils/response.util");

class SystemController {
    getSettings = async (req, res, next) => {
        try {
            const result = await systemService.getSettings();
            return response(res, {
                status: 200,
                message: "Get system settings success",
                data: result,
            });
        } catch (error) {
            return error_response(res, error);
        }
    };

    updateSettings = async (req, res, next) => {
        try {
            const data = req.body;

            // Handle image upload if a file is present
            if (req.file) {
                const imageUrl = await upLoadImage(req.file);

                // Ensure appearance object exists
                if (!data.appearance) {
                    data.appearance = {};
                }

                // If data.appearance is a string (from FormData), parse it
                if (typeof data.appearance === "string") {
                    try {
                        data.appearance = JSON.parse(data.appearance);
                    } catch (e) {
                        data.appearance = {};
                    }
                }

                data.appearance.homeHeroImage = imageUrl;
            }

            // Handle nested objects if they come as strings from FormData
            ["general", "appearance", "security", "notifications", "payment"].forEach((key) => {
                if (data[key] && typeof data[key] === "string") {
                    try {
                        data[key] = JSON.parse(data[key]);
                    } catch (e) {
                        // Keep as is if parsing fails
                    }
                }
            });

            const result = await systemService.updateSettings(data);
            return response(res, {
                status: 200,
                message: "Update system settings success",
                data: result,
            });
        } catch (error) {
            return error_response(res, error);
        }
    };
}

module.exports = new SystemController();
