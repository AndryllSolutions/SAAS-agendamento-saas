import api from './api';

const servicesService = {
  // Listar serviços com filtros
  async getServices(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/services?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes do serviço
  async getServiceById(serviceId) {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar novo serviço
  async createService(serviceData) {
    try {
      const response = await api.post('/services', serviceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar serviço
  async updateService(serviceId, serviceData) {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Deletar serviço
  async deleteService(serviceId) {
    try {
      await api.delete(`/services/${serviceId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter profissionais que oferecem o serviço
  async getServiceProfessionals(serviceId) {
    try {
      const response = await api.get(`/services/${serviceId}/professionals`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Adicionar profissional ao serviço
  async addProfessionalToService(serviceId, professionalId, pricing) {
    try {
      const response = await api.post(`/services/${serviceId}/professionals`, {
        professional_id: professionalId,
        ...pricing,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remover profissional do serviço
  async removeProfessionalFromService(serviceId, professionalId) {
    try {
      await api.delete(`/services/${serviceId}/professionals/${professionalId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Listar categorias de serviços
  async getCategories() {
    try {
      const response = await api.get('/services/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter estatísticas do serviço
  async getServiceStats(serviceId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/services/${serviceId}/stats?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter agendamentos do serviço
  async getServiceAppointments(serviceId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/services/${serviceId}/appointments?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Listar pacotes do serviço
  async getServicePackages(serviceId) {
    try {
      const response = await api.get(`/services/${serviceId}/packages`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buscar serviços
  async searchServices(query) {
    try {
      const response = await api.get(`/services/search?q=${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter serviços por categoria
  async getServicesByCategory(categoryId) {
    try {
      const response = await api.get(`/services/category/${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Duplicar serviço
  async duplicateService(serviceId) {
    try {
      const response = await api.post(`/services/${serviceId}/duplicate`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Ativar/Desativar serviço
  async toggleServiceStatus(serviceId, active) {
    try {
      const response = await api.patch(`/services/${serviceId}/status`, { active });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default servicesService;
