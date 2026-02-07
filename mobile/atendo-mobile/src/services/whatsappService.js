import api from './api';

const whatsappService = {
  async getWhatsappCampaigns(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get(`/whatsapp/campaigns?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createWhatsappCampaign(campaignData) {
    try {
      const response = await api.post('/whatsapp/campaigns', campaignData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async sendWhatsappMessage(phoneNumber, message) {
    try {
      const response = await api.post('/whatsapp/send', { phone_number: phoneNumber, message });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getWhatsappStats() {
    try {
      const response = await api.get('/whatsapp/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCRMMessages(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.client_id) params.append('client_id', filters.client_id);

      const response = await api.get(`/whatsapp/crm/messages?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default whatsappService;
