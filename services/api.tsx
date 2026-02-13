import axios from 'axios';
import { tokenUtils } from '@/utils/token';
import { showErrorToast } from '@/utils/toast';

// Configuração base do Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7283',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para adicionar o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout automático
      tokenUtils.logout();
    } else if (error.response?.status === 403) {
      // Acesso negado - usuário não tem permissão para acessar o recurso
      showErrorToast('Acesso negado. Você não possui permissão de Administrador.');
    }
    return Promise.reject(error);
  }
);

export default api;
