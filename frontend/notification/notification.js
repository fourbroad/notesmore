const notificationHtml = require('./notification.html');

$.widget("nm.notification", {
  options: {},

  _create: function() {
    this._addClass('nm-notification', 'dropdown');
    this.element.html(notificationHtml)

    this._refresh();
  },

  _refresh: function() {
  },

  _destroy: function() {
    this.element.empty();
  }

});
