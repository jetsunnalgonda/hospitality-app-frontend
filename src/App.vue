<template>
  <div id="app">
    <Sidebar />
    <router-view class="content" />
  </div>
</template>

<script>
import Sidebar from './views/Sidebar.vue';

export default {
  name: 'App',
  components: {
    Sidebar,
  },
};
</script>

<style>
/* #app {
  display: flex;
}

.content {
  margin-left: 250px;
  padding: 20px;
  background-color: #ecf0f1;
  height: 100vh;
  width: 100%; 
  overflow-y: auto; 
} */
</style>
