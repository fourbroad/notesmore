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
          <label for="contains-text" class="sr-only">Contains text:</label>
          <input
            id="contains-text"
            type="text"
            name="containsText"
            v-model.trim="text"
            class="contains-text form-control form-control-sm"
            　placeholder="Contains text"
          >
          <small class="remark　form-text text-muted"></small>
        </div>
        <a
          href="javascript:void(0)"
          class="clear-contains-text px-2"
          :class="{disabled:text==''}"
          @click="text=''"
        >Clear contains text</a>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "ContainsText",
  data() {
    return {
      error: null,
      text: this.containsText
    };
  },
  props: {
    name: String,
    title: String,
    containsText: {
      type: String,
      default: ""
    }
  },
  i18n: {
    messages: {
      en: {
        all: "All",
        contains: "contains",
        containsTextPlaceholder: "contains text"
      },
      cn: {
        all: "全部",
        contains: "包含",
        containsTextPlaceholder: "包含文本"
      }
    }
  },
  mounted() {
    this.debouncedUpdateText = _.debounce(this.updateText, 500);
  },
  computed: {
    buttonText() {
      let label;
      if (this.containsText) {
        label =
          this.title + this.$t("contains") + '"' + this.containsText + '"';
      } else {
        label = this.title + ": " + this.$t("all");
      }
      return label;
    },
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    text(newText, oldText) {
      this.debouncedUpdateText();
    }
  },
  methods: {
    updateText() {
      this.$emit("update:containsText", this.text);
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
  min-width: 220px;

  a.disabled {
    color: #c3c3c3;
  }
}
</style>
