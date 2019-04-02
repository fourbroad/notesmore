import utils from 'core/utils';
import validate from "validate.js";

var client = require('../../lib/client')();

import loginHtml from './login.html';

$.widget("nm.login", {
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

    this._addClass('nm-login');
    this.element.html(loginHtml)

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

    this.$form = $('form', this.element);
    this.$signup = $('.signup', this.element);
    this.$loginButton = $('#login.btn', this.$form);

    this.$alert = $('.alert', this.element);
    this.$alertContent = $('.alert-content', this.$alert);
    this.$alertHideBtn = $('button.close', this.$alert);

    $("input, textarea, select", this.$form).each(function() {
      $(this).bind("change", function(e) {
        var errors = validate(self.$form, o.constraints) || {};
        utils.showErrorsForInput($(this), errors[this.name]);
      });
    });

    this._on(this.$signup, {click: this._onSignup});
    this._on(this.$loginButton, {click: this._onSubmit});
    this._on(this.$form, {submit: this._onSubmit});
    this._on(this.$alertHideBtn, {click : this._onHideAlert});
  },

  _onSignup: function(e){
    e.preventDefault();
    e.stopImmediatePropagation();    
    runtime.option({uriAnchor:{col:'.pages', doc:'.signup'}, override: false});
  },

  _onSubmit: function(e) {
    var o = this.options, self = this;

    e.preventDefault();
    e.stopPropagation();

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
      client.login(loginData.username, loginData.password, function(err, user) {
        if (err) {
          self._showAlertMessage('alert-danger', err.message);
          self._enableSubmit();
        } else {
          self._enableSubmit();
          self._closeAlertMessage();
          runtime.option({uriAnchor:{col:'.pages', doc:'.workbench'}, override: true});
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
