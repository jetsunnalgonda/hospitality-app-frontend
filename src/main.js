import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import AsyncComputed from 'vue-async-computed'

import '@/assets/css/hospital-theme.css'; // Import the theme

// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library so you can use them in your components
library.add(fas);

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);
app.use(store);
app.use(AsyncComputed);

app.mount('#app');
