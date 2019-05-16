<template>
  <div class="content" id="content">
    <div class="body login-width">
      <div class="model model-1" data-model="model-1">
        <div class="logo">
          <div class="logo-img">
            <img src="/assets/images/logo-hui.png" alt>
          </div>
          <h4 class="logo-big-text">Notesmore</h4>
        </div>
        <div class="title">登录</div>
        <div class="row user-name">
          <div class="input-box">
            <input
              class
              type="text"
              id="username"
              name="username"
              placeholder="请输入手机号码或邮箱地址"
              v-model.trim="username"
            >
          </div>
          <p class="error">请输入正确的手机号码或邮箱地址</p>
        </div>
        <div class="row password">
          <div class="input-box">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="请输入密码"
              v-model.trim="password"
              @keyup.enter="login"
            >
          </div>
          <p class="error">密码错误</p>
        </div>
        <div class="row submit">
          <button type="button" class="btn btn-block submit-btn" @click="login">登录</button>
        </div>
      </div>
    </div>
    <p class="copy">&copy;2011-2019 深圳市Notesmore技术有限公司 版权所有 | 粤ICP备14027470号-1</p>
  </div>
</template>

<script>
import client from "lib/client";

import validate from "validate.js";
import _ from "lodash";

import 'particles.js';

const particles_config = require('./particles_config.json');

export default {
  data() {
    return {
      username: "",
      password: ""
    };
  },
  mounted: function(){
    particlesJS('content', particles_config);
  },
  methods: {
    async login() {
      let _this = this;
      client.login(this.username, this.password, (err, user) => {
        _this.$store.commit("LOGIN_IN", client.getToken());
        _this.$router.replace("/");
      });
    }
  }
};
</script>

<style scoped lang="scss">
.content {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(./images/bg.jpg) no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
  user-select: none;

  canvas {
    position: fixed;
    z-index: -1;
  }
}

.body {
  background: #ffffff;
  border-radius: 3px;
  font-size: 14px;
  color: #71818e;

  &.login-width {
    width: 432px;
  }

  .logo {
    display: flex;
    height: 23px;
    margin: 10px 15px;
    color: #333f49;

    .logo-img {
      width: 23px;
      min-width: 23px;
      height: 100%;
      overflow: hidden;

      img {
        height: 100%;
        max-height: 100%;
        width: 100%;
        max-width: 100%;
      }
    }

    .logo-big-text {
      margin-bottom: 0px;
      margin-top: 3px;
      padding-left: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 19px;
      line-height: 19px;
    }
  }

  .title {
    margin: 23px 40px 36px;
    text-align: center;
    font-size: 26px;
    font-weight: bold;
    color: #333f49;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row {
    margin: 0px 40px;

    input {
      font-size: 14px;
      color: #474e53;
      border: none;
      outline: none;
      font-weight: bold;
      flex: 1;

      &::placeholder {
        font-size: 14px;
        color: #9fadb9;
        font-weight: normal;
      }
    }

    input:-webkit-autofill {
      box-shadow: 0px 0px 0px 1000px white inset;
    }

    &.help {
      justify-content: space-between;

      p {
        margin-bottom: 0px;
        margin-top: 10px;
        cursor: pointer;
        text-align: left;
        width: auto;
        height: 26px;
        line-height: 28px;
      }

      &.mar-bottom {
        margin-bottom: 55px;
      }
    }

    &.verify-code span {
      color: #ff9c00;
      cursor: pointer;
      padding-left: 15px;

      &.disabled {
        color: #9fadb9;
        cursor: default;
      }
    }

    .input-box {
      display: flex;
      width: 100%;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebebeb;
    }

    .error {
      margin: 0px;
      min-height: 26px;
      width: 100%;
      color: #df0000;
      font-weight: 600;
      line-height: 18px;
      padding-top: 5px;
      padding-bottom: 3px;
      visibility: hidden;
      text-align: left;

      &.show {
        visibility: visible;
      }
    }

    &.submit {
      padding-top: 4px;
      padding-bottom: 75px;

      .submit-btn {
        font-size: 1rem;
        color: #fff;
        background: #333f49;
        box-shadow: none;
      }
    }
  }

  .footer {
    height: 55px;
    margin-top: 45px;
    background: #f6f6f6;
    border-top: 1px solid #ebebeb;
    border-radius: 0px 0px 3px 3px;
    text-align: center;

    p {
      height: 55px;
      line-height: 55px;
      font-size: 1rem;
      color: #3e4e47;

      a {
        color: #ff9c00;
      }
    }
  }

  .model-2 {
    display: none;
  }

  .model-0 {
    display: flex;
    padding: 0px 30px;

    .photo {
      align-self: center;

      img {
        width: 95px;
        height: 95px;
        border-radius: 50%;
      }

      .nickname {
        margin: 0px;
        text-align: center;
        font-weight: bold;
        color: #333538;
        width: 95px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .row {
      width: 300px;
      margin: 0px;
      margin-left: 30px;

      &.help {
        margin-bottom: 36px;

        .toggle {
          margin-top: 4px;
        }
      }
    }

    .right {
      margin-top: 48px;
    }
  }
}

.copy {
  position: fixed;
  bottom: 0px;
  color: #fff;
}
</style>
