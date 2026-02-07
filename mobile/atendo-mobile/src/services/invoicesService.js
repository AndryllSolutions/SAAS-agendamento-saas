import api from './api';

const invoicesService = {
  async getInvoices(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get('/invoices?'+params.toString());
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getInvoiceById(id) {
    try {
      const response = await api.get('/invoices/'+id);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createInvoice(data) {
    try {
      const response = await api.post('/invoices', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateInvoice(id, data) {
    try {
      const response = await api.put('/invoices/'+id, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteInvoice(id) {
    try {
      await api.delete('/invoices/'+id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async issueInvoice(id) {
    try {
      const response = await api.post('/invoices/'+id+'/issue');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async cancelInvoice(id, reason) {
    try {
      const response = await api.post('/invoices/'+id+'/cancel', { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async sendInvoice(id) {
    try {
      const response = await api.post('/invoices/'+id+'/send');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async downloadInvoice(id, format = 'pdf') {
    try {
      const response = await api.get('/invoices/'+id+'/download?format='+format);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Métodos antigos mantidos para compatibilidade
  async getInvoicesService(filters = {}) {
    return this.getInvoices(filters);
  },

  async createInvoicesService(data) {
    return this.createInvoice(data);
  },

  async updateInvoicesService(id, data) {
    return this.updateInvoice(id, data);
  },

  async deleteInvoicesService(id) {
    return this.deleteInvoice(id);
  },
};

export default invoicesService;
