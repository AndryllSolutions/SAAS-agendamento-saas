import api from './api';

const clientsService = {
  // Listar clientes com filtros
  async getClients(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/clients?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes do cliente
  async getClientById(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar novo cliente
  async createClient(clientData) {
    try {
      const response = await api.post('/clients', clientData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar cliente
  async updateClient(clientId, clientData) {
    try {
      const response = await api.put(`/clients/${clientId}`, clientData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Deletar cliente
  async deleteClient(clientId) {
    try {
      await api.delete(`/clients/${clientId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter histórico de agendamentos do cliente
  async getClientAppointments(clientId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/clients/${clientId}/appointments?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter anamnese do cliente
  async getClientAnamnesis(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}/anamnesis`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar anamnese do cliente
  async updateClientAnamnesis(clientId, anamnesesData) {
    try {
      const response = await api.put(`/clients/${clientId}/anamnesis`, anamnesesData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter notas do cliente
  async getClientNotes(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}/notes`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Adicionar nota ao cliente
  async addClientNote(clientId, note) {
    try {
      const response = await api.post(`/clients/${clientId}/notes`, { content: note });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter avaliações do cliente
  async getClientReviews(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}/reviews`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Adicionar avaliação do cliente
  async addClientReview(clientId, reviewData) {
    try {
      const response = await api.post(`/clients/${clientId}/reviews`, reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buscar clientes por nome/email/telefone
  async searchClients(query) {
    try {
      const response = await api.get(`/clients/search?q=${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter estatísticas do cliente
  async getClientStats(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Exportar clientes (CSV/PDF)
  async exportClients(format = 'csv') {
    try {
      const response = await api.get(`/clients/export?format=${format}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default clientsService;
