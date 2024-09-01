<template>
  <div class="profile-container">
    <h2>Your Profile</h2>
    <form @submit.prevent="updateProfile">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" v-model="form.username" id="username" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="form.email" id="email" required />
      </div>
      <div class="form-group">
        <label for="role">Role:</label>
        <input type="text" v-model="form.role" id="role" disabled /> <!-- Role is disabled for non-admins -->
      </div>
      <div class="form-group">
        <label for="password">New Password:</label>
        <input type="password" v-model="form.password" id="password" />
      </div>
      <div class="form-group">
        <label for="avatars">Profile Picture:</label>
        <input type="file" id="avatars" @change="handleFileUpload" />
      </div>
      <button type="submit">Update Profile</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProfileView',
  data() {
    return {
      form: {
        username: '',
        email: '',
        role: '',
        password: '',
      },
      avatarFile: null, // Store the uploaded file
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
    };
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      try {
        const response = await axios.get(`${this.apiBaseUrl}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        this.form.username = response.data.username;
        this.form.email = response.data.email;
        this.form.role = response.data.role;
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    },
    handleFileUpload(event) {
      this.avatarFile = event.target.files[0];
    },
    async updateProfile() {
      try {
        const formData = new FormData();
        formData.append('username', this.form.username);
        formData.append('email', this.form.email);

        if (this.form.password) {
          formData.append('password', this.form.password);
        }

        if (this.avatarFile) {
          formData.append('avatar', this.avatarFile);
        }

        await axios.put(`${this.apiBaseUrl}/profile`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        alert('Profile updated successfully');
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile');
      }
    },
  },
};
</script>
