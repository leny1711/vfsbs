import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  refresh: () => api.post('/api/auth/refresh')
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getBookings: () => api.get('/api/users/bookings')
};

// Routes API
export const routesAPI = {
  getAll: () => api.get('/api/routes'),
  getById: (id) => api.get(`/api/routes/${id}`),
  create: (data) => api.post('/api/routes', data),
  update: (id, data) => api.put(`/api/routes/${id}`, data),
  delete: (id) => api.delete(`/api/routes/${id}`)
};

// Schedules API (reused as Providers API for compatibility)
export const schedulesAPI = {
  getAll: (params) => api.get('/api/schedules', { params }),
  search: (params) => api.get('/api/schedules/search', { params }),
  getById: (id) => api.get(`/api/schedules/${id}`),
  create: (data) => api.post('/api/schedules', data),
  update: (id, data) => api.put(`/api/schedules/${id}`, data),
  delete: (id) => api.delete(`/api/schedules/${id}`)
};

// Providers API (maps to schedules for backend compatibility)
export const providersAPI = {
  getAll: (params) => api.get('/api/schedules', { params }),
  search: (params) => api.get('/api/schedules/search', { params }),
  getById: (id) => api.get(`/api/schedules/${id}`),
  getNearby: (params) => api.get('/api/schedules', { params })
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/api/bookings', data),
  getById: (id) => api.get(`/api/bookings/${id}`),
  cancel: (id) => api.put(`/api/bookings/${id}/cancel`),
  getAll: () => api.get('/api/bookings')
};

// Payments API
export const paymentsAPI = {
  createIntent: (data) => api.post('/api/payments/create-intent', data),
  confirm: (data) => api.post('/api/payments/confirm', data),
  getById: (id) => api.get(`/api/payments/${id}`)
};

export default api;
