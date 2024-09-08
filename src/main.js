import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import AsyncComputed from 'vue-async-computed'

import '@/assets/css/hospital-theme.css'; // Import the theme
import '@/assets/css/messages-jetsun.css';

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

app.directive('click-outside', {
    beforeMount(el, binding) {
        el.clickOutsideEvent = function (event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
});

app.mount('#app');
