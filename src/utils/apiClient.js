import axios from 'axios';
import router from '../router'; 
import store from '../store'; 

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, 
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Handle token refresh on a 401 error
      originalRequest._retry = true;

      try {
        // Call Vuex action to refresh the token
        await store.dispatch('refreshToken');

        // Retry the original request with the new token
        const token = localStorage.getItem('token'); // Get updated token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        await store.dispatch('logout'); // Dispatch Vuex logout action
        router.push('/login');
        alert('Your session has expired. Please log in again.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
