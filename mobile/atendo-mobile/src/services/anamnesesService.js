import api from './api';

const anamnesesService = {
  async getAnamneses(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.search) params.append('search', filters.search);
      if (filters.client_id) params.append('client_id', filters.client_id);

      const response = await api.get('/anamneses?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAnamnesisById(id) {
    try {
      const response = await api.get('/anamneses/'+id);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createAnamnesis(data) {
    try {
      const response = await api.post('/anamneses', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateAnamnesis(id, data) {
    try {
      const response = await api.put('/anamneses/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteAnamnesis(id) {
    try {
      await api.delete('/anamneses/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Métodos antigos mantidos para compatibilidade
  async getAnamnesesService(filters = {}) {
    return this.getAnamneses(filters);
  },

  async createAnamnesesService(data) {
    return this.createAnamnesis(data);
  },

  async updateAnamnesesService(id, data) {
    return this.updateAnamnesis(id, data);
  },

  async deleteAnamnesesService(id) {
    return this.deleteAnamnesis(id);
  },
};

export default anamnesesService;
