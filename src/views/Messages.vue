<template>
  <div class="messages-view">
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
export default {
  name: 'MessagesView',
  data() {
    return {
      conversations: [
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
        {
          id: 2,
          name: 'Dr. Alice Johnson',
          avatarUrl: '/images/avatar1.jpg',
          lastMessage: 'See you tomorrow at 10 AM!',
          role: 'Doctor',
          messages: [
            { id: 1, text: 'Hi! Just confirming our appointment.', timestamp: '10:00 AM', isMine: false, date: 'Yesterday' },
            { id: 2, text: 'Yes, see you tomorrow at 10 AM.', timestamp: '10:05 AM', isMine: true, date: 'Yesterday' },
          ],
        },
        {
          id: 3,
          name: 'Patient Support',
          avatarUrl: '/images/group-avatar2.jpg',
          lastMessage: 'Your next check-up is scheduled.',
          role: 'Coordinator',
          messages: [
            { id: 1, text: 'Can you confirm my next check-up?', timestamp: '3:00 PM', isMine: true, date: 'Today' },
            { id: 2, text: 'Sure, it’s scheduled for next Monday.', timestamp: '3:05 PM', isMine: false, date: 'Today' },
          ],
        },
      ],
      selectedConversation: null,
      newMessage: '',
    };
  },
  computed: {
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
};
</script>


<style scoped>

</style>
