<template>
  <div class="messages-view" v-click-outside="handleClickOutside">
    <div class="conversations-list">
      <h3>Conversations</h3>
      <input v-model="searchQuery" type="text" placeholder="Search people or groups" class="search-bar" />
      <ul>
        <!-- Conversations List -->
        <template v-if="!searchQuery">
          <li v-for="conversation in filteredConversations" :key="conversation.id"
            @click="selectConversation(conversation)">
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
import apiClient from '@/utils/apiClient';
import websocketService from '@/utils/websocketService';
import ActionQueue from '@/utils/ActionQueue';
import { mapGetters } from 'vuex';

export default {
  name: 'MessagesView',
  data() {
    return {
      messageLocalQueue: new ActionQueue(),
      messageNetworkQueue: new ActionQueue(),
      conversations: [],
      users: [],
      selectedConversation: null,
      newMessage: '',
      searchQuery: '',
    };
  },
  computed: {
    ...mapGetters('user', ['user']),
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
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.name && user.name.toLowerCase().includes(query))
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
    // this.getUserLocation();
    websocketService.initialize(this.user.id);

    websocketService.addListener('message', this.handleMessage);
    this.fetchUsers();
  },
  beforeUnmount() {
    websocketService.removeListener('message', this.handleMessage);
  },
  methods: {
    selectConversation(conversation) {
      this.selectedConversation = conversation;
      this.fetchMessages(conversation.id);
    },
    handleClickOutside() {
      if (this.selectedConversation) {
        this.selectedConversation = null;
      }
    },
    startConversationWithUser(user) {
      const newConversation = {
        id: Date.now(), // Use a better ID generation strategy
        name: user.name,
        avatarUrl: user.avatarUrl,
        lastMessage: '',
        role: user.role,
        messages: [],
      };
      this.conversations.push(newConversation);
      this.selectConversation(newConversation);
    },
    async sendMessage_new_unorganized() {
      if (this.newMessage.trim() !== '' && this.selectedConversation) {
        const newMessage = {
          id: Date.now(), // Temporary ID
          text: this.newMessage,
          timestamp: new Date().toLocaleTimeString(),
          isMine: true,
          date: 'Today',
          status: 'to-be-delivered', // Local status
        };

        // Step 1: Store the message in Vuex (persistent state) and update UI
        localStorageQueue.enqueue(() => {
          this.$store.dispatch('addMessage', {
            conversationId: this.selectedConversation.id,
            message: newMessage,
          });
          this.newMessage = '';
        });

        // Step 2: Send the message via WebSocket
        networkQueue.enqueue(async () => {
          try {
            await websocketService.sendMessage('MESSAGE', {
              conversationId: this.selectedConversation.id,
              text: newMessage.text,
              tempId: newMessage.id, // Temporary ID to match with API response
            });
          } catch (error) {
            console.error('Error sending message via WebSocket:', error);
          }
        });

        // Step 3: Store the message in the database via API call
        networkQueue.enqueue(async () => {
          try {
            const response = await apiClient.post('/messages', {
              conversationId: this.selectedConversation.id,
              text: newMessage.text,
            });

            // Update the message ID and status after successful save
            newMessage.id = response.data.messageId; // Actual ID from the database
            newMessage.status = 'delivered'; // Mark as delivered
            this.$store.dispatch('addMessage', {
              conversationId: this.selectedConversation.id,
              message: newMessage,
            });
          } catch (error) {
            console.error('Error saving message to the database:', error);
            // Optionally revert UI changes or mark the message as failed
            newMessage.status = 'failed';
            this.$store.dispatch('addMessage', {
              conversationId: this.selectedConversation.id,
              message: newMessage,
            });
          }
        });
      }
    },
    async sendMessage() {
      if (this.newMessage.trim() === '' || !this.selectedConversation) return;
      this.createLocalMessage();
      this.sendWebSocketMessage(tempMessage);
      this.saveMessageToDatabase(tempMessage);
    },

    async sendMessage_old() {
      // Check if the message is not empty and a conversation is selected
      if (this.newMessage.trim() === '' || !this.selectedConversation) return;

      // Enqueue the message sending process
      this.messageQueue.enqueue(async () => {
        // Step 1: Create and store the message locally
        const tempMessage = await this.createLocalMessage();

        // Step 2: Send a WebSocket message to the server
        await this.sendWebSocketMessage(tempMessage);

        // Step 3: Send an API call to store the message in the database
        await this.saveMessageToDatabase(tempMessage);
      });

      // Clear the input field
      this.newMessage = '';
    },

    // Function to create and store the message locally
    createLocalMessage() {
      const newMessage = {
        id: Date.now(),
        text: this.newMessage,
        timestamp: new Date().toLocaleTimeString(),
        isMine: true,
        date: 'Today',
        status: 'to-be-delivered', // Tagging the message as "to-be-delivered"
      };

      // Push the new message to the conversation's messages
      this.selectedConversation.messages.push(newMessage);
      return newMessage;
    },

    // Function to send a WebSocket message
    sendWebSocketMessage(message) {
      websocketService.sendMessage('MESSAGE', {
        conversationId: this.selectedConversation.id,
        text: message.text,
        tempId: message.id, // Using the local ID as a temporary ID
      });
    },

    // Function to save the message to the database
    async saveMessageToDatabase(message) {
      try {
        const response = await apiClient.post('/messages', {
          conversationId: this.selectedConversation.id,
          text: message.text,
        });

        // After successful API call, update the message with the actual ID
        message.id = response.data.messageId;
        message.status = 'delivered';

        // Optionally, send an update via WebSocket with the actual message ID
        websocketService.sendMessage('UPDATE_MESSAGE_ID', {
          conversationId: this.selectedConversation.id,
          tempId: message.id,
          messageId: response.data.messageId,
        });

      } catch (error) {
        console.error('Error saving message to database:', error);
        // Revert the UI changes on error
        this.selectedConversation.messages = this.selectedConversation.messages.filter(msg => msg.id !== message.id);
      }
    },
    async fetchMessages(conversationId) {
      try {
        const response = await apiClient.get(`/messages/${conversationId}`);
        this.selectedConversation.messages = response.data.messages;
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    },
    async fetchUsers() {
      try {
        const response = await apiClient.get(`/users`); // Adjust the endpoint
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      console.log('Users =', this.users)
    },
    handleMessage(message) {
      // Handle incoming WebSocket messages
      const conversation = this.conversations.find(c => c.id === message.conversationId);
      if (conversation) {
        conversation.messages.push({
          id: message.messageId,
          text: message.text,
          timestamp: new Date().toLocaleTimeString(),
          isMine: false,
          date: 'Today',
        });
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
</style>
