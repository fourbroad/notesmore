
import 'jquery-datetimepicker';
import 'jquery-datetimepicker/jquery.datetimepicker.css';

import validate from "validate.js";
import utils from 'core/utils';

import './datetime-range.scss';
import datetimeRangeHtml from './datetime-range.html';

$.widget("nm.datetimerange", {

  options:{
    constraints: {
      earliest: {
        datetime: function(value, attributes, attributeName, options, constraints) {
          if(!attributes.latest) return null;
          return {
            latest: moment.utc(attributes.latest),
            message:'must be no later than ' + attributes.latest
          };
        }
      },
      latest: {
        datetime: function(value, attributes, attributeName, options, constraints) {
          if(!attributes.earliest) return null;
          return {
            earliest: moment.utc(attributes.earliest),
            message:'must be no earlier than '+ attributes.earliest
          };
        }
      }
    }
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-datetimerange', 'dropdown btn-group');
    this.element.html(datetimeRangeHtml);

    this.$earliestPicker = $('[name="earliest"]', this.element);
    this.$latestPicker = $('[name="latest"]', this.element);
    this.$datetimeRangeBtn = this.element.children('button');
    this.$dropdownMenu = $('.dropdown-menu', this.element);
    this.$form = $('form', this.$dropdownMenu);
    this.$latestInput = $('input[name=earliest]', this.$form);
    this.$earliestInput = $('input[name=latest]', this.$form);
    this.$latestIcon = $('.latest-icon', this.$form);
    this.$earliestIcon = $('.earliest-icon', this.$form);
    this.$updateBtn = $('#update', this.$form)
    this.$resetBtn = $('#reset', this.$form)
    this.$cancelBtn = $('#cancel', this.$form)

    if(o.class){
      this._addClass(null, o.class);
    }
    if(o.btnClass){
      this._addClass(this.$datetimeRangeBtn, null, o.btnClass);
    }

    validate.extend(validate.validators.datetime, {
      parse: function(value, options) {
        return +moment.utc(value);
      },

      format: function(value, options) {
        var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
        return moment.utc(value).format(format);
      }
    });

    this._refreshButton();

    $.datetimepicker.setDateFormatter('moment');

    this.$earliestPicker.datetimepicker({
      format:'YYYY-MM-DD HH:mm:ss'
    });
    this.$latestPicker.datetimepicker({
      format:'YYYY-MM-DD HH:mm:ss'
    });

    this.element.on('show.bs.dropdown', function () {
      if(o.earliest) self.$latestInput.val(moment.utc(o.earliest).format('YYYY-MM-DD HH:mm:ss'));
      if(o.latest) self.$earliestInput.val(moment.utc(o.latest).format('YYYY-MM-DD HH:mm:ss'));
    });

    this._on(this.$dropdownMenu, {
      click: function(evt){
        evt.stopImmediatePropagation();
      }
    });

    this._on(this.$earliestInput, {
      change: function(evt){
        var errors = validate(this.$form, o.constraints) || {};
        utils.showErrorsForInput(this.$earliestInput, errors[evt.target.name]);
        if(this.$latestInput.val()!=''){
          utils.showErrorsForInput(this.$latestInput, errors[this.$latestInput.attr('name')]);
        }
      }
    });

    this._on(this.$latestInput, {
      change: function(evt){
        var errors = validate(this.$form, o.constraints) || {};
        utils.showErrorsForInput(this.$latestInput, errors[evt.target.name]);
        if(this.$earliestInput.val()!=''){
          utils.showErrorsForInput(this.$earliestInput, errors[this.$earliestInput.attr('name')]);
        }
      }
    });

    this._on(this.$latestIcon, {
      click: function(evt){
        this.$latestPicker.datetimepicker('toggle');
      }
    });

    this._on(this.$earliestIcon, {
      click: function(evt){
        this.$earliestPicker.datetimepicker('toggle');
      }
    });
  
    this._on(this.$updateBtn, {click: this._onSubmit});
    this._on(this.$resetBtn, {click: this._onReset});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$form, {submit: this._onSubmit});
  },

  _refreshButton: function(){
    var o = this.options, label = '';
    if(o.earliest && o.latest){
      label = o.title+':'+moment.utc(o.earliest).format('YYYY-MM-DD') + '~' + moment.utc(o.latest).format('YYYY-MM-DD');
    }else if(o.earliest){
      label = o.title+'>='+moment.utc(o.earliest).format('YYYY-MM-DD');
    } else if(o.latest){
      label = o.title+'<='+moment.utc(o.latest).format('YYYY-MM-DD');
    }else{
      label = o.title+':all'
    }

    this.$datetimeRangeBtn.html(label);
  },

  _doSubmit: function(dropdown){
    var o = this.options, errors = validate(this.$form, o.constraints);
    if (errors) {
      utils.showErrors(this.$form, errors);
    } else {
      var ep = this.$earliestPicker.val() ? + moment.utc(this.$earliestPicker.val()) : null, 
          lp = this.$latestPicker.val() ? +moment.utc(this.$latestPicker.val()) : null;
      if(o.earliest != ep || o.latest != lp){
        o.earliest = ep;
        o.latest = lp;
        this._refreshButton();

        this._trigger('valueChanged', null, {earliest:o.earliest, latest:o.latest});
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
    this.$earliestInput.val('');
    this.$latestInput.val('');
    this._doSubmit(true);
  },

  _onCancel: function(ev){
    this.element.trigger('click');
  }

});
