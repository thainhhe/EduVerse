const SystemSettings = require("../../models/SystemSettings");

class SystemRepository {
    async getSettings() {
        return await SystemSettings.getSettings();
    }

    async updateSettings(newSettings) {
        const settings = await SystemSettings.getSettings();

        // Update fields deeply
        if (newSettings.general) settings.general = { ...settings.general, ...newSettings.general };
        if (newSettings.appearance)
            settings.appearance = { ...settings.appearance, ...newSettings.appearance };
        if (newSettings.security) settings.security = { ...settings.security, ...newSettings.security };
        if (newSettings.notifications)
            settings.notifications = { ...settings.notifications, ...newSettings.notifications };
        if (newSettings.payment) settings.payment = { ...settings.payment, ...newSettings.payment };

        return await settings.save();
    }
}

module.exports = new SystemRepository();
