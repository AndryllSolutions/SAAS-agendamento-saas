import api from './api';

const commandsService = {
  async getCommands(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/commands?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCommandById(commandId) {
    try {
      const response = await api.get(`/commands/${commandId}`);
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

  async addItemToCommand(commandId, itemData) {
    try {
      const response = await api.post(`/commands/${commandId}/items`, itemData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async removeItemFromCommand(commandId, itemId) {
    try {
      await api.delete(`/commands/${commandId}/items/${itemId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async closeCommand(commandId) {
    try {
      const response = await api.post(`/commands/${commandId}/close`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async reopenCommand(commandId) {
    try {
      const response = await api.post(`/commands/${commandId}/reopen`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default commandsService;
