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

/**
 * Gửi email thông báo khoá học được phê duyệt
 * @param {string} toEmail - Email giảng viên
 * @param {string} instructorName - Tên giảng viên
 * @param {string} courseTitle - Tiêu đề khoá học
 */
const sendCourseApprovalEmail = (toEmail, instructorName, courseTitle) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"EduVerse Team" <no-reply@eduverse.com>',
        to: toEmail,
        subject: `🎉 Chúc mừng! Khóa học của bạn đã được phê duyệt: "${courseTitle}"`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>🎉 Khóa học của bạn đã được chấp thuận!</h2>
                <p>Xin chào <strong>${instructorName}</strong>,</p>
                <p>Chúng tôi vui mừng thông báo rằng khóa học "<strong>${courseTitle}</strong>" của bạn đã được đội ngũ kiểm duyệt EduVerse xem xét và <strong>phê duyệt</strong>.</p>
                <p>Khóa học của bạn hiện đã được xuất bản và hiển thị công khai. Cảm ơn bạn đã đóng góp nội dung chất lượng cho nền tảng!</p>
                <br>
                <p>Trân trọng,<br>Đội ngũ EduVerse</p>
            </div>
        `,
    };
    return transporter.sendMail(mailOptions);
};

/**
 * Gửi email thông báo khoá học bị từ chối
 * @param {string} toEmail - Email giảng viên
 * @param {string} instructorName - Tên giảng viên
 * @param {string} courseTitle - Tiêu đề khoá học
 * @param {string} reasonReject - Lý do từ chối
 */
const sendCourseRejectionEmail = (toEmail, instructorName, courseTitle, reasonReject) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"EduVerse Team" <no-reply@eduverse.com>',
        to: toEmail,
        subject: `⚠️ Cần xem xét: Khóa học của bạn bị từ chối: "${courseTitle}"`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>⚠️ Thông báo về khóa học "${courseTitle}"</h2>
                <p>Xin chào <strong>${instructorName}</strong>,</p>
                <p>Chúng tôi rất tiếc phải thông báo rằng khóa học "<strong>${courseTitle}</strong>" của bạn đã bị <strong>từ chối</strong> sau quá trình xem xét.</p>
                <p><strong>Lý do từ chối:</strong></p>
                <div style="border-left: 4px solid #f44336; padding-left: 15px; background-color: #f9f9f9; margin: 15px 0;">
                    <p style="font-style: italic;">${reasonReject}</p>
                </div>
                <p>Vui lòng xem xét các góp ý trên, cập nhật lại nội dung khóa học và gửi lại để chúng tôi xem xét.</p>
                <br>
                <p>Trân trọng,<br>Đội ngũ EduVerse</p>
            </div>
        `,
    };
    return transporter.sendMail(mailOptions);
};

module.exports = { generateOtp, hashOtp, compareOtp, sendOtpEmail, sendInviteInstructorEmail, sendCourseApprovalEmail, sendCourseRejectionEmail };
