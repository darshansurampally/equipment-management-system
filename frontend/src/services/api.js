import axios from 'axios'

const api = axios.create({
  baseURL: '',  // empty = use relative URLs, goes through nginx proxy
  headers: { 'Content-Type': 'application/json' },
})

// ── Equipment ──────────────────────────────────────────────
export const equipmentApi = {
  getAll: (params) => api.get('/api/equipment', { params }).then(r => r.data),
  getById: (id) => api.get(`/api/equipment/${id}`).then(r => r.data),
  create: (data) => api.post('/api/equipment', data).then(r => r.data),
  update: (id, data) => api.put(`/api/equipment/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/equipment/${id}`).then(r => r.data),
}

// ── Maintenance ───────────────────────────────────────────
export const maintenanceApi = {
  log: (data) => api.post('/api/maintenance', data).then(r => r.data),
  getHistory: (equipmentId) =>
    api.get(`/api/equipment/${equipmentId}/maintenance`).then(r => r.data),
}

// ── Equipment Types ───────────────────────────────────────
export const typesApi = {
  getAll: () => api.get('/api/equipment-types').then(r => r.data),
}

export default api