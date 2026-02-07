import api from './api';

const reportsService = {
  // Obter relatório de despesas
  async getExpensesReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.category) params.append('category', filters.category);
      if (filters.groupBy) params.append('groupBy', filters.groupBy); // day, week, month

      const response = await api.get(`/reports/expenses?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de resultados financeiros (DRE)
  async getFinancialResultsReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/reports/financial-results?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter projeção de faturamento
  async getRevenueProjectionReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.months) params.append('months', filters.months);

      const response = await api.get(
        `/reports/revenue-projection?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de comissões
  async getCommissionsReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.professional_id) params.append('professional_id', filters.professional_id);

      const response = await api.get(`/reports/commissions?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório por serviço
  async getByServiceReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.service_id) params.append('service_id', filters.service_id);

      const response = await api.get(`/reports/by-service?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório por profissional
  async getByProfessionalReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.professional_id) params.append('professional_id', filters.professional_id);

      const response = await api.get(
        `/reports/by-professional?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório por cliente
  async getByClientReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.client_id) params.append('client_id', filters.client_id);

      const response = await api.get(`/reports/by-client?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de agendamentos
  async getAppointmentsReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);
      if (filters.professional_id) params.append('professional_id', filters.professional_id);

      const response = await api.get(`/reports/appointments?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de receita
  async getRevenueReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.groupBy) params.append('groupBy', filters.groupBy);

      const response = await api.get(`/reports/revenue?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de metas
  async getGoalsReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.professional_id) params.append('professional_id', filters.professional_id);

      const response = await api.get(`/reports/goals?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de produtos
  async getProductsReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/reports/products?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Exportar relatório
  async exportReport(reportType, format = 'pdf', filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/reports/${reportType}/export?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter resumo de relatórios
  async getReportsSummary(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/reports/summary?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter comparação de períodos
  async getPeriodsComparison(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.period1_from) params.append('period1_from', filters.period1_from);
      if (filters.period1_to) params.append('period1_to', filters.period1_to);
      if (filters.period2_from) params.append('period2_from', filters.period2_from);
      if (filters.period2_to) params.append('period2_to', filters.period2_to);

      const response = await api.get(
        `/reports/periods-comparison?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório de satisfação
  async getSatisfactionReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/reports/satisfaction?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default reportsService;
