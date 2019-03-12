import './numeric-range.scss';

import 'jquery.event.ue';

import utils from 'core/utils';
import validate from "validate.js";
import numericRangeHtml from './numeric-range.html';

$.widget("nm.numericrange", {

  options:{
    constraints: {
      lowestValue: {
        numericality: function(value, attributes, attributeName, options, constraints) {
          if(!attributes.highestValue) return null;
          return {lessThanOrEqualTo: Number(attributes.highestValue)};
        }
      },
      highestValue: {
        numericality: function(value, attributes, attributeName, options, constraints) {
          if(!attributes.lowestValue) return null;
          return {greaterThanOrEqualTo: Number(attributes.lowestValue)};
        }
      }
    }
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-numericrange', 'dropdown btn-group');
    this.element.html(numericRangeHtml);

    this.$numericRangeBtn = this.element.children('button');
    this.$dropdownMenu = $('.dropdown-menu', this.element);
    this.$form = $('form', this.$dropdownMenu);
    this.$lowestInput = $('input[name=lowestValue]', this.$form);
    this.$highestInput = $('input[name=highestValue]', this.$form);
    this.$updateBtn = $('#update', this.$form);
    this.$resetBtn = $('#reset', this.$form);
    this.$cancelBtn = $('#cancel', this.$form)

    if(o.class){
      this._addClass(null, o.class);
    }
    if(o.btnClass){
      this._addClass(this.$numericRangeBtn, null, o.btnClass);
    }
  
    this._refreshButton();

    this.element.on('show.bs.dropdown', function () {
      if(o.lowestValue) self.$lowestInput.val(o.lowestValue);
      if(o.highestValue) self.$highestInput.val(o.highestValue);
    });

    this._on(this.$dropdownMenu, {
      click: function(evt){
        evt.stopImmediatePropagation();
      }
    });

    this._on(this.$lowestInput, {
      change: function(evt){
        var errors = validate(this.$form, o.constraints) || {};
        utils.showErrorsForInput(this.$lowestInput, errors[evt.target.name]);
        if(!errors[evt.target.name]&&this.$highestInput.val()!=''){
          utils.showErrorsForInput(this.$highestInput, errors[this.$highestInput.attr('name')]);
        }
      }
    });

    this._on(this.$highestInput, {
      change: function(evt){
        var errors = validate(this.$form, o.constraints) || {};
        utils.showErrorsForInput(this.$highestInput, errors[evt.target.name]);
        if(!errors[evt.target.name]&&this.$lowestInput.val()!=''){
          utils.showErrorsForInput(this.$lowestInput, errors[this.$lowestInput.attr('name')]);
        }
      }
    });
  
    this._on(this.$updateBtn, {utap: this._onSubmit});
    this._on(this.$resetBtn, {utap: this._onReset});
    this._on(this.$cancelBtn, {utap: this._onCancel});
    this._on(this.$form, {submit: this._onSubmit});
  },

  _refreshButton: function(){
    var o = this.options, label = '';
    if(o.lowestValue && o.highestValue){
      label = o.title+':'+o.lowestValue + '-' + o.highestValue;
    }else if(o.lowestValue){
      label = o.title+'>='+o.lowestValue;
    } else if(o.highestValue){
      label = o.title+'<='+o.highestValue;
    }else{
      label = o.title+':all'
    }

    this.$numericRangeBtn.html(label);
  },

  _doSubmit: function(dropdown){
    var o = this.options, errors = validate(this.$form, o.constraints);
    if (errors) {
      utils.showErrors(this.$form, errors);
    } else {
      var values = validate.collectFormValues(this.$form, {trim: true}),
          lv = values.lowestValue ? parseInt(values.lowestValue) : null,
          hv = values.highestValue? parseInt(values.highestValue) : null;
      if(o.lowestValue != lv || o.highestValue != hv){
        o.lowestValue = lv;
        o.highestValue = hv;
        this._refreshButton();
        this._trigger('valueChanged', null, {lowestValue: o.lowestValue, highestValue: o.highestValue});
      }
      utils.clearErrors(this.$form);
      if(!dropdown) this.element.trigger('click');
    }
  },

  _onSubmit: function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    this._doSubmit();
  },

  _onReset: function(ev){
    this.$highestInput.val('');
    this.$lowestInput.val('');
    this._doSubmit(true);
  },

  _onCancel: function(ev){
    this.element.trigger('click');
  }
});