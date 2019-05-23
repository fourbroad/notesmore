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
import { setTimeout } from "timers";

const constraints = {
  lowestInput: {
    numericality: function(
      value,
      attributes,
      attributeName,
      options,
      constraints
    ) {
      if (!attributes.highestInput) return null;
      return { lessThanOrEqualTo: Number(attributes.highestInput) };
    }
  },
  highestInput: {
    numericality: function(
      value,
      attributes,
      attributeName,
      options,
      constraints
    ) {
      if (!attributes.lowestInput) return null;
      return { greaterThanOrEqualTo: Number(attributes.lowestInput) };
    }
  }
};

export default {
  name: "NumericRange",
  data() {
    return {
      errors: {},
      lowestInput: this.lowestValue,
      highestInput: this.highestValue
    };
  },
  props: {
    name: String,
    title: String,
    lowestValue: Number,
    highestValue: Number
  },
  i18n: {
    messages: {
      en: {
        all: "All",
        lowestLabel: "Lowest Value",
        lowestPlaceholder: "Lowest value",
        highestLabel: "Highest Value",
        highestPlaceholder: "Highest value"
      },
      cn: {
        all: "全部",
        lowestLabel: "最小值",
        lowestPlaceholder: "最小值",
        highestLabel: "最大值",
        highestPlaceholder: "最大值"
      }
    }
  },
  mounted() {
    this.debouncedUpdateLowest = _.debounce(this.updateLowest, 500);
    this.debouncedUpdateHighest = _.debounce(this.updateHighest, 500);
  },
  computed: {
    buttonText() {
      var label = "";
      if (this.lowestValue && this.highestValue) {
        label = this.title + ":" + this.lowestValue + "-" + this.highestValue;
      } else if (this.lowestValue) {
        label = this.title + ">=" + this.lowestValue;
      } else if (this.highestValue) {
        label = this.title + "<=" + this.highestValue;
      } else {
        label = this.title + ":" + this.$t("all");
      }
      return label;
    },
    $form() {
      return $(this.$el).find("form");
    },
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    lowestInput(newValue, oldValue) {
      this.errors = validate(this.$data, constraints) || {};
      if (_.isEmpty(this.errors)) {
        this.debouncedUpdateLowest();
      }
    },
    highestInput(newValue, oldValue) {
      this.errors = validate(this.$data, constraints) || {};
      if (_.isEmpty(this.errors)) {
        this.debouncedUpdateHighest();
      }
    }
  },
  methods: {
    updateLowest() {
      this.$emit("update:lowestValue", this.lowestInput);
    },
    updateHighest() {
      this.$emit("update:highestValue", this.highestInput);
    },
    onClearClick() {
      this.lowestInput = undefined;
      this.highestInput = undefined;
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
