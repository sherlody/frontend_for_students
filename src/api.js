//instancia de Axios para interactuar con el back
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
