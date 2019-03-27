import 'jquery-ui/ui/widget';

import './select.scss';
import selectHtml from './select.html';

$.widget("nm.select", {
  options:{
    mode: 'single',
    classes: {},
    selectedItems: []
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-select', 'dropdown btn-group');
    this.element.html(selectHtml);

    this.$selectBtn = this.element.children('button');
    this.$dropdownMenu = $('.dropdown-menu', this.element);
    this.$clearLink = $('.clear-selected-items', this.element);
    this.$itemContainer = $('.item-container', this.element);
    this.$input = $('input', this.element);
    this.$inputIcon = $('.input-group-text>i', this.element);

    if(o.class){
      this._addClass(null, o.class);
    }

    if(o.btnClass){
      this._addClass(this.$selectBtn, null, o.btnClass);
    }

    this._refreshButton();

    this._on(this.$input, {
      keyup: this._onSearchInputChange,
      change: this._onSearchInputChange
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
          if($i.hasClass('fa-check-square')){
            $i.removeClass('fa-check-square').addClass('fa-square');
            o.selectedItems = _.differenceWith(o.selectedItems, [item], _.isEqual);
          }else if($i.hasClass('fa-square')){
            $i.removeClass('fa-square').addClass('fa-check-square');
            o.selectedItems = _.unionWith(o.selectedItems, [item], _.isEqual);
          }
        } else {
          if($i.hasClass('fa-check-circle')){
            $i.removeClass('fa-check-circle').addClass('fa-circle');
            o.selectedItems = [];
          }else if($i.hasClass('fa-circle')){
            $('li>.fa-li.fa-check-circle', this.$itemContainer).removeClass('fa-check-circle').addClass('fa-circle');
            $i.removeClass('fa-circle').addClass('fa-check-circle');
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

  clear: function(){
    var o = this.options;
    if(o.selectedItems.length > 0){
      if(o.mode === 'multi'){
        $('li>.fa-li.fa-check-square', this.$itemContainer).removeClass('fa-check-square').addClass('fa-square');
      }else{
        $('li>.fa-li.fa-check-circle', this.$itemContainer).removeClass('fa-check-circle').addClass('fa-circle');
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
    filter = filter == "" ? '*' : '*'+filter+'*';
    o.menuItems(filter, function(items){
      self._refreshClearLink();
      self._armItems(items);
    });
  },

  _armItem: function(label, value, checked){
    var o = this.options, itemHtml, 
        icon = o.mode == 'multi' ? 'fa-square' : 'fa-circle',
        iconCheck = o.mode == 'multi' ? 'fa-check-square' : 'fa-check-circle';
    if(checked){
      itemHtml = '<li><i class="fa-li fa ' + iconCheck + '"></i>' + label + '</li>';
    }else{
      itemHtml = '<li><i class="fa-li fa ' + icon + '"></i>' + label + '</li>';
    }
    return itemHtml;
  },

  _armItems: function(items){
    var o = this.options, self = this;

    this.$itemContainer.empty();
    _.each(_.intersectionWith(items, o.selectedItems, _.isEqual), function(item){
      $(self._armItem(item.label, item.value, true)).data('item', item).appendTo(self.$itemContainer);
    });

    $.each(_.differenceWith(items, o.selectedItems, _.isEqual), function(index, item){
      $(self._armItem(item.label, item.value)).data('item', item).appendTo(self.$itemContainer);
    });
  },

  _render: function(){
    var o = this.options, label;
    if(o.render){
      label = o.render(o.selectedItems);
    }

    if(!label){
      label = _.reduce(o.selectedItems, function(text, item) {
        return text == '' ? item.label : text + ',' + item.label;
      }, '');
    }
  
    return label == '' ? "Please select a " + o.title : label;
  },

  _refreshButton: function(){
    this.$selectBtn.html(this._render());
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