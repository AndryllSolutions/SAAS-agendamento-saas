import api from './api';

const packagesService = {
  // Listar pacotes
  async getPackages(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/packages?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes do pacote
  async getPackageById(packageId) {
    try {
      const response = await api.get(`/packages/${packageId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar novo pacote
  async createPackage(packageData) {
    try {
      const response = await api.post('/packages', packageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar pacote
  async updatePackage(packageId, packageData) {
    try {
      const response = await api.put(`/packages/${packageId}`, packageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Deletar pacote
  async deletePackage(packageId) {
    try {
      await api.delete(`/packages/${packageId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter serviços do pacote
  async getPackageServices(packageId) {
    try {
      const response = await api.get(`/packages/${packageId}/services`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Adicionar serviço ao pacote
  async addServiceToPackage(packageId, serviceId, quantity = 1) {
    try {
      const response = await api.post(`/packages/${packageId}/services`, {
        service_id: serviceId,
        quantity,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remover serviço do pacote
  async removeServiceFromPackage(packageId, serviceId) {
    try {
      await api.delete(`/packages/${packageId}/services/${serviceId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter pacotes pré-definidos
  async getPredefinedPackages(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/packages/predefined?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes do pacote pré-definido
  async getPredefinedPackageById(packageId) {
    try {
      const response = await api.get(`/packages/predefined/${packageId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar pacote a partir de pré-definido
  async createPackageFromPredefined(predefinedPackageId, customData = {}) {
    try {
      const response = await api.post(
        `/packages/predefined/${predefinedPackageId}/create`,
        customData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter agendamentos do pacote
  async getPackageAppointments(packageId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(
        `/packages/${packageId}/appointments?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter clientes que compraram o pacote
  async getPackageClients(packageId) {
    try {
      const response = await api.get(`/packages/${packageId}/clients`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter estatísticas do pacote
  async getPackageStats(packageId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/packages/${packageId}/stats?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buscar pacotes
  async searchPackages(query) {
    try {
      const response = await api.get(`/packages/search?q=${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Ativar/Desativar pacote
  async togglePackageStatus(packageId, active) {
    try {
      const response = await api.patch(`/packages/${packageId}/status`, { active });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Duplicar pacote
  async duplicatePackage(packageId) {
    try {
      const response = await api.post(`/packages/${packageId}/duplicate`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default packagesService;
