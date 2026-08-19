import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live-feed';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Analytics
  getOverviewKPIs: () => apiClient.get('/analytics/overview').then(res => res.data),
  getCategoryBreakdown: () => apiClient.get('/analytics/categories').then(res => res.data),
  getPriceScatter: (sampleSize = 250) => apiClient.get(`/analytics/scatter?sample_size=${sampleSize}`).then(res => res.data),
  getFeatureImportances: () => apiClient.get('/analytics/feature-importances').then(res => res.data),

  // Products CRUD
  getProducts: (params) => apiClient.get('/products', { params }).then(res => res.data),
  getProductById: (id) => apiClient.get(`/products/${id}`).then(res => res.data),
  createProduct: (data) => apiClient.post('/products', data).then(res => res.data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),
  getDropdownOptions: () => apiClient.get('/products/dropdown-options').then(res => res.data),

  // Pipeline & Simulation
  predictRealtime: (data) => apiClient.post('/pipeline/predict-realtime', data).then(res => res.data),
  uploadBatchCSV: (formData) => apiClient.post('/pipeline/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  retrainModel: () => apiClient.post('/pipeline/retrain').then(res => res.data),
  getModelDiagnostics: () => apiClient.get('/pipeline/metrics').then(res => res.data),
};
