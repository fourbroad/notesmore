<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import 'bootstrap';
import "font-awesome/scss/font-awesome.scss";

export default {
  name: "App"
};
</script>

<style lang="scss">
@import '~bootstrap/scss/bootstrap';
@import 'assets/index';
</style>
