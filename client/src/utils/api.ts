// src/api.ts
import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });



//This injects the access token into the headers for every request
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('accessToken');
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

//This handles 401 errors by redirecting to the login page
api.interceptors.response.use(
  r => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);
