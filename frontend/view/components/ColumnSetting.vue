<template>
  <div>
    <button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown">
      <i class="fa fa-columns"></i>
    </button>
    <div class="dropdown-menu dropdown-menu-right">
      <ul class="item-container fa-ul mx-1 mb-0">
        <ItemSelector
          v-for="item in items"
          v-bind:key="item.name"
          v-bind:item="item"
          @clickItem="onItemClicked"
        ></ItemSelector>
      </ul>
    </div>
  </div>
</template>

<script>
import ItemSelector from "./ItemSelector.vue";

export default {
  name: "ColumnSetting",
  props: {
    columns: Array
  },
  computed: {
    items: function() {
      return this.columns.filter(c => c.name != undefined);
    }
  },
  methods: {
    onItemClicked: function(itemName) {
      let item = this.columns.filter(f => f.name == itemName)[0];
      if (item.visible == undefined || item.visible == true) {
        this.$set(item, "visible", false);
      } else {
        this.$set(item, "visible", true);
      }
      this.$emit("item-changed", item);
    }
  },
  components: {
    ItemSelector
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.btn.btn-outline-secondary {
  border-color: lightgray !important;
}

.item-container {
  position: relative;
}
</style>