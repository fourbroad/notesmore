<template>
  <div v-on:resize="console.log('~~~~~~~~~~~~~~~~~~~~~~~~~')">
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
    this.$on('resize', ()=>{
      console.log('resize~~~~~~~~~~~~~~~~~~~~~~~~~')
    })
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
      Meta.get(domId, metaId, (err, meta) => {
        if (err) {
          this.loading = false
          return this.error = err.toString()
        }

        let actions, defaultAction, plugin, pluginName
        actions = _.union(doc._meta.actions, meta.actions)
        defaultAction = doc._meta.defaultAction || meta.defaultAction
        actionId = actionId || defaultAction || actions[0] || 'edit'
        Action.get(domId, actionId, (err, action) => {
          this.loading = false
          if (err) return this.error = err.toString()
          this.component = components[actionId]
          this.actionId = actionId;
          this.document = doc
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
          Meta.get(domId, documentId, (err, meta) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(meta, actionId)
          });
          break
        case ".domains":
          Domain.get(documentId, (err, domain) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(domain, actionId)
          })
          break
        case ".collections":
          Collection.get(domId, documentId, (err, col) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(col, actionId)
          });
          break
        case ".views":
          View.get(domId, documentId, (err, view) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(view, actionId)
          })
          break
        case ".pages":
          Page.get(domId, documentId, (err, page) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(page, actionId)
          })
          break
        case ".forms":
          Form.get(domId, documentId, (err, form) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(form, actionId)
          })
          break
        case ".roles":
          Role.get(domId, documentId, (err, role) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(role, actionId)
          })
          break
        case ".profiles":
          Profile.get(domId, documentId, (err, profile) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(profile, actionId)
          })
          break
        case ".groups":
          Group.get(domId, documentId, (err, group) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(group, actionId)
          })
          break
        case ".users":
          User.get(documentId, (err, user) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(user, actionId)
          })
          break
        case ".actions":
          Action.get(domId, documentId, (err, action) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(action, actionId)
          })
          break
        default:
          Document.get(domId, collectionId, documentId, (err, doc) => {
            if (err) {
              this.loading = false
              return this.error = err.toString()
            }
            this._doLoadDocument(doc, actionId)
          })
      }
    },
    createDocument(domainId, metaId){
      let { Meta, Domain, Collection, View, Page, Form, Role, Profile, Group, User, Document, Action } = this.$client;
      Meta.get(domainId, metaId, (err, meta)=>{
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

        Action.get(domainId, 'new', (err, action)=>{
          if (err) return this.error = err.toString()
          this.component = components[action.id]
          this.document = doc
          this.isNew = true;
          this.loading = false
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