<template>
  <div class="messages-view">
    <!-- New Conversation UI -->
    <div class="new-conversation">
      <input v-model="searchQuery" placeholder="Search users by email or username" />
      <ul v-if="filteredUsers.length">
        <li v-for="user in filteredUsers" :key="user.id">
          <button @click="startNewConversation(user.id)">{{ user.username || user.email }}</button>
        </li>
      </ul>
    </div>

    <!-- Conversations List -->
    <div class="conversations-list">
      <h3>Conversations</h3>
      <ul>
        <li v-for="conversation in conversations" :key="conversation.id" @click="selectConversation(conversation)">
          <div class="conversation-item" :class="{ 'selected': conversation.id === selectedConversation?.id }">
            <img :src="conversation.avatarUrl || '/default-avatar.jpg'" alt="User Avatar" class="avatar" />
            <div class="conversation-info">
              <h4>{{ conversation.name }} <span class="tag">{{ conversation.role }}</span></h4>
              <p>{{ conversation.lastMessage }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
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

export default {
  name: 'MessagesView',
  data() {
    return {
      conversations: [],
      selectedConversation: null,
      newMessage: '',
      searchQuery: '',
      users: [], // List of users to search from
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      return this.users.filter(user =>
        (user.email && user.email.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
    },
    groupedMessages() {
      if (!this.selectedConversation) return [];

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
  methods: {
    async fetchUsers() {
      try {
        const response = await apiClient.get(`/users`); // Adjust the endpoint
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async startNewConversation(participantId) {
      try {
        const response = await apiClient.post('/conversations', {
          userId: this.$store.state.userId, // Adjust to get current user ID
          participantId,
        });

        const newConversation = response.data;
        this.conversations.push(newConversation);
        this.selectConversation(newConversation);
        this.searchQuery = ''; // Clear the search query
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    },
    selectConversation(conversation) {
      this.selectedConversation = conversation;
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
  created() {
    this.fetchUsers(); // Fetch users on component creation
  },
};
</script>

<style scoped>
/* Add your CSS styles for the component here */
</style>
