// store/index.js
import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persist';

// Import modules
import auth from './modules/auth';
import user from './modules/user';
import unsentMessages from './modules/unsentMessages';
import messages from './modules/messages';
import conversations from './modules/conversations';

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: (state) => ({
    auth: state.auth,
    user: state.user,
    unsentMessages: state.unsentMessages,
    messages: state.messages,
    conversations: state.conversations,
  }),
});

const store = createStore({
  modules: {
    auth,
    user,
    unsentMessages,
    messages,
    conversations,
  },
  plugins: [vuexLocal.plugin],
});

export default store;
