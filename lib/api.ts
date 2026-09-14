import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      // Only redirect to /auth if user was previously logged in (had an access_token)
      if (token) {
        const url = error.config?.url || '';
        if (!url.includes('/auth/login') && !url.includes('/auth/signup') && !url.includes('/auth/recover')) {
          localStorage.removeItem('access_token');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
