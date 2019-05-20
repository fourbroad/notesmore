import Vue from 'vue'
import Router from 'vue-router'

import Login from 'login/login.vue'
import NotFound from 'errors/404'
import Forbidden from 'errors/403'
import workbench from 'workbench/workbench.vue'
import Home from 'workbench/home.vue'

const dashboard = () => import('dashboard/dashboard.vue')

Vue.use(Router)

// 初始路由
export default new Router({
  routes: [{
    path: '/login',
    component: Login
  }]
})
