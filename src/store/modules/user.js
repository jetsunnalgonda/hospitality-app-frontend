//store/modules/user.js
import apiClient from "@/utils/apiClient";

const state = () => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
});

const mutations = {
  setUser(state, user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  },
  logoutUser(state) {
    state.user = null;
    localStorage.removeItem('user');
  },
};

const actions = {
  async fetchUser({ commit, dispatch }) {
    try {
      const response = await apiClient.get(`/profile`);
      commit('setUser', response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        const refreshed = await dispatch('auth/refreshToken', null, { root: true });
        if (refreshed) {
          await dispatch('fetchUser');
        } else {
          commit('auth/logoutUser', null, { root: true });
          alert('Your session has expired. Please log in again.');
        }
      } else {
        commit('auth/logoutUser', null, { root: true });
        alert('An error occurred. Please log in again.');
      }
    }
  },
};

const getters = {
  user: (state) => state.user,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
