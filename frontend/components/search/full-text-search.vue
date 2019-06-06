<template>
  <div class="search-item input-group input-group-sm mr-1">
    <input
      type="text"
      class="form-control"
      v-model.trim="text"
      aria-label="Search"
      aria-describedby="inputGroup-sizing-sm"
    >
    <div class="input-group-prepend" @click="text=''">
      <span class="input-group-text" id="inputGroup-sizing-sm">
        <i class="fa" :class="[text==''?'fa-search':'fa-times']"></i>
      </span>
    </div>
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
    this.debouncedUpdateKeyword = _.debounce(this.updateKeyword, 500);
  },
  computed: {
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    text(newText, oldText) {
      this.debouncedUpdateKeyword();
    },
    keyword(){
      this.text = this.keyword
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
.search-item {
  font-size: 0.8rem;
  padding-bottom: 5px;
  margin-right: 2px;
}

.input-group {
  display: inline-flex;
  width: fit-content;
  vertical-align: middle;
  border-radius: 0.2rem;

  input {
    width: 80px;
    border-right-width: 0px;
  }

  .input-group-text {
    border-left-width: 0px;
    background-color: white;
  }
}
</style>
