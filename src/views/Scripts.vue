<template>
    <div class="scripts">
      <h1>Available Scripts</h1>
      <!-- Dynamically load scripts from backend -->
    </div>
  </template>
  
  <script>
  export default {
    name: 'ScriptsView',
    data() {
      return {
        scripts: [], // Scripts will be fetched from the backend
      };
    },
    mounted() {
      // Fetch scripts from backend
    },
  };
  </script>
  
  <style scoped>
  /* .scripts {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  } */
  </style>
  