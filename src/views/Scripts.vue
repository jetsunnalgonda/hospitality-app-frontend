<template>
  <div class="scripts">
    <h1>Your Scripts</h1>
    
    <div class="script-list">
      <h2>Existing Scripts</h2>
      <ul>
        <li v-for="script in scripts" :key="script.id">
          <div class="script-title">{{ script.title }}</div>
          <div class="script-content">{{ script.content }}</div>
          <button @click="editScript(script)">Edit</button>
          <button @click="deleteScript(script.id)">Delete</button>
        </li>
      </ul>
    </div>

    <div class="script-form">
      <h2 v-if="currentScript.id">Edit Script</h2>
      <h2 v-else>Create New Script</h2>
      <form @submit.prevent="saveScript">
        <input v-model="currentScript.title" placeholder="Title" required />
        <textarea v-model="currentScript.content" placeholder="Content" required></textarea>
        <button type="submit">Save</button>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from '@/utils/apiClient'; // Adjust the path as needed

export default {
  name: 'ScriptsView',
  data() {
    return {
      scripts: [],
      currentScript: {
        id: null,
        title: '',
        content: '',
      },
    };
  },
  created() {
    this.fetchScripts();
  },
  methods: {
    async fetchScripts() {
      try {
        const response = await apiClient.get('/scripts');
        this.scripts = response.data;
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching scripts:', error);
      }
    },
    async saveScript() {
      try {
        if (this.currentScript.id) {
          // Update existing script
          await apiClient.put(`/scripts/${this.currentScript.id}`, this.currentScript);
        } else {
          // Create new script
          await apiClient.post('/scripts', this.currentScript);
        }
        this.resetForm();
        this.fetchScripts();
      } catch (error) {
        console.error('Error saving script:', error);
      }
    },
    editScript(script) {
      this.currentScript = { ...script };
    },
    async deleteScript(scriptId) {
      try {
        await apiClient.delete(`/scripts/${scriptId}`);
        this.fetchScripts();
      } catch (error) {
        console.error('Error deleting script:', error);
      }
    },
    resetForm() {
      this.currentScript = {
        id: null,
        title: '',
        content: '',
      };
    },
  },
};
</script>

<style scoped>
.scripts {
  padding: 20px;
}

.script-list ul {
  list-style-type: none;
  padding: 0;
}

.script-list li {
  margin-bottom: 10px;
}

.script-form {
  margin-top: 20px;
}

.script-title {
  font-weight: bold;
}

button {
  margin-left: 10px;
}
</style>
