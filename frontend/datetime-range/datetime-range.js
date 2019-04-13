
import 'jquery-datetimepicker';
import 'jquery-datetimepicker/jquery.datetimepicker.css';

import validate from "validate.js";
import utils from 'core/utils';

import './datetime-range.scss';
import datetimeRangeHtml from './datetime-range.html';

const isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,
      isoMessage = "^Date range must comply with ISO 8609 specifications";


$.widget("nm.datetimerange", {

  options:{
    mode: 'between', // latest, before, between, range
    unit: 'minutes', // minutes, hours, days, weeks, months
    constraints: {
      lEarliest:{
        presence: false,
        numericality: {
          onlyInteger: true,
          greaterThan: 0
        }
      },
      bfLatest:{
        presence: false,
        numericality: {
          onlyInteger: true,
          greaterThan: 0
        }
      },
      btEarliest: {
        datetime: true
      },
      btLatest: {
        datetime: true
      },
      rEarliest: {
        presence: false,
        format: {
          pattern: isoRegex,
          message: isoMessage
        }
      },
      rLatest: {
        presence: false,
        format: {
          pattern: isoRegex,
          message: isoMessage
        }
      }
    }
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-datetimerange', 'dropdown btn-group');
    this.element.html(datetimeRangeHtml);

    this.$btEarliest = $('input[name="btEarliest"]', this.element);
    this.$btLatest = $('input[name="btLatest"]', this.element);
    this.$btLatestIcon = $('.btLatest-icon', this.$form);
    this.$btEarliestIcon = $('.btEarliest-icon', this.$form);
    this.$lEarliest = $('input[name="lEarliest"]', this.element);
    this.$lUnit = $('select.l-unit', this.element);
    this.$bfLatest = $('input[name="bfLatest"]', this.element);
    this.$bfUnit = $('select.bf-unit', this.element);
    this.$rEarliest = $('input[name="rEarliest"]', this.element);
    this.$rLatest = $('input[name="rLatest"]', this.element);
    this.$datetimeRangeBtn = this.element.children('button');
    this.$dropdownMenu = $('.dropdown-menu', this.element);
    this.$form = $('form', this.$dropdownMenu);
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
        return +moment(value);
      },

      format: function(value, options) {
        var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
        return moment(value).format(format);
      }
    });

    this._initRadio();
    this._refreshButton();

    $.datetimepicker.setDateFormatter('moment');

    this.$btEarliest.datetimepicker({
      format:'YYYY-MM-DD HH:mm:ss',
      onShow:function(ct){
        this.setOptions({
          maxDate:self.$btLatest.val() ? self.$btLatest.val() : false
        })
      },
    });
    this.$btLatest.datetimepicker({
      format:'YYYY-MM-DD HH:mm:ss',
      onShow:function(ct){
       this.setOptions({
        minDate: self.$btEarliest.val() ? self.$btEarliest.val() : false
       })
      }
    });

    this._on(this.$dropdownMenu, {
      click: function(evt){
        evt.stopImmediatePropagation();
      }
    });

    this._on({ 'change input[type="text"]': this._onInputChange });

    this._on(this.$btLatestIcon, {
      click: function(evt){
        this.$btLatest.focus();
      }
    });

    this._on(this.$btEarliestIcon, {
      click: function(evt){
        this.$btEarliest.focus();
      }
    });
  
    this._on(this.$updateBtn, {click: this._onSubmit});
    this._on(this.$resetBtn, {click: this._onReset});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$form, {submit: this._onSubmit});
  },

  _initRadio: function() {
    var o = this.options, $mode = $('input[type="radio"][value="'+o.mode+'"]', this.$form);
    $('.custom-radio', this.$form).each(function(index){
      $(this).children('input').attr("id", o.name+index);
      $(this).children('label').attr("for", o.name+index);
    })
    this._on({'change input[type="radio"]': this._onRadioChanged});
    $mode.prop('checked', true);
    $mode.closest('.form-row').find('input[type!="radio"], select').prop('disabled', false);
    $(':not(:checked)[type="radio"]', this.$form).closest('.form-row').css('color','gray');

    this.$form.on('click', '.form-row>.col-auto', function(e){
      $(this).closest('.form-row').find('input[type="radio"]').prop('checked', true).trigger('change', e.target);
    });

    switch(o.mode){
      case 'latest':
        if(o.earliest){
          this.$lEarliest.val(o.earliest);
        }
        this.$lUnit.val(o.unit);
        break;
      case 'before':
        if(o.latest){
          this.$bfLatest.val(o.latest);
        }
        this.$bfUnit.val(o.unit);
        break;
      case 'between':
        if(o.earliest) this.$btEarliest.val(moment(o.earliest).format('YYYY-MM-DD HH:mm:ss'));
        if(o.latest) this.$btLatest.val(moment(o.latest).format('YYYY-MM-DD HH:mm:ss'));
        break;
      case 'range':
        if(o.earliest) this.$rEarliest.val(o.earliest);
        if(o.latest) this.$rLatest.val(o.latest);
        break;
      default:
        console.error(o.mode);
    }
  },

  _onInputChange: function(e){
    var o = this.options, $target = $(e.target), c = o.constraints,
      name = $target.attr('name'), value = $target.val();
    if(c[name]){
      var errors = validate.single($.isEmptyObject(value) ? null: value, c[name]);
      if(!$.isEmptyObject(errors)){
        utils.showErrorsForInput($target, errors);
      }else{
        utils.clearInputError($target);
      }
    }
  },

  _onRadioChanged: function(e, orginal) {
    var o = this.options, $target = $(e.target), $targetParent = $target.closest('.form-row');
    
    if($target.val() == o.mode) return;

    $(':not(:checked)[type="radio"]', this.$form).closest('.form-row').css('color','gray')
      .find('input[type!="radio"], select').prop('disabled', true);
    $target.closest('.form-row').find('input[type!="radio"], select').prop('disabled', false);
    $targetParent.css('color', '');

    if($(orginal).is('input[type=text]')){
      $(orginal).focus();
    }else{
      $targetParent.find('input').eq(1).focus();      
    }

    utils.clearErrors(this.$form);
    this.option({ mode: $target.val(), earliest: null, latest:null, unit: null});
  },

  _refreshButton: function(){
    var o = this.options, label = o.title+':all';
    switch(o.mode){
      case 'latest':
        if(o.earliest){
          label = o.title + " within the last " + o.earliest + " " + o.unit;
        }
      break;
      case 'before':
        if(o.latest){
          label = o.title + " more than " + o.latest + " " + o.unit + " ago";
        }
      break;
      case 'between':
        if(o.earliest && o.latest){
          label = o.title+':'+moment(o.earliest).format('YYYY-MM-DD') + '~' + moment(o.latest).format('YYYY-MM-DD');
        }else if(o.earliest){
          label = o.title+'>='+moment(o.earliest).format('YYYY-MM-DD');
        } else if(o.latest){
          label = o.title+'<='+moment(o.latest).format('YYYY-MM-DD');
        }else{
          label = o.title+':all'
        }
      break;
      case 'range':{
        var now = moment(), earliest, latest;
        if(o.earliest && o.latest){
          earliest = now.clone().add(moment.duration(o.earliest)).format('YYYY-MM-DD');
          latest = now.clone().add(moment.duration(o.latest)).format('YYYY-MM-DD');
          label = o.title+':'+earliest+'~'+latest;
        }else if(o.earliest){
          label = o.title + '>=' + now.clone().add(moment.duration(o.earliest)).format('YYYY-MM-DD');
        }else if(o.latest){
          label = o.title + '<=' + now.clone().add(moment.duration(o.latest)).format('YYYY-MM-DD');
        }
      }
      break;
      default:      
      break;
    }

    this.$datetimeRangeBtn.html(label);
  },

  _doSubmit: function(dropdown){
    var o = this.options, errors = validate(this.$form, o.constraints);
    if (errors) {
      utils.showErrors(this.$form, errors);
    } else {
      var value = {mode: o.mode};
      switch(o.mode){
        case 'latest':{
          var ev = this.$lEarliest.val(), unit = this.$lUnit.val();
          o.earliest = value.earliest = ev;
          o.unit = value.unit = unit;
        }                
        break;
        case 'before':{
          var lv = this.$bfLatest.val(), unit = this.$bfUnit.val();
          o.latest = value.latest = lv;
          o.unit = value.unit = unit;
        }
        break;
        case 'between':{
          var ev = this.$btEarliest.val() ? + moment(this.$btEarliest.val()) : null, 
            lv = this.$btLatest.val() ? + moment(this.$btLatest.val()) : null;
          o.earliest = value.earliest = ev;
          o.latest = value.latest = lv;
        }
        break;
        case 'range':{
          var ev = this.$rEarliest.val(), lv = this.$rLatest.val();
          o.earliest = value.earliest = ev;
          o.latest = value.latest = lv;
        }
        break;
        default:
          console.error(o.mode);
      }

      this._refreshButton();
      this._trigger('valueChanged', null, value);

      if(!dropdown) this.element.trigger('click');
    }
  },

  _onSubmit: function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    this._doSubmit();
  },

  _onReset: function(ev){
    this.$lEarliest.val('');
    this.$bfLatest.val('');
    this.$btEarliest.val('');
    this.$btLatest.val('');
    this.$rEarliest.val('');
    this.$rLatest.val('');
    utils.clearErrors(this.$form);
    this._doSubmit(true);
  },

  _onCancel: function(ev){
    this.element.trigger('click');
  }

});
