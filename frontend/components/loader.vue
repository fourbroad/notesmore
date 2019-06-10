<template>
  <div>
    <component :is="component" :actionId="actionId" :document="document" :isNew="isNew" :key="document.collectionId+'~'+document.id"></component>
    <div class="container" v-if="loading">
      <div class="row loading">
        <div class="spinner-grow m-auto" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { mapState, mapActions} from "vuex"

const components = {
  workbench: () => import('components/workbench'),
  dashboard: () => import('components/dashboard'),
  calendar: () => import('components/calendar'),
  im: () => import('components/im'),
  email: () => import('components/email'),
  gridView: () => import('components/view'),
  edit: () => import('components/form'),
  new: () => import('components/form'),
  uploadFiles:()=> import('components/file-upload'),
  notFound: () => import('components/errors/404'),
  forbidden: () => import('components/errors/403')
}

export default {
  data() {
    return {
      loading: false,
      component: null,
      actionId: '',
      document: {},
      isNew: false,
      key: null,
      error: null
    };
  },
  created() {
    this.loadDocument(this.$route)
  },
  computed: {
    ...mapState(["currentDomainId", "locale"])
  },
  watch: {
    $route(){
     this.loadDocument(this.$route)     
    }
  },
  beforeRouteUpdate(to, from, next){
    this.loadDocument(to)
    next()
  },
  methods: {
    _doLoadDocument(doc, actionId) {
      let domainId = this.currentDomainId, metaId = _.at(doc, "_meta.metaId")[0] || ".meta";
      return this.fetchMeta({domainId:domainId, metaId:metaId}).then(meta => {
        let actions, defaultAction, plugin, pluginName
        actions = _.union(doc._meta.actions, meta.actions)
        defaultAction = doc._meta.defaultAction || meta.defaultAction
        actionId = actionId || defaultAction || actions[0] || 'edit'
        return this.fetchAction({domainId:domainId, actionId:actionId}).then(action => {
          this.loading = false
          this.component = components[actionId]
          this.actionId = actionId;
          this.document = doc
          window.dispatchEvent(new Event('resize'))
        });
      });
    },
    loadDocument($route) {
      let params = $route.params, meta = $route.meta, 
        collectionId = params.collectionId || meta.collectionId,
        documentId = params.documentId || meta.documentId,
        actionId = params.actionId || meta.actionId,
        domainId = this.currentDomainId;

      this.loading = true

      if(actionId == 'new'){
        return this.createDocument(domainId, documentId);
      }

      this.error = this.post = null
      this.isNew = false;

      return this.fetchＤocument({domainId:domainId, collectionId:collectionId, documentId: documentId}).then(doc=>this._doLoadDocument(doc, actionId));
    },
    createDocument(domainId, metaId){
      return this.newDocument({domainId:domainId, metaId:metaId}).then(doc=>{
        return this.fetchAction({domainId:domainId, actionId:'new'}).then(action=>{
          this.component = components[action.id];
          this.document = doc;
          this.isNew = true;
          this.loading = false;
          window.dispatchEvent(new Event('resize'));
        });
      });
    },
    ...mapActions({
      fetchＤocument: 'FETCH_DOCUMENT',
      newDocument: 'NEW_DOCUMENT',
      fetchAction: 'FETCH_ACTION',
      fetchMeta: 'FETCH_META'
    })
  }
}
</script>

<style lang="scss" scoped>
  .loading{
    height: calc(100vh - 126px);
  }
</style>