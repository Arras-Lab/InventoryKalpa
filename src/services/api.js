import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('Anda tidak memiliki akses untuk melakukan tindakan ini')
    } else if (error.response?.status >= 500) {
      toast.error('Terjadi kesalahan server. Silakan coba lagi.')
    }
    return Promise.reject(error)
  }
)

// Wood Inventory API
export const woodInventoryApi = {
  getAll: (params = {}) => api.get('/wood-inventory', { params }),
  getById: (noKontrak, noKapling, skshh, urutanPengiriman) => 
    api.get(`/wood-inventory/${encodeURIComponent(noKontrak)}/${encodeURIComponent(noKapling)}/${encodeURIComponent(skshh)}/${urutanPengiriman}`),
  create: (data) => api.post('/wood-inventory', data),
  update: (noKontrak, noKapling, skshh, urutanPengiriman, data) => 
    api.put(`/wood-inventory/${encodeURIComponent(noKontrak)}/${encodeURIComponent(noKapling)}/${encodeURIComponent(skshh)}/${urutanPengiriman}`, data),
  delete: (noKontrak, noKapling, skshh, urutanPengiriman) => 
    api.delete(`/wood-inventory/${encodeURIComponent(noKontrak)}/${encodeURIComponent(noKapling)}/${encodeURIComponent(skshh)}/${urutanPengiriman}`),
  getDashboard: () => api.get('/wood-inventory/dashboard'),
  exportExcel: (params = {}) => api.get('/wood-inventory/export/excel', { 
    params, 
    responseType: 'blob' 
  }),
  exportPdf: (params = {}) => api.get('/wood-inventory/export/pdf', { 
    params, 
    responseType: 'blob' 
  }),
}

// User Management API
export const userApi = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.post(`/users/${id}/toggle-status`),
}

// Auth API
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  changePassword: (passwordData) => api.post('/change-password', passwordData),
  refresh: () => api.post('/refresh'),
}

// Storage Location API
export const storageLocationService = {
  getAll: (params = {}) => api.get('/storage-locations', { params }).then(res => res.data),
  getById: (id) => api.get(`/storage-locations/${id}`).then(res => res.data),
  create: (data) => api.post('/storage-locations', data).then(res => res.data),
  update: (id, data) => api.put(`/storage-locations/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/storage-locations/${id}`).then(res => res.data),
  getStatistics: () => api.get('/storage-locations/statistics').then(res => res.data),
  getAvailable: (params = {}) => api.get('/storage-locations/available', { params }).then(res => res.data),
  updateUsage: () => api.post('/storage-locations/update-usage').then(res => res.data),
}

// Utility functions for file downloads
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const handleExport = async (exportFunction, filename, params = {}) => {
  try {
    toast.loading('Mengunduh file...', { id: 'export' })
    const response = await exportFunction(params)
    const blob = new Blob([response.data])
    downloadFile(blob, filename)
    toast.success('File berhasil diunduh!', { id: 'export' })
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Gagal mengunduh file', { id: 'export' })
  }
}
