import utils from 'core/utils';
import validate from "validate.js";

var client = require('../../lib/client')();

import accountHtml from './account.html';

$.widget("nm.account", {
  options:{
    constraints: {
      // These are the constraints used to validate the form
      username: {
        presence: true,
        // You need to pick a username too
        length: {
          // And it must be between 3 and 20 characters long
          minimum: 3,
          maximum: 20
        },
        format: {
          pattern: "[a-z0-9]+",
          // We don't allow anything that a-z and 0-9
          flags: "i",
          // but we don't care if the username is uppercase or lowercase
          message: "can only contain a-z and 0-9"
        }
      },
      password: {
        presence: true,
        // Password is also required
        length: {
          // And must be at least 5 characters long
          minimum: 5
        }
      }
    }
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-account','dropdown');
    this.element.html(accountHtml)

    // Before using it we must add the parse and format functions
    // Here is a sample implementation using moment.js
    validate.extend(validate.validators.datetime, {
      // The value is guaranteed not to be null or undefined but otherwise it
      // could be anything.
      parse: function(value, options) {
        return +moment.utc(value);
      },
      // Input is a unix timestamp
      format: function(value, options) {
        var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
        return moment.utc(value).format(format);
      }
    });

    this.$avatar = $('.avatar', this.element);
    this.$nickname = $('.nickname', this.element);
    this.$dropdownToggle = $('.dropdown-toggle', this.element);
    this.$profileMenu = $('.profile-menu', this.element);
    this.$signOff = $('.sign-off', this.$profileMenu);

    this.$loginMenu = $('.login-menu', this.element);
    this.$form = $('form', this.$loginMenu);
    this.$loginButton = $('#login.btn', this.$loginMenu);

    this.$alert = $('.alert', this.$loginMenu);
    this.$alertContent = $('.alert-content', this.$alert);
    this.$alertHideBtn = $('button.close', this.$alert);

    $("input, textarea, select", this.$form).each(function() {
      $(this).bind("change", function(ev) {
        var errors = validate(self.$form, o.constraints) || {};
        utils.showErrorsForInput($(this), errors[this.name]);
      });
    });

    this._on(this.$loginButton, {utap: this._onSubmit});
    this._on(this.$form, {submit: this._onSubmit});
    this._on(this.$alertHideBtn, {click : this._onHideAlert});

    this._refresh();
    
    this._on(this.$signOff, {utap: this._onSignoff});
    $.gevent.subscribe(this.element, 'clientChanged',  $.proxy(this._onClientChanged, this));
  },

  _onSignoff: function(event){
    var o = this.options;

    event.preventDefault();
    event.stopPropagation();

    o.client.logout(function(){
      Client.login(function(err, client){
        $.gevent.publish('clientChanged', client);
      });
    });
  },

  _refresh: function(){
    var o = this.options, self = this, User = o.client.User;
    User.get(function(err, user){
      if(user.id == "anonymous"){
        self.$profileMenu.detach();
        self.$loginMenu.appendTo(self.element);
        self.$nickname.text('Please sign-in');
      } else {
        self.$loginMenu.detach();
        self.$profileMenu.appendTo(self.element);
        self.$nickname.text(user.id);
      }
    });
  },

  _onClientChanged: function(event, c){
    var o = this.options;
    o.client = c;
    this._refresh();
  },

  _onSubmit: function(ev) {
    var o = this.options, self = this;

    ev.preventDefault();
    ev.stopPropagation();

    // validate the form aginst the constraints
    var errors = validate(this.$form, o.constraints);
    // then we update the form to reflect the results
    if (errors) {
      this.$form.find("input[name], select[name]").each(function() {
        self._closeAlertMessage();
        // Since the errors can be null if no errors were found we need to handle that
        utils.showErrorsForInput($(this), errors[this.name]);
      });
    } else {
      var loginData = validate.collectFormValues(this.$form, {trim: true});
      this._disableSubmit();
      Client.login(loginData.username, loginData.password, function(err, client) {
        if (err) {
          self._showAlertMessage('alert-danger', err.message);
          self._enableSubmit();
        } else {
          self._enableSubmit();
          self._closeAlertMessage();
          $.gevent.publish('clientChanged', client);
        }
      });
    }
  },

  _disableSubmit: function() {
    if (!this.$loginButton.data('normal-text')) {
      this.$loginButton.data('normal-text', this.$loginButton.html());
    }

    this.$loginButton.html(this.$loginButton.data('loading-text'));
    this.$loginButton.addClass("disabled");
    this.$loginButton.attr({'aria-disabled': true});
  },

  _enableSubmit: function() {
    this.$loginButton.html(this.$loginButton.data('normal-text'));
    this.$loginButton.removeClass("disabled");
    this.$loginButton.removeAttr("aria-disabled");
  },

  _showAlertMessage: function(type, message) {
    this.$alert.removeClass('d-none alert-success alert-info alert-warning alert-danger');
    this.$alert.addClass(type);
    this.$alertContent.html(message);
  },

  _closeAlertMessage: function() {
    this.$alert.addClass('d-none');
  },

  _onHideAlert: function() {
    this.$alert.addClass('d-none');
  },

  _destroy: function() {
    this.element.empty();
  }

});
