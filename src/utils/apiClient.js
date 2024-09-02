import axios from 'axios';
import router from '../router';
import store from '../store';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/refresh`, { token: refreshToken });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await store.dispatch('logout');
        router.push('/login');
        alert('Your session has expired. Please log in again.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
