<template>
  <div class="profile-container">
    <h2>Your Profile</h2>
    <form @submit.prevent="updateProfile" class="loading-overlay-container" :class="{ 'disabled': isLoading }">
      <!-- Profile Picture Section -->
      <div class="profile-pic-container" @click="triggerFileInput">
        <img :src="temporaryAvatarUrl" alt="Avatar Preview" class="profile-pic" />
        <input type="file" @change="handleAvatarChange" ref="fileInput" style="display: none;" />
      </div>

      <!-- Form Fields -->
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" v-model="form.username" id="username" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="form.email" id="email" required />
      </div>
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" v-model="form.name" id="name" required />
      </div>
      <div class="form-group">
        <label for="role">Role:</label>
        <input type="text" v-model="form.role" id="role" disabled /> <!-- Role is disabled for non-admins -->
      </div>
      <div class="form-group">
        <label for="password">New Password:</label>
        <input type="password" v-model="form.newPassword" id="password" />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" v-model="form.confirmPassword" id="confirmPassword" />
      </div>
      <div class="form-group">
        <label for="avatar">Profile Picture:</label>
        <input type="file" id="avatar" @change="handleFileUpload" />
      </div>
      <button type="submit">Update Profile</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { getPresignedUrl } from '../utils/apiService';
import apiClient from '@/utils/apiClient';

import { mapActions } from 'vuex';

import LoadingOverlay from '../utils/LoadingOverlay';
import '../utils/LoadingOverlay.css';

export default {
  name: 'ProfileView',
  data() {
    return {
      loadingOverlay: null,
      isLoading: false,
      form: {
        username: '',
        email: '',
        name: '',
        role: '',
        newPassword: '',
        confirmPassword: '',
        avatars: [],
      },
      avatarFile: null, // Store the uploaded file
      temporaryAvatar: null,
      temporaryAvatarUrl: '',
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      profilePicUrl: '/default-avatar.jpg',
      roles: ['Admin', 'Coordinator', 'Doctor'], 
    };
  },
  mounted() {
    // this.loadUserProfile();
    this.fetchUserData();
  },
  methods: {
    ...mapActions(['setUser', 'setAuthenticated']),
    // async loadUserProfile() {
    //   try {
    //     const response = await axios.get(`${this.apiBaseUrl}/profile`, {
    //       headers: {
    //         Authorization: `Bearer ${localStorage.getItem('token')}`,
    //       },
    //     });

    //     this.form.username = response.data.username;
    //     this.form.email = response.data.email;
    //     this.form.name = response.data.name;
    //     this.form.role = response.data.role;
    //   } catch (error) {
    //     console.error('Failed to load profile:', error);
    //     alert('Failed to load profile. Please try again later.');
    //   }
    // },
    showOverlay() {
      if (this.loadingOverlay) {
        this.loadingOverlay.close(); // Close any existing instance
      }
      this.loadingOverlay = new LoadingOverlay({
        text: 'Updating profile...',
        color: '#1b62e1',
        spinnerType: 'lds-roller'
      });
      this.loadingOverlay.init('loading-overlay-container'); // Attach to element with class 'loading-overlay-container'
    },
    hideOverlay() {
      if (this.loadingOverlay) {
        this.loadingOverlay.close();
        this.loadingOverlay = null; // Clear reference
      }
    },
    async fetchUserData() {
      // this.loading = true;
      console.log('Fetching user data...');
      try {
        const response = await this.getUserProfile();
        this.user = response.data;
        this.form = { ...this.user };
        this.form.avatars = this.user.avatars || [];

        await this.loadAvatarUrls();

        // this.temporaryAvatarUrl = this.profilePicUrl;
        if (this.form.avatars.length > 0 && this.form.avatars[0].presignedUrl) {
          this.temporaryAvatarUrl = this.form.avatars[0].presignedUrl;
        } else {
          // Fallback to a default avatar if no avatar is found
          this.temporaryAvatarUrl = '/default-avatar.jpg';
        }
        console.log('User data fetched successfully');
      } catch (error) {
        console.error('Error fetching user data', error);
        this.handleServerError();
      }
      // finally {
      //     this.loading = false; // Stop loading
      // }
    },
    async getUserProfile() {
      const url = `${this.apiBaseUrl}/profile`;
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      console.log(`Requesting user profile from: ${url}`);
      return axios.get(url, { headers });
    },
    async loadAvatarUrls() {
      console.log('Loading avatar URLs...');
      for (const avatar of this.form.avatars) {
        try {
          avatar.presignedUrl = await getPresignedUrl(avatar.url);
          console.log(`Fetched presigned URL for avatar: ${avatar.url}`);
          console.log(`Presigned URL: ${avatar.presignedUrl}`);
        } catch (error) {
          console.error(`Failed to fetch presigned URL for avatar: ${avatar.url}`, error);
          avatar.presignedUrl = '/default-avatar.jpg'; // Fallback URL
        }
      }
    },
    async created() {
      await getPresignedUrl(this.user.avatars[0] || '');
    },
    handleFileUpload(event) {
      this.avatarFile = event.target.files[0];
    },
    // async updateProfile_2() {
    //   if (this.form.password && this.form.password !== this.form.confirmPassword) {
    //     return alert('Passwords do not match.');
    //   }

    //   try {
    //     const formData = new FormData();
    //     formData.append('username', this.form.username);
    //     formData.append('email', this.form.email);
    //     formData.append('name', this.form.name);

    //     if (this.form.password) {
    //       formData.append('password', this.form.password);
    //     }

    //     if (this.avatarFile) {
    //       formData.append('avatar', this.avatarFile);
    //     }

    //     await axios.put(`${this.apiBaseUrl}/profile`, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //         Authorization: `Bearer ${localStorage.getItem('token')}`,
    //       },
    //     });

    //     alert('Profile updated successfully');
    //     this.loadUserProfile(); // Refresh the profile data
    //   } catch (error) {
    //     console.error('Failed to update profile:', error);
    //     alert('Failed to update profile. Please try again later.');
    //   }
    // },
    async updateProfile() {
      if (this.form.newPassword && this.form.newPassword !== this.form.confirmPassword) {
        return alert('Passwords do not match.');
      }

      console.log('this.form.newPassword = ' + this.form.newPassword);

      this.isLoading = true;
      this.showOverlay();
      try {
        const formData = { ...this.form };
        console.log(formData.avatars);
        formData.avatars = formData.avatars.map((avatar) => ({
          id: avatar.id,
          url: avatar.url || undefined
        }));

        // Append new password if provided
        if (this.form.newPassword) {
          formData.append('password', this.form.newPassword);
        }

        // Append avatar if new one is selected
        if (this.temporaryAvatar) {
          const avatarFormData = new FormData();
          avatarFormData.append('avatars', this.temporaryAvatar);

          // Update profile
          await apiClient.put('/profile', avatarFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const response = await apiClient.get('/profile');
          formData.avatars = response.data.avatars;
        }

        // Refresh profile data
        const response = await apiClient.put('/profile', formData);
        this.setUser(response.data);
        this.fetchUserData();

      } catch (error) {
        console.error('Error updating profile', error);
        // Check if error indicates a need to log out
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          this.handleServerError();
        } else {
          // Handle other types of errors
          console.error('An unexpected error occurred');
        }
      } finally {
        this.isLoading = false;
        this.hideOverlay();
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.temporaryAvatar = file;
        this.temporaryAvatarUrl = URL.createObjectURL(file);
      }
    },
    handleServerError() {
      // Redirect to login or another page
      // if (error.response && error.response.status === 401) {
      // Only redirect if it's an authentication issue
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.setUser(null); // Clear Vuex user state
      this.setAuthenticated(false); // Update the authentication state

      this.router.push('/login');
      // } else {
      //     console.error('Server error:', error);
      //     // Handle other types of errors accordingly
      // }
    },

  },
};
</script>

<style scoped>
.profile-pic-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.profile-pic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}
</style>
