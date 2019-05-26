<template>
  <div class="search-item dropdown btn-group mr-1">
    <button
      class="btn btn-outline-secondary btn-sm dropdown-toggle"
      type="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >{{buttonText}}</button>
    <div class="dropdown-menu px-1">
      <form class="px-2">
        <div class="form-row mb-3 mt-2">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" :id="name+'-latest'" name="radio-stacked" value="latest" v-model="option">
              <label class="custom-control-label" :for="name+'-latest'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='latest'">
            <span class="withinLast">{{$t('withinLast')}}</span>
          </div>
          <div class="input-group input-group-sm col-auto px-0" @click="option='latest'">
            <input
              type="text"
              class="form-control"
              name="lEarliest"
              ref="lEarliest"
              style="max-width:50px"
              v-model="lEarliest"
              :disabled="option!='latest'"              
            >
            <div class="input-group-append">
              <select
                class="l-unit custom-select custom-select-sm border-left-0 rounded-right"
                v-model="lUnit"
                :disabled="option!='latest'"
              >
                <option value="minutes" selected>{{$t('minutes')}}</option>
                <option value="hours">{{$t('hours')}}</option>
                <option value="days">{{$t('days')}}</option>
                <option value="weeks">{{$t('weeks')}}</option>
                <option value="months">{{$t('months')}}</option>
              </select>
            </div>
            <div class="invalid-feedback"></div>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" :id="name+'-before'" name="radio-stacked" value="before" v-model="option">
              <label class="custom-control-label" :for="name+'-before'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='before'">
            <span class="moreThan">{{$t('moreThan')}}</span>
          </div>
          <div class="input-group input-group-sm before col-auto px-0" @click="option='before'">
            <input type="text" class="form-control" name="bfLatest" ref="bfLatest" v-model="bfLatest" style="max-width:50px" :disabled="option!='before'">
            <div class="input-group-append">
              <select
                class="bf-unit custom-select custom-select-sm border-left-0 rounded-right"
                v-model="bfUnit"
                :disabled="option!='before'"
              >
                <option value="minutes" selected>{{$t('minutes')}}</option>
                <option value="hours">{{$t('hours')}}</option>
                <option value="days">{{$t('days')}}</option>
                <option value="weeks">{{$t('weeks')}}</option>
                <option value="months">{{$t('months')}}</option>
              </select>
            </div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-auto pt-1" @click="option='before'">
            <span class="ago">{{$t('ago')}}</span>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" :id="name+'-between'" name="radio-stacked" value="between" v-model="option">
              <label class="custom-control-label" :for="name+'-between'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='between'">
            <span class="between">{{$t('between')}}</span>
          </div>
          <div class="input-group input-group-sm bt col-auto px-0" @click="option='between'">
            <input type="text" class="form-control" name="btEarliest" v-model="btEarliest" ref="btEarliest" autocomplete="off" :disabled="option!='between'">
            <div class="input-group-append">
              <span class="input-group-text btEarliest-icon" @click="$refs.btEarliest.focus()">
                <i class="fa fa-calendar"></i>
              </span>
            </div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-auto pt-1" @click="option='between'">
            <span class="and">{{$t('and')}}</span>
          </div>
          <div class="input-group input-group-sm bt col-auto" @click="option='between'">
            <input type="text" class="form-control" name="btLatest" ref="btLatest" v-model="btLatest" autocomplete="off" :disabled="option!='between'">
            <div class="input-group-append">
              <span class="input-group-text btLatest-icon" @click="$refs.btLatest.focus()">
                <i class="fa fa-calendar"></i>
              </span>
            </div>
            <div class="invalid-feedback"></div>
          </div>
        </div>
        <div class="form-row">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" :id="name+'-range'" name="radio-stacked" value="range" v-model="option">
              <label class="custom-control-label" :for="name+'-range'"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0" @click="option='range'">
            <span class="inRange">{{$t('inRange')}}</span>
          </div>
          <div class="col-auto px-0" @click="option='range'">
            <input
              type="text"
              class="form-control form-control-sm"
              name="rEarliest"
              ref="rEarliest"
              v-model.trim="rEarliest"
              placeholder="- P1Y2M3DT4H5M6S"
              style="max-width: 132px;"
              :disabled="option!='range'"
            >
            <div class="invalid-feedback" style="max-width: 132px;"></div>
          </div>
          <div class="col-auto pt-1" @click="option='range'">
            <span class="to">{{$t('to')}}</span>
          </div>
          <div class="col-auto px-0" @click="option='range'">
            <input
              type="text"
              class="form-control form-control-sm"
              name="rLatest"
              ref="rLatest"
              v-model.trim="rLatest"
              placeholder="P1Y2M3DT4H5M6S"
              style="max-width: 132px;"
              :disabled="option!='range'"
            >
            <div class="invalid-feedback" style="max-width: 132px;"></div>
          </div>
        </div>
        <div class="form-row mb-3" @click="option='range'">
          <small class="col-auto form-text text-muted ml-4">
            <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601:&nbsp</a>
            <span
              class="iso8601"
            >{{$t('iso8601')}}</span>
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
  lEarliest: {
    presence: false,
    numericality: {
      onlyInteger: true,
      greaterThan: 0
    }
  },
  bfLatest: {
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
  name: "DatetimeRange",
  data() {
    return {
      errors: {},
      option: this.range.option,
      lUnit: this.range.unit||'minutes', 
      bfUnit: this.range.unit||'minutes',
      lEarliest: this.range.earliest,
      bfLatest: this.range.latest,
      btEarliest: this.range.earliest,
      btLatest: this.range.latest,
      rEarliest: this.range.sEarliest,
      rLatest: this.range.sLatest
    };
  },
  props: {
    name: String,
    title: String,
    range: {
      type:Object,
      default() {
        return {}
      }
    }
  },
  i18n: {
    messages: {
      en: {
        all: "All",
        withinLast: "Within the last",
        moreThan: "More than",
        ago: "ago",
        between: "Between",
        and: "and",
        inRange: "In range",
        to: "to",
        minutes: "minutes",
        hours: "hours",
        days: "days",
        weeks: "weeks",
        months: "months",
        iso8601: "P:Period, Y:Year, M:Month, D:Day, T:Time, H: Hour, M:Minute, S:Sencond",
        clearAll: "Clear all options"
      },
      cn: {
        all: "全部",
        withinLast: "最近",
        moreThan: "超过",
        ago: "之前",
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
          lEarliest: {
            numericality: {
              message: "请输入大于0的整数"
            }
          },
          bfLatest: {
            numericality: {
              message: "请输入大于0的整数"
            }
          },
          rEarliest: {
            format: {
              message: "日期范围必须符合ISO 8609规范"
            }
          },
          rLatest: {
            format: {
              message: "日期范围必须符合ISO 8609规范"
            }
          }
        },
        clearAll: "清除所有选项"
      }
    }
  },
  mounted() {
    console.log(this.$i18n.getLocaleMessage("cn"));

    this.debouncedUpdateRange = _.debounce(this.updateRange, 500);

    let _this = this;
    $.datetimepicker.setDateFormatter('moment');
    this.$btEarliest.datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      onShow(ct) {
        this.setOptions({
          maxDate: _this.$btLatest.val() ? _this.$btLatest.val() : false
        });
      },
      onChangeDateTime(dp,$input){
        _this.btEarliest = $input.val();
      }      
    });
    this.$btLatest.datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      onShow: function(ct) {
        this.setOptions({
          minDate: _this.$btEarliest.val() ? _this.$btEarliest.val() : false
        });
      },
      onChangeDateTime(dp,$input){
        _this.btLatest = $input.val();
      }      
    });
  },
  computed: {
    buttonText() {
      let label = `${this.title}:${this.$t("all")}`;
      let option = this.range.option, earliest = this.range.earliest, latest = this.range.latest, unit = this.range.unit,
        rEarliest = this.range.sEarliest, rLatest = this.range.sLatest;
      switch (option) {
        case "latest":
          if (earliest) {
            label = `${this.title}${this.$t("withinLast")}${earliest} ${this.$t(unit)}`;
          }
          break;
        case "before":
          if (latest) {
            label = `${this.title}${this.$t("moreThan")}${latest} ${this.$t(unit)}${this.$t("ago")}`;
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
        case "range":{
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
    //   _.merge(o.constraints, _.at(o, "i18n." + this.locale + ".constraints")[0]);
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
    lUnit(newValue, oldValue) {
      this.updateRange();
    },
    bfUnit(newValue, oldValue) {
      this.updateRange();
    },
    lEarliest(newValue, oldValue) {
      this.debouncedUpdateRange();
    },
    bfLatest(newValue, oldValue) {
      this.debouncedUpdateRange();
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
      switch(this.option){
        case 'latest':
          if(this.lEarliest != undefined){
            this.$emit("update:range", {option: this.option, unit: this.lUnit, earliest: this.lEarliest});
          }else{
            this.$emit("update:range", undefined);
          }
          break;
        case 'before':
          if(this.bfLatest != undefined){
            this.$emit("update:range", {option: this.option, unit: this.bfUnit, latest: this.bfLatest});
          }else{
            this.$emit("update:range", undefined);
          }
          break;
        case 'between':
          if(this.btEarliest != undefined || this.btLatest != undefined){
            let range = {option: this.option}
            if(this.btEarliest != undefined) range.earliest = +moment(this.btEarliest);
            if(this.btLatest != undefined) range.latest = +moment(this.btLatest);
            this.$emit("update:range", range);

          }else{
            this.$emit("update:range", undefined);
          }
          break;
        case 'range':
          if(this.rEarliest != undefined || this.rLatest != undefined){
            let range = {option: this.option}
            if(this.rEarliest != '') range.sEarliest = this.rEarliest;
            if(this.rLatest != '') range.sLatest = this.rLatest;
            this.$emit("update:range", range);
          }else{
            this.$emit("update:range", undefined);
          }
          break;
        default:
          this.$emit("update:range", undefined);
      }
    },
    onClearClick() {
      this.option = undefined;
      this.lEarliest = undefined;
      this.bfLatest = undefined;
      this.btEarliest = undefined;
      this.btLatest = undefined;
      this.rEarliest = '';
      this.rLatest = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.search-item {
  font-size: 0.8rem;
  padding-bottom: 5px;
  margin-right: 2px;
}
.btn {
  border-color: lightgray;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-menu {
  font-size: 0.9rem;
  
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
