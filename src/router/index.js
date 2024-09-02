import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/Dashboard.vue';
import ScriptsView from '../views/Scripts.vue';
import ScheduleView from '../views/Schedule.vue';
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import ProfileView from '../views/Profile.vue';
import MessagesView from '../views/Messages.vue';
import ErrorView from '@/views/Error.vue';

const routes = [
  { path: '/', name: 'Home', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/scripts', name: 'Scripts', component: ScriptsView, meta: { requiresAuth: true } },
  { path: '/schedule', name: 'Schedule', component: ScheduleView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profle', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/messages', name: 'Messages', component: MessagesView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/error', name: 'Error', component: ErrorView },
  { path: '/:pathMatch(.*)*', redirect: '/error' }  // Redirect unrecognized paths to /error

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if token is stored
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next('/login');
  } else if (to.path === '/register' && isAuthenticated) {
    // Redirect to home or another page if user is already authenticated and trying to access register
    next('/'); // Redirect to home or any other page you prefer
  } else {
    next();
  }
});
export default router;
