// store/modules/unsentMessages.js
import apiClient from "@/utils/apiClient";

const state = () => ({
  unsentMessages: JSON.parse(localStorage.getItem('unsentMessages')) || [],  // Load from localStorage if available
});

const actions = {
  async addUnsentMessage({ commit }, message) {
    commit('ADD_UNSENT_MESSAGE', message);
  },

  async retryUnsentMessages({ commit }) {
    const unsentMessages = state().unsentMessages;
    for (const message of unsentMessages) {
      try {
        await apiClient.post('/messages', message);
        commit('REMOVE_UNSENT_MESSAGE', message.id);
      } catch (error) {
        console.error('Error resending message:', error);
      }
    }
  },

  // New action to clear all unsent messages
  async clearAllUnsentMessages({ commit }) {
    commit('CLEAR_ALL_UNSENT_MESSAGES');
  },
};

const mutations = {
  ADD_UNSENT_MESSAGE(state, message) {
    state.unsentMessages.push(message);
    localStorage.setItem('unsentMessages', JSON.stringify(state.unsentMessages));
  },

  REMOVE_UNSENT_MESSAGE(state, messageId) {
    state.unsentMessages = state.unsentMessages.filter(m => m.id !== messageId);
    localStorage.setItem('unsentMessages', JSON.stringify(state.unsentMessages));
  },

  // New mutation to clear the entire unsentMessages array
  CLEAR_ALL_UNSENT_MESSAGES(state) {
    state.unsentMessages = [];
    localStorage.removeItem('unsentMessages');  // Clear from localStorage
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
