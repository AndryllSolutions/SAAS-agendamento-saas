import api from './api';

const goalsService = {
  async getGoals(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get('/goals?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getGoalById(id) {
    try {
      const response = await api.get('/goals/'+id);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createGoal(data) {
    try {
      const response = await api.post('/goals', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateGoal(id, data) {
    try {
      const response = await api.put('/goals/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteGoal(id) {
    try {
      await api.delete('/goals/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getGoalProgress(id) {
    try {
      const response = await api.get('/goals/'+id+'/progress');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Métodos antigos mantidos para compatibilidade
  async getGoalsService(filters = {}) {
    return this.getGoals(filters);
  },

  async createGoalsService(data) {
    return this.createGoal(data);
  },

  async updateGoalsService(id, data) {
    return this.updateGoal(id, data);
  },

  async deleteGoalsService(id) {
    return this.deleteGoal(id);
  },
};

export default goalsService;
