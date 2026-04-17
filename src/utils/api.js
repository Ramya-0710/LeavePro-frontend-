import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lf_token');
      localStorage.removeItem('lf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────
export const authAPI = {
  login:          (data)   => API.post('/auth/login', data),
  register:       (data)   => API.post('/auth/register', data),
  me:             ()       => API.get('/auth/me'),
  changePassword: (data)   => API.put('/auth/change-password', data),
  updateProfile:  (data)   => API.put('/auth/profile', data),
};

// ── USERS ─────────────────────────────────────────
export const userAPI = {
  getAll:           (params) => API.get('/users', { params }),
  getOne:           (id)     => API.get(`/users/${id}`),
  create:           (data)   => API.post('/users', data),
  update:           (id, data) => API.put(`/users/${id}`, data),
  delete:           (id)     => API.delete(`/users/${id}`),
  availableBackups: (params) => API.get('/users/available-backups', { params }),
};

// ── LEAVES ────────────────────────────────────────
export const leaveAPI = {
  getAll:       (params)    => API.get('/leaves', { params }),
  getOne:       (id)        => API.get(`/leaves/${id}`),
  apply:        (data)      => API.post('/leaves', data),
  updateStatus: (id, data)  => API.put(`/leaves/${id}/status`, data),
  cancel:       (id)        => API.put(`/leaves/${id}/cancel`),
  checkConflict:(params)    => API.get('/leaves/check-conflict', { params }),
  getToday:     ()          => API.get('/leaves/today'),
};

// ── EVENTS ────────────────────────────────────────
export const eventAPI = {
  getAll:  (params)   => API.get('/events', { params }),
  create:  (data)     => API.post('/events', data),
  update:  (id, data) => API.put(`/events/${id}`, data),
  delete:  (id)       => API.delete(`/events/${id}`),
};

// ── HOLIDAYS ──────────────────────────────────────
export const holidayAPI = {
  getAll:  (params)   => API.get('/holidays', { params }),
  create:  (data)     => API.post('/holidays', data),
  update:  (id, data) => API.put(`/holidays/${id}`, data),
  delete:  (id)       => API.delete(`/holidays/${id}`),
};

// ── NOTIFICATIONS ─────────────────────────────────
export const notifAPI = {
  getAll:      (params) => API.get('/notifications', { params }),
  markRead:    (id)     => API.put(`/notifications/${id}/read`),
  markAllRead: ()       => API.put('/notifications/mark-all-read'),
};

// ── ANALYTICS ─────────────────────────────────────
export const analyticsAPI = {
  manager:  (params) => API.get('/analytics/manager',  { params }),
  admin:    (params) => API.get('/analytics/admin',    { params }),
  employee: (params) => API.get('/analytics/employee', { params }),
};

// ── POLICY ────────────────────────────────────────
export const policyAPI = {
  get:           ()     => API.get('/policy'),
  update:        (data) => API.put('/policy', data),
  resetBalances: ()     => API.post('/policy/reset-balances'),
};

// ── CARRY FORWARD ─────────────────────────────────
export const carryAPI = {
  getAll:  ()     => API.get('/carryforward'),
  process: (data) => API.post('/carryforward/process', data),
};

// ── AUDIT ─────────────────────────────────────────
export const auditAPI = {
  getAll: (params) => API.get('/audit', { params }),
};

export default API;
