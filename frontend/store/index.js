import client from 'api/client'

import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import getters from './getters'
import modules from './modules'
import actions from './actions'
import mutations from './mutations'

// let url = 'localhost:3000/domains';

Vue.use(Vuex)

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules
})

client.connect({url: store.state.acgUrl, token: store.state.token});
client.on('InvalidTokenError', ()=>{
  store.commit('CLEAR_TOKEN')
  window.location.reload() // 防止切换用户时时addRoutes重复添加路由导致出现警告
})

export default store;