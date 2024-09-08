<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="toggle-button" @click="toggleSidebar">
      <font-awesome-icon :icon="isCollapsed ? 'chevron-right' : 'chevron-left'" />
    </div>
    <div class="sidebar-header">
      <h2 v-if="!isCollapsed"><router-link to="/">Hospital App</router-link></h2>
      <router-link v-if="isCollapsed" to="/"><font-awesome-icon icon="home" class="icon" /></router-link>
    </div>
    <div class="profile-section" v-if="!isCollapsed">
      <a href="" @click="gotoProfile"><img :src="profilePicUrl || '/default-avatar.jpg'" alt="Profile Picture" /></a>
      <div class="profile-name">{{ userName }}</div>
    </div>
    <font-awesome-icon v-if="isCollapsed" icon="user-circle" class="profile-icon" />

    <ul class="nav-links">
      <li><router-link to="/scripts"><font-awesome-icon icon="file-alt" class="icon" /> <span
            v-if="!isCollapsed">Scripts</span></router-link></li>
      <li><router-link to="/schedule"><font-awesome-icon icon="calendar-alt" class="icon" /> <span
            v-if="!isCollapsed">Schedule</span></router-link></li>
      <li><router-link to="/tasks"><font-awesome-icon icon="tasks" class="icon" /> <span
            v-if="!isCollapsed">Tasks</span></router-link></li>
      <li><router-link to="/appointments"><font-awesome-icon icon="calendar-check" class="icon" /> <span
            v-if="!isCollapsed">Appointments</span></router-link></li>
      <li><router-link to="/messages"><font-awesome-icon icon="envelope" class="icon" /> <span 
            v-if="!isCollapsed">Messages</span></router-link></li>
      <li><a @click="performLogout"><font-awesome-icon icon="sign-out-alt" class="icon" /> <span
            v-if="!isCollapsed">Logout</span></a></li>
    </ul>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapActions } from 'vuex';
import { getPresignedUrl } from '../utils/apiService';

export default {
  name: 'SidebarView',
  data() {
    return {
      isLoading: false,
      isCollapsed: false,
      // user: null,
      defaultAvatarUrl: '/default-avatar.jpg', // Default avatar image URL
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      // profilePicUrl: this.defaultAvatarUrl,
    };
  },
  computed: {
    ...mapGetters('auth', ['isAuthenticated']),
    ...mapGetters('user', ['user']),

    userName() {
      console.log('userName change triggered');
      console.log('userName is', this.user?.name);
      console.log('user avatar is', this.user?.avatars)
      console.log('imageKey: ' + this.user?.avatars?.[0]?.url)
      return this.user?.name || 'Guest';
    },

  },
  asyncComputed: {
    profilePicUrl: {
      async get() {
        this.isLoading = true;
        let presignedUrl = this.defaultAvatarUrl
        if (this.isAuthenticated) {
          presignedUrl = await getPresignedUrl(this.user?.avatars?.[0]?.url)
        }
        return presignedUrl
      },
      default() {
        return this.defaultAvatarUrl
      }
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
    ...mapActions('auth', ['logout']),
    async updateProfilePicUrl(user) {
      if (user && user.avatars && user.avatars.length > 0) {
        const avatarUrl = user.avatars[0].url;
        try {
          this.profilePicUrl = await getPresignedUrl(avatarUrl);
        } catch (error) {
          this.profilePicUrl = this.defaultAvatarUrl;
        }
      } else {
        this.profilePicUrl = this.defaultAvatarUrl;
      }
    },
    async performLogout() {
      this.logout();
      this.$router.push('/login');
    },
    gotoProfile() {
      this.$router.push('/profile');
    },
  },
};
</script>

<style scoped>
/* .sidebar {
  background-color: #2c3e50;
  color: #ecf0f1;
  width: 250px;
  height: 100vh;
  position: fixed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  font-size: 1.5em;
  border-bottom: 1px solid #34495e;
}

.sidebar-header a {
  color: #ecf0f1;
  text-decoration: none;
}

.nav-links {
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.nav-links li {
  padding: 15px 20px;
  transition: background-color 0.3s;
}

.nav-links li a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1.2em;
  display: block;
  width: 100%;
}

.nav-links li a:hover {
  background-color: #1abc9c;
  border-radius: 4px;
}

.nav-links li.active a {
  background-color: #34495e;
  border-radius: 4px;
}

.nav-links li + li {
  border-top: 1px solid #34495e;
}

@media (max-height: 600px) {
  .nav-links {
    overflow-y: auto;
  }
} */
</style>
