import api from './api';

const evaluationsService = {
  async getEvaluations(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.rating) params.append('rating', filters.rating);

      const response = await api.get('/evaluations?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getEvaluationById(id) {
    try {
      const response = await api.get('/evaluations/'+id);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createEvaluation(data) {
    try {
      const response = await api.post('/evaluations', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateEvaluation(id, data) {
    try {
      const response = await api.put('/evaluations/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteEvaluation(id) {
    try {
      await api.delete('/evaluations/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Métodos antigos mantidos para compatibilidade
  async getEvaluationsService(filters = {}) {
    return this.getEvaluations(filters);
  },

  async createEvaluationsService(data) {
    return this.createEvaluation(data);
  },

  async updateEvaluationsService(id, data) {
    return this.updateEvaluation(id, data);
  },

  async deleteEvaluationsService(id) {
    return this.deleteEvaluation(id);
  },
};

export default evaluationsService;
