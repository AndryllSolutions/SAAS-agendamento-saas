// COMMANDS SERVICE
import api from './api';

export const commandsService = {
  async getCommands(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get(`/commands?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createCommand(commandData) {
    try {
      const response = await api.post('/commands', commandData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateCommand(commandId, commandData) {
    try {
      const response = await api.put(`/commands/${commandId}`, commandData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteCommand(commandId) {
    try {
      await api.delete(`/commands/${commandId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// NOTIFICATIONS SERVICE
export const notificationsService = {
  async getNotifications(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.read) params.append('read', filters.read);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get(`/notifications?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}`, { read: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// WHATSAPP SERVICE
export const whatsappService = {
  async getWhatsappCampaigns(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

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
      const response = await api.post('/whatsapp/send', {
        phone_number: phoneNumber,
        message,
      });
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
};

// PROMOTIONS SERVICE
export const promotionsService = {
  async getPromotions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);

      const response = await api.get(`/promotions?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPromotion(promotionData) {
    try {
      const response = await api.post('/promotions', promotionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePromotion(promotionId, promotionData) {
    try {
      const response = await api.put(`/promotions/${promotionId}`, promotionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePromotion(promotionId) {
    try {
      await api.delete(`/promotions/${promotionId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// SETTINGS SERVICE
export const settingsService = {
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateSettings(settings) {
    try {
      const response = await api.put('/settings', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCompanySettings() {
    try {
      const response = await api.get('/settings/company');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateCompanySettings(settings) {
    try {
      const response = await api.put('/settings/company', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// GOALS SERVICE
export const goalsService = {
  async getGoals(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);

      const response = await api.get(`/goals?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createGoal(goalData) {
    try {
      const response = await api.post('/goals', goalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateGoal(goalId, goalData) {
    try {
      const response = await api.put(`/goals/${goalId}`, goalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteGoal(goalId) {
    try {
      await api.delete(`/goals/${goalId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// PURCHASES SERVICE
export const purchasesService = {
  async getPurchases(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/purchases?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPurchase(purchaseData) {
    try {
      const response = await api.post('/purchases', purchaseData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePurchase(purchaseId, purchaseData) {
    try {
      const response = await api.put(`/purchases/${purchaseId}`, purchaseData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePurchase(purchaseId) {
    try {
      await api.delete(`/purchases/${purchaseId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// CASHBACK SERVICE
export const cashbackService = {
  async getCashbackPrograms() {
    try {
      const response = await api.get('/cashback/programs');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getClientCashback(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}/cashback`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async redeemCashback(clientId, amount) {
    try {
      const response = await api.post(`/clients/${clientId}/cashback/redeem`, { amount });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// INVOICES SERVICE
export const invoicesService = {
  async getInvoices(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/invoices?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getInvoiceById(invoiceId) {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createInvoice(invoiceData) {
    try {
      const response = await api.post('/invoices', invoiceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// EVALUATIONS SERVICE
export const evaluationsService = {
  async getEvaluations(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.rating) params.append('rating', filters.rating);

      const response = await api.get(`/evaluations?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createEvaluation(evaluationData) {
    try {
      const response = await api.post('/evaluations', evaluationData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ANAMNESES SERVICE
export const anamnesesService = {
  async getAnamneses(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.client_id) params.append('client_id', filters.client_id);

      const response = await api.get(`/anamneses?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAnamnesisById(anamnesisId) {
    try {
      const response = await api.get(`/anamneses/${anamnesisId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createAnamnesis(anamnesisData) {
    try {
      const response = await api.post('/anamneses', anamnesisData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateAnamnesis(anamnesisId, anamnesisData) {
    try {
      const response = await api.put(`/anamneses/${anamnesisId}`, anamnesisData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
