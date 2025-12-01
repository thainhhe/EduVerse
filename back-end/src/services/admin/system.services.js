const systemRepository = require("../../repositories/admin/system.repository");

class SystemService {
    async getSettings() {
        return await systemRepository.getSettings();
    }

    async updateSettings(data) {
        // Here we can add validation logic if needed
        return await systemRepository.updateSettings(data);
    }
}

module.exports = new SystemService();
