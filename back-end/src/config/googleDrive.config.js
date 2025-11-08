// config/googleDrive.config.js
const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.DRIVE_CLIENT_ID,
    process.env.DRIVE_CLIENT_SECRET,
    process.env.DRIVE_REDIRECT_URI
);

// Đặt refresh token (sẽ lấy từ .env sau khi chạy Giai đoạn 3)
oauth2Client.setCredentials({
    refresh_token: process.env.DRIVE_REFRESH_TOKEN
});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

module.exports = drive;