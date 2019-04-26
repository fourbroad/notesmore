import validate from "validate.js";

var client = require('../../lib/client')();

import fphtml from './forgit-password.html';
import './forgit-password.scss';

$.widget("nm.forgitPassword", {
  options: {
    maxSMSCount: 5,//获取最大验证码次数
    waitSMSTime: 60,//每次获取验证码后等待时长
    hour: 24,//短信次数用完后等待的小时数
    constraints: {
      'model-1': {
        username: {
          presence: { message: '请输入手机号码或邮箱地址' },
          format: {
            pattern: /(\w+@\w+\.\w{2,3})|(1\d{10})/,
            message: "请输入正确的手机号码或邮箱地址"
          }
        },
        random: {
          presence: { message: '请输入验证码' },
          format: {
            pattern: /.{4}/,
            message: "验证码错误"
          }
        }
      },
      'model-2': {
        code: {
          presence: { message: '请输入验证码' },
          format: {
            pattern: /\d{6}/,
            message: "验证码错误"
          }
        }
      },
      'model-3': {
        'password': {
          presence: { message: '请输入登录密码' },
          format: {
            pattern: /.{8,}/,
            message: "密码格式错误"
          }
        },
        'againpassword': {
          presence: { message: '请输入登录密码' }
        }
      }
    }
  },

  _create() {
    this._addClass('nm-forgit-password');
    this.element.html(fphtml);

    this.$input = $('input', this.element);
    this.$verifyCode = $('.verify-code', this.element);
    this.$username = $('.username', this.element);
    this.$password = $('.first-password', this.element);
    this.$againPassword = $('.again-password', this.element);

    this.interval = null;
    this.verifyCodeText = null;

    this._getverifyCode();

    //输入完后校验数据
    this._on(this.$input, {
      'change': function (e) {
        let $target = $(e.currentTarget)
          , error = this._verifyData($target) || {}
          , name = $target.attr('name'), temp, val;

        this._showError($target, error[name]);

        if (name == 'againpassword') {
          if (this.$password.val().trim() != this.$againPassword.val().trim()) {
            this._showError($target, ['两次输入的密码不一致']);
          } else {
            this._showError($target, ['']);
          }
        }
      },
      'keyup':function(e){
        if (e.keyCode == 13) {
          this._submit(e);
        }
      }
    });

    //返回登录
    this._on(this.element.find('.help a'), {
      'click': function () {
        runtime.option({ uriAnchor: { col: '.pages', doc: '.login' }, override: false });
      }
    })

    //返回修改
    this._on(this.element.find('.model-2 .edit'), {
      click: function () {
        if (this.interval) {
          clearInterval(this.interval);
          this.element.find('.verify-code span').removeClass('disabled ui-state-disabled').text(this.verifyCodeText);
        }
        this.element.find('.model-2').hide().prev().show()
      }
    })

    //下一步
    this._on(this.element.find('.submit-btn'), { 'click': this._submit });
  },

  _destroy() {
    this.element.removeClass("nm-forgit-password");
  },

  _submit(e) {
    let $target = $(e.currentTarget)
      , $model = $target.parents('.model')
      , error = this._verifyData($target)
      , self = this
      , inputData, name, temp;

    if (error) {
      $model.find('input').each(function (i, v) {
        let $v = $(v);
        self._showError($v, error[$v.attr('name')]);
      });
      return false;
    }

    name = $model.data('model');

    switch (name) {
      case 'model-1':
        inputData = validate.collectFormValues($model, { trim: true });
        console.log('model-1', inputData);
        temp = ['验证码已发送至你的注册手机', '请输入6位短信验证码', '获取短信验证码'];
        if (/\w+@\w+\.\w{2,3}/.test(inputData['username'])) {
          temp[0] = '验证码已发送至你的注册邮箱';
          temp[1] = '请输入6位邮箱验证码';
          temp[2] = '获取邮箱验证码';
        }
        this.verifyCodeText = temp[2];
        this.$username.text(inputData['username']);
        $model.hide().next().show()
          .find('.title p').text(temp[0]).end()
          .find('.verify-code input').attr('placeholder', temp[1])
          .siblings('span').text(temp[2]).click();
        break;
      case 'model-2':
        inputData = validate.collectFormValues($model, { trim: true });
        console.log('model-2', inputData);
        $model.hide().next().show();
        break;
      case 'model-3':
        inputData = validate.collectFormValues($model, { trim: true });
        console.log('提交密码', inputData);
        if (this.$password.val().trim() != this.$againPassword.val().trim()) {
          this._showError($target, ['两次输入的密码不一致']);
          return false;
        } else {
          this._showError($target, ['']);
        }
        $model.hide().next().show();
        break;
      case 'model-4':
        runtime.option({ uriAnchor: { col: '.pages', doc: '.login' }, override: false });
        break;
      default:
        break;
    }
  },


  /**
   * 获取验证码
   *
   */
  _getverifyCode() {
    this._on(this.$verifyCode, {
      'click span': function (e) {
        let $target = $(e.currentTarget)
          , waitSMSTime = this.options.waitSMSTime
          , maxSMSCount = this.options.maxSMSCount
          , hour = this.options.hour
          , phoneVal = this.$username.text().trim()
          , countObj = JSON.parse(localStorage.getItem('getSMSCount') || '{}')
          , count, temp;

        //恢复24小时后的数据
        $.each(countObj, function (k, v) {
          if (v.time + hour * 60 * 60 * 1000 < new Date().getTime()) {
            v.count = 0;
          }
        });

        count = parseInt((countObj[phoneVal] && countObj[phoneVal]['count']) || '0')
        if (count >= maxSMSCount) {
          this._showError($(e.currentTarget), ['对不起，您获取验证码次数超过' + maxSMSCount + '次，请' + hour + '小时后再次获取。'])
          return false;
        }
        count++;
        countObj[phoneVal] = { count: count, time: new Date().getTime() };
        localStorage.setItem('getSMSCount', JSON.stringify(countObj));
        $target.addClass('disabled ui-state-disabled').text(waitSMSTime + '秒后可重发')
          .parents('.model').find('.error').removeClass('show').text('');
        this.interval = setInterval(() => {
          if (--waitSMSTime <= 0) {
            clearInterval(this.interval);
            $target.removeClass('disabled ui-state-disabled').text(this.verifyCodeText);
            return false;
          }
          $target.text(waitSMSTime + '秒后可重发');
        }, 1000);
      }
    });
  },


  /**
   * 校验输入数据
   *
   * @param {*} $el
   * @returns
   */
  _verifyData($el) {
    let $model = $el.parents('.model')
      , error = validate($model, this.options.constraints[$model.data('model')]);
    console.log(error);
    return error;
  },

  /**
  * 显示错误
  *
  * @param {*} element jquery对象
  * @param {string} [text=''] 错误文本
  */
  _showError(element, text = []) {
    let $error = element.parents('.row').find('.error');
    text = text[0] || '';
    text = text.split(' ');
    if (text.length > 1) {
      text = text.slice(1);
    }
    text = text.join('');
    if (text) {
      $error.addClass('show').text(text);
    } else {
      $error.removeClass('show').text('');
    }
  }
});