<template>
  <div class="login-container loading-overlay-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="form.email" id="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" v-model="form.password" id="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <div class="register-link">
      <p>Don't have an account? <a @click="goToRegister">Register here</a></p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import LoadingOverlay from '../utils/LoadingOverlay';
import '../utils/LoadingOverlay.css';

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
    };
  },
  methods: {
    showOverlay() {
      if (this.loadingOverlay) {
        this.loadingOverlay.close(); // Close any existing instance
      }
      this.loadingOverlay = new LoadingOverlay({
        text: 'Logging in...',
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
    async handleLogin() {
      this.isLoading = true;
      this.showOverlay();

      console.log('Form data before dispatch:', this.form);

      try {
        const result = await this.login(this.form);
        if (result.success) {
          this.$router.push('/'); // Redirect to home or another protected route
        } else {
          this.errorMessage = result.message;
        }
      } catch (error) {
        this.errorMessage = 'An error occurred during login.';
      } finally {
        this.isLoading = false;
        this.hideOverlay();
      }

    },
    goToRegister() {
      this.$router.push('/register');
    },
    ...mapActions('auth', ['login']),

  },
};
</script>

<style scoped>
.disabled {
  pointer-events: none;
}
.error-message {
  color: red;
}
/* Form Container */
.login-container {
  max-width: 400px;
  margin: 0px auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-size: 0.9em;
  color: #333;
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

/* Inputs */
input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 10px 15px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #b0c8e4;
  border-radius: 8px;
  background-color: #fff;
  color: #333;
  font-size: 0.9em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus {
  outline: none;
  border-color: #5da6f0;
  box-shadow: 0 0 5px rgba(93, 166, 240, 0.5);
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

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link p {
  font-size: 0.9em;
  color: #333;
}

.register-link a {
  color: #5da6f0;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .login-container {
    padding: 15px;
  }

  button {
    padding: 8px 12px;
    font-size: 0.85em;
  }

  input[type="text"],
  input[type="password"],
  input[type="email"] {
    padding: 8px 12px;
  }
}
</style>
