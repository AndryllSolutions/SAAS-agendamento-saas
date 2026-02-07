import api from './api';

const cashbackService = {
  async getCashbackSummary() {
    try {
      const response = await api.get('/cashback/summary');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCashbackTransactions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get('/cashback/transactions?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCashbackService(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get('/cashbackService?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createCashbackService(data) {
    try {
      const response = await api.post('/cashbackService', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateCashbackService(id, data) {
    try {
      const response = await api.put('/cashbackService/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteCashbackService(id) {
    try {
      await api.delete('/cashbackService/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default cashbackService;
