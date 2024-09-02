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
      
      <div class="chat-window" v-if="selectedConversation">
        <h3>{{ selectedConversation.name }} <span class="tag">{{ selectedConversation.role }}</span></h3>
        <div class="messages">
          <div v-for="(messageGroup, index) in groupedMessages" :key="index">
            <div class="date-stamp">{{ messageGroup.date }}</div>
            <div v-for="message in messageGroup.messages" :key="message.id" :class="{'message': true, 'my-message': message.isMine}">
              <img v-if="!message.isMine" :src="selectedConversation.avatarUrl" alt="User Avatar" class="message-avatar" />
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
            role: 'Coordinator',
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
  .messages-view {
    display: flex;
    height: 100%;
  }
  
  .conversations-list {
    width: 30%;
    border-right: 1px solid #ccc;
    padding: 10px;
    overflow-y: auto;
  }
  
  .conversations-list h3 {
    margin-bottom: 15px;
  }
  
  .conversation-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
  }
  
  .conversation-item:hover {
    background-color: #f0f0f0;
  }
  
  .conversation-item.selected {
    background-color: #e0e0e0;
  }
  
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .conversation-info h4 {
    margin: 0;
    font-size: 16px;
  }
  
  .conversation-info p {
    margin: 5px 0 0;
    color: #555;
  }
  
  .chat-window {
    width: 70%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  
  .chat-window h3 {
    margin-bottom: 10px;
  }
  
  .tag {
    display: inline-block;
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    margin-left: 10px;
  }
  
  .messages {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  
  .date-stamp {
    text-align: center;
    color: #888;
    font-size: 12px;
    margin: 20px 0;
  }
  
  .message {
    display: flex;
    align-items: flex-end;
    margin-bottom: 10px;
    max-width: 70%;
  }
  
  .message-bubble {
    padding: 10px;
    border-radius: 20px;
    background-color: #d1e7dd;
    position: relative;
  }
  
  .message p {
    margin: 0;
  }
  
  .timestamp {
    font-size: 10px;
    color: #888;
    margin-top: 5px;
    text-align: right;
  }
  
  .message-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
  }
  
  .my-message {
    align-self: flex-end;
  }
  
  .my-message .message-bubble {
    background-color: #007bff;
    color: white;
  }
  
  .message-bubble::after {
    content: "";
    position: absolute;
    top: 10px;
    width: 0;
    height: 0;
  }
  
  .message-bubble::after {
    left: -10px;
    border-top: 10px solid transparent;
    border-right: 10px solid #d1e7dd;
  }
  
  .my-message .message-bubble::after {
    right: -10px;
    border-top: 10px solid transparent;
    border-left: 10px solid #007bff;
  }
  
  .message-input {
    display: flex;
    align-items: center;
  }
  
  .message-input input {
    flex: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin-right: 10px;
  }
  
  .message-input button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
  }
  
  .message-input button:hover {
    background-color: #0056b3;
  }
  
  .no-conversation-selected {
    width: 70%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    color: #888;
  }
  </style>
  