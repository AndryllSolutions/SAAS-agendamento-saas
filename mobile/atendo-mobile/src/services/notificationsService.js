import api from './api';

const notificationsService = {
  async getNotifications(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.read) params.append('read', filters.read);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/notifications?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}`, { read: true });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async subscribeToPush(subscription) {
    try {
      const response = await api.post('/notifications/push/subscribe', subscription);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default notificationsService;
