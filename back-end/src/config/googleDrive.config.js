// config/googleDrive.config.js
require('dotenv').config();
const { google } = require('googleapis');

class GoogleDriveConfig {
  constructor() {
    this.oauth2Client = null;
    this.drive = null;
    this.initialize();
  }

  initialize() {
    try {
      const clientId = process.env.DRIVE_CLIENT_ID;
      const clientSecret = process.env.DRIVE_CLIENT_SECRET;
      const redirectUri = process.env.DRIVE_REDIRECT_URI;
      const refreshToken = process.env.DRIVE_REFRESH_TOKEN;

      if (!clientId || !clientSecret) {
        throw new Error('Missing DRIVE_CLIENT_ID or DRIVE_CLIENT_SECRET in env');
      }

      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );

      if (refreshToken) {
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      } else {
        console.warn('⚠️ No DRIVE_REFRESH_TOKEN set in env. Drive calls will fail until you set a valid refresh token.');
      }

      this.drive = google.drive({
        version: 'v3',
        auth: this.oauth2Client,
      });

      console.log('✅ Google Drive OAuth initialized');
      console.log('DRIVE_REDIRECT_URI:', redirectUri);
      // For safety do not log secret token; just show whether present:
      console.log('DRIVE_REFRESH_TOKEN present:', !!refreshToken);
    } catch (error) {
      console.error('❌ Google Drive initialization failed:', error.message || error);
      // do NOT throw to avoid crashing app at import time; let callers handle
      this.oauth2Client = null;
      this.drive = null;
    }
  }

  getDrive() {
    if (!this.drive) this.initialize();
    return this.drive;
  }

  getOAuth2Client() {
    if (!this.oauth2Client) this.initialize();
    return this.oauth2Client;
  }
}

module.exports = new GoogleDriveConfig();
