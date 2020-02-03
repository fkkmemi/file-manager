import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Sign.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('./views/Main.vue')
    },
    {
      path: '/MySQL',
      name: 'MySQL',
      component: () => import('./views/MySQL.vue')
    }
  ]
})
