import './contains-text.scss';

import containsTextHtml from './contains-text.html';

$.widget("nm.containstext", {

  options:{
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-containstext', 'dropdown btn-group');
    this.element.html(containsTextHtml);

    this.$containstextBtn = this.element.children('button');
    this.$dropdownMenu = $('.dropdown-menu', this.element);
    this.$form = $('form', this.$dropdownMenu);
    this.$containsTextInput = $('input[name=containsText]', this.$form);
    this.$updateBtn = $('#update', this.$form);
    this.$resetBtn = $('#reset', this.$form);
    this.$cancelBtn = $('#cancel', this.$form)

    if(o.class){
      this._addClass(null, o.class);
    }
    if(o.btnClass){
      this._addClass(this.$containstextBtn, null, o.btnClass);
    }
  
    this._refreshButton();

    this.element.on('show.bs.dropdown', function () {
      if(o.containsText) self.$containsTextInput.val(o.containsText);
    });

    this._on(this.$dropdownMenu, {
      click: function(evt){
        evt.stopImmediatePropagation();
      }
    });

    this._on(this.$updateBtn, {click: this._onSubmit});
    this._on(this.$resetBtn, {click: this._onReset});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$form, {submit: this._onSubmit});
  },

  _refreshButton: function(){
    var o = this.options, label = '';
    if(o.containsText){
      label = o.title+' contains "' + o.containsText + '"';
    }else{
      label = o.title+':all'
    }

    this.$containstextBtn.html(label);
  },

  _doSubmit: function(dropdown){
    var o = this.options;
    o.containsText = this.$containsTextInput.val();
    this._refreshButton();
    this._trigger('valueChanged', null, {containsText: o.containsText});
    if(!dropdown) this.element.trigger('click');
  },

  _onSubmit: function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    this._doSubmit();
  },

  _onReset: function(ev){
    this.$containsTextInput.val('');
    delete this.options.containsText;
    this._doSubmit(true);
  },

  _onCancel: function(ev){
    this.element.trigger('click');
  }
});