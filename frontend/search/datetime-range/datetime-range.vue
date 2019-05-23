<template>
  <div class="dropdown btn-group mr-1">
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
              <input type="radio" class="custom-control-input" name="radio-stacked" value="latest">
              <label class="custom-control-label"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0">
            <span class="withinLast">Within the last</span>
          </div>
          <div class="input-group input-group-sm col-auto px-0">
            <input
              type="text"
              class="form-control"
              name="lEarliest"
              style="max-width:50px"
              disabled
            >
            <div class="input-group-append">
              <select
                class="l-unit custom-select custom-select-sm border-left-0 rounded-right"
                disabled
              >
                <option value="minutes" selected>minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
              </select>
            </div>
            <div class="invalid-feedback"></div>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" name="radio-stacked" value="before">
              <label class="custom-control-label"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0">
            <span class="moreThan">More than</span>
          </div>
          <div class="input-group input-group-sm before col-auto px-0">
            <input type="text" class="form-control" name="bfLatest" style="max-width:50px" disabled>
            <div class="input-group-append">
              <select
                class="bf-unit custom-select custom-select-sm border-left-0 rounded-right"
                disabled
              >
                <option value="minutes" selected>minutes</option>
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
              </select>
            </div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-auto pt-1">
            <span class="ago">ago</span>
          </div>
        </div>
        <div class="form-row mb-3">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" name="radio-stacked" value="between">
              <label class="custom-control-label"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0">
            <span class="between">Between</span>
          </div>
          <div class="input-group input-group-sm bt col-auto px-0">
            <input type="text" class="form-control" name="btEarliest" autocomplete="off" disabled>
            <div class="input-group-append">
              <span class="input-group-text btEarliest-icon">
                <i class="fa fa-calendar"></i>
              </span>
            </div>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-auto pt-1">
            <span class="and">and</span>
          </div>
          <div class="input-group input-group-sm bt col-auto">
            <input type="text" class="form-control" name="btLatest" autocomplete="off" disabled>
            <div class="input-group-append">
              <span class="input-group-text btLatest-icon">
                <i class="fa fa-calendar"></i>
              </span>
            </div>
            <div class="invalid-feedback"></div>
          </div>
        </div>
        <div class="form-row">
          <div class="col-auto pt-1 pr-0">
            <div class="custom-control custom-radio">
              <input type="radio" class="custom-control-input" name="radio-stacked" value="range">
              <label class="custom-control-label"></label>
            </div>
          </div>
          <div class="col-auto pt-1 pl-0">
            <span class="inRange">In range</span>
          </div>
          <div class="col-auto px-0">
            <input
              type="text"
              class="form-control form-control-sm"
              name="rEarliest"
              placeholder="- P1Y2M3DT4H5M6S"
              style="max-width: 132px;"
              disabled
            >
            <div class="invalid-feedback" style="max-width: 132px;"></div>
          </div>
          <div class="col-auto pt-1">
            <span class="to">to</span>
          </div>
          <div class="col-auto px-0">
            <input
              type="text"
              class="form-control form-control-sm"
              name="rLatest"
              placeholder="P1Y2M3DT4H5M6S"
              style="max-width: 132px;"
              disabled
            >
            <div class="invalid-feedback" style="max-width: 132px;"></div>
          </div>
        </div>
        <div class="form-row mb-3">
          <small class="col-auto form-text text-muted ml-4">
            <a href="https://en.wikipedia.org/wiki/ISO_8601">ISO 8601:&nbsp</a>
            <span
              class="iso8601"
            >P:Period, Y:Year, M:Month, D:Day, T:Time, H: Hour, M:Minute, S:Sencond</span>
          </small>
        </div>
        <div class="form-group btn-group mb-1">
          <div class="peers ai-c jc-sb fxw-nw">
            <div class="peer">
              <button id="update" type="submit" class="btn btn-primary btn-sm" role="button">Update</button>
            </div>
            <div class="peer">
              <a
                href="javascript:void(0)"
                id="reset"
                class="btn btn-secondary btn-sm"
                role="button"
              >Reset</a>
            </div>
            <div class="peer">
              <a
                href="javascript:void(0)"
                id="cancel"
                class="btn btn-secondary btn-sm"
                role="button"
              >Cancel</a>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as $ from "jquery";
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
      lUnit: this.range.unit, 
      bfUnit: this.range.unit,
      lEarliest: this.range.earliest,
      bfLatest: this.range.latest,
      btEarliest: this.range.earliest,
      btLatest: this.range.latest,
      rEarliest: this.range.earliest,
      rLatest: this.range.latest
    };
  },
  props: {
    name: String,
    title: String,
    range: Object
    // option: String,
    // unit: {
    //   type: String,
    //   default: 'minutes' // minutes, hours, days, weeks, months
    // },
    // earliest: Number,
    // latest: Number
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
        iso8601:
          "P:Period, Y:Year, M:Month, D:Day, T:Time, H: Hour, M:Minute, S:Sencond"
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
        }
      }
    }
  },
  mounted() {
    console.log(this.$i18n.getLocaleMessage("cn"));
    // this.debouncedUpdateLowest = _.debounce(this.updateLowest, 500);
    // this.debouncedUpdateHighest = _.debounce(this.updateHighest, 500);
    let _this = this;
    this.$btEarliest.datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      onShow: function(ct) {
        this.setOptions({
          maxDate: _this.$btLatest.val() ? _this.$btLatest.val() : false
        });
      }
    });
    this.$btLatest.datetimepicker({
      format: "YYYY-MM-DD HH:mm:ss",
      onShow: function(ct) {
        this.setOptions({
          minDate: _this.$btEarliest.val() ? _this.$btEarliest.val() : false
        });
      }
    });
  },
  computed: {
    buttonText() {
      let label = `${this.title}:${this.$t("all")}`;
      switch (this.option) {
        case "latest":
          if (this.earliest) {
            label = `${this.title}${this.$t("withinLast")}${this.earliest} ${this.$t(this.unit)}`;
          }
          break;
        case "before":
          if (this.latest) {
            label = `${this.title}${this.$t("moreThan")}${this.latest} ${this.$t(this.unit)}${this.$t("ago")}`;
          }
          break;
        case "between":
          if (this.earliest && this.latest) {
            label = `${this.title}:${moment(this.earliest).format("YYYY-MM-DD")}~${moment(this.latest).format("YYYY-MM-DD")}`;
          } else if (this.earliest) {
            label = `${this.title}>=${moment(this.earliest).format("YYYY-MM-DD")}`;
          } else if (this.latest) {
            label = `${this.title}<=${moment(this.latest).format("YYYY-MM-DD")}`;
          } else {
            label = `${this.title}:${this.$t("all")}`;
          }
          break;
        case "range":          {
            var now = moment(),
              earliest,
              latest;
            if (this.earliest && this.latest) {
              earliest = now.clone().add(moment.duration(this.earliest)).format("YYYY-MM-DD");
              latest = now.clone().add(moment.duration(this.latest)).format("YYYY-MM-DD");
              label = `${this.title}:${earliest}~${latest}`;
            } else if (this.earliest) {
              label = `${this.title}>=${now.clone().add(moment.duration(this.earliest)).format("YYYY-MM-DD")}`;
            } else if (this.latest) {
              label = `${this.title}<=${now.clone().add(moment.duration(this.latest)).format("YYYY-MM-DD")}`;
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
      return this.$form.find('input[name="btEarliest"]');
    },
    $btLatest() {
      return this.$form.find('input[name="btLatest"]');
    },
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
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
          this.$emit("update:range", {option: this.option, unit: this.lUnit, earliest: this.lEarliest});
          break;
        case 'before':
          this.$emit("update:range", {option: this.option, unit: this.bfUnit, latest: this.bfLatest});
          break;
        case 'between':
          this.$emit("update:range", {option: this.option, earliest: this.btEarliest, latest: this.btLatest});
          break;
        case 'range':
          this.$emit("update:range", {option: this.option, earliest: this.rEarliest, latest: this.rLatest});
          break;
        default:
      }
    },
    onClearClick() {
      this.lUnit = undefined;
      this.bfUnit = undefined;
      this.lEarliest = undefined;
      this.bfLatest = undefined;
      this.btEarliest = undefined;
      this.btLatest = undefined;
      this.rEarliest = undefined;
      this.rLatest = undefined;
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown-menu {
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
  }
}

.messages {
  p {
    margin-bottom: 0px;
  }
}

.btn-group {
  margin-bottom: 0px;
}
</style>
