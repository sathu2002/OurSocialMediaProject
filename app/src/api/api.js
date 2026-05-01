import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Base URL - Update this based on your environment
// For Android emulator: http://10.0.2.2:5000/api
// For iOS simulator: http://localhost:5000/api
// For physical device: use your computer's IP address
const API_URL = 'http://192.168.103.203:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token on auth error
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
      } catch (e) {
        console.log('Error clearing storage:', e);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// User API
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Client API
export const clientAPI = {
  getClients: () => api.get('/clients'),
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (clientData) => api.post('/clients', clientData),
  registerClient: (clientData) => api.post('/clients/register', clientData),
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  deleteClient: (id) => api.delete(`/clients/${id}`),
};

// Task API
export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  getMyTasks: () => api.get('/tasks/my'),
  getTasksByMonth: (month) => api.get(`/tasks/calendar/${month}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Feedback API
export const feedbackAPI = {
  getFeedback: () => api.get('/feedback'),
  getMyFeedback: () => api.get('/feedback/my'),
  createFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  updateFeedback: (id, feedbackData) => api.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
};

// Payment API
export const paymentAPI = {
  getPayments: () => api.get('/payments'),
  getPaymentStats: () => api.get('/payments/stats'),
  getClientPayments: (clientId) => api.get(`/payments/client/${clientId}`),
  createPayment: (paymentData) => api.post('/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  deletePayment: (id) => api.delete(`/payments/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: () => api.get('/analytics'),
  getAnalyticsSummary: () => api.get('/analytics/summary'),
  getClientAnalytics: (clientId) => api.get(`/analytics/client/${clientId}`),
  getMonthlyAnalytics: (month) => api.get(`/analytics/monthly/${month}`),
  createAnalytics: (data) => api.post('/analytics', data),
  updateAnalytics: (id, data) => api.put(`/analytics/${id}`, data),
  deleteAnalytics: (id) => api.delete(`/analytics/${id}`),
};

// AI API
export const aiAPI = {
  chat: (message) => api.post('/ai/chat', { message }),
  sentiment: (text) => api.post('/ai/sentiment', { text }),
  analyticsInsight: (data) => api.post('/ai/analytics-insight', data),
  roleRecommend: (userData) => api.post('/ai/role-recommend', userData),
  permissionExplain: (role) => api.post('/ai/permission-explain', { role }),
  trends: () => api.post('/ai/trends'),
  suggestions: (data) => api.post('/ai/suggestions', data),
  monthlySummary: (month) => api.post('/ai/monthly-summary', { month }),
};

export default api;
