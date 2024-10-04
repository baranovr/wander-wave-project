import axiosInstance from './axiosInstance';
import { store } from '../app/store';
import { refreshToken } from '../features/authSlice';

export function setupAxiosInterceptors() {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.accessToken;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          await store.dispatch(refreshToken());
          const newToken = store.getState().auth.accessToken;
          if (newToken) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
}
