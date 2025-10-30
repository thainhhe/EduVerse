const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const generateOtp = (length = 6) => {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return String(Math.floor(Math.random() * (max - min + 1) + min));
};

const hashOtp = async (otp) => {
    return bcrypt.hash(otp, 12);
};

const compareOtp = async (otp, hash) => {
    return bcrypt.compare(otp, hash);
};

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOtpEmail = (toEmail, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
        to: toEmail,
        subject: "Mã OTP đặt lại mật khẩu",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
        html: `<p>Mã OTP của bạn là: <strong>${otp}</strong></p><p>Mã có hiệu lực trong 5 phút.</p>`,
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { generateOtp, hashOtp, compareOtp, sendOtpEmail };
