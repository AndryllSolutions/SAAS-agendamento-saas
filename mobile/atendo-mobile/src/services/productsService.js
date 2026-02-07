import api from './api';

const productsService = {
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.brand_id) params.append('brand_id', filters.brand_id);
      if (filters.category_id) params.append('category_id', filters.category_id);

      const response = await api.get(`/products?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getProductById(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createProduct(data) {
    try {
      const response = await api.post('/products', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateProduct(id, data) {
    try {
      const response = await api.put(`/products/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getBrands() {
    try {
      const response = await api.get('/brands');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getCategories() {
    try {
      const response = await api.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async adjustStock(productId, quantity, reason) {
    try {
      const response = await api.post(`/products/${productId}/stock-adjustment`, {
        quantity,
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default productsService;
