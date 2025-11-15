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

const escapeHtml = (text) =>
    text.replace(
        /[&<>"']/g,
        (m) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            }[m])
    );

const send_NewPassword_Email = (toEmail, new_password) => {
    const safePassword = escapeHtml(new_password);

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
        to: toEmail,
        subject: "Mật khẩu đã được đặt lại",
        text: `Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
        html: `
            <p>Xin chào!</p>
            <p><strong>Mật khẩu mới của bạn là:</strong></p>
            <p style="font-size: 18px; font-weight: bold; color: #1a73e8;">${safePassword}</p>
            <p>Vui lòng đăng nhập và đổi mật khẩu sau khi đăng nhập.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
        `,
    };

    return transporter.sendMail(mailOptions);
};

const sendInviteInstructorEmail = (toEmail, inviteLink, inviterName = "EduVerse Team", courseName) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"${inviterName}" <no-reply@eduverse.com>`,
        to: toEmail,
        subject: "🎓 Lời mời tham gia giảng dạy cùng EduVerse",
        text: `Xin chào!\n\n${inviterName} đã mời bạn tham gia đội ngũ giảng viên của EduVerse.\n\nHãy nhấp vào liên kết dưới đây để chấp nhận lời mời:\n${inviteLink}\n\nNếu bạn không mong đợi email này, vui lòng bỏ qua.`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>🎓 Lời mời trở thành Giảng viên tại <span style="color:#007BFF;">EduVerse</span></h2>
                <p>Xin chào,</p>
                <p><strong>${inviterName}</strong> đã mời bạn tham gia đội ngũ giảng viên của nền tảng EduVerse trong khoá học ${courseName}</p>
                <p>Nhấp vào nút bên dưới để chấp nhận lời mời và hoàn tất đăng ký giảng viên:</p>
                <div style="text-align:center; margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color:#007BFF;color:white;padding:12px 20px;text-decoration:none;border-radius:5px;font-weight:bold;">
                        Chấp nhận lời mời
                    </a>
                </div>
                <p>Nếu bạn không mong đợi email này, vui lòng bỏ qua.</p>
                <hr>
                <p style="font-size: 12px; color: #777;">EduVerse - Nền tảng học tập thông minh.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { generateOtp, hashOtp, compareOtp, sendOtpEmail, sendInviteInstructorEmail, send_NewPassword_Email };
