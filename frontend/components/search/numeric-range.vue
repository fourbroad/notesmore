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
        <div class="form-group">
          <label for="lowestInput">{{$t('lowestLabel')}}</label>
          <input
            id="lowestInput"
            type="number"
            class="form-control form-control-sm"
            :class="{'is-invalid':errors.lowestInput&&errors.lowestInput.length > 0}"
            name="lowestInput"
            v-model.trim.number="lowestInput"
            :placeholder="$t('lowestPlaceholder')">
          <div class="invalid-feedback">
            <span v-for="(error, index) in errors.lowestInput" :key="index">{{error}}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="highestInput">{{$t('highestLabel')}}</label>
          <input
            id="highestInput"
            type="number"
            class="form-control form-control-sm"
            :class="{'is-invalid':errors.highestInput&&errors.highestInput.length > 0}"
            name="highestInput"
            v-model.trim.number="highestInput"
            :placeholder="$t('highestPlaceholder')">
          <div class="invalid-feedback">
            <span v-for="(error, index) in errors.highestInput" :key="index">{{error}}</span>
          </div>
        </div>
        <a
          href="javascript:void(0)"
          class="px-2"
          :class="{disabled:lowestInput==''&&highestInput==''}"
          @click="onClearClick"
        >{{$t('clearAll')}}</a>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as $ from "jquery";
import validate from "validate.js";

const constraints = {
  lowestInput: {
    numericality(value, attributes, attributeName, options, constraints) {
      if (!attributes.highestInput || value == '') return null;
      return { lessThanOrEqualTo: Number(attributes.highestInput) };
    }
  },
  highestInput: {
    numericality(value, attributes, attributeName, options, constraints) {
      if (!attributes.lowestInput || value=='') return null;
      return { greaterThanOrEqualTo: Number(attributes.lowestInput) };
    }
  }
};

export default {
  name: "NumericRange",
  data() {
    return {
      errors: {},
      lowestInput: this.range.lowestValue !=  undefined ? this.range.lowestValue : '',
      highestInput: this.range.highestValue !=  undefined ? this.range.highestValue : ''
    };
  },
  props: {
    name: String,
    title: String,
    range:{
      type:Object,
      default(){
        return {}
      }
    }
  },
  i18n: {
    messages: {
      en: {
        all: "All",
        lowestLabel: "Lowest Value",
        lowestPlaceholder: "Lowest value",
        highestLabel: "Highest Value",
        highestPlaceholder: "Highest value",
        clearAll: "Clear all values"
      },
      cn: {
        all: "全部",
        lowestLabel: "最小值",
        lowestPlaceholder: "最小值",
        highestLabel: "最大值",
        highestPlaceholder: "最大值",
        clearAll: "清除所有值"
      }
    }
  },
  mounted() {
    this.debouncedUpdateRange = _.debounce(this.updateRange, 500);
  },
  computed: {
    buttonText() {
      var label = "", lowestValue = this.range.lowestValue, highestValue = this.range.highestValue;
      if (lowestValue && highestValue) {
        label = this.title + ":" + lowestValue + "-" + highestValue;
      } else if (lowestValue) {
        label = this.title + ">=" + lowestValue;
      } else if (highestValue) {
        label = this.title + "<=" + highestValue;
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
        this.debouncedUpdateRange();
      }
    },
    highestInput(newValue, oldValue) {
      this.errors = validate(this.$data, constraints) || {};
      if (_.isEmpty(this.errors)) {
        this.debouncedUpdateRange();
      }
    }
  },
  methods: {
    updateRange(){
      if(this.lowestInput != '' || this.highestInput != ''){
        let range = {};
        if(this.lowestInput != ''){
          range.lowestValue = this.lowestInput;
        }
        if(this.highestInput != ''){
          range.highestValue = this.highestInput;
        }
        this.$emit('update:range', range);
      } else {
        this.$emit('update:range', undefined);
      }     
    },
    onClearClick() {
      this.lowestInput = '';
      this.highestInput = '';
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
  min-width: 220px;

  a.disabled {
    color: #c3c3c3;
  }
}
</style>
