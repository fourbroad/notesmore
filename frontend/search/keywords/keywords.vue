<template>
  <div>
    <button
      class="btn btn-outline-secondary dropdown-toggle"
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
            <i class="fa" :class="[filter==''?'fa-search':'fa-times']"></i>
          </span>
        </div>
      </div>
      <a
        href="javascript:void(0)"
        class="clear-selected-items px-2"
        v-if="filter==''"
        :class="{disabled:selectedItems.length<=0}"
      >Clear selected items</a>
      <div class="item-container-wrapper mT-5">
        <ul class="item-container fa-ul">
          <li v-for="item in items" :key="item.value" @click="onItemClick(item)">
            <i class="fa-li fa" :class="{'fa-check-square-o': multi && item.checked, 'fa-check-circle-o': !multi && item.checked, 'fa-square-o': multi && !item.checked,'fa-circle-o': !multi && !item.checked }"></i>
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
        >Enter more content to narrow your selection...</div>
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
      default: function() {
        return new Array();
      }
    },
    fetchItems: Function
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
      this.debouncedFetchWords();
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
        label = this.title + ": all";
      }
      return label == "" ? "Please select a " + this.title : label;
    },
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    filter: function(newFilter, oldFilter) {
      this.debouncedFetchWords();
    }
  },
  methods: {
    fetchWords: function() {
      let filter = this.filter == "" ? ".*" : ".*" + this.filter + ".*";
      this.loading = true;
      this.fetchItems(this.name, filter, (err, items) => {
        this.loading = false;
        if (err) return (this.error = err.toString());
        this.items = _.reduce(this.selectedItems.concat(
          _.differenceWith(items, this.selectedItems, _.isEqual)
        ),(objs, item)=>{objs.push({value:item}); return objs;},[]);
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
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown-menu {
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
