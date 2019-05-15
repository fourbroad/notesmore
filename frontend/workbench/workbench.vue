<template>
  <div class="workbench">
    <div class="sidebar">
      <div class="sidebar-inner">
        <div class="sidebar-logo p-0">
          <div class="peers ai-c fxw-nw">
            <div class="peer peer-greed">
              <div class="peers ai-c fxw-nw">
                <div class="logo">
                  <div class="container h-100">
                    <div class="row h-100 align-items-center justify-content-center">
                      <div class="col align-items-center">
                        <img
                          class="mt-1"
                          width="40px"
                          height="40px"
                          src="images/logo.png"
                          alt="Logo"
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="logo-text">
                  <div class="container d-flex h-100">
                    <div class="row justify-content-center align-self-center">
                      <div>
                        <h4 class="workbench-title mb-0"></h4>
                        <small class="slogan"></small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="peer">
              <div class="mobile-toggle sidebar-toggle">
                <a href class="td-n">
                  <i class="fa fa-arrow-circle-o-left"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <ul class="sidebar-menu scrollable pT-30 pos-r">
          <li class="favorites nav-item dropdown">
            <a class="dropdown-toggle sidebar-link document">
              <span class="icon-holder">
                <i class="c-red-500 fa fa-star-o"></i>
              </span>
              <span class="title">Favorites</span>
              <span class="badge badge-pill badge-info mT-10"></span>
              <span class="arrow">
                <i class="fa fa-angle-right"></i>
              </span>
            </a>
            <ul class="favorite-item-container dropdown-menu"></ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="page-container">
      <div class="header navbar">
        <div class="header-container">
          <ul class="nav-left">
            <li>
              <a id="sidebar-toggle" class="sidebar-toggle">
                <i class="fa fa-bars"></i>
              </a>
            </li>
            <li class="new-document">
              <a>
                <i class="fa fa-file-o"></i>
              </a>
            </li>
            <li class="search-box">
              <a class="search-toggle">
                <i class="search-icon fa fa-search"></i>
              </a>
            </li>
          </ul>
          <ul class="nav-right mr-3">
            <li>
              <a
                class="dropdown-toggle no-after peers fxw-nw ai-c lh-1 pr-1"
                data-toggle="dropdown"
              >
                <div class="peer mR-10">
                  <img
                    class="avatar w-2r bdrs-50p"
                    width="32px"
                    height="32px"
                    src="./images/run.png"
                    alt
                  >
                </div>
                <div class="peer">
                  <span class="nickname fsz-sm">Please sign-in</span>
                </div>
              </a>
              <ul class="profile-menu dropdown-menu fsz-sm">
                <li class="profile">
                  <a href="javascript:void(0)" class="d-b td-n pY-5 text-dark">
                    <i class="fa fa-user-circle-o mR-10"></i>
                    <span class="label">Profile</span>
                  </a>
                </li>
                <li role="separator" class="divider"></li>
                <li class="sign-off">
                  <a href="javascript:void(0)" class="d-b td-n pY-5 text-dark">
                    <i class="fa fa-power-off mR-10"></i>
                    <span class="label">Logout</span>
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
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import $ from 'jquery';
import _ from 'lodash';
import Loader from 'core/loader';
import jsonPatch from "fast-json-patch";
import workbenchHtml from './workbench.html';

import PerfectScrollbar from 'perfect-scrollbar';

import 'bootstrap';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'notification/notification';

export default {
  data() {
    return {};
  },
  computed: {},
  components: {}
};
</script>

<style src="./workbench.scss" lang="scss" scoped>
</style>