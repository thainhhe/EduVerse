const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
    {
        general: {
            siteName: { type: String, default: "EduVerse" },
            supportEmail: { type: String, default: "support@eduverse.com" },
            facebook: { type: String, default: "https://facebook.com" },
            twitter: { type: String, default: "https://twitter.com" },
            linkedin: { type: String, default: "https://linkedin.com" },
            youtube: { type: String, default: "https://youtube.com" },
            maintenanceMode: { type: Boolean, default: false },
        },
        appearance: {
            homeHeroImage: { type: String, default: null },
            headerBgColor: { type: String, default: "#ffffff" },
            headerTextColor: { type: String, default: "#000000" },
            footerBgColor: { type: String, default: "#1e293b" },
            footerTextColor: { type: String, default: "#ffffff" },
        },
        security: {
            sessionTimeout: { type: Number, default: 30 }, // in minutes
            passwordExpiry: { type: Boolean, default: false },
        },
        notifications: {
            enableEmail: { type: Boolean, default: true },
            smtpHost: { type: String, default: "smtp.gmail.com" },
        },
        payment: {
            currency: { type: String, default: "USD" },
            taxRate: { type: Number, default: 10 },
        },
    },
    { timestamps: true }
);

// Ensure only one document exists
systemSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
