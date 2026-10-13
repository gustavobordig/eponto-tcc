import axios from 'axios';
import toast from 'react-hot-toast';
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
    // Modo demonstração da API: limite de gravações (429) e contas protegidas (403).
    // As telas mostram só um erro genérico; aqui aparece o motivo. O id evita repetir o aviso.
    const mensagem: unknown = error.response?.data?.mensagem;
    if (error.response?.status === 429 || (error.response?.status === 403 && typeof mensagem === 'string' && /demonstra/i.test(mensagem))) {
      toast.error(String(mensagem ?? 'Limite de uso atingido. Tente mais tarde.'), { id: 'aviso-demo', duration: 6000 });
    }
    return Promise.reject(error);
  }
);

export default api;
