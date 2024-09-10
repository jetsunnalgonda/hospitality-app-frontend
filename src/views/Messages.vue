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
              <!-- <div class="avatar-container"> -->
              <img :src="conversation.avatarUrl || '/default-avatar.jpg'" alt="User Avatar" class="avatar" />
              <!-- </div> -->
              <div class="conversation-info">
                <h4>{{ conversation.name }} <span class="tag">{{ conversation.role }}</span></h4>
                <p>{{ conversation.lastMessage }}</p>
                <span class="timestamp">{{ conversation.lastMessageTimestamp }}</span>
              </div>
              <div v-if="conversation.unreadCount > 0" class="unread-count">{{ conversation.unreadCount }}</div>
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
        <div class="messages" ref="chatContainer">
          <transition-group name="message-list" tag="div">
            <div v-for="(messageGroup, index) in groupedMessages" :key="index">
              <div class="date-stamp">{{ messageGroup.date }}</div>

              <transition-group name="message" tag="div">
                <div v-for="message in messageGroup.messages" :key="message.id"
                  :class="{ 'message': !message.isMine, 'my-message': message.isMine }">
                  <img v-if="!message.isMine" :src="selectedConversation.avatarUrl" alt="User Avatar"
                    class="message-avatar" />
                  <div class="message-bubble">
                    <p>{{ message.text }}</p>
                    <span class="timestamp">{{ message.timestamp }}</span>
                  </div>
                </div>
              </transition-group>

            </div>
          </transition-group>

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
import { mapGetters, mapActions } from 'vuex';
import { getPresignedUrl } from '../utils/apiService';
// import { nextTick } from 'vue';

export default {
  name: 'MessagesView',
  data() {
    return {
      websocketQueue: new ActionQueue(),
      databaseQueue: new ActionQueue(),
      conversations: [],
      users: [],
      selectedConversation: null,
      newMessage: '',
      searchQuery: '',
    };
  },
  // watch: {
  //   conversations(newVal, oldVal) {
  //     // Ensure this runs after the DOM is updated
  //     console.log('Conversations changed')
  //     console.log(oldVal)
  //     console.log(newVal)
  //     nextTick(() => {
  //       console.log('Next tick')
  //       this.scrollToBottom();
  //     });
  //   },
  //   selectedConversation(newVal, oldVal) {
  //     // Ensure this runs after the DOM is updated
  //     console.log('selectedConversation changed')
  //     console.log(oldVal)
  //     console.log(newVal)
  //     nextTick(() => {
  //       console.log('Next tick')
  //       this.scrollToBottom();
  //     });
  //   },
  // },
  computed: {
    ...mapGetters('user', ['user']),
    filteredConversations() {
      console.log('Search Query:', this.searchQuery);
      console.log('Conversations:', this.conversations);

      const query = (this.searchQuery || '').toLowerCase();
      return this.conversations.filter(convo => {
        const name = (convo.name || '').toLowerCase();
        const lastMessage = (convo.lastMessage || '').toLowerCase();
        return name.includes(query) || lastMessage.includes(query);
      });
    },

    filteredUsers() {
      if (!this.users) return
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
        const messageDate = new Date(message.timestamp).toDateString();
        if (messageDate !== currentDate) {
          currentDate = message.date;
          groups.push({ date: currentDate, messages: [] });
        }
        groups[groups.length - 1].messages.push(message);
      });

      return groups;
    },
  },
  mounted() {
    this.fetchConversations();
    // this.getUserLocation();
    websocketService.initialize(this.user.id);
    console.log('this.user.id is now ' + this.user.id)
    const existingListeners = websocketService.listeners.notification || [];
    console.log('existingListeners')
    console.log(existingListeners)
    const hasListener = existingListeners.some(listener => listener === this.handleMessage);

    if (!hasListener) {
      // Only add the listener if it's not already added
      websocketService.addListener('message', this.handleMessage);
    }

    this.fetchUsers();
    this.$store.dispatch('unsentMessages/clearAllUnsentMessages');

    this.retryUnsentMessages();
  },
  beforeUnmount() {
    websocketService.removeListener('message', this.handleMessage);
  },
  methods: {
    ...mapActions('unsentMessages', ['retryUnsentMessages']),
    async retryUnsentMessages() {
      await this.$store.dispatch('unsentMessages/retryUnsentMessages');
    },
    async fetchConversations() {
      try {
        // const response = await apiClient.get('/conversations');

        const response = await apiClient.post('/usersConversations', {
          userId: this.user.id,
        });
        console.log('this.user.id = ' + this.user.id);

        console.log('conversations response.data:');
        console.log(response.data);

        // Use Promise.all to resolve all async operations within the map
        this.conversations = await Promise.all(
          response.data.map(async (conversation) => {
            const lastMessage = conversation.messages[0]?.text || ''; // Handle case when there's no last message
            const lastMessageTimestamp = new Date(conversation.messages[0]?.timestamp).toLocaleString();

            console.log('conversation.messages:');
            console.log(conversation.messages);
            console.log('lastMessageTimestamp = ' + lastMessageTimestamp);

            // Extract main participant (assumed first one that's not the current user)
            const participant = conversation.participants.find(p => p.id !== this.user.id) || {};

            // Fetch the presigned URL for the participant's avatar
            const avatarUrl = participant.avatars?.[0]?.url
              ? await getPresignedUrl(participant.avatars[0].url)
              : '';

            console.log('participant.avatars')
            console.log(participant.avatars)
            console.log('participant:')
            console.log(participant)

            return {
              id: conversation.id,
              name: participant.name || 'Unknown User', // Fallback for missing data
              avatarUrl: avatarUrl,
              role: participant.role || 'user', // Role of the participant
              lastMessage,
              lastMessageTimestamp,
              participants: conversation.participants,
              messages: [], // Assuming messages are loaded later
              unreadCount: conversation.unreadCount,
            };
          })
        );

        console.log('Parsed Conversations:', this.conversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    },

    updateUnreadCount() {
      const unreadMessages = document.querySelectorAll('.message.unread').length;
      const unreadCountBadge = document.querySelector('.unread-count');

      if (unreadMessages > 0) {
        unreadCountBadge.textContent = unreadMessages;
      } else {
        unreadCountBadge.style.display = 'none'; // Hide if no unread messages
      }
    },
    selectConversation(conversation) {
      this.selectedConversation = conversation;
      console.log('Conversation selected:', this.selectedConversation)
      if (typeof this.selectedConversation.messages === 'undefined') {
        console.log('Messages were undefined')
        this.selectedConversation.messages = ['wefwsfd'];
      }
      console.log('this.selectedConversation from selectConversation() method: ')
      console.log(conversation)
      console.log(conversation.id)
      this.fetchMessages(conversation.id);
    },
    handleClickOutside() {
      if (this.selectedConversation) {
        this.selectedConversation = null;
      }
    },
    checkExistingConversationLocally_other(user) {
      // Check if a conversation with this user already exists
      const existingConversation = this.conversations.find(convo => {
        const hasUser = convo.participants.some(participant => participant.id === user.id);
        const hasCurrentUser = convo.participants.some(participant => participant.id === this.user.id);
        return hasUser && hasCurrentUser;
      });
      return existingConversation;
    },
    checkExistingConversationLocally(user) {
      return this.conversations.find(convo =>
        convo.participants.some(p => p.id === user.id) &&
        convo.participants.some(p => p.id === this.user.id)
      );
    },
    async checkExistingConversationInDatabase(user1, user2) {
      try {
        const response = await apiClient.get('/conversations/check', {
          params: {
            user1Id: user1.id,
            user2Id: user2.id
          }
        });
        return response.data.conversation; // Assuming the conversation object is in `data.conversation`
      } catch (error) {
        console.error('Error checking conversation in the database:', error);
        return null;
      }
    },
    async startConversationWithUser(user) {

      // Check locally first
      let existingConversation = this.checkExistingConversationLocally(user);

      if (!existingConversation) {
        // If not found locally, check the database
        existingConversation = await this.checkExistingConversationInDatabase(this.user, user);
      }
      if (existingConversation) {
        this.selectConversation(existingConversation);
        return;
      }

      const tempConversationId = parseInt(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

      const newConversation = {
        id: tempConversationId,
        tempId: tempConversationId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        lastMessage: '',
        role: user.role,
        messages: [],
        participants: [this.user.id, user.id],
      };

      console.log("newConversation:")
      console.log(newConversation)
      // Step 1: Immediate Vuex State Update
      this.conversations.push(newConversation);
      this.selectConversation(newConversation);
      console.log('this.selectConversation.id from async startConversationWithUser')
      console.log(this.selectedConversation.id)
      console.log('this.conversations')
      console.log(this.conversations)

      // Step 2: WebSocket Message in a Separate Queue
      this.websocketQueue.enqueue(async () => {
        try {
          await websocketService.sendMessage('NEW_CONVERSATION', {
            id: tempConversationId,
            participants: [this.user.id, user.id],
            messages: [],
          });
        } catch (error) {
          console.error('Error sending WebSocket message:', error);
          // Handle WebSocket error (e.g., retry, notify user)
        }
      });

      // Step 3: Database Storage in a Separate Queue
      this.databaseQueue.enqueue(async () => {
        try {
          const response = await apiClient.post('/conversations', {
            participants: [this.user.id, user.id],
            messages: [],
          });

          // Update the conversation ID in the local state
          const newConversationId = response.data.id;
          this.selectedConversation.id = newConversationId;
          console.log('newConversationId')
          console.log(newConversationId)
          console.log('response.data')
          console.log(response.data)
          newConversation.id = newConversationId;
          this.$store.dispatch('conversations/updateConversationId', {
            oldId: tempConversationId,
            newId: newConversationId,
          });

          console.log('this.conversations')
          console.log(this.conversations)

        } catch (error) {
          console.error('Error storing conversation in database:', error);
          // Handle database error (e.g., retry, notify user)
        }
      });
    },
    async sendMessage() {
      if (this.newMessage.trim() === '' || !this.selectedConversation) return;

      const timestamp = Date.now();

      const newMessage = {
        id: parseInt(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
        text: this.newMessage,
        timestamp: new Date().toLocaleTimeString(),
        isMine: true,
        date: 'Today',
        status: 'to-be-delivered',
      };

      // Update the UI
      console.log('this.selectedConversation');

      console.log(this.selectedConversation);

      this.selectedConversation.messages.push(newMessage);
      this.newMessage = '';
      this.scrollToBottom();

      // Get sendeeId (assuming there's only one recipient per conversation)
      const sendeeId = this.selectedConversation.participants.find(p => p.id !== this.user.id)?.id;

      console.log('sendMessage sendeeId: ' + sendeeId)

      // Step 1: Store the message in Vuex (persistent state) and update UI
      this.$store.dispatch('messages/addMessage', {
        conversationId: this.selectedConversation.id,
        message: newMessage,
        timestamp: timestamp,
        userId: this.user.id, // Sender's ID
        sendeeId: sendeeId, // Sendee's ID
        status: 'delivered',
      })

      // Step 2: Enqueue WebSocket and Database operations
      this.websocketQueue.enqueue(async () => {
        try {
          await websocketService.sendMessage('MESSAGE', {
            conversationId: this.selectedConversation.id,
            text: newMessage.text,
            tempId: newMessage.id,
            senderId: this.user.id,
            sendeeId: sendeeId, // Send sendeeId via WebSocket
            createdAt: timestamp,
          });
        } catch (error) {
          console.error('Error sending message via WebSocket:', error);
          // Save to unsent messages in case of WebSocket failure
          this.$store.dispatch('unsentMessages/addUnsentMessage', newMessage);
        }
      });

      this.databaseQueue.enqueue(async () => {
        console.log('databaseQueue enqueued')
        console.log('this.selectedConversation')
        console.log(this.selectedConversation)
        try {
          const response = await apiClient.post('/messages', {
            conversationId: this.selectedConversation.id || this.selectedConversation.tempId,
            text: newMessage.text,
            status: 'delivered',
            sendeeId: sendeeId, // Send sendeeId to the database
          });

          // Update the message ID and status after successful save
          newMessage.id = response.data.messageId;
          newMessage.status = 'delivered';
          this.$store.dispatch('messages/addMessage', {
            conversationId: this.selectedConversation.id,
            message: newMessage,
            timestamp: timestamp,
          });
        } catch (error) {
          console.error('Error saving message to the database:', error);
          // Save to unsent messages in case of database failure
          newMessage.status = 'failed';
          this.$store.dispatch('unsentMessages/addUnsentMessage', newMessage);
        }
      });
    },

    async fetchMessages(conversationId) {
      try {
        const response = await apiClient.get(`/conversations/${conversationId}/messages`);
        console.log('fetchedMessages:', response.data);

        // Map the response data to match your UI format
        this.selectedConversation.messages = response.data.map(message => {
          const isMine = message.userId === this.user.id; // Check if the message is from the current user

          return {
            id: message.id, // Message ID
            text: message.text, // Message text
            timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format timestamp
            isMine, // True if the message is from the current user, otherwise false
            date: new Date(message.timestamp).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) // Format date
          };
        });

        console.log('Parsed Messages:', this.selectedConversation.messages);
        // nextTick(() => {
        //   console.log('Next tick after fetching messages:')

        // });
        this.scrollToBottom('auto');

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

      const { tempId, text, createdAt } = message;

      console.log('incoming message:', message)
      console.log('this.user.id =', this.user.id)

      const conversation = this.conversations.find(c => c.id === message.conversationId);
      if (conversation) {
        const existingMessage = conversation.messages.find(m => m.id === tempId);

        if (!existingMessage) {
          // Add the message if it does not already exist
          conversation.messages.push({
            id: tempId,
            text: text,
            timestamp: new Date(createdAt).toLocaleTimeString(),
            isMine: false,
            date: new Date(createdAt).toLocaleDateString(),
          });
          this.scrollToBottom()
        } else {
          console.log('Message with this ID already exists, skipping...');
        }
      }

    },
    // scrollToBottom() {
    //   console.log('scrollToBottom triggered');
    //   this.$nextTick(() => {
    //     const chatContainer = this.$refs.chatContainer;
    //     if (chatContainer) {
    //       chatContainer.scrollTop = chatContainer.scrollHeight;
    //     }
    //   });
    // },

    scrollToBottom(behavior = 'smooth') {
      console.log('scrollToBottom triggered');
      this.$nextTick(() => {
        if (this.$refs.chatContainer) {
          this.$refs.chatContainer.scrollTo({
            top: this.$refs.chatContainer.scrollHeight,
            behavior: behavior
          });
        }
      });
    },

  },
};
</script>

<style scoped>
/* Add your styles here */
/* Message list animation */
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.5s ease;
}

.message-list-enter-from,
.message-list-leave-to {
  opacity: 1;
  transform: translateY(20px);
}

/* Individual message animation */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 1;
  transform: translateY(10px);
}

.search-bar {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

.conversation-item.selected,
.user-item:hover {
  background-color: #f0f0f0;
}

.messages {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.messages::-webkit-scrollbar {
  display: none;
}


/* .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
} */
</style>
