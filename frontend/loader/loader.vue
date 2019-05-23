<template>
  <div>
    <component :is="component" :document="document"></component>
    <div class="loading" v-if="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { mapState } from "vuex"

const components = {
  workbench: () => import('workbench/workbench.vue'),
  dashboard: () => import('dashboard/dashboard.vue'),
  calendar: () => import('calendar/calendar.vue'),
  im: () => import('im/im.vue'),
  email: () => import('email/email.vue'),
  gridView: () => import('view/view.vue'),
  notFound: () => import('errors/404'),
  forbidden: () => import('errors/403')
}

export default {
  data() {
    return {
      loading: false,
      component: null,
      document: {},
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
      Meta.get(domId, metaId, (err, meta) => {
        if (err) return this.error = err.toString()

        let actions, defaultAction, plugin, pluginName
        actions = _.union(doc._meta.actions, meta.actions)
        defaultAction = doc._meta.defaultAction || meta.defaultAction
        actionId = actionId || defaultAction || actions[0]
        Action.get(domId, actionId, (err, action) => {
          if (err) return this.error = err.toString()
          this.component = components[action.id]
          this.document = doc
          this.loading = false
        });
      });
    },
    loadDocument($route) {
      let params = $route.params, meta = $route.meta, 
        collectionId = params.collectionId || meta.collectionId,
        documentId = params.documentId || meta.documentId,
        actionId = params.actionId || meta.actionId,
        domId = this.currentDomainId,
        { Meta, Domain, Collection, View, Page, Form, Role, Group, User, Document, Action } = this.$client

      this.error = this.post = null
      this.loading = true

      switch (collectionId) {
        case ".metas":
          Meta.get(domId, documentId, (err, meta) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(meta, actionId)
          });
          break
        case ".domains":
          Domain.get(documentId, (err, domain) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(domain, actionId)
          })
          break
        case ".collections":
          Collection.get(domId, documentId, (err, col) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(col, actionId)
          });
          break
        case ".views":
          View.get(domId, documentId, (err, view) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(view, actionId)
          })
          break
        case ".pages":
          Page.get(domId, documentId, (err, page) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(page, actionId)
          })
          break
        case ".forms":
          Form.get(domId, documentId, (err, form) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(form, actionId)
          })
          break
        case ".roles":
          Role.get(domId, documentId, (err, role) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(role, actionId)
          })
          break
        case ".groups":
          Group.get(domId, documentId, (err, group) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(group, actionId)
          })
          break
        case ".users":
          User.get(documentId, (err, user) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(user, actionId)
          })
          break
        case ".actions":
          Action.get(domId, documentId, (err, action) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(action, actionId)
          })
          break
        default:
          Document.get(domId, collectionId, documentId, (err, doc) => {
            if (err) return (this.error = err.toString())
            this._doLoadDocument(doc, actionId)
          })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>