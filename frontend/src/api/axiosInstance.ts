import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: process.env.VITE_API_URL,
});

// Add a request interceptor to include the auth token in the headers
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access'); // Retrieve token from local storage or auth state
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
