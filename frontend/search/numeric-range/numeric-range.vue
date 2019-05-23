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
        <div class="form-group">
          <label for="lowestInput">Lowest value</label>
          <input
            id="lowestInput"
            type="number"
            class="form-control form-control-sm"
            :class="{'is-invalid':errors.lowestInput&&errors.lowestInput.length > 0}"
            name="lowestInput"
            v-model.number.trim="lowestInput"
            placeholder="Lowest value"
          >
          <div class="invalid-feedback">
            <span v-for="(error, index) in errors.lowestInput" :key="index">{{error}}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="highestInput">Highest value</label>
          <input
            id="highestInput"
            type="number"
            class="form-control form-control-sm"
            :class="{'is-invalid':errors.highestInput&&errors.highestInput.length > 0}"
            name="highestInput"
            v-model.number.trim="highestInput"
            placeholder="Highest value"
          >
          <div class="invalid-feedback">
            <span v-for="(error, index) in errors.highestInput" :key="index">{{error}}</span>
          </div>
        </div>
        <a
          href="javascript:void(0)"
          class="px-2"
          :class="{disabled:lowestInput==undefined&&highestInput==undefined}"
          @click="onClearClick"
        >Clear all values</a>
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
  min-width: 220px;

  a.disabled {
    color: #c3c3c3;
  }
}
</style>
