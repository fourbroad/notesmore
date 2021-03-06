
import './full-text.scss';
import fullTextHtml from './full-text.html';

$.widget("nm.fulltextsearch", {
  version:"1.0",
  options:{},

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-fulltextsearch', 'input-group input-group-sm')
    this.element.html(fullTextHtml);

    this.$input = $('input', this.element);
    this.$inputIcon = $('.input-group-text>i', this.element);

    if(o.class){
      this._addClass(null, o.class);
    }

    this.$input.val(o.keyword);
    this._refreshSearchIcon();

    this._on(this.$input, {
      keyup: _.debounce(this._onInputChange, 500)
    });

    this._on(this.$inputIcon, {
      click: function(event){
        var filter = this.$input.val(), changed = filter.trim() != '';
        this.$input.val('');
        this._setSearchIcon();    
        if(changed) 
          this._trigger('valueChanged', event, {keyword: this.getKeyword()});
      }
    });
  },

  _onInputChange: function(event){
    this._refreshSearchIcon();
    this._trigger('valueChanged', event, {keyword: this.getKeyword()});
  },

  _refreshSearchIcon: function(){
    var filter = this.$input.val().trim();
    if(filter != ''){
      this._setCancelIcon();      
    } else {
      this._setSearchIcon();
    }
  },

  _setSearchIcon: function(){
    this.$inputIcon.removeClass('fa-times');
    this.$inputIcon.addClass('fa-search');
  },

  _setCancelIcon: function(){
    this.$inputIcon.removeClass('fa-search');
    this.$inputIcon.addClass('fa-times');
  },

  getKeyword: function(){
    return this.$input.val().trim();
  }

});