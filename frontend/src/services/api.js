import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  profile: () => api.get('/auth/profile'),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  findAll: () => api.get('/users'),
  findOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersApi = {
  findAll: () => api.get('/customers'),
  findOne: (id) => api.get(`/customers/${id}`),
  findWithDebt: () => api.get('/customers/with-debt'),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
  setGlobalLimit: (limit) => api.patch('/customers/global-limit', { limit }),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  findAll: () => api.get('/products'),
  findOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export const salesApi = {
  findAll: () => api.get('/sales'),
  findOne: (id) => api.get(`/sales/${id}`),
  findByCustomer: (customerId) => api.get(`/sales/customer/${customerId}`),
  create: (data) => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  markAsPaid: (id) => api.patch(`/sales/${id}/pay`),
  remove: (id) => api.delete(`/sales/${id}`),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getSummary: () => api.get('/dashboard'),
  getTopDebtors: () => api.get('/dashboard/top-debtors'),
}

// ─── Import / Export ──────────────────────────────────────────────────────────
export const importExportApi = {
  exportAll: () => api.get('/import-export/export/all', { responseType: 'blob' }),
  exportCustomers: () => api.get('/import-export/export/customers', { responseType: 'blob' }),
  exportProducts: () => api.get('/import-export/export/products', { responseType: 'blob' }),
  exportSales: () => api.get('/import-export/export/sales', { responseType: 'blob' }),
  templateCustomers: () => api.get('/import-export/template/customers', { responseType: 'blob' }),
  templateProducts: () => api.get('/import-export/template/products', { responseType: 'blob' }),
  importCustomers: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/import-export/import/customers', form)
  },
  importProducts: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/import-export/import/products', form)
  },
}
