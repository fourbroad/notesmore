import Vue from 'vue'
import Router from 'vue-router'

import Login from 'components/login'

Vue.use(Router)

// 初始路由
export default new Router({
  routes: [{
    path: '/login',
    component: Login
  }]
})
