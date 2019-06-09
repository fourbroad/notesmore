<template>
  <div class="search-item dropdown btn-group mr-1">
    <button
      class="btn btn-outline-secondary btn-sm dropdown-toggle"
      type="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false">
      {{buttonText}}
    </button>
    <div class="dropdown-menu px-1">
      <form class="px-2">
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" :id="name+'-overdue'" class="custom-control-input" name="radio-stacked" value="overdue" v-model="option">
              <label class="custom-control-label" :for="name+'-overdue'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='overdue'">
            <span class="overdue">{{$t('overdue')}}</span>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" :id="name+'-overdue-more'" class="custom-control-input" name="radio-stacked" value="overdue_more" v-model="option">
              <label class="custom-control-label" :for="name+'-overdue-more'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='overdue_more'">
            <span class="overdueMore">{{$t('overdueMore')}}</span>
          </div>
          <div class="input-group input-group-sm before col-auto px-0" @click="option='overdue_more'">
            <input 
              type="text" 
              name="odMore" 
              class="form-control" 
              :class="{'is-invalid':errors.odMore&&errors.odMore.length > 0}"
              ref="odMore"
              style="max-width:50px"
              v-model="odMore"
              :disabled="option!='overdue_more'">
            <div class="input-group-append">
              <select 
                class="o-unit custom-select custom-select-sm border-left-0 rounded-right" 
                v-model="oUnit"
                :disabled="option!='overdue_more'">
                <option value="minutes" selected>{{$t('minutes')}}</option>
                <option value="hours">{{$t('hours')}}</option>
                <option value="days">{{$t('days')}}</option>
                <option value="weeks">{{$t('weeks')}}</option>
                <option value="months">{{$t('months')}}</option>
              </select>
            </div>
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.odMore" :key="index">{{error}}</span>
            </div>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input :id="name+'-expire-yn'" type="radio" class="custom-control-input" name="radio-stacked" value="expire_yn" v-model="option">
              <label class="custom-control-label" :for="name+'-expire-yn'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='expire_yn'">
            <span class="inNext">{{$t('inNext')}}</span>
          </div>
          <div class="input-group input-group-sm before col-auto px-0" @click="option='expire_yn'">
            <input 
              type="text" 
              name="expireYn" 
              class="form-control" 
              :class="{'is-invalid':errors.expireYn&&errors.expireYn.length > 0}"
              ref="expireYn" 
              v-model="expireYn" 
              style="max-width:50px" 
              :disabled="option!='expire_yn'">
            <div class="input-group-append">
              <select 
                class="e-unit custom-select custom-select-sm border-left-0 rounded-right"
                v-model="eUnit"
                :disabled="option!='expire_yn'">
                <option value="minutes" selected>{{$t('minutes')}}</option>
                <option value="hours">{{$t('hours')}}</option>
                <option value="days">{{$t('days')}}</option>
                <option value="weeks">{{$t('weeks')}}</option>
                <option value="months">{{$t('months')}}</option>
              </select>
            </div>
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.expireYn" :key="index">{{error}}</span>              
            </div>
          </div>
          <div class="col-auto pt-1" v-if="locale=='zh-CN'">
            <span>之内</span>
          </div>
          <div class="col-auto">
            <select 
              class="will-yn custom-select custom-select-sm"
              v-model="willYn"
              :disabled="option!='expire_yn'">
              <option value="yes" selected>{{$t('willBeOverdue')}}</option>
              <option value="no">{{$t('willNotBeOverdue')}}</option>
            </select>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input
                type="radio"
                class="custom-control-input"
                :id="name+'-between'"
                name="radio-stacked"
                value="between"
                v-model="option"
              >
              <label class="custom-control-label" :for="name+'-between'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='between'">
            <span class="between">{{$t('between')}}</span>
          </div>
          <div class="input-group input-group-sm bt col-auto px-0" @click="option='between'">
            <input
              type="text"
              name="btEarliest"
              class="form-control"
              :class="{'is-invalid':errors.btEarliest&&errors.btEarliest.length > 0}"
              v-model="btEarliest"
              ref="btEarliest"
              autocomplete="off"
              :disabled="option!='between'">
            <div class="input-group-append">
              <span class="input-group-text btEarliest-icon" @click="$refs.btEarliest.focus()">
                <i class="fa fa-calendar"></i>
              </span>
            </div>
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.btEarliest" :key="index">{{error}}</span>
            </div>
          </div>
          <div class="col-auto pt-1" @click="option='between'">
            <span class="and">{{$t('and')}}</span>
          </div>
          <div class="input-group input-group-sm bt col-auto" @click="option='between'">
            <input
              type="text"
              name="btLatest"
              class="form-control"
              :class="{'is-invalid':errors.btLatest&&errors.btLatest.length > 0}"
              ref="btLatest"
              v-model="btLatest"
              autocomplete="off"
              :disabled="option!='between'"
            >
            <div class="input-group-append">
              <span class="input-group-text btLatest-icon" @click="$refs.btLatest.focus()">
                <i class="fa fa-calendar"></i>
              </span>
            </div>
            <div class="invalid-feedback">
              <span v-for="(error, index) in errors.btLatest" :key="index">{{error}}</span>
            </div>
          </div>
        </div>
        <div class="form-row">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input
                type="radio"
                class="custom-control-input"
                :id="name+'-range'"
                name="radio-stacked"
                value="range"
                v-model="option"
              >
              <label class="custom-control-label" :for="name+'-range'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='range'">
            <span class="inRange">{{$t('inRange')}}</span>
          </div>
          <div class="col-auto px-0" @click="option='range'">
            <input
              type="text"
              name="rEarliest"
              class="form-control form-control-sm"
              :class="{'is-invalid':errors.rEarliest&&errors.rEarliest.length > 0}"
              ref="rEarliest"
              v-model.trim="rEarliest"
              placeholder="- P1Y2M3DT4H5M6S"
              style="max-width: 132px;"
              :disabled="option!='range'"
            >
            <div class="invalid-feedback" style="max-width: 132px;">
              <span v-for="(error, index) in errors.rEarliest" :key="index">{{error}}</span>
            </div>
          </div>
          <div class="col-auto pt-1" @click="option='range'">
            <span class="to">{{$t('to')}}</span>
          </div>
          <div class="col-auto px-0" @click="option='range'">
            <input
              type="text"
              name="rLatest"
              class="form-control form-control-sm"
              :class="{'is-invalid':errors.rLatest&&errors.rLatest.length > 0}"
              ref="rLatest"
              v-model.trim="rLatest"
              placeholder="P1Y2M3DT4H5M6S"
              style="max-width: 132px;"
              :disabled="option!='range'"
            >
            <div class="invalid-feedback" style="max-width: 132px;">
              <span v-for="(error, index) in errors.rLatest" :key="index">{{error}}</span>
            </div>
          </div>
        </div>
        <div class="form-row mb-3" @click="option='range'">
          <small class="col-auto form-text text-muted ml-4">
            <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601:&nbsp</a>
            <span class="iso8601">{{$t('iso8601')}}</span>
          </small>
        </div>
        <a
          href="javascript:void(0)"
          class="px-2"
          :class="{disabled:option==undefined}"
          @click="onClearClick"
        >{{$t('clearAll')}}</a>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import validate from "validate.js";
import "jquery-datetimepicker";
import "jquery-datetimepicker/jquery.datetimepicker.css";

const isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,
  isoMessage = "^Date range must comply with ISO 8609 specifications";

const constraints = {
  odMore:{
    presence: false,
    numericality: {
      onlyInteger: true,
      greaterThan: 0
    }
  },
  expireYn:{
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
};

validate.extend(validate.validators.datetime, {
  parse: function(value, options) {
    return +moment(value);
  },

  format: function(value, options) {
    var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
    return moment(value).format(format);
  }
});

export default {
  name: "DatetimeDuedate",
  data() {
    return {
      errors: {},
      option: this.range.option,
      oUnit: this.range.unit || "minutes",
      eUnit: this.range.unit || "minutes",
      odMore: this.range.latest || "",
      willYn: this.range.willYn || "yes",
      expireYn: this.range.willYn ? (this.range.latest || "") : (this.range.earliest||""),
      btEarliest: this.range.earliest || "",
      btLatest: this.range.latest || "",
      rEarliest: this.range.sEarliest || "",
      rLatest: this.range.sLatest || ""
    };
  },
  props: {
    name: String,
    title: String,
    range: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  i18n: {
    messages: {
      en: {
        all: "All",
        overdue: "Overdue",
        overdueMore: "Overdue for more than",
        inNext: "In next",
        willBeOverdue: "将会逾期",
        willNotBeOverdue: "不会逾期",
        between: "Between",
        and: "and",
        inRange: "In range",
        to: "to",
        minutes: "minutes",
        hours: "hours",
        days: "days",
        weeks: "weeks",
        months: "months",
        iso8601:
          "P:Period, Y:Year, M:Month, D:Day, T:Time, H: Hour, M:Minute, S:Sencond",
        clearAll: "Clear all options"
      },
      cn: {
        all: "全部",
        overdue: "已逾期",
        overdueMore: "逾期超过",
        inNext: "在未来",
        willBeOverdue: "将会逾期",
        willNotBeOverdue: "不会逾期",
        between: "从",
        and: "到",
        inRange: "从",
        to: "到",
        minutes: "分钟",
        hours: "小时",
        days: "天",
        weeks: "周",
        months: "月",
        iso8601: "P:期间, Y:年, M:月, D:日, T:时间, H:小时, M:分钟, S:秒",
        constraints: {
          odMore:{
            numericality:{
              message: "^请输入大于0的整数"
            }
          },
          expireYn:{
            numericality:{
              message: "^请输入大于0的整数"
            }
          },
          rEarliest:{
            format:{
              message: "^日期范围必须符合ISO 8609规范"
            }
          },
          rLatest:{
            format:{
              message: "^日期范围必须符合ISO 8609规范"
            }
          }
        },
        clearAll: "清除所有选项"
      }
    }
  },
  mounted() {
    this.debouncedUpdateRange = _.debounce(this.updateRange, 500);

    let vm = this;
    $.datetimepicker.setDateFormatter("moment");
    if (this.$i18n.locale == "cn") {
      $.datetimepicker.setLocale("ch");
    }

    this.$btEarliest.datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      onShow(ct) {
        this.setOptions({
          maxDate: vm.$btLatest.val() ? vm.$btLatest.val() : false
        });
      },
      onChangeDateTime(dp, $input) {
        vm.btEarliest = $input.val();
      }
    });
    this.$btLatest.datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      onShow: function(ct) {
        this.setOptions({
          minDate: vm.$btEarliest.val() ? vm.$btEarliest.val() : false
        });
      },
      onChangeDateTime(dp, $input) {
        vm.btLatest = $input.val();
      }
    });
  },
  computed: {
    buttonText() {
      let label = `${this.title}:${this.$t("all")}`;
      let option = this.range.option,
        willYn = this.range.willYn,
        earliest = this.range.earliest,
        latest = this.range.latest,
        unit = this.range.unit,
        rEarliest = this.range.sEarliest,
        rLatest = this.range.sLatest;
      switch (option) {
        case 'overdue':
          label = `${this.title}${this.$t("overdue")}`;
          break;
        case 'overdue_more':
          if(latest){
            label = `${this.title}${this.$t("overdueMore")}${latest}${this.$t(unit)}`;
          }
          break;
        case 'expire_yn':
          if(willYn == 'yes' && latest){
            if(this.locale == 'zh-CN'){
              label = `${this.title}将会在${latest}${this.$t(unit)}之内逾期`;
            } else {
              label = `${this.title}${this.$t('willBeOverdue')}${latest}${this.$t(unit)}`;
            }
          } else if(willYn == 'no' && earliest){
            if(this.locale == 'zh-CN'){
              label = `${this.title}将会在${earliest}${this.$t(unit)}之后逾期`;
            } else {
              label = `${this.title}${this.$t('willNotBeOverdue')}${earliest}${this.$t(unit)}`;
            }
          }
          break;
        case "between":
          if (earliest && latest) {
            label = `${this.title}:${moment(earliest).format("YYYY-MM-DD")}~${moment(latest).format("YYYY-MM-DD")}`;
          } else if (earliest) {
            label = `${this.title}>=${moment(earliest).format("YYYY-MM-DD")}`;
          } else if (latest) {
            label = `${this.title}<=${moment(latest).format("YYYY-MM-DD")}`;
          } else {
            label = `${this.title}:${this.$t("all")}`;
          }
          break;
        case "range":
          {
            let now = moment();
            if (rEarliest && rLatest) {
              let earliestTmp, latestTmp;
              earliestTmp = now.clone().add(moment.duration(rEarliest)).format("YYYY-MM-DD");
              latestTmp = now.clone().add(moment.duration(rLatest)).format("YYYY-MM-DD");
              label = `${this.title}:${earliestTmp}~${latestTmp}`;
            } else if (rEarliest) {
              label = `${this.title}>=${now.clone().add(moment.duration(rEarliest)).format("YYYY-MM-DD")}`;
            } else if (rLatest) {
              label = `${this.title}<=${now.clone().add(moment.duration(rLatest)).format("YYYY-MM-DD")}`;
            }
          }
          break;
        default:
          break;
      }
      return label;
    },
    constraints() {
      return _.merge(_.cloneDeep(constraints),_.at(this.$i18n.getLocaleMessage(this.$i18n.locale), "constraints")[0]
      );
    },
    $form() {
      return $(this.$el).find("form");
    },
    $btEarliest() {
      return $(this.$refs.btEarliest);
    },
    $btLatest() {
      return $(this.$refs.btLatest);
    },
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    option(newValue, oldValue) {
      this.updateRange();
    },
    odMore(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    oUnit(newValue, oldValue) {
      this.updateRange();
    },
    willYn(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    expireYn(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    eUnit(newValue, oldValue) {
      this.updateRange();
    },
    btEarliest(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    btLatest(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    rEarliest(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    rLatest(newValue, oldValue) {
      this.debouncedUpdateRange();
    }
  },
  methods: {
    updateRange() {
      switch (this.option) {
        case 'overdue':
          this.$emit('update:range',{option: this.option});
          break;
        case 'overdue_more':
          if(this.odMore != ""){
            let data = {odMore: this.odMore};
            this.errors = validate(data, this.constraints)||{};
            if(_.isEmpty(this.errors)){
              this.$emit('update:range',{
                option: this.option,
                unit: this.oUnit,
                latest: this.odMore
              });
            }
          }else{
            this.errors = {};
            this.$emit('update:range',undefined);
          }
          break;
        case 'expire_yn':
          if(this.expireYn!=""){
            let data = {expireYn: this.expireYn};
            this.errors = validate(data, this.constraints)||{};
            if(_.isEmpty(this.errors)){
              let range = {option: this.option, willYn: this.willYn, unit: this.eUnit}
              if(this.willYn == 'yes'){
                range.latest = this.expireYn
              } else {
                range.earliest = this.expireYn
              }
              this.$emit('update:range', range)
            }
          }else{
            this.errors = {};
            this.$emit('update:range',undefined);
          }
          break;
        case "between":
          if (this.btEarliest != "" || this.btLatest != "") {
            let data = {};
            if (this.btEarliest != "") data.btEarliest = this.btEarliest;
            if (this.btLatest != "") data.btLatest = this.btLatest;
            this.errors = validate(data, this.constraints) || {};
            if (_.isEmpty(this.errors)) {
              let range = { option: this.option };
              if (this.btEarliest != "")
                range.earliest = +moment(this.btEarliest);
              if (this.btLatest != "") range.latest = +moment(this.btLatest);
              this.$emit("update:range", range);
            }
          } else {
            this.errors = {};
            this.$emit("update:range", undefined);
          }
          break;
        case "range":
          if (this.rEarliest != "" || this.rLatest != "") {
            let data = {};
            if (this.rEarliest != "") data.rEarliest = this.rEarliest;
            if (this.rLatest != "") data.rLatest = this.rLatest;
            this.errors = validate(data, this.constraints) || {};
            if (_.isEmpty(this.errors)) {
              let range = { option: this.option };
              if (this.rEarliest != "") range.sEarliest = this.rEarliest;
              if (this.rLatest != "") range.sLatest = this.rLatest;
              this.$emit("update:range", range);
            }
          } else {
            this.errors = {};
            this.$emit("update:range", undefined);
          }
          break;
        default:
          this.errors = {};
          this.$emit("update:range", undefined);
      }
    },
    onClearClick() {
      this.option = undefined;
      this.odMore = "";
      this.expireYn = "";
      this.btEarliest = "";
      this.btLatest = "";
      this.rEarliest = "";
      this.rLatest = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.btn {
  border-color: lightgray;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-menu {
  font-size: 0.875rem;

  form {
    width: 504px;
    .form-row {
      .invalid-feedback {
        p {
          margin-bottom: -8px;
        }
      }
      .input-group {
        width: auto;

        &.bt {
          input[name="btEarliest"] {
            width: 150px;
            &.is-invalid {
              width: 82px;
            }
          }
          input[name="btLatest"] {
            width: 150px;
            &.is-invalid {
              width: 82px;
            }
          }
          .invalid-feedback {
            p {
              max-width: 194px;
              margin-right: -126px;
              margin-bottom: -10px;
            }
          }
        }
        &.before {
          .invalid-feedback {
            p {
              max-width: 350px;
              margin-right: -88px;
              margin-bottom: -10px;
            }
          }
        }
      }
    }

    a.disabled {
      color: #c3c3c3;
    }
  }
}

.btn-group {
  margin-bottom: 0px;
}
</style>
