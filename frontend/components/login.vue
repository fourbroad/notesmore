<template>
  <div class="content" id="login">
    <div class="body login-width">
      <div class="model model-1" data-model="model-1">
        <div class="logo">
          <div class="logo-img">
            <img src="assets/images/logo-hui.png" alt>
          </div>
          <h4 class="logo-big-text">协同</h4>
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
              @change="verifyData"
            >
          </div>
          <p class="error" :class="{show:validate.username.isShow}">{{validate.username.errorText}}</p>
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
              @change="verifyData"
            >
          </div>
          <p class="error" :class="{show:this.validate.password.isShow}">{{this.validate.password.errorText}}</p>
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
import particles_config from "./particles_config.json";
import client from "api/client";
import validatejs from "validate.js";
import "particles.js";

export default {
  data() {
    return {
      username: "",
      password: "",
      logging:false,  
      validate:{
        username:{
          isShow:false,
          errorText:''
        },
        password:{
          isShow:false,
          errorText:''
        }
      },
      constraints: {
        username: {
          presence: {
            allowEmpty:false,
            message: "请输入手机号码或邮箱地址"
          },
          // format: {
          //   pattern: /(1\d{10})|(\w+@\w+\.\w{2,3})/,
          //   message: "请输入正确的手机号码或邮箱地址"
          // }
        },
        password: {
          presence: {
            allowEmpty:false,
            message: "请输入登录密码"
          },
          // format: {
          //   pattern: /.{8,}/,
          //   message: "密码错误"
          // }
        }
      }
    };
  },
  mounted: function() {
    particlesJS("login", particles_config);
  },
  methods: {
    async login() {
      let _this = this,error;
      if(this.logging) return false;
      error = validatejs({username:this.username,password:this.password},this.constraints);
      if (error) {
        this.showError('username',validatejs.single(this.username, this.constraints.username));
        this.showError('password',validatejs.single(this.password, this.constraints.password));
        return false;
      }
      this.logging = true;
      client.login(this.username, this.password, (err, user) => {
        this.logging = false;
        if (err) {
          console.error(err);
          _this.showError('password',[err]);
          return false;
        }
        _this.$store.commit("LOGIN_IN", client.getToken());
        _this.$router.replace("/");
      });
    },

    verifyData(e) {
      let name = e.target.name,error;
      error = validatejs.single(this[name], this.constraints[name]);
      this.showError(name,error);
    },
    
    showError(name,error = []) {
      this.validate[name].errorText = error[0] || '';
      this.validate[name].isShow = !!error[0];
    }
  }
};
</script>

<style lang="scss" scoped>
#login {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url(../assets/images/bg.jpg) no-repeat;
  background-size: cover;
  width: 100%;
  height: 100%;
  user-select: none;

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
  }

  .copy {
    position: fixed;
    bottom: 0px;
    color: #fff;
  }
}
</style>
<style>
#login .particles-js-canvas-el {
  position: fixed;
  z-index: -1;
}
</style>

