<template>
  <div
    class="modal fade"
    id="save-as"
    tabindex="-1"
    role="dialog"
    aria-labelledby="save-as"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Save ...</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form class="id-title">
            <div class="form-group">
              <label for="id">ID</label>
              <input type="text" class="form-control" name="id" aria-describedby="docHelp">
              <span class="messages"></span>
            </div>
            <div class="form-group">
              <label for="title">Title</label>
              <input type="text" class="form-control" name="title" aria-describedby="docHelp">
              <span class="messages"></span>
            </div>
            <button type="submit" class="btn btn-primary d-none">Submit</button>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="cancel btn btn-secondary" data-dismiss="modal">Cancel</button>
          <button
            type="button"
            class="submit btn btn-primary"
            data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i> Please wait..."
          >Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "ContainsText",
  data() {
    return {
      error: null
    };
  },
  props: {
    id: String,
    title: String,
    show: {
      type: Boolean,
      default: false
    }
  },
  i18n: {
    messages: {
      en: {
        modelTitle: "Save",
        id: "ID",
        title: "Title",
        save: "Save",
        cancel: "Cancel"
      },
      "zh-CN": {
        modelTitle: "保存",
        id: "唯一标识",
        title: "标题",
        save: "保存",
        cancel: "取消"
      }
    }
  },
  mounted() {
    $(this.$el)
      .appendTo("body")
      .modal({ show: false });
  },
  computed: {
    buttonText() {},
    ...mapState(["currentDomainId", "locale"])
  },
  methods: {
    submit() {
      this.$emit("save", { id: this.id, title: this.title });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
