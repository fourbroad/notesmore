import 'jquery-ui/ui/widget';

import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import './keywords.scss';
import keywordsHtml from './keywords.html';

$.widget("nm.keywords", {
  options:{
    mode: 'multi', // single, multi
    classes: {},
    selectedItems: [],
    i18n:{
      'zh-CN':{
        all: "全部",
        please: "请选择",
        clearLink: "清除已选择项目"
      }
    }
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-keywords', 'dropdown btn-group');
    this.element.html(keywordsHtml);

    this.$keywordsBtn = this.element.children('button');
    this.$dropdownMenu = $('.dropdown-menu', this.element);
    this.$clearLink = $('.clear-selected-items', this.element);
    this.$itemContainerWrapper = $('.item-container-wrapper', this.element);
    this.$itemContainer = $('.item-container', this.$itemContainerWrapper);
    this.$input = $('input', this.element);
    this.$inputIcon = $('.input-group-text>i', this.element);

    this.ps = new PerfectScrollbar(this.$itemContainerWrapper[0],{suppressScrollX:true, wheelPropagation: false});

    if(o.class){
      this._addClass(null, o.class);
    }

    if(o.btnClass){
      this._addClass(this.$keywordsBtn, null, o.btnClass);
    }

    this._refreshButton();

    this._on(this.$input, {
      keyup: this._onSearchInputChange
    });

    this._on(this.$inputIcon, {
      'click': function(){
        var filter = this.$input.val(), rearm = filter.trim() != '';
        this.$input.val('');
        this._setSearchIcon();    
        if(rearm){
          this._fetchMenuItems();
        }
      }
    });

    this._on(this.$clearLink, { 'click': this._onClear });

    this.element.on('show.bs.dropdown', function () {
      self.$input.val('');
      self._setSearchIcon();
      self._fetchMenuItems();
    });

    this._on(this.$dropdownMenu, {
      'click': function(e){
        e.stopImmediatePropagation();
      }
    });

    this._on(this.$itemContainer, {
      'click li': function(e){
        var $target = $(e.target), $i = $('i.fa-li', $target), item = $target.data('item');
        if(o.mode == 'multi'){
          if($i.hasClass('fa-check-square-o')){
            $i.removeClass('fa-check-square-o').addClass('fa-square-o');
            o.selectedItems = _.differenceWith(o.selectedItems, [item], _.isEqual);
          }else if($i.hasClass('fa-square-o')){
            $i.removeClass('fa-square-o').addClass('fa-check-square-o');
            o.selectedItems = _.unionWith(o.selectedItems, [item], _.isEqual);
          }
        } else {
          if($i.hasClass('fa-check-circle-o')){
            $i.removeClass('fa-check-circle-o').addClass('fa-circle-o');
            o.selectedItems = [];
          }else if($i.hasClass('fa-circle-o')){
            $('li>.fa-li.fa-check-circle-o', this.$itemContainer).removeClass('fa-check-circle-o').addClass('fa-circle-o');
            $i.removeClass('fa-circle-o').addClass('fa-check-circle-o');
            o.selectedItems = [item];
          }
        }
        this._refresh();
        this._trigger('valueChanged', e, {selectedItems: o.selectedItems});        
      }
    });

    this._on(this.$itemContainer, {
      'click li>i.fa-li': function(e){
        $(e.target).parent('li').click();
      }
    });
  },

  _onClear: function(e){
    if(!this.$clearLink.hasClass('disabled')){
      this.clear();
    }    
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
  },  

  clear: function(){
    var o = this.options;
    if(o.selectedItems.length > 0){
      if(o.mode === 'multi'){
        $('li>.fa-li.fa-check-square-o', this.$itemContainer).removeClass('fa-check-square-o').addClass('fa-square-o');
      }else{
        $('li>.fa-li.fa-check-circle-o', this.$itemContainer).removeClass('fa-check-circle-o').addClass('fa-circle-o');
      }
      o.selectedItems = [];
      this._refresh();
      this._fetchMenuItems();
      this._trigger('valueChanged', event, {selectedItems: o.selectedItems});
    }        
  },

  _onSearchInputChange: function(){
    var filter = this.$input.val();
    if(filter != ''){
      this._setClearIcon();
    } else {
      this._setSearchIcon();
    }
    this._fetchMenuItems();
  },

  _setSearchIcon: function(){
    this.$inputIcon.removeClass('fa-times');
    this.$inputIcon.addClass('fa-search');
  },

  _setClearIcon: function(){
    this.$inputIcon.removeClass('fa-search');
    this.$inputIcon.addClass('fa-times');
  },

  _refreshClearLink: function(){
    var o = this.options, filter = this.$input.val();
    this.$clearLink.html(this._i18n('clearLink','Clear selected items'));
    if(filter.trim() == ''){
      this.$clearLink.show();
      if(o.selectedItems.length > 0){
        this.$clearLink.removeClass('disabled');      
      }else{
        this.$clearLink.addClass('disabled');
      }
    }else{
      this.$clearLink.hide();
    }
  },

  _fetchMenuItems: function(){
    var o = this.options, self = this, filter = this.$input.val().trim();
    filter = filter == "" ? '.*' : '.*'+filter+'.*';
    o.menuItems(filter, function(items){
      self._refreshClearLink();
      self._armItems(items);
      self.$itemContainerWrapper.scrollTop(0);
    });
  },

  _armItem: function(item, checked){
    var o = this.options, itemHtml, 
        icon = o.mode == 'multi' ? 'fa-square-o' : 'fa-circle-o',
        iconCheck = o.mode == 'multi' ? 'fa-check-square-o' : 'fa-check-circle-o';
        
    if(checked){
      itemHtml = '<li><i class="fa-li fa ' + iconCheck + '"></i>' + item + '</li>';
    }else{
      itemHtml = '<li><i class="fa-li fa ' + icon + '"></i>' + item + '</li>';
    }
    return itemHtml;
  },

  _armItems: function(items){
    var o = this.options, self = this;

    this.$itemContainer.empty();
    _.each(_.intersectionWith(items, o.selectedItems, _.isEqual), function(item){
      $(self._armItem(item, true)).data('item', item).appendTo(self.$itemContainer);
    });

    $.each(_.differenceWith(items, o.selectedItems, _.isEqual), function(index, item){
      $(self._armItem(item)).data('item', item).appendTo(self.$itemContainer);
    });
  },

  _render: function(){
    var o = this.options, label;
    if(o.render){
      label = o.render(o.selectedItems);
    }

    if(!label){
      if(o.selectedItems && o.selectedItems.length > 1){
        label = _.reduce(o.selectedItems, function(text, item) {
          return text == '' ? item : text + ',' + item;
        }, '');
      } else {
        label = o.title+': '+this._i18n('all', 'all');
      }
    }
  
    return label == '' ? this._i18n("please", "Please select a ") + o.title : label;
  },

  _refreshButton: function(){
    this.$keywordsBtn.html(this._render());
  },

  _refresh: function(){
    this._refreshClearLink();
    this._refreshButton();
  },

  _setOption: function( key, value ) {
    var o = this.options;
    this._super( key, value );
    if ( key == "selectedItems" ) {
      this._refresh();      
    }
  }
    
});