<template>
  <li class="dropdown-item px-2" @click.stop.prevent="clickItem">
    <i class="fa-li fa" v-bind:class="{'fa-square-o': item.visible==false, 'fa-check-square-o': item.visible==undefined||item.visible}"></i>
    {{item.title }}
  </li>
</template>

<script>
export default {
  name: "ItemSelector",
  props: ['item'],
  methods: {
    clickItem: function() {
      this.$emit('clickItem', this.item.name);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li > i {
  position: relative;
  left: 0px;
  top: 0px;
  width: auto;
}
</style>