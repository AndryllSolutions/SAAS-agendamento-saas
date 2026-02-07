import api from './api';

const professionalsService = {
  // Listar profissionais
  async getProfessionals(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.specialty) params.append('specialty', filters.specialty);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/professionals?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes do profissional
  async getProfessionalById(professionalId) {
    try {
      const response = await api.get(`/professionals/${professionalId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar novo profissional
  async createProfessional(professionalData) {
    try {
      const response = await api.post('/professionals', professionalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar profissional
  async updateProfessional(professionalId, professionalData) {
    try {
      const response = await api.put(`/professionals/${professionalId}`, professionalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Deletar profissional
  async deleteProfessional(professionalId) {
    try {
      await api.delete(`/professionals/${professionalId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter agenda do profissional
  async getProfessionalSchedule(professionalId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.date) params.append('date', filters.date);

      const response = await api.get(
        `/professionals/${professionalId}/schedule?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar agenda do profissional
  async updateProfessionalSchedule(professionalId, scheduleData) {
    try {
      const response = await api.put(
        `/professionals/${professionalId}/schedule`,
        scheduleData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter disponibilidade do profissional
  async getProfessionalAvailability(professionalId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.service_id) params.append('service_id', filters.service_id);
      if (filters.duration) params.append('duration', filters.duration);

      const response = await api.get(
        `/professionals/${professionalId}/availability?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter agendamentos do profissional
  async getProfessionalAppointments(professionalId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(
        `/professionals/${professionalId}/appointments?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter serviços do profissional
  async getProfessionalServices(professionalId) {
    try {
      const response = await api.get(`/professionals/${professionalId}/services`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Adicionar serviço ao profissional
  async addServiceToProfessional(professionalId, serviceId, pricing) {
    try {
      const response = await api.post(
        `/professionals/${professionalId}/services`,
        {
          service_id: serviceId,
          ...pricing,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remover serviço do profissional
  async removeServiceFromProfessional(professionalId, serviceId) {
    try {
      await api.delete(`/professionals/${professionalId}/services/${serviceId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter comissão do profissional
  async getProfessionalCommission(professionalId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/professionals/${professionalId}/commission?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter estatísticas do profissional
  async getProfessionalStats(professionalId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/professionals/${professionalId}/stats?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter exceções de horário do profissional
  async getProfessionalScheduleOverrides(professionalId) {
    try {
      const response = await api.get(
        `/professionals/${professionalId}/schedule-overrides`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Adicionar exceção de horário
  async addScheduleOverride(professionalId, overrideData) {
    try {
      const response = await api.post(
        `/professionals/${professionalId}/schedule-overrides`,
        overrideData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Remover exceção de horário
  async removeScheduleOverride(professionalId, overrideId) {
    try {
      await api.delete(
        `/professionals/${professionalId}/schedule-overrides/${overrideId}`
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Buscar profissionais
  async searchProfessionals(query) {
    try {
      const response = await api.get(`/professionals/search?q=${query}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Ativar/Desativar profissional
  async toggleProfessionalStatus(professionalId, active) {
    try {
      const response = await api.patch(`/professionals/${professionalId}/status`, {
        active,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default professionalsService;
