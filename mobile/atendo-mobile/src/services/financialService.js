import api from './api';

const financialService = {
  // Obter resumo financeiro
  async getFinancialSummary(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.period) params.append('period', filters.period); // day, week, month, year

      const response = await api.get(`/financial/summary?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter transações
  async getTransactions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.type) params.append('type', filters.type); // income, expense, refund
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/financial/transactions?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes da transação
  async getTransactionById(transactionId) {
    try {
      const response = await api.get(`/financial/transactions/${transactionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter receitas
  async getRevenue(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.groupBy) params.append('groupBy', filters.groupBy); // day, week, month

      const response = await api.get(`/financial/revenue?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter despesas
  async getExpenses(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.category) params.append('category', filters.category);
      if (filters.groupBy) params.append('groupBy', filters.groupBy);

      const response = await api.get(`/financial/expenses?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter comissões
  async getCommissions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.professional_id) params.append('professional_id', filters.professional_id);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/financial/commissions?${params.toString()}`);
      return { success: true, data: response.data };
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
        `/financial/professionals/${professionalId}/commission?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter controle de caixa
  async getCashControl(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/financial/cash-control?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Abrir caixa
  async openCash(initialAmount) {
    try {
      const response = await api.post('/financial/cash-control/open', {
        initial_amount: initialAmount,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Fechar caixa
  async closeCash(finalAmount) {
    try {
      const response = await api.post('/financial/cash-control/close', {
        final_amount: finalAmount,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter relatório DRE
  async getDREReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/financial/reports/dre?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter projeção de faturamento
  async getRevenueProjection(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.months) params.append('months', filters.months);

      const response = await api.get(`/financial/reports/revenue-projection?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter análise de lucratividade
  async getProfitabilityAnalysis(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(
        `/financial/reports/profitability?${params.toString()}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Exportar relatório financeiro
  async exportFinancialReport(format = 'pdf', filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/financial/reports/export?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter configurações de comissão
  async getCommissionSettings() {
    try {
      const response = await api.get('/financial/commission-settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar configurações de comissão
  async updateCommissionSettings(settings) {
    try {
      const response = await api.put('/financial/commission-settings', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter metas financeiras
  async getFinancialGoals(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.period) params.append('period', filters.period);

      const response = await api.get(`/financial/goals?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar meta financeira
  async createFinancialGoal(goalData) {
    try {
      const response = await api.post('/financial/goals', goalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar meta financeira
  async updateFinancialGoal(goalId, goalData) {
    try {
      const response = await api.put(`/financial/goals/${goalId}`, goalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default financialService;
