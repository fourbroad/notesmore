
require('./idtitle-dialog.scss');

const 
  Loader = require('core/loader'),
  idtitleDialog  = require('./idtitle-dialog.html');

$.widget('nm.idtitledialog', {
  options: {
    modelTitle: 'Save...'
  },

  _create: function(){
    var o = this.options, self = this;

    this._addClass('nm-idtitledialog', 'modal fade');
    this.element.html(idtitleDialog);
    this.element.attr({tabindex:-1, role:'dialog', 'aria-labelledby':'idtitleModalLabel', 'aria-hidden':'true'});
    
    this.element.appendTo('body').modal({show:false});

    this.$modelTitle = $('.modal-title', this.element);
    this.$formTag = $('form.id-title', this.element);
    this.$titleInput = $('input[name="title"]', this.element);
    this.$idInput = $('input[name="id"]', this.element);
    this.$submitBtn = $('.btn.submit', this.element);

    if(o.placeholder && o.placeholder.id){
      this.$idInput.attr('placeholder', o.placeholder.id);
    }

    if(o.placeholder && o.placeholder.title){
      this.$titleInput.attr('placeholder', o.placeholder.title);
    }

    this.$modelTitle.html(o.modelTitle);

    this.element.on('shown.bs.modal', $.proxy(function (e) {
      this.$idInput.val(o.id||'').focus();
      this.$titleInput.val(o.title||'')
    },this));

    this._on(this.$submitBtn, {click: this._onSubmit});
    this._on(this.$formTag, {submit: this._onSubmit});
  },

  _init: function(){
    this.$submitBtn.html('Submit').prop( "disabled", false);
  },

  _onSubmit: function(evt){
    evt.preventDefault();
    evt.stopPropagation();        

    this.$submitBtn.html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> Please wait...').prop( "disabled", true);
    this._trigger('submit',evt, {id: this.$idInput.val(), title:this.$titleInput.val()});
  },

  show: function(){
    this.element.modal('show');
  },

  close: function(){
    this.element.modal('toggle');
    this.$submitBtn.html('Submit').prop( "disabled", false);
  }
});
