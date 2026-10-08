import axios from 'axios';
import { tokenUtils } from '@/shared/lib/token';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7283',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = tokenUtils.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 fora do login = sessão expirada ou inválida
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.toLowerCase().includes('login/');
    if (error.response?.status === 401 && !isLogin && tokenUtils.getToken()) {
      tokenUtils.logout();
    }
    return Promise.reject(error);
  }
);

export default api;
