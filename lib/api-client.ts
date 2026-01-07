import axios from 'axios';

const API_BASE_URL = 'https://skilltestnextjs.evidam.zybotechlab.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  

  const localToken = localStorage.getItem('access_token');
  if (localToken) return localToken;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return value || null;
    }
  }
  
  return null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; Max-Age=0; path=/;';
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  verifyUser: (phoneNumber: string) => 
    api.post('/api/verify/', { phone_number: phoneNumber }),
  
  registerUser: (data: { name: string; phone_number: string; unique_id?: string }) =>
    api.post('/api/login-register/', data),
  
  purchaseProduct: (data: { product_id?: string; variation_product_id?: string }) =>
    api.post('/api/purchase-product/', data),
  
  getUserOrders: () => 
    api.get('/api/user-orders/'),
  
  // fallback for client-side usage
  getNewProducts: () => 
    api.get('/api/new-products/'),
};

export default api;

