<template>
  <div class="full-text-search">
    <input class="form-control" type="text" v-model.trim="text">
    <i class="fa" :class="[text==''?'fa-search':'fa-times']" @click.stop="text=''"></i>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "FullTextSearch",
  data() {
    return {
      error: null,
      text: this.keyword
    };
  },
  props: {
    name: String,
    title: String,
    keyword: {
      type: String,
      default: ""
    }
  },
  mounted() {
    this.debouncedUpdateKeyword = _.debounce(this.updateKeyword, 250);
  },
  computed: {
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    text(newText, oldText) {
      this.debouncedUpdateKeyword();
    },
    keyword() {
      this.text = this.keyword;
    }
  },
  methods: {
    updateKeyword() {
      this.$emit("update:keyword", this.text);
    }
  }
};
</script>

<style lang="scss" scoped>
.full-text-search {
  display: inline-flex;
  width: fit-content;
  vertical-align: middle;
  border-radius: 0.2rem;
  position: relative;
  font-size: inherit !important;

  input {
    padding: 4px 8px;
    padding-right: 1.7rem;
    width: auto;
    height: 100%;
    font-size: inherit;
  }
  i {
    position: absolute;
    top: 50%;
    right: 0.6rem;
    margin-top: -0.5rem;
    color: #495057;
  }
}
</style>
