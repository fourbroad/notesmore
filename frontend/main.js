import Vue from 'vue'
import App from './app'
import store from 'store/index'
import router from 'router/index'
import VueI18n from 'vue-i18n'
import client from 'lib/client'

// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

// import './styles/index.scss'

// import axios from './config/httpConfig'
// import * as globalFilter from './filters/filters'

// Vue.prototype.$http = axios

// Object.keys(globalFilter).forEach(key => {
//   Vue.filter(key, globalFilter[key])
// })

// Vue.use(ElementUI)

Vue.config.productionTip = false

let domain = document.domain,
  currentDomain, index, url;
index = domain.indexOf('.notesmore.com');
if (index >= 0) {
  currentDomain = domain.slice(0, index);
}

index = domain.indexOf('.notesmore.cn');
if (index >= 0) {
  currentDomain = domain.slice(0, index);
}

if (!currentDomain || currentDomain == 'www') {
  currentDomain = localStorage.getItem("currentDomain") || '.root';
}

if (localStorage.getItem("environment") == "development") {
  url = 'localhost:3000/domains';

  import( /* webpackChunkName: "moment" */ 'moment').then(({
    default: moment
  }) => {
    window.moment = moment;
  });

  import( /* webpackChunkName: "jsonPatch" */ 'fast-json-patch').then(({
    default: jsonPatch
  }) => {
    window.jsonPatch = jsonPatch;
  });

  import( /* webpackChunkName: "elasticsearch" */ 'elasticsearch-browser').then(({
    default: elasticsearch
  }) => {
    window.esc = new elasticsearch.Client({
      host: 'localhost:9200',
      log: 'trace'
    });
  });
} else {
  url = 'https://notesmore.com/domains';
}

store.state.currentDomainId = currentDomain;

router.beforeEach((to, from, next) => {
  if (!store.state.token) {
    if (
      to.matched.length > 0 &&
      !to.matched.some(record => record.meta.requiresAuth)
    ) {
      next()
    } else {
      next({
        path: '/login'
      })
    }
  } else {
    function doNext() {
      if (!store.state.permission.permissionList) {
        store.dispatch('permission/FETCH_PERMISSION').then(() => {
          next({
            path: to.path
          })
        })
      } else {
        if (to.path !== '/login') {
          next()
        } else {
          next(from.fullPath)
        }
      }
    }

    if (client.isConnected()) {
      doNext();
    } else {
      client.connect(store.state.token, (err, user) => {
        if (err) {
          console.err(err);
          next({
            path: '/login'
          })
        } else {
          doNext();
        }
      });
    }
  }
})

router.afterEach((to, from, next) => {
  var routerList = to.matched
  store.commit('setCrumbList', routerList)
  store.commit('permission/SET_CURRENT_MENU', to.name)
})

Vue.use(client)
Vue.use(VueI18n)

const i18n = new VueI18n({ locale: 'cn'});

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