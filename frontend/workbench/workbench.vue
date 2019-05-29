<template>
  <div class="workbench" :class="{'is-collapsed':isSidebarNavCollapse}">
    <div class="loading" v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <NewDialog :opened.sync="openNewDialog"></NewDialog>
    <div class="sidebar" v-if="page">
      <div class="sidebar-inner">
        <div class="sidebar-logo p-0">
          <div class="peers ai-c fxw-nw">
            <div class="peer peer-greed">
              <div class="peers ai-c fxw-nw">
                <div class="logo">
                  <div class="container h-100">
                    <div class="row h-100 align-items-center justify-content-center">
                      <div class="col align-items-center">
                        <img class="mt-1" width="40px" height="40px" src="./images/logo.png" alt="Logo">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="logo-text">
                  <div class="container d-flex h-100">
                    <div class="row justify-content-center align-self-center">
                      <div>
                        <h4 class="workbench-title mb-0">{{localePage.title}}</h4>
                        <small class="slogan">{{localePage.slogan}}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="peer">
              <div class="mobile-toggle sidebar-toggle" @click.prevent="toggleNavCollapse">
                <a href class="td-n">
                  <i class="fa fa-arrow-circle-o-left"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <ul class="sidebar-menu scrollable pT-30 pos-r">
          <li class="nav-item" v-for="item in sidebarItems" :key="item.id" @click="$router.push(`/${item.collectionId}/${item.id}`)">
            <a class="sidebar-link document">
              <span class="icon-holder">
                <i :class="[item.iconClass, item.iconColor]"></i>
              </span>
              <span class="title">{{item.title}}</span>
            </a>
          </li>
          <li class="favorites nav-item dropdown" :class="{open:favoritesOpened}">
            <a class="dropdown-toggle sidebar-link document" @click="favoritesOpened = !favoritesOpened">
              <span class="icon-holder">
                <i class="c-red-500 fa fa-star-o"></i>
              </span>
              <span class="title">{{localePage.favorites.title}}</span>
              <span class="badge badge-pill badge-info mT-10">{{(localeFavorites && localeFavorites.length)||0}}</span>
              <span class="arrow">
                <i class="fa fa-angle-right"></i>
              </span>
            </a>
            <ul class="favorite-item-container dropdown-menu">
              <li class="nav-item" v-for="favorite in localeFavorites" :key="favorite.id" @click="$router.push(`/${favorite.collectionId}/${favorite.id}`)">
                <a class="sidebar-link document">
                  <span class="icon-holder">
                    <i :class="[favorite._meta.iconClass||'fa fa-file-text-o']"></i>
                  </span>
                  <span class="title">{{favorite.title}}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="page-container" v-if="page">
      <div class="header navbar">
        <div class="header-container">
          <ul class="nav-left">
            <li>
              <a id="sidebar-toggle" class="sidebar-toggle" @click="toggleNavCollapse">
                <i class="fa fa-bars"></i>
              </a>
            </li>
            <li class="new-document" @click="openNewDialog = !openNewDialog">
              <a>
                <i class="fa fa-file-o"></i>
              </a>
            </li>
            <li class="search-box" @click="$router.push('/.views/.searchDocuments')">
              <a class="search-toggle">
                <i class="search-icon fa fa-search"></i>
              </a>
            </li>
          </ul>
          <ul class="nav-right mr-3">
            <li is="notification"></li>
            <li>
              <a class="dropdown-toggle no-after peers fxw-nw ai-c lh-1 pr-1" data-toggle="dropdown">
                <div class="peer mR-10">
                  <img class="avatar w-2r bdrs-50p" width="32px" height="32px" src="./images/run.png" alt>
                </div>
                <div class="peer">
                  <span class="nickname fsz-sm">{{nickname}}</span>
                </div>
              </a>
              <ul class="profile-menu dropdown-menu fsz-sm">
                <li class="profile">
                  <a href="javascript:void(0)" class="d-b td-n pY-5 text-dark" @click="$router.push(`/.profiles/${profile.id}`)">
                    <i class="fa fa-user-circle-o mR-10"></i>
                    <span class="label">{{$t('profile')}}</span>
                  </a>
                </li>
                <li role="separator" class="divider"></li>
                <li class="sign-off" @click="loginOut">
                  <a href="javascript:void(0)" class="d-b td-n pY-5 text-dark">
                    <i class="fa fa-power-off mR-10"></i>
                    <span class="label">{{$t('logout')}}</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <main class="main bgc-grey-100">
        <div class="main-container pos-r">
          <div id="mainContent">
            <router-view></router-view>
          </div>
          <footer class="bdT ta-c p-30 lh-0 fsz-sm c-grey-600">
            <span>Copyright © 2019 XGS Corporation, All Rights Reserved.</span>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters} from "vuex"

import NewDialog from "new-dialog/new-dialog.vue";

import _ from "lodash"
import jsonPatch from "fast-json-patch"

import "perfect-scrollbar/css/perfect-scrollbar.css"
import PerfectScrollbar from "perfect-scrollbar"

import notification from "notification/notification.vue"

export default {
  data() {
    return {
      loading: false,
      error: null,
      page: null,
      sidebarItems: [],
      openNewDialog: false
    };
  },
  i18n: {
    messages: {
      en: {
        pleaseSignIn:"Please sign-in",
        profile: "Profile",
        logout: "Logout"
      },
      cn: {
        pleaseSignIn:"请登录",
        profile: "设置",
        logout: "退出登录"
      }
    }
  },  
  created() {
    this.fetchData();
  },
  computed: {
    nickname(){
      return this.localeCurrentUser ? (this.localeCurrentUser.title || this.localeCurrentUser.id) : this.$t('pleaseSignIn');
    },
    localePage(){
      return this.page.get(this.locale);
    },
    favoritesOpened:{
      get(){
        return this.$store.state.favoritesOpened;
      },
      set(opened){
        this.$store.commit('SET_FAVORITESOPENED', opened);
      }
    },
    ...mapState([
      "isSidebarNavCollapse",
      "currentDomainId",
      "locale",
      "profile"
    ]),
    ...mapGetters([
      "localeFavorites",
      "localeCurrentUser"
    ])
  },
  methods: {
    toggleNavCollapse() {
      this.$store.commit("toggleNavCollapse");
    },
    loginOut() {
      this.$store.commit("LOGIN_OUT");
      window.location.reload(); // 防止切换用户时时addRoutes重复添加路由导致出现警告
    },
    getSidebarItems(items) {
      let { Domain } = this.$client
      Domain.mgetDocuments(this.currentDomainId, items, (err, docs) => {
        if (err) return (this.error = err.toString);
        
        let sidebarItems = []
        _.each(docs, doc => {
          let item
          doc = doc.get(this.locale)
          item = _.filter(items, function(i) {
            return i.collectionId == doc.collectionId && i.id == doc.id;
          })
          sidebarItems.push(
            _.merge(item[0], {
              iconClass: doc._meta.iconClass || "fa fa-file-text-o",
              title: doc.title
            })
          )
        })
        this.sidebarItems = sidebarItems
      });
    },
    fetchData() {
      let {Domain, Page, Profile, currentUser} = this.$client
      this.error = this.post = null;
      this.loading = true;
      Page.get(this.currentDomainId, ".workbench", (err, page) => {
        this.loading = false;
        if (err) return this.error = err.toString();
        this.page = page;
        this.getSidebarItems(page.sidebarItems);
      });
      this.$store.dispatch('FETCH_FAVORITES');
    }
  },
  components: {
    notification, NewDialog
  }
};
</script>

<style lang="scss">
// <style lang="scss" scoped>
@import "assets/scss/settings/index";
@import "assets/scss/tools/mixins/index";

@import "scss/sidebar";
@import "scss/topbar";
@import "scss/pageContainer";
@import "scss/footer";
</style>