// __webpack_public_path__ = myRuntimePublicPath;

import Vue from 'vue'
import App from 'components/app'
import store from 'store/index'
import router from 'router/index'
import dynamicRoutes from 'router/dynamic-router'

import VueI18n from 'vue-i18n'

require('core-js/features/object/define-property');
require('core-js/features/object/create');
require('core-js/features/object/assign');
require('core-js/features/array/for-each');
require('core-js/features/array/index-of');
require('core-js/features/function/bind');
require('core-js/features/promise');


// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

// import axios from './config/httpConfig'
// import * as globalFilter from './filters/filters'

// Vue.prototype.$http = axios

// Object.keys(globalFilter).forEach(key => {
//   Vue.filter(key, globalFilter[key])
// })

// Vue.use(ElementUI)

Vue.filter('formatSize', function (size) {
  if (size > 1024 * 1024 * 1024 * 1024) {
    return (size / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB'
  } else if (size > 1024 * 1024 * 1024) {
    return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  } else if (size > 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + ' MB'
  } else if (size > 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  }
  return size.toString() + ' B'
})

Vue.config.productionTip = false

Vue.use(VueI18n)

if (localStorage.getItem("environment") == "development") {
  import( /* webpackChunkName: "moment" */ 'moment').then(({default: moment}) => {
    window.moment = moment;
  });

  import( /* webpackChunkName: "jsonPatch" */ 'fast-json-patch').then(({default: jsonPatch}) => {
    window.jsonPatch = jsonPatch;
  });

  import( /* webpackChunkName: "elasticsearch" */ 'elasticsearch-browser').then(({default: elasticsearch}) => {
    window.esc = new elasticsearch.Client({
      host: 'localhost:9200',
      log: 'trace'
    });
  });
}

router.beforeEach((to, from, next) => {
  if (!store.state.token) {
    if (to.matched.length > 0 && !to.matched.some(record => record.meta.requiresAuth)) {
      next()
    } else {
      next({path: '/login'})
    }
  } else {
    if (!store.state.dynamicRoutes) {
      router.addRoutes(dynamicRoutes);
      store.state.dynamicRoutes = dynamicRoutes;
      next({path: to.path})
    } else {
      if (to.path !== '/login') {
        next()
      } else {
        next(from.fullPath)
      }
    }
  }
})

router.afterEach((to, from, next) => {
  // store.commit('permission/SET_CURRENT_MENU', to.name)
})

const i18n = new VueI18n({ locale: store.state.locale});

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: {
    App
  },
  template: '<App/>'
})