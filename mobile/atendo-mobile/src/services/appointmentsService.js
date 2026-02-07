// Appointments Service
import apiClient from '../config/api';

export const appointmentsService = {
  // Listar agendamentos
  getAppointments: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      if (filters.professional_id) params.append('professional_id', filters.professional_id);

      const response = await apiClient.get(`/appointments?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao listar agendamentos',
      };
    }
  },

  // Obter detalhes de um agendamento
  getAppointmentDetails: async (appointmentId) => {
    try {
      const response = await apiClient.get(`/appointments/${appointmentId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter agendamento',
      };
    }
  },

  // Criar novo agendamento
  createAppointment: async (appointmentData) => {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao criar agendamento',
      };
    }
  },

  // Atualizar agendamento
  updateAppointment: async (appointmentId, appointmentData) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, appointmentData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar agendamento',
      };
    }
  },

  // Cancelar agendamento
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      const response = await apiClient.delete(`/appointments/${appointmentId}`, {
        data: { cancellation_reason: reason },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao cancelar agendamento',
      };
    }
  },

  // Remarcar agendamento
  rescheduleAppointment: async (appointmentId, newDateTime) => {
    try {
      const response = await apiClient.post(`/appointments/${appointmentId}/reschedule`, {
        new_start_time: newDateTime,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao remarcar agendamento',
      };
    }
  },

  // Obter calendário
  getCalendar: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/appointments/calendar', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter calendário',
      };
    }
  },

  // Verificar conflitos
  checkConflicts: async (serviceId, startTime, endTime) => {
    try {
      const response = await apiClient.get('/appointments/conflicts', {
        params: {
          service_id: serviceId,
          start_time: startTime,
          end_time: endTime,
        },
      });
      return {
        success: true,
        hasConflicts: response.data.has_conflicts,
        conflicts: response.data.conflicts || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao verificar conflitos',
      };
    }
  },

  // Obter agendamentos de hoje
  getTodayAppointments: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/appointments', {
        params: {
          start_date: today,
          end_date: today,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter agendamentos de hoje',
      };
    }
  },

  // Obter próximos agendamentos
  getUpcomingAppointments: async (days = 7) => {
    try {
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const response = await apiClient.get('/appointments', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao obter próximos agendamentos',
      };
    }
  },
};
