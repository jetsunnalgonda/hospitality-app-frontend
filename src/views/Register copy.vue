<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" v-model="form.username" id="username" />
        <small class="optional-text">Optional</small>
      </div>
      <div class="form-group">
        <label for="name">Name: <span class="required">*</span></label>
        <input type="text" v-model="form.name" id="name" required />
      </div>
      <div class="form-group">
        <label for="email">Email: <span class="required">*</span></label>
        <input type="email" v-model="form.email" id="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password: <span class="required">*</span></label>
        <input type="password" v-model="form.password" id="password" required />
      </div>
      <div class="form-group">
        <label for="passwordConfirmation">Confirm Password: <span class="required">*</span></label>
        <input type="password" v-model="passwordConfirmation" id="passwordConfirmation" required />
      </div>
      <div class="form-group">
        <label for="role">Role: <span class="required">*</span></label>
        <select v-model="form.role" id="role" required>
          <option value="" disabled>Select Role</option>
          <option value="coordinator">Coordinator</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div class="form-group">
        <label for="avatars">Picture:</label>
        <input type="file" id="avatars" multiple @change="handleFileUpload" />
        <small class="optional-text">Optional</small>
      </div>
      <button type="submit">Register</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
    <div class="login-link">
      <p>Already have an account? <a @click="goToLogin">Login here</a></p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        username: '', // Optional
        name: '',    // Required
        email: '',   // Required
        password: '',// Required
        role: '',    // Required
      },
      passwordConfirmation: '',
      avatarFiles: [], // Store the uploaded files
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      errorMessage: '', // To store and display error messages
    };
  },
  methods: {
    handleFileUpload(event) {
      this.avatarFiles = Array.from(event.target.files);
    },
    async register() {
      if (this.form.password !== this.passwordConfirmation) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      try {
        const formData = new FormData();
        formData.append('username', this.form.username || ''); // Optional
        formData.append('name', this.form.name); // Required
        formData.append('email', this.form.email); // Required
        formData.append('password', this.form.password); // Required
        formData.append('role', this.form.role); // Required

        this.avatarFiles.forEach(file => {
          formData.append('avatars', file);
        });

        await axios.post(`${this.apiBaseUrl}/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        this.$router.push('/login');
      } catch (error) {
        console.error('Registration failed', error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Add styles for error messages */
a {
  cursor: pointer;
}
.error-message {
  color: red;
  margin-top: 10px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

/* Buttons */
button {
  width: 100%;
  padding: 10px 15px;
  background-color: #5da6f0;
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

button:hover {
  background-color: #3b5fc2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  font-size: 0.9em;
  color: #333;
}

.login-link a {
  color: #5da6f0;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

/* Optional Text */
.optional-text {
  font-size: 0.8em;
  color: #666;
}

/* Required Asterisk */
.required {
  color: red;
  font-size: 1.1em;
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .register-container {
    padding: 15px;
  }

  button {
    padding: 8px 12px;
    font-size: 0.85em;
  }

  input[type="text"],
  input[type="password"],
  input[type="email"],
  textarea,
  input[type="file"] {
    padding: 8px 12px;
  }
}
</style>