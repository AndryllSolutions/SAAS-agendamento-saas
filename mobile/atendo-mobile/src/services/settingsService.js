import api from './api';

const settingsService = {
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getSettingByKey(key) {
    try {
      const response = await api.get('/settings/'+key);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateSetting(key, value) {
    try {
      const response = await api.put('/settings/'+key, { value });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateSettings(data) {
    try {
      const response = await api.put('/settings', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async resetSettings() {
    try {
      const response = await api.post('/settings/reset');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Métodos antigos mantidos para compatibilidade
  async getSettingsService(filters = {}) {
    return this.getSettings();
  },

  async createSettingsService(data) {
    return this.updateSettings(data);
  },

  async updateSettingsService(id, data) {
    return this.updateSetting(id, data);
  },

  async deleteSettingsService(id) {
    return { success: true };
  },
};

export default settingsService;
