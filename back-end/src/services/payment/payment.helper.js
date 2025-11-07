const crypto = require("crypto");

const paymentHelper = {
    generateSignature: (data, checksumKey) => {
        if (!data || typeof data !== "string") {
            throw new Error("Dữ liệu phải là một chuỗi hợp lệ.");
        }
        if (!checksumKey || typeof checksumKey !== "string") {
            throw new Error("Khóa checksum phải là một chuỗi hợp lệ.");
        }

        try {
            const hmac = crypto.createHmac("sha256", checksumKey);
            hmac.update(data);
            return hmac.digest("hex");
        } catch (error) {
            console.error("Lỗi khi tạo chữ ký:", error);
            throw new Error("Không thể tạo chữ ký. Vui lòng kiểm tra lại dữ liệu và khóa.");
        }
    },
    randomNumber: () => {
        const min = 100000;
        const max = 999999;
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomNumber;
    },
};

module.exports = { paymentHelper };
