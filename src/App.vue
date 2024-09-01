<template>
  <div id="app">
    <Sidebar v-if="isAuthenticated" />
    <!-- <router-view :class="['content', { 'content-centered': !isAuthenticated }]" /> -->
    <router-view :class="['content', { 'content-centered': !isAuthenticated }]" />
</div>
</template>

<script>
import Sidebar from './views/Sidebar.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  components: {
    Sidebar,
  },
  computed: {
    ...mapGetters(['isAuthenticated']), // Map Vuex getters to computed properties
  },
};
</script>

<style>
/* Base styles for the content area */
.content {
  padding: 20px;
  background-color: #ecf0f1;
  height: 100vh;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

/* Margin-left for content when the sidebar is shown */
.content {
  margin-left: 200px; /* This matches the sidebar width */
}

/* Centered content when not authenticated (sidebar not shown) */
.content-centered {
  margin-left: 0;
  margin-right: auto;
  margin-left: auto;
  max-width: 800px; /* Optional: max width to better control centering */
}
</style>
