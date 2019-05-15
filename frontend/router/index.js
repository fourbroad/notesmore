import Vue from 'vue'
import Router from 'vue-router'

import Login from 'login/login.vue'
import NotFound from 'errors/404'
import Forbidden from 'errors/403'
import workbench from 'workbench/workbench.vue'
import Home from 'workbench/home.vue'

Vue.use(Router)

// 初始路由
export default new Router({
  routes: [{
    path: '/login',
    component: Login
  }]
})

// 准备动态添加的路由
export const DynamicRoutes = [{
    path: '',
    component: workbench,
    name: 'workbench',
    redirect: 'home',
    meta: {
      requiresAuth: true,
      name: '首页'
    },
    children: [{
      path: 'home',
      component: Home,
      name: 'home',
      meta: {
        name: '首页',
        icon: 'icon-home'
      }
    }]
  },
  {
    path: '/403',
    component: Forbidden
  },
  {
    path: '*',
    component: NotFound
  }
]