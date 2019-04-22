import * as $ from 'jquery';
import 'bootstrap';
// import moment from 'moment';
import validate from "validate.js";

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import signupHtml from './signup.html';
import './signup.scss';
// import { interval } from '_rxjs@6.4.0@rxjs';

$.widget('nm.signup', {
  options: {
    maxSMSCount: 5,//获取最大验证码次数
    waitSMSTime: 60,//每次获取验证码后等待时长
    hour: 24,//短信次数用完后等待的小时数
    constraints: {
      phones: {
        presence: { message: '请输入手机号码' },
        format: {
          pattern: /1\d{10}/,
          message: "请输入正确的手机号码"
        }
      },
      email: {
        presence: { message: '请输入邮箱地址' },
        format: {
          pattern: /\w+@\w+\.\w{2,3}/,
          message: "请输入正确的邮箱地址"
        }
      },
      code: {
        presence: { message: '请输入短信验证码' },
        format: {
          pattern: /\d{6}/,
          message: "短信验证码错误"
        }
      },
      password: {
        presence: { message: '请输入登录密码' },
        format: {
          pattern: /.{8,}/,
          message: "登录密码格式错误"
        }
      }
    }
  },

  _create() {
    this._addClass("nm-signup");
    this.element.html(signupHtml);

    this.$select = $('.menu', this.element);
    this.$verifyCode = $('.verify-code', this.element);
    this.$signupBtn = $('.submit-btn', this.element);
    this.$input = $('input', this.element);

    this._select();
    this._getverifyCode();

    //输入完后校验数据
    this._on(this.$input, {
      'change': function (e) {
        let error = this._verifyData() || {}
          , $target = $(e.currentTarget);
        this._showError($target, error[$target.attr('name')]);
      },
      'keyup':function(e){
        if (e.keyCode == 13) {
          this._submit(e);
        }
      }
    });

    //切换到登录
    this._on(this.element.find('.footer a'), {
      'click': function () {
        runtime.option({ uriAnchor: { col: '.pages', doc: '.login' }, override: false });
      }
    });

    //提交
    this._on(this.$signupBtn, { 'click': this._submit });

    //重发邮件
    this._on(this.element.find('.again'), {
      'click a': function () {
        console.log('again');
      }
    });
  },

  _destroy() {
    this.element.removeClass("nm-signup");
  },

  /**
   * 下拉选择框
   *
   */
  _select() {
    let $option = $('.menu-option', this.$select)
      , $li = $('li', $option)
      , $text = $('.menu-text', this.$select);

    this._on(this.$select, {
      'click .menu-text': function (e) {
        e.preventDefault();
        e.stopPropagation();
        $option.toggle();
      },
      'click .menu-option li': function (e) {
        let $target = $(e.currentTarget);
        e.preventDefault();
        e.stopPropagation();
        $li.removeClass('active');
        $target.addClass('active');
        $option.toggle();
        $text.text($target.text().trim());
        if ($target.attr('name') == 'email') {
          this.$verifyCode.hide();
          this.$signupBtn.text('发送邮件激活注册');
          $('.email', this.element).show().siblings('.phones').hide();
        } else {
          this.$verifyCode.show();
          this.$signupBtn.text('注册');
          $('.phones', this.element).show().siblings('.email').hide();
        }
        $('.error', this.element).text('');
      }
    });
    this._on(this.element, {
      'click': function () {
        $option.hide();
      }
    });
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
          , phoneVal = $('.phones', this.element).val().trim()
          , countObj = JSON.parse(localStorage.getItem('getSMSCount') || '{}')
          , error = this._verifyData(this.$verifyCode) || {}
          , interval
          , count;

        if (error['phones']) {
          this._showError($('.phones', this.element), error[$('.phones', this.element).attr('name')]);
          return false;
        }

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
        $target.addClass('disabled ui-state-disabled').text(waitSMSTime + '秒后可重发');
        interval = setInterval(() => {
          if (--waitSMSTime <= 0) {
            clearInterval(interval);
            $target.removeClass('disabled ui-state-disabled').text('获取短信验证码');
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
   */
  _verifyData() {
    let error = validate(this.element, this.options.constraints);
    console.log(error);
    return error;
  },

  /**
   * 提交
   *
   */
  _submit() {
    let error = this._verifyData()
      , self = this
      , hasError = false
      , type = this.$select.find('li.active').attr('name') || '';

    error && $('input:visible', this.element).each(function (i, v) {
      let $v = $(v);
      hasError = true;
      self._showError($v, error[$v.attr('name')]);
    });

    if (hasError) return false;

    let inputData = validate.collectFormValues(this.element, { trim: true });
    if (!inputData.agree) return false;

    if (type == 'phone') {
      console.log('phone signup', inputData);
    } else if (type == 'email') {
      console.log('email signup', inputData);
      $('.model-1', this.element).hide().siblings('.model-2').show();
    }
  },

  /**
   *显示错误
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
