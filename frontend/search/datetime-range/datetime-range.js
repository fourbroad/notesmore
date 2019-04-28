const _ = require('lodash');

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
//     option: 'between', // latest, before, between, range
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
    },
    i18n:{
      'zh-CN':{
        all: "全部",
        withinLast: "最近",
        moreThan: "超过",
        ago: "之前",
        between: "从",
        and: "到",
        inRange: "从",
        to: "到",
        update: "更新",
        reset: "清除",
        cancel: "取消",
        minutes: "分钟",
        hours: "小时",
        days: "天",
        weeks: "周",
        months: "月",
        iso8601: "P:期间, Y:年, M:月, D:日, T:时间, H:小时, M:分钟, S:秒",
        constraints:{
          lEarliest:{
            numericality:{
              message: "请输入大于0的整数"
            }
          },
          bfLatest:{
            numericality:{
              message: "请输入大于0的整数"
            }
          },
          rEarliest:{
            format:{
              message: "日期范围必须符合ISO 8609规范"
            }
          },
          rLatest:{
            format:{
              message: "日期范围必须符合ISO 8609规范"
            }
          }
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

    this.$withinLast = $('span.withinLast', this.$form);
    this.$moreThan = $('span.moreThan', this.$form);
    this.$ago = $('span.ago', this.$form);
    this.$between = $('span.between', this.$form);
    this.$and = $('span.and', this.$form);
    this.$inRange = $('span.inRange', this.$form);
    this.$to = $('span.to', this.$form);
    this.$iso8601 = $('span.iso8601', this.$form);

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
    
    if(o.locale){
      _.merge(o.constraints, _.at(o, 'i18n.'+o.locale+'.constraints')[0]);
      if(o.locale == 'zh-CN'){
        $.datetimepicker.setLocale('ch');        
      }
    }

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
    var o = this.options, $option = $('input[type="radio"][value="'+o.option+'"]', this.$form);
    $('.custom-radio', this.$form).each(function(index){
      $(this).children('input').attr("id", o.name+index);
      $(this).children('label').attr("for", o.name+index);
    })
    this._on({'change input[type="radio"]': this._onRadioChanged});
    $option.prop('checked', true);
    $option.closest('.form-row').find('input[type!="radio"], select').prop('disabled', false);
    $(':not(:checked)[type="radio"]', this.$form).closest('.form-row').css('color','gray');

    this.$form.on('click', '.form-row>.col-auto', function(e){
      $(this).closest('.form-row').find('input[type="radio"]').prop('checked', true).trigger('change', e.target);
    });

    switch(o.option){
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
    
    if($target.val() == o.option) return;

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
    this.option({ option: $target.val(), earliest: null, latest:null, unit: null});
  },

  _refreshButton: function(){
    var o = this.options, label = o.title+':' + this._i18n('all','all');
    switch(o.option){
      case 'latest':
        if(o.earliest){
          label = o.title + this._i18n('withinLast',' within the last ') + o.earliest + " " + this._i18n(o.unit, o.unit);
        }
      break;
      case 'before':
        if(o.latest){
          label = o.title + this._i18n('moreThan', ' more than ') + o.latest + " " + this._i18n(o.unit, o.unit) + this._i18n('ago', ' ago ');
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
          label = o.title+':' + this._i18n('all','all');
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

    this.$withinLast.html(this._i18n('withinLast', 'Within the last'));
    this.$moreThan.html(this._i18n('moreThan', 'More than'));
    this.$ago.html(this._i18n('ago', ' ago'));
    this.$between.html(this._i18n('between', 'Between'));
    this.$and.html(this._i18n('and', 'and'));
    this.$inRange.html(this._i18n('inRange', 'In Range'));
    this.$to.html(this._i18n('to', 'to'));
    this.$iso8601.html(this._i18n('iso8601', ': P:Period, Y:Year, M:Month, D:Day, T:Time, H: Hour, M:Minute, S:Sencond'));

    
    let selects = '<option value="minutes" selected>'+ this._i18n('minutes','minutes')+'</option>' +
                  '<option value="hours">'+ this._i18n('hours','hours')+'</option>' +
                  '<option value="days">'+ this._i18n('days','days')+'</option>' +
                  '<option value="weeks">'+ this._i18n('weeks','weeks')+'</option>' +
                  '<option value="months">'+ this._i18n('months','months')+'</option>';
    this.$lUnit.html(selects);
    this.$bfUnit.html(selects);
    if(o.unit){
      this.$lUnit.val(o.unit);
      this.$bfUnit.val(o.unit);
    }

    this.$updateBtn.html(this._i18n('update', 'Update'));
    this.$resetBtn.html(this._i18n('reset', 'Reset'));
    this.$cancelBtn.html(this._i18n('cancel', 'Cancel'));
  },

  _doSubmit: function(dropdown){
    var o = this.options, errors = validate(this.$form, o.constraints);
    if (errors) {
      utils.showErrors(this.$form, errors);
    } else {
      var value = {option: o.option};
      switch(o.option){
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
      }

      this._refreshButton();
      this._trigger('valueChanged', null, value);

      if(!dropdown) this.element.trigger('click');
    }
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
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
    delete this.options.option;
    this.$form.find('input[type="radio"]:checked').prop('checked', false)
        .closest('.form-row').css('color','gray').find('input[type!="radio"], select').prop('disabled', true);
    
    utils.clearErrors(this.$form);
    this._doSubmit(true);
  },

  _onCancel: function(ev){
    this.element.trigger('click');
  }

});
