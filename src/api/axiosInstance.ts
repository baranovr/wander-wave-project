import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://wander-wave-backend.onrender.com/api/',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;