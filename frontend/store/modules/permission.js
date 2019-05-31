
import client from 'api/client'

// import { fetchPermission } from '@/api/permission'
import router, { DynamicRoutes } from 'router/index'
import { recursionRouter, setDefaultRoute } from 'utils/recursion-router'
import dynamicRouter from 'router/dynamic-router'

const { Action } = client;

export default {
  namespaced: true,
  state: {
    permissionList: null /** 所有路由 */ ,
    sidebarMenu: [] /** 导航菜单 */ ,
    currentMenu: '' /** 当前active导航菜单 */
  },
  getters: {},
  mutations: {
    SET_PERMISSION(state, routes) {
      state.permissionList = routes
    },
    CLEAR_PERMISSION(state) {
      state.permissionList = null
    },
    SET_MENU(state, menu) {
      state.sidebarMenu = menu
    },
    CLEAR_MENU(state) {
      state.sidebarMenu = []
    },
    SET_CURRENT_MENU(state, currentMenu) {
      state.currentMenu = currentMenu
    }
  },
  actions: {
    async FETCH_PERMISSION({state, commit, rootState}) {
      let routes = dynamicRouter;
      // setDefaultRoute([routes.find(v => v.path === '')])

      let initialRoutes = router.options.routes
      router.addRoutes(routes)
      commit('SET_PERMISSION', [...initialRoutes, ...routes])
    }
  }
}