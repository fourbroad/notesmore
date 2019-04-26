import utils from 'core/utils';
import validate from "validate.js";

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

    this.loggedInListener =function(user){
      self._refresh();
    }

    o.client.on("loggedIn", this.loggedInListener);

    this._refresh();
    
    this._on(this.$signOff, {click: this._onSignoff});
  },

  _onSignoff: function(event){
    var o = this.options, client = o.client;

    event.preventDefault();
    event.stopPropagation();

    client.logout();
  },

  _refresh: function(){
    var o = this.options, self = this, User = o.client.User;
    User.get(function(err, user){
      if(user.avatar){
        self.$avatar.attr('src', user.avatar);
      }
      self.$nickname.text(user.title || user.id);
    });
  },

  _onClientChanged: function(event, c){
    this._refresh();
  },

  _destroy: function() {
    var o = this.options, client = o.client;
    this.element.empty();
    client.off("loggedIn", this.loggedInListener);
    client.off("loggedOut", this.loggedOutListener);
  }

});
