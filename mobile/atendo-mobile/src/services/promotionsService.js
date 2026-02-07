import api from './api';

const promotionsService = {
  async getPromotions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get('/promotions?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPromotionById(id) {
    try {
      const response = await api.get('/promotions/'+id);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPromotion(data) {
    try {
      const response = await api.post('/promotions', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePromotion(id, data) {
    try {
      const response = await api.put('/promotions/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePromotion(id) {
    try {
      await api.delete('/promotions/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Métodos antigos mantidos para compatibilidade
  async getPromotionsService(filters = {}) {
    return this.getPromotions(filters);
  },

  async createPromotionsService(data) {
    return this.createPromotion(data);
  },

  async updatePromotionsService(id, data) {
    return this.updatePromotion(id, data);
  },

  async deletePromotionsService(id) {
    return this.deletePromotion(id);
  },
};

export default promotionsService;
