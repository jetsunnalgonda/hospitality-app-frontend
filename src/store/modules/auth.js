//store/modules/auth.js
import apiClient from '@/utils/apiClient'; // Use apiClient instead of axios

const state = () => ({
  accessToken: localStorage.getItem('token') || '',
  refreshToken: localStorage.getItem('refreshToken') || '',
  isAuthenticated: !!localStorage.getItem('token'),
});

const mutations = {
  setTokens(state, { accessToken, refreshToken }) {
    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
    state.isAuthenticated = true;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  logoutUser(state) {
    state.accessToken = '';
    state.refreshToken = '';
    state.isAuthenticated = false;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  setAuthenticated(state, status) {
    state.isAuthenticated = status;
    if (!status) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },
};

const actions = {
  async login({ commit, dispatch }, form) {
    try {
      const response = await apiClient.post(`/login`, form);
      const { token, refreshToken } = response.data;

      commit('setTokens', { accessToken: token, refreshToken });
      await dispatch('user/fetchUser', null, { root: true });
      commit('setAuthenticated', true);

      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, message: 'Login failed. Please check your email and password.' };
    }
  },
  async logout({ commit }) {
    commit('logoutUser');
  },
  async refreshToken({ commit, state }) {
    try {
      const response = await apiClient.post(`/refresh`, {
        token: state.refreshToken,
      });
      const { token, refreshToken } = response.data;

      commit('setTokens', { accessToken: token, refreshToken });
      commit('setAuthenticated', true);

      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      commit('logoutUser');
      alert('Your session has expired. Please log in again.');
      return false;
    }
  },
  startTokenRefresh({ dispatch }) {
    const refreshInterval = 15 * 60 * 1000;
    setInterval(() => {
      dispatch('refreshToken');
    }, refreshInterval);
  },
};

const getters = {
  accessToken: (state) => state.accessToken,
  isAuthenticated: (state) => state.isAuthenticated,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
