<template>
  <section class="chat__body">
    <div class="messages">
      <div class="chat__loader" v-if="loading">
        <div class="spinner"></div>
      </div>
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'message',
          { 'my-message': message.senderId === currentUserId },
          { 'droplet': message.type === 'text' && message.hasDroplet }
        ]"
      >
        <div class="message__profile">
          <img class="message__profile__pic" :src="message.profilePic" />
        </div>
        <div v-if="message.type === 'text'" class="message__text">
          <div class="message__text__content">
            <div class="message__sender">{{ message.senderName }} ({{ message.senderRole }})</div>
            {{ message.content }}
            <div class="message__time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        <div v-if="message.type === 'image'" class="message__image">
          <img class="message__image__content" :src="message.content" />
          <div class="message__time">{{ formatTime(message.timestamp) }}</div>
        </div>
        <div v-if="message.type === 'text' && message.hasImage" class="message__image__text">
          <img class="message__image__content" :src="message.imageUrl" />
          <div class="message__text__content">
            <div class="message__sender">{{ message.senderName }} ({{ message.senderRole }})</div>
            {{ message.content }}
            <div class="message__time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'MessagesView',
  data() {
    return {
      loading: false,
      currentUserId: 1, // Assuming current user ID is 1 for demonstration
      messages: [
        {
          id: 1,
          senderId: 2,
          senderName: 'Dr. Smith',
          senderRole: 'Doctor',
          profilePic: 'https://via.placeholder.com/40?text=Dr.S',
          type: 'text',
          content: 'The patient in Room 301 needs urgent attention.',
          timestamp: new Date().toISOString(),
          hasDroplet: true,
        },
        {
          id: 2,
          senderId: 2,
          senderName: 'Dr. Smith',
          senderRole: 'Doctor',
          profilePic: 'https://via.placeholder.com/40?text=Dr.S',
          type: 'text',
          content: 'Please prepare the operating room for surgery.',
          timestamp: new Date().toISOString(),
          hasDroplet: true,
        },
        {
          id: 3,
          senderId: 1,
          senderName: 'Nurse Jane',
          senderRole: 'Nurse',
          profilePic: 'https://via.placeholder.com/40?text=Jane',
          type: 'text',
          content: 'I have already notified the surgical team.',
          timestamp: new Date().toISOString(),
          hasDroplet: true,
        },
        {
          id: 4,
          senderId: 2,
          senderName: 'Dr. Smith',
          senderRole: 'Doctor',
          profilePic: 'https://via.placeholder.com/40?text=Dr.S',
          type: 'image',
          content: 'https://via.placeholder.com/400?text=Surgery+Prep',
          timestamp: new Date().toISOString(),
        },
        {
          id: 5,
          senderId: 1,
          senderName: 'Nurse Jane',
          senderRole: 'Nurse',
          profilePic: 'https://via.placeholder.com/40?text=Jane',
          type: 'text',
          content: 'Everything is ready. The room is prepped for surgery.',
          timestamp: new Date().toISOString(),
          hasDroplet: true,
        },
        {
          id: 6,
          senderId: 1,
          senderName: 'Nurse Jane',
          senderRole: 'Nurse',
          profilePic: 'https://via.placeholder.com/40?text=Jane',
          type: 'text',
          content: 'We need to update the patient’s records with the latest vitals.',
          timestamp: new Date().toISOString(),
          hasImage: true,
          imageUrl: 'https://via.placeholder.com/200?text=Patient+Vitals',
        },
      ],
    };
  },
  methods: {
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.getHours()}:${date.getMinutes()}`;
    },
  },
};
</script>

<style scoped>
/* Adjust the chat container to be narrower */
.chat__body {
  display: flex;
  width: 100%;
  max-width: 600px; /* Adjusted width */
  height: 100%;
  background-image: url("https://raw.githubusercontent.com/telegramdesktop/tdesktop/dev/Telegram/Resources/art/bg_initial.jpg");
  background-position-y: -54px;
  background-attachment: fixed;
}

.messages {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-end;
  margin: 16px;
  margin-bottom: 6px;
  overflow-y: auto; /* Allow scrolling if content overflows */
}

.message {
  align-self: flex-start;
  display: flex;
  align-items: center;
  position: relative;
  min-height: 30px;
  max-width: 80%; /* Adjusted for narrower container */
  background-color: #e0f7fa; /* Light hospital blue */
  margin-bottom: 8px;
  border-radius: 6px;
  z-index: 2;
  box-shadow: 0 2px 1px 0 rgba(160,172,182,.5);
}

.message.my-message {
  align-self: flex-end;
  background-color: #c8e6c9; /* Light hospital green */
  box-shadow: 0 2px 1px 0 rgba(93,196,82,.5);
}

.message__profile {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.message__profile__pic {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.message__text,
.message__image__text .message__text__content {
  padding: 10px;
  z-index: 2;
}

.message__image,
.message__image__text {
  position: relative;
  z-index: 2;
}

.message__image {
  border-radius: 6px;
}

.message__image__content {
  border-radius: 6px;
  margin-bottom: -3px;
  max-width: 100%;
}

.message__time {
  display: inline-block;
  float: right;
  padding: 4px 14px;
  text-align: right;
  font-size: 12px;
  color: #a0acb6;
}

.my-message .message__time {
  color: #5dc452;
}

.message__image .message__time {
  display: block;
  float: initial;
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 4px;
  color: #fff;
  background-color: rgba(38,50,56,.5);
  border-radius: 6px;
  transition: opacity .2s linear;
  opacity: 0;
}

.message__image:hover .message__time {
  opacity: 1;
}

.message__sender {
  font-weight: bold;
  margin-bottom: 4px;
}

.message__text__content {
  display: flex;
  flex-direction: column;
}
</style>
