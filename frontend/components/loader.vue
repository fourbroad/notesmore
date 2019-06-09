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
import { mapState } from "vuex"

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
      let domId = this.currentDomainId, metaId = _.at(doc, "_meta.metaId")[0] || ".meta", {Meta, Action} = this.$client
      return Meta.get(domId, metaId).then(meta => {
        let actions, defaultAction, plugin, pluginName
        actions = _.union(doc._meta.actions, meta.actions)
        defaultAction = doc._meta.defaultAction || meta.defaultAction
        actionId = actionId || defaultAction || actions[0] || 'edit'
        return Action.get(domId, actionId).then(action => {
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
        domId = this.currentDomainId,
        { Meta, Domain, Collection, View, Page, Form, Role, Profile, Group, User, Document, Action } = this.$client

      this.loading = true

      if(actionId == 'new'){
        return this.createDocument(domId, documentId);
      }

      this.error = this.post = null
      this.isNew = false;

      switch (collectionId) {
        case ".metas":
          return Meta.get(domId, documentId).then(meta => this._doLoadDocument(meta, actionId));
        case ".domains":
          return Domain.get(documentId).then(domain => this._doLoadDocument(domain, actionId));
        case ".collections":
          return Collection.get(domId, documentId).then(col => this._doLoadDocument(col, actionId));
        case ".views":
          return View.get(domId, documentId).then(view => this._doLoadDocument(view, actionId));
        case ".pages":
          return Page.get(domId, documentId).then(page => this._doLoadDocument(page, actionId));
        case ".forms":
          return Form.get(domId, documentId).then(form => this._doLoadDocument(form, actionId));
        case ".roles":
          return Role.get(domId, documentId).then(role => this._doLoadDocument(role, actionId));
        case ".profiles":
          return Profile.get(domId, documentId).then(profile => this._doLoadDocument(profile, actionId));
        case ".groups":
          return Group.get(domId, documentId).then(group => this._doLoadDocument(group, actionId));
        case ".users":
          return User.get(documentId).then(user => this._doLoadDocument(user, actionId));
        case ".actions":
          return Action.get(domId, documentId).then(action => this._doLoadDocument(action, actionId));
        default:
          return Document.get(domId, collectionId, documentId).then(doc => this._doLoadDocument(doc, actionId));
      }
    },
    createDocument(domainId, metaId){
      let { Meta, Domain, Collection, View, Page, Form, Role, Profile, Group, User, Document, Action } = this.$client;
      return Meta.get(domainId, metaId).then(meta => {
        let collectionId = meta.container.id, doc, docData = {};
        _.merge(docData, {_meta: {metaId: metaId, iconClass:meta._meta.iconClass}}, _.cloneDeep(meta.defaultValue));
        switch(collectionId){
          case '.metas':
            doc = new Meta(domainId, docData, true);
            break;
          case '.domains':
            doc = new Domain(docData, true);
            break;
          case '.collections':
            doc = new Collection(domainId, docData, true);
            break;
          case '.views':
            doc = new View(domainId, docData, true);
            break;
          case '.pages':
            doc = new Page(domainId, docData, true);
            break;
          case '.forms':
            doc = new Form(domainId, docData, true);
            break;
          case '.roles':
            doc = new Role(domainId, docData, true);
            break;
          case '.profiles':
            doc = new Profile(domainId, docData, true);
            break;
          case '.groups':
            doc = new Group(domainId, docData, true);
            break;
          case '.users':
            doc = new User(docData, true);
            break;
          case '.actions':
            doc = new Action(domainId, docData, true);
            break;
          default:
            doc = new Document(domainId, collectionId, docData, true);
        }

        return Action.get(domainId, 'new').then(action => {
          this.component = components[action.id];
          this.document = doc;
          this.isNew = true;
          this.loading = false;
          window.dispatchEvent(new Event('resize'));
        });
      });
    }
  }
}
</script>

<style lang="scss" scoped>
  .loading{
    height: calc(100vh - 126px);
  }
</style>