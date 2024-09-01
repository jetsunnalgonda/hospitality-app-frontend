import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/Dashboard.vue';
import ScriptsView from '../views/Scripts.vue';
import ScheduleView from '../views/Schedule.vue';
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import ErrorView from '@/views/Error.vue';

const routes = [
  { path: '/', name: 'Home', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/scripts', name: 'Scripts', component: ScriptsView, meta: { requiresAuth: true } },
  { path: '/schedule', name: 'Schedule', component: ScheduleView, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/error', name: 'Error', component: ErrorView },
  { path: '/:pathMatch(.*)*', redirect: '/error' }  // Redirect unrecognized paths to /error

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
