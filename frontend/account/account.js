import utils from 'core/utils';
import validate from "validate.js";

import accountHtml from './account.html';

$.widget("nm.account", {
  options:{
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-account','dropdown');
    this.element.html(accountHtml)

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
      if(err) return console.error(err);
      let userLocale = user.get(o.locale);
      if(userLocale.avatar){
        self.$avatar.attr('src', userLocale.avatar);
      }
      
      self.$nickname.text(userLocale.title || userLocale.id);
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
