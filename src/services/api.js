import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (API_BASE && !API_BASE.endsWith('/api')) {
  API_BASE = API_BASE.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  employeeLogin: (email, password) => api.post('/auth/employee/login', { email, password }),
};

// Admin APIs
export const adminAPI = {
  getEmployees: () => api.get('/admin/employees'),
  createEmployee: (data) => api.post('/admin/employees', data),
  updateEmployee: (id, data) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getTasks: () => api.get('/admin/tasks'),
  createTask: (data) => api.post('/admin/tasks', data),
  deleteTask: (id) => api.delete(`/admin/tasks/${id}`),
  getTodayActivity: () => api.get('/admin/activity/today'),
  getAllActivity: () => api.get('/admin/activity'),
  getChartAnalytics: (params) => api.get('/admin/analytics/charts', { params }),
};

// Employee APIs
export const employeeAPI = {
  getProfile: () => api.get('/employee/profile'),
  checkIn: () => api.post('/employee/check-in'),
  checkOut: () => api.post('/employee/check-out'),
  getCheckInStatus: () => api.get('/employee/check-in/status'),
  getTasks: (status) => api.get('/employee/tasks', { params: { status } }),
  createTask: (data) => api.post('/employee/tasks', data),
  updateTaskStatus: (id, status) => api.patch(`/employee/tasks/${id}`, { status }),
  getTaskStats: () => api.get('/employee/tasks/stats'),
};

export default api;
