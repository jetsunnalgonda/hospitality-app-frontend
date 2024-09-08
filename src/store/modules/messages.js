// store/modules/messages.js
const state = () => ({
  conversations: JSON.parse(localStorage.getItem('messages')) || [], // Load conversations from localStorage
});

const actions = {
  async addMessage({ commit }, { conversationId, message, timestamp, userId }) {
    commit('ADD_MESSAGE', { conversationId, message, timestamp, userId });
  },
};

const mutations = {
  ADD_MESSAGE(state, { conversationId, message, timestamp, userId }) {
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.messages.push({ ...message, timestamp, userId });
    } else {
      // Add a new conversation if it doesn't exist
      state.conversations.push({
        id: conversationId,
        messages: [{ ...message, timestamp, userId }],
      });
    }
    localStorage.setItem('messages', JSON.stringify(state.conversations));
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
