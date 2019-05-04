import './toast.scss';
import toastHtml  from'./toast.html';

$.widget('nm.nmtoast', {
  options: {
    animation: true,
    autohide: true,
    delay: 500
  },

  _create: function(){
    let o = this.options, _this = this;

    this._addClass('nm-toast', 'toast');
    this.element.html(toastHtml);
    
    this.element.toast({
      animation: o.animation,
      autohide: o.autohide,
      delay: o.delay
    }).toast('show');

    this.$title = $('.title', this.element);
    this.$hint = $('.hint', this.element);
    this.$body = $('.toast-body', this.element);

    this.refresh();
  },

  refresh: function(){
    let o = this.options;
    this.$title.html(o.title);
    this.$hint.html(o.hint);
    this.$body.html(o.message);
  },

  _setOptions: function( options ) {
    this._super(options);
    this.refresh();
  }  

});
