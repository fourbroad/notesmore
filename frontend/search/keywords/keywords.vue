<template>
  <div class="search-item dropdown btn-group mr-1">
    <button
      class="btn btn-outline-secondary dropdown-toggle btn-sm"
      type="button"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >{{buttonText}}</button>
    <div class="dropdown-menu m-2 px-1" @click.stop>
      <div class="input-group input-group-sm px-2 pb-1">
        <input
          type="text"
          v-model.trim="filter"
          class="form-control"
          aria-label="Search"
          aria-describedby="inputGroup-sizing-sm"
        >
        <div class="input-group-prepend">
          <span class="input-group-text" id="inputGroup-sizing-sm">
            <i class="fa" :class="[filter==''?'fa-search':'fa-times']" @click="filter=''"></i>
          </span>
        </div>
      </div>
      <a
        href="javascript:void(0)"
        class="clear-selected-items px-2"
        v-if="filter==''"
        :class="{disabled:selectedItems.length<=0}"
        @click="onClearClick"
      >{{$t('clearLink')}}</a>
      <div class="item-container-wrapper mT-5">
        <ul class="item-container fa-ul">
          <li v-for="item in items" :key="item.value" @click="onItemClick(item)">
            <i
              class="fa-li fa"
              :class="{'fa-check-square-o': multi && item.checked, 'fa-check-circle-o': !multi && item.checked, 'fa-square-o': multi && !item.checked,'fa-circle-o': !multi && !item.checked }"
            ></i>
            {{item.value}}
          </li>
        </ul>
        <div class="container h-100" v-if="loading">
          <div class="row align-items-center h-100">
            <div class="col-auto spinner-grow mx-auto" status>
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
        <div
          class="enter-hint px-2 text-muted font-italic"
          v-if="items.length>=100"
        >{{$t('enterHint')}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import * as $ from "jquery";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";

export default {
  name: "Keywords",
  data() {
    return {
      loading: false,
      error: null,
      ps: null,
      filter: "",
      items: []
    };
  },
  props: {
    name: String,
    title: String,
    multi: {
      type: Boolean,
      default: true
    },
    selectedItems: {
      type: Array,
      default() {
        return new Array();
      }
    },
    fetchItems: Function
  },
  i18n: {
    messages: {
      en: {
        all: "全部",
        clearLink: "清除已选择项目",
        enterHint: "输入更多内容,　可以缩小选择范围..."
      },
      cn: {
        all: "全部",
        clearLink: "清除已选择项目",
        enterHint: "输入更多内容,　可以缩小选择范围..."
      }
    }
  },
  mounted() {
    let $el = $(this.$el),
      $itemContainerWrapper = $(".item-container-wrapper", $el);
    this.ps = new PerfectScrollbar($itemContainerWrapper[0], {
      suppressScrollX: true,
      wheelPropagation: false
    });

    $el.on("show.bs.dropdown", () => {
      this.filter = "";
      this.items = [];
      // this.debouncedFetchWords();
      this.fetchWords();
    });
    this.debouncedFetchWords = _.debounce(this.fetchWords, 500);
  },
  computed: {
    buttonText() {
      let label;
      if (this.selectedItems.length > 0) {
        label = _.reduce(
          this.selectedItems,
          (text, item) => {
            return text == "" ? item : text + "," + item;
          },
          ""
        );
      } else {
        label = `${this.title} : ${this.$t('all')}`;
      }
      return label;
    },
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    filter(newFilter, oldFilter) {
      // this.debouncedFetchWords();
      this.fetchWords();
    }
  },
  methods: {
    fetchWords() {
      let filter = this.filter == "" ? ".*" : ".*" + this.filter + ".*";
      this.loading = true;
      this.fetchItems(this.name, filter, (err, items) => {
        this.loading = false;
        if (err) return (this.error = err.toString());
        if (this.filter == "") {
          let sis = _.reduce(
            this.selectedItems,
            (sis, si) => {
              sis.push({ value: si, checked: true });
              return sis;
            },
            []
          );
          this.items = _.reduce(
            _.differenceWith(items, this.selectedItems, _.isEqual),
            (is, item) => {
              is.push({ value: item });
              return is;
            },
            sis
          );
        } else {
          let selectedItems = this.selectedItems;
          this.items = _.reduce(
            items,
            (is, item) => {
              if (_.indexOf(selectedItems, item) >= 0) {
                is.push({ value: item, checked: true });
              } else {
                is.push({ value: item });
              }
              return is;
            },
            []
          );
        }
        this.ps.update();
      });
    },
    itemClass(item) {
      return {
        "fa-check-square-o": this.multi && item.checked,
        "fa-check-circle-o": !this.multi && item.checked,
        "fa-square-o": this.multi && !item.checked,
        "fa-circle-o": !this.multi && !item.checked
      };
    },
    onItemClick(item) {
      this.$set(item, "checked", !item.checked);
      if (item.checked) {
        this.$emit(
          "update:selectedItems",
          _.unionWith(this.selectedItems, [item.value], _.isEqual)
        );
      } else {
        this.$emit(
          "update:selectedItems",
          _.differenceWith(this.selectedItems, [item.value], _.isEqual)
        );
      }
    },
    onClearClick() {
      this.$emit("update:selectedItems", []);
      this.fetchWords();
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

  input {
    border-right-width: 0px;
  }

  a.disabled {
    color: #c3c3c3;
  }

  li {
    cursor: default;
  }

  .input-group-text {
    border-left-width: 0px;
    background-color: white;
  }

  .item-container-wrapper {
    position: relative;
    max-height: 400px;
    overflow-y: auto;

    .item-container {
      margin-bottom: 0px;
    }
  }
}
</style>
