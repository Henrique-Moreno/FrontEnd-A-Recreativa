import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001', 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='));
      const token = cookie ? cookie.split('=')[1] : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('Erro capturado no interceptor:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
      request: error.request ? {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers,
      } : null,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        data: error.config.data,
      } : null,
    });
    return Promise.reject(error);
  }
);

export default apiClient;