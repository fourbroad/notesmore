<template>
  <div class="toast" role="alert" aria-live="assertive" data-autohide="false">
    <div class="toast-header">
      <img src="../assets/images/logo.png" class="icon rounded ml-0 mt-2 mb-2 mr-2" alt="notesmore">
      <strong class="title mr-auto">{{title}}</strong>
      <small class="hint ml-3 float-right">{{hint}}</small>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">{{message}}</div>
  </div>
</template>

<script>
export default {
  name: "Toast",
  data() {
    return {
      error: null
    };
  },
  props: {
    title: String,
    hint: String,
    message: String,
    animation: {
      type: Boolean,
      default:true
    },
    autohide: {
      type: Boolean,
      default: true
    },
    delay: {
      type: Number,
      default: 500
    }
  },
  mounted() {
    $(this.$el).toast({
      animation: this.animation,
      autohide: this.autohide,
      delay: this.delay
    }).toast('show');
  },
  computed: {
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
.icon {
  width: 18px;
  height: 18px;
}
.hint {
  min-width: 40px;
}
</style>
