import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7283',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
