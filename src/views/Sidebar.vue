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
      <img src="default-avatar.jpg" alt="Profile Picture" />
      <div class="profile-name">John Doe</div>
    </div>
    <font-awesome-icon v-if="isCollapsed" icon="user-circle" class="profile-icon" />

    <ul class="nav-links">
      <li><router-link to="/scripts"><font-awesome-icon icon="file-alt" class="icon" /> <span v-if="!isCollapsed">Scripts</span></router-link></li>
      <li><router-link to="/schedule"><font-awesome-icon icon="calendar-alt" class="icon" /> <span v-if="!isCollapsed">Schedule</span></router-link></li>
      <li><router-link to="/tasks"><font-awesome-icon icon="tasks" class="icon" /> <span v-if="!isCollapsed">Tasks</span></router-link></li>
      <li><router-link to="/appointments"><font-awesome-icon icon="calendar-check" class="icon" /> <span v-if="!isCollapsed">Appointments</span></router-link></li>
      <li><router-link to="/logout"><font-awesome-icon icon="sign-out-alt" class="icon" /> <span v-if="!isCollapsed">Logout</span></router-link></li>
    </ul>

  </div>
</template>

<script>
export default {
  name: 'SidebarView',
  data() {
    return {
      isCollapsed: false, // Track whether the sidebar is collapsed
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
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
