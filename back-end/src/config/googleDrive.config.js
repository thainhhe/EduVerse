const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveConfig {
    constructor() {
        this.auth = null;
        this.drive = null;
        this.initialize();
    }

    initialize() {
        try {
            const credentialsPath = path.join(__dirname, '../../credentials.json');
            
            if (!fs.existsSync(credentialsPath)) {
                throw new Error('credentials.json not found!');
            }

            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

            this.auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });

            this.drive = google.drive({ version: 'v3', auth: this.auth });
            
            console.log('✅ Google Drive initialized successfully');
        } catch (error) {
            console.error('❌ Google Drive initialization failed:', error);
            throw error;
        }
    }

    getDrive() {
        if (!this.drive) {
            this.initialize();
        }
        return this.drive;
    }
}

module.exports = new GoogleDriveConfig();