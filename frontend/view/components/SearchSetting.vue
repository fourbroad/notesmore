<template>
  <div class="search-item dropdown btn-group">
    <button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown">
      <i class="fa fa-ellipsis-h"></i>
    </button>
    <div class="dropdown-menu dropdown-menu-right">
      <ul class="item-container fa-ul mx-1 mb-0">
        <ItemSelector
          v-for="item in fields"
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
  name: "SearchSetting",
  props: {
    fields: Array
  },
  methods: {
    onItemClicked: function(itemName) {
      let item = this.fields.filter(f => f.name == itemName)[0];
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

.item-container {
  font-size: 0.9rem;
  position: relative;
}
</style>