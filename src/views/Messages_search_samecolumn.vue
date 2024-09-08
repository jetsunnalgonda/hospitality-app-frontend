<template>
  <div class="messages-view" v-click-outside="handleClickOutside">
    <div class="conversations-list">
      <h3>Conversations</h3>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search people or groups"
        class="search-bar"
      />
      <ul>
        <!-- Conversations List -->
        <template v-if="!searchQuery">
          <li v-for="conversation in filteredConversations" :key="conversation.id" @click="selectConversation(conversation)">
            <div class="conversation-item" :class="{ 'selected': conversation.id === selectedConversation?.id }">
              <img :src="conversation.avatarUrl || '/default-avatar.jpg'" alt="User Avatar" class="avatar" />
              <div class="conversation-info">
                <h4>{{ conversation.name }} <span class="tag">{{ conversation.role }}</span></h4>
                <p>{{ conversation.lastMessage }}</p>
              </div>
            </div>
          </li>
        </template>
        <!-- User Profiles -->
        <template v-if="searchQuery">
          <li v-for="user in filteredUsers" :key="user.id" @click="startConversationWithUser(user)">
            <div class="user-item">
              <img :src="user.avatarUrl || '/default-avatar.jpg'" alt="User Avatar" class="avatar" />
              <div class="user-info">
                <h4>{{ user.name }}</h4>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>

    <div class="main-content">
      <div class="selected-conversation" v-if="selectedConversation">
        <h3>{{ selectedConversation.name }} <span class="tag">{{ selectedConversation.role }}</span></h3>
      </div>

      <div class="chat-window" v-if="selectedConversation">
        <div class="messages">
          <div v-for="(messageGroup, index) in groupedMessages" :key="index">
            <div class="date-stamp">{{ messageGroup.date }}</div>
            <div v-for="message in messageGroup.messages" :key="message.id"
              :class="{ 'message': !message.isMine, 'my-message': message.isMine }">
              <img v-if="!message.isMine" :src="selectedConversation.avatarUrl" alt="User Avatar"
                class="message-avatar" />
              <div class="message-bubble">
                <p>{{ message.text }}</p>
                <span class="timestamp">{{ message.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="message-input">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..." />
          <button @click="sendMessage">Send</button>
        </div>
      </div>

      <div class="no-conversation-selected" v-else>
        <p>Select a conversation to start messaging</p>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/utils/apiClient'
import ActionQueue from '@/utils/ActionQueue';

export default {
  name: 'MessagesView',
  data() {
    return {
      messageQueue: new ActionQueue(),
      conversations: [
        // Example data, replace with real data from your API
        {
          id: 1,
          name: 'Team Alpha',
          avatarUrl: '/images/group-avatar1.jpg',
          lastMessage: 'Let’s sync up later today.',
          role: 'Group',
          messages: [
            { id: 1, text: 'Hello Team!', timestamp: '9:00 AM', isMine: false, date: 'Today' },
            { id: 2, text: 'Good morning, everyone.', timestamp: '9:05 AM', isMine: false, date: 'Today' },
            { id: 3, text: 'Good morning! Ready for the meeting?', timestamp: '9:10 AM', isMine: true, date: 'Today' },
          ],
        },
        // Additional example conversations
      ],
      users: [
        // Example data, replace with real user data from your API
        {
          id: 4,
          name: 'Jane Doe',
          avatarUrl: '/images/avatar2.jpg',
          role: 'Patient',
        },
        // Additional example users
      ],
      selectedConversation: null,
      newMessage: '',
      searchQuery: '',
    };
  },
  computed: {
    filteredConversations() {
      const query = this.searchQuery.toLowerCase();
      return this.conversations.filter(convo =>
        convo.name.toLowerCase().includes(query) ||
        (convo.lastMessage || '').toLowerCase().includes(query)
      );
    },
    filteredUsers() {
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.name.toLowerCase().includes(query)
      );
    },
    groupedMessages() {
      if (!this.selectedConversation || !this.selectedConversation.messages) return [];

      let groups = [];
      let currentDate = null;

      this.selectedConversation.messages.forEach(message => {
        if (message.date !== currentDate) {
          currentDate = message.date;
          groups.push({ date: currentDate, messages: [] });
        }
        groups[groups.length - 1].messages.push(message);
      });

      return groups;
    },
  },
  mounted() {
    // this.notify = useNotivue();
    this.getUserLocation();
    // initializeWebSocket(this.user.id, push.success);
    websocketService.initialize(this.user.id);
    // websocketService.addListener('notification', this.handleNotification);

    const existingListeners = websocketService.listeners.message || [];
    const hasListener = existingListeners.some(listener => listener === this.handleMessage);

    if (!hasListener) {
      // Only add the listener if it's not already added
      websocketService.addListener('message', this.handleMessage);
    }

    // window.addEventListener('scroll', this.checkScroll);

    console.log("[Home] websocketService", websocketService)
  },
  beforeUnmount() {
    websocketService.removeListener('message', this.handleNotification);
    // window.removeEventListener('scroll', this.checkScroll);
  },
  methods: {
    selectConversation(conversation) {
      this.selectedConversation = conversation;
    },
    handleClickOutside() {
      // Your logic to handle clicks outside of the conversations list
      if (this.selectedConversation) {
        this.selectedConversation = null; // Deselect conversation or hide content
      }
    },
    startConversationWithUser(user) {
      // Logic to start a new conversation with the selected user
      const newConversation = {
        id: this.conversations.length + 1, // Generate a new ID (for example purposes)
        name: user.name,
        avatarUrl: user.avatarUrl,
        lastMessage: '',
        role: user.role,
        messages: [], // Start with an empty message array
      };
      this.conversations.push(newConversation);
      this.selectConversation(newConversation);
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        this.selectedConversation.messages.push({
          id: Date.now(),
          text: this.newMessage,
          timestamp: new Date().toLocaleTimeString(),
          isMine: true,
          date: 'Today',
        });
        this.newMessage = '';
      }
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
.search-bar {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}
/* .conversations-list ul,
.conversations-list li {
  list-style: none;
  padding: 0;
  margin: 0;
} */
/* .conversation-item,
.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
} */
.conversation-item.selected,
.user-item:hover {
  background-color: #f0f0f0;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
/* .user-info h4 {
  margin: 0;
} */
</style>
