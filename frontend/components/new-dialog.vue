<template>
  <div class="new-dialog modal fade" tabindex="-1" role="dialog" aria-labelledby="new-document" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="title">{{$t('selectMeta')}}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-masonry class="row gap-20 masonry pos-r" transition-duration="0.3s" item-selector=".masonry-item" column-width=".masonry-sizer" ref="masonry">
            <div class="masonry-sizer pos-a col-2"></div>
            <div v-masonry-tile v-for="meta in localeMetas" :key="meta.collectionId+'~'+meta.id" class="masonry-item col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2 ml-auto mr-auto">
              <div class="meta p-10 bd" 
                :class="{selected:selectedMeta.collectionId==meta.collectionId&&selectedMeta.id==meta.id}" 
                @click="selectedMeta={collectionId:meta.collectionId, id:meta.id}">
                <span class="icon-holder"><i :class="[meta._meta.iconClass]"></i></span>
                <h6>{{meta.title||meta.id}}</h6>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="cancel btn btn-secondary" data-dismiss="modal">{{$t('cancel')}}</button>
          <button type="button" class="create btn btn-primary" @click="onCreateClick">{{$t('create')}}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapGetters} from "vuex";

export default {
  name: "NewDialog",
  data() {
    return {
      error: null,
      masonry: null,
      selectedMeta: {}
    };
  },
  props: {
    name: String,
    title: String,
    opened: Boolean
  },
  i18n: {
    messages: {
      en: {
        selectMeta: "Please select a template of document",
        create: "Create",
        cancel: "Cancel"
       },
      cn: {
        selectMeta: "请选择文档模板",
        create: "创建",
        cancel: "取消"
       }
    }
  },
  mounted() {
    if(this.opened){
      this.$dialog.modal('show');
    }else{
      this.$dialog.modal('hide');
    }

    this.$dialog.on('shown.bs.modal', (e) => {
      this.$store.dispatch('FETCH_METAS');
    });

    this.$dialog.on('hidden.bs.modal', (e) => {
      this.$emit('update:opened', false);
    });

  },
  computed: {
    $dialog(){
      return $(this.$el);
    },
    ...mapState(["currentDomainId", "locale"]),
    ...mapGetters([ "localeMetas"])
  },
  watch: {
    opened(newValue, oldValue) {
      if(newValue){
        this.$dialog.modal('show');
      }else{
        this.$dialog.modal('hide');
      }
    }
  },
  methods: {
    onCreateClick(){
      this.$emit('update:opened', false);
      this.$router.push(`/${this.selectedMeta.collectionId}/${this.selectedMeta.id}/new`);
    }
  }
};
</script>

<style lang="scss" scoped>
.meta {
  text-align: center;
  .icon-holder {
    font-size: 64px;
    text-align: center;
  }
}

.meta.selected, .meta:hover {
  color: #2196f3 !important;
}
</style>
