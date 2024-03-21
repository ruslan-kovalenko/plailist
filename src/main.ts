import './assets/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  mode: 'history',
  history: createWebHistory(),
  routes: [],
})

createApp(App).use(router).mount('#app')