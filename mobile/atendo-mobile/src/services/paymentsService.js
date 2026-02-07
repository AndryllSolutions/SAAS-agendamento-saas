import api from './api';

const paymentsService = {
  // Listar pagamentos
  async getPayments(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);
      if (filters.method) params.append('method', filters.method);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/payments?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes do pagamento
  async getPaymentById(paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar novo pagamento
  async createPayment(paymentData) {
    try {
      const response = await api.post('/payments', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar pagamento
  async updatePayment(paymentId, paymentData) {
    try {
      const response = await api.put(`/payments/${paymentId}`, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Processar reembolso
  async refundPayment(paymentId, refundData = {}) {
    try {
      const response = await api.post(`/payments/${paymentId}/refund`, refundData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter métodos de pagamento
  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/methods');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter pagamentos por cliente
  async getClientPayments(clientId, filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/clients/${clientId}/payments?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter pagamentos por agendamento
  async getAppointmentPayments(appointmentId) {
    try {
      const response = await api.get(`/appointments/${appointmentId}/payments`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter faturas
  async getInvoices(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/invoices?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter detalhes da fatura
  async getInvoiceById(invoiceId) {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar fatura
  async createInvoice(invoiceData) {
    try {
      const response = await api.post('/invoices', invoiceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Atualizar fatura
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const response = await api.put(`/invoices/${invoiceId}`, invoiceData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Enviar fatura por email
  async sendInvoiceByEmail(invoiceId, email) {
    try {
      const response = await api.post(`/invoices/${invoiceId}/send-email`, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Gerar PDF da fatura
  async generateInvoicePDF(invoiceId) {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter faturas por cliente
  async getClientInvoices(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}/invoices`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Processar pagamento Stripe
  async processStripePayment(paymentData) {
    try {
      const response = await api.post('/payments/stripe/process', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter planos de pagamento
  async getPaymentPlans() {
    try {
      const response = await api.get('/payments/plans');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obter assinaturas
  async getSubscriptions(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/payments/subscriptions?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Criar assinatura
  async createSubscription(subscriptionData) {
    try {
      const response = await api.post('/payments/subscriptions', subscriptionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId) {
    try {
      const response = await api.post(`/payments/subscriptions/${subscriptionId}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default paymentsService;
