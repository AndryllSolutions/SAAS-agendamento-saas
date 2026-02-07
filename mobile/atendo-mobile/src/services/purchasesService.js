import api from './api';

const purchasesService = {
  // Suppliers
  async getSuppliers(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get('/suppliers?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createSupplier(data) {
    try {
      const response = await api.post('/suppliers', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateSupplier(id, data) {
    try {
      const response = await api.put('/suppliers/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteSupplier(id) {
    try {
      await api.delete('/suppliers/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPurchasesService(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get('/purchasesService?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPurchasesService(data) {
    try {
      const response = await api.post('/purchasesService', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePurchasesService(id, data) {
    try {
      const response = await api.put('/purchasesService/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePurchasesService(id) {
    try {
      await api.delete('/purchasesService/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default purchasesService;
