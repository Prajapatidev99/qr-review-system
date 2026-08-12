import axios from 'axios';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('qr_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only redirect if we're on an admin page
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('qr_admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data),
};

// ─── Businesses ───────────────────────────────────────────
export const businessAPI = {
  getAll: (params) => api.get('/businesses', { params }),
  getBySlug: (slug) => api.get(`/businesses/slug/${slug}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  remove: (id) => api.delete(`/businesses/${id}`),
  getQR: (id) => api.get(`/businesses/${id}/qr`),
};

// ─── Scans ────────────────────────────────────────────────
export const scanAPI = {
  record: (data) => api.post('/scans', data),
  recordAction: (id, data) => api.post(`/scans/${id}/action`, data),
};

// ─── Feedbacks ────────────────────────────────────────────
export const feedbackAPI = {
  submit: (data) => api.post('/feedbacks', data),
  getAll: (params) => api.get('/feedbacks', { params }),
  resolve: (id, data) => api.put(`/feedbacks/${id}/resolve`, data),
};

// ─── Analytics ────────────────────────────────────────────
export const analyticsAPI = {
  getSummary: (businessId, params) => api.get(`/analytics/${businessId}`, { params }),
  getTimeline: (businessId, params) => api.get(`/analytics/${businessId}/timeline`, { params }),
  getOverview: () => api.get('/analytics/overview'),
};

// ─── Suggestions ──────────────────────────────────────────
export const suggestionsAPI = {
  getRandom: (category, language, params = {}) => {
    const queryParams = typeof params === 'object' ? { count: 5, ...params } : { count: params };
    return api.get(`/suggestions/${category}/${language}`, { params: queryParams });
  },
  getAll: () => api.get('/suggestions'),
  upsert: (data) => api.post('/suggestions', data),
};
