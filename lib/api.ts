import axios from 'axios';

const API_BASE_URL = 'https://skilltestnextjs.evidam.zybotechlab.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh (if needed)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Handle token refresh logic here if needed
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  verifyUser: (phoneNumber: string) => 
    api.post('/api/verify/', { phone_number: phoneNumber }),
  
  registerUser: (data: { name: string; phone_number: string; unique_id?: string }) =>
    api.post('/api/login-register/', data),
  
  purchaseProduct: (data: { product_id?: string; variation_product_id?: string }) =>
    api.post('/api/purchase-product/', data),
  
  getUserOrders: () => 
    api.get('/api/user-orders/'),
  
  getNewProducts: () => 
    api.get('/api/new-products/'),
};

export default api;