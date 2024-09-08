// store/modules/conversations.js
const state = () => ({
  conversations: JSON.parse(localStorage.getItem('conversations')) || [], // Load from localStorage
});

const actions = {
  async updateConversationId({ commit }, { oldId, newId }) {
    commit('UPDATE_CONVERSATION_ID', { oldId, newId });
  },
};

const mutations = {
  UPDATE_CONVERSATION_ID(state, { oldId, newId }) {
    const conversation = state.conversations.find(c => c.id === oldId);
    if (conversation) {
      conversation.id = newId;
    }
    localStorage.setItem('conversations', JSON.stringify(state.conversations));
  },
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
