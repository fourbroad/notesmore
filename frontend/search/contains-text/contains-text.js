import './contains-text.scss';

import containsTextHtml from './contains-text.html';

$.widget("nm.containstext", {

  options:{
    i18n:{
      'zh-CN':{
        all: "全部",
        contains: "包含",
        update: "更新",
        reset: "清除",
        cancel: "取消",
        containsTextPlaceholder: "包含文本"
      }      
    }
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

  _render: function(){
    var o = this.options, label;
    if(o.render){
      label = o.render(o.containsText);
    }

    if(!label){
      if(o.containsText){
        label = o.title+this._i18n('contains', ' contains ')+ '"' + o.containsText + '"';
      }else{
        label = o.title+': '+this._i18n('all', 'all');
      }
    }
  
    return label == '' ? "Please enter keyword for " + o.title : label;
  },

  _refreshButton: function(){
    this.$containstextBtn.html(this._render());
    this.$containsTextInput.attr('placeholder',this._i18n('containsTextPlaceholder', 'Contains text'));
    this.$updateBtn.html(this._i18n('update', 'Update'));
    this.$resetBtn.html(this._i18n('reset', 'Reset'));
    this.$cancelBtn.html(this._i18n('cancel', 'Cancel'));
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
  },

  _doSubmit: function(dropdown){
    var o = this.options;
    o.containsText = this.$containsTextInput.val().trim();
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