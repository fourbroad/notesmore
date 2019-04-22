module.exports = Domain;

const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Meta = require('./meta')
  , Collection = require('./collection')
  , View = require('./view')
  , Form = require('./form')
  , Group = require('./group')
  , Page = require('./page')
  , Action = require('./action')
  , Profile = require('./profile')
  , File = require('./file')
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document')
  , {uniqueId, documentHotAlias, documentAllAlias, inherits, buildMeta, getEntity} = require('./utils');

const DOMAINS = '.domains'
  , ROOT = '.root'
  , DEFAULT_COLUMNS = [{
  sortable: false
},{
  title: "Id",
  name: "id",
  data: "id",
  defaultLink: true
}, {
  title: "Title",
  name: "title",
  data: "title",
  defaultLink: true
}, {
  title: "Author",
  name: "_meta.author",
  data: "_meta.author"
}, {
  title: "Version",
  name: "_meta.version",
  data: "_meta.version"
}, {
  title: "Created",
  name: "_meta.created",
  data: "_meta.created",
  className: "datetime"
}, {
  title: "Updated",
  name: "_meta.updated",
  data: "_meta.updated",
  className: "datetime"
}, {
  sortable: false
}]
  , DEFAULT_SEARCH_COLUMNS = [{
  title: "Id",
  name: "id",
  type: "keywords"
}, {
  title: "Title",
  name: "title",
  type: "containsText"
}, {
  title: "Author",
  name: "_meta.author",
  type: "keywords"
}, {
  title: "Version",
  name: "_meta.version",
  type: "numericRange"
}, {
  title: "Created",
  name: "_meta.created",
  type: "datetimeRange"
}, {
  title: "Updated",
  name: "_meta.updated",
  type: "datetimeRange"
}]
  , COLLECTIONS = [{
  id: ".collections",
  title: "Data Warehouse",
  _meta:{
    iconClass: "ti-harddrives"
  }
}, {
  id: ".metas",
  title: "Metas",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".pages",
  title: "Pages",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".views",
  title: "Views",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".forms",
  title: "Forms",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".actions",
  title: "Actions",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".files",
  title: "Files",
  _meta: {
    iconClass: "ti-folder",
    actions: ['uploadFiles','edit']
  }
}, {
  id: ".roles",
  title: "Roles",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".groups",
  title: "Groups",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".profiles",
  title: "Profiles",
  _meta:{
    iconClass: "ti-folder"
  }
}]
  , ROOT_COLLECTIONS = [{
  id: ".users",
  title: "Users",
  _meta:{
    iconClass: "ti-folder"
  }
}, {
  id: ".domains",
  title: "Domains",
  _meta:{
    iconClass: "ti-folder"
  }
}]
  , ACTIONS = [{
  id: "new",
  title: "New",
  plugin: {
    name: "@notesabc/form",
    mode: 'offline',
    js: "@notesabc/form/form.bundle.js",
    css: "@notesabc/form/form.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: "edit",
  title: "Edit(Json)",
  plugin: {
    name: "@notesabc/form",
    mode: 'offline',
    js: "@notesabc/form/form.bundle.js",
    css: "@notesabc/form/form.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: "gridView",
  title: "Grid View",
  plugin: {
    name: "@notesabc/view",
    mode: 'offline',
    js: "@notesabc/view/view.bundle.js",
    css: "@notesabc/view/view.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'login',
  title: 'Login',
  plugin: {
    name: "@notesabc/login",
    mode: 'offline',
    js: "@notesabc/login/login.bundle.js",
    css: "@notesabc/login/login.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'signup',
  title: 'Signup',
  plugin: {
    name: "@notesabc/signup",
    mode: 'offline',
    js: "@notesabc/signup/signup.bundle.js",
    css: "@notesabc/signup/signup.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'workbench',
  title: "Workbench",
  plugin: {
    name: "@notesabc/workbench",
    mode: 'offline',
    js: "@notesabc/workbench/workbench.bundle.js",
    css: "@notesabc/workbench/workbench.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'dashboard',
  title: 'Dashboard',
  plugin: {
    name: "@notesabc/dashboard",
    mode: 'offline',
    js: "@notesabc/dashboard/dashboard.bundle.js",
    css: "@notesabc/dashboard/dashboard.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'calendar',
  title: "Calendar",
  plugin: {
    name: "@notesabc/calendar",
    mode: 'offline',
    js: "@notesabc/calendar/calendar.bundle.js",
    css: "@notesabc/calendar/calendar.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'chat',
  title: "Chat",
  plugin: {
    name: "@notesabc/chat",
    mode: 'offline',
    js: "@notesabc/chat/chat.bundle.js",
    css: "@notesabc/chat/chat.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'email',
  title: "Email",
  plugin: {
    name: "@notesabc/email",
    mode: 'offline',
    js: "@notesabc/email/email.bundle.js",
    css: "@notesabc/email/email.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: "uploadFiles",
  title: "Upload Files",
  plugin: {
    name: "@notesabc/uploadfiles",
    mode: 'offline',
    js: "@notesabc/upload-files/upload-files.bundle.js",
    css: "@notesabc/upload-files/upload-files.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}]
  , METAS = [{
  id: ".meta",
  title: "Meta",
  defaultValue:{
    title: "New Meta"
  },
  container:{
    id: '.metas',
    title: 'Metas'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-wand"
  }
}, {
  id: ".meta-collection",
  title: "Collection",
  container:{
    id: '.collections',
    title: 'Collections'
  },
  defaultValue:{
    title: "New Collection",
    columns: DEFAULT_COLUMNS,
    searchColumns: DEFAULT_SEARCH_COLUMNS,
    search: {
      names: ["id.keyword", "title.keyword", "_meta.author.keyword"]
    },
    order: "[[6,\"desc\"],[5,\"desc\"]]"
  },
  defaultAction: 'gridView',
  actions: ['gridView', 'edit'],
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".meta-page",
  title: "Page",
  defaultValue:{
    title: "New Page"
  },
  container:{
    id: '.pages',
    title: 'Pages'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-layout-width-default"
  }
}, {
  id: ".meta-view",
  title: "View",
  container:{
    id: '.views',
    title: 'Views'
  },
  defaultValue:{
    title: "New View",
    collections:[],
    columns: DEFAULT_COLUMNS,
    searchColumns: DEFAULT_SEARCH_COLUMNS,
    search: {
      names: ["id.keyword", "title.keyword", "_meta.author.keyword"]
    },
    order: "[[6,\"desc\"],[5,\"desc\"]]",
    _meta:{
      metaId:'.meta-view'
    }
  },
  defaultAction: "gridView",
  actions: ['gridView', 'edit'],
  _meta: {
    iconClass: "ti-view-list-alt"
  }
}, {
  id: ".meta-form",
  title: "Form",
  defaultValue:{
    title: "New Form"
  },
  container:{
    id: '.forms',
    title: 'Forms'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-layout-cta-btn-right"
  }
}, {
  id: ".meta-action",
  title: "Action",
  defaultValue:{
    title: "New Action"
  },
  container:{
    id: '.actions',
    title: 'Actions'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: ".meta-file",
  title: "File",
  defaultValue:{
    title: "New File"
  },
  container:{
    id: '.files',
    title: 'Files'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-file"
  }
}, {
  id: ".meta-role",
  title: "Role",
  defaultValue:{
    title: "New Role"
  },
  container:{
    id: '.roles',
    title: 'Roles'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-id-badge"
  }
}, {
  id: ".meta-group",
  title: "Group",
  defaultValue:{
    title: "New Group"
  },
  container:{
    id: '.groups',
    title: 'Groups'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-view-grid"
  }
}, {
  id: ".meta-profile",
  title: "Profile",
  defaultValue:{
    title: "New Profile"
  },
  container:{
    id: '.profiles',
    title: 'Profiles'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-id-badge"
  }
}]
  , ROOT_METAS = [{
  id: ".meta-user",
  title: "User",
  container:{
    id: '.users',
    title: 'Users'
  },
  defaultValue:{
    id: 'newuser',
    password: 'password',
    title: "New User"
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: ".meta-domain",
  title: "Domain",
  container:{
    id: '.domains',
    title: 'Domains'
  },
  defaultValue:{
    title: "New Domain"
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-layout-width-full"
  }
}, ]
  , PAGES = [{
  id: ".login",
  title: "Login",
  _meta: {
    iconClass: "ti-layout-width-default",
    actions: ['login']
  }
}, {
  id: ".signup",
  title: "Signup",
  _meta: {
    iconClass: "ti-layout-width-default",
    actions: ['signup']
  }
}, {
  id: ".workbench",
  title: "Workbench",
  sidebarItems:[{
    collectionId: ".pages",
    id: ".dashboard",
    iconColor: "c-blue-500"
  },{
    collectionId: ".pages",
    id: ".calendar",
    iconColor: "c-deep-orange-500"
  },{
    collectionId: ".pages",
    id: ".chat",
    iconColor: "c-deep-purple-500"
  },{
    collectionId: ".pages",
    id: ".email",
    iconColor: "c-brown-500"
  },{
    collectionId: ".collections",
    id: ".collections",
    label: "All Documents",
    iconColor: "c-deep-purple-500"
  }],
  tips:[{
    collectionId: ".collections",
    id: ".notifications",
    iconClass: "ti-bell"
  },{
    collectionId: ".collections",
    id: ".emails",
    iconClass: "ti-email"
  }],
  _meta: {
    iconClass: "ti-blackboard",
    actions: ['workbench']
  }
}, {
  id: ".dashboard",
  title: "Dashboard",
  _meta: {
    iconClass: "ti-dashboard",
    actions: ['dashboard']
  }
}, {
  id: ".calendar",
  title: "Calendar",
  _meta: {
    iconClass: "ti-calendar",  
    actions: ['calendar']
  }
}, {
  id: ".chat",
  title: "Chat",
  _meta: {
    iconClass: "ti-comments",
    actions: ['chat']
  }
}, {
  id: ".email",
  title: "Email",
  _meta: {
    iconClass: "ti-email",
    actions: ['email']
  }
}]
  , ROLES = [{
  id: "administrator",
  title: "Administrator",
  _meta:{
    iconClass: "ti-user"
  }
}, {
  id: "anonymous",
  title: "Anonymous",
  _meta:{
    iconClass: "ti-user"
  }
}]
  , ADMINISTRATOR = {
  id: "administrator",
  title: "Administrator",
  password: "3c3f601a1960b8d7b347d376d52b6e59",
  _meta:{
    iconClass: "ti-user",
  }
}
  , ANONYMOUS = {
  id: "anonymous",
  title: "Anonymous",
  password: "a29b1ee7caefc17a3a73d6d137c8169b",
  _meta:{
    iconClass: "ti-user"
  }
};

function indexName(domainId, collectionId) {
  return domainId + `~` + collectionId + '~snapshots~1-1';
}

function createMeta(authorId, doc) {
  var _meta = doc._meta || {}
    , timestamp = new Date().getTime();
  _meta.acl = _.merge(Document.DEFAULT_ACL, _.at(doc, '_meta.acl')[0]);
  _meta = _.merge(_meta, {
    created: timestamp,
    updated: timestamp,
    version: 1
  });
  _meta.author = authorId;
  return _meta;
}

function initTempates(domainId) {
  var cols = domainId == ROOT ? COLLECTIONS.concat(ROOT_COLLECTIONS) : COLLECTIONS;
  return Promise.all(_.map(cols, function(col) {
    return Collection.putTemplates(domainId, col.id);
  }));
}

function createIndices(domainId) {
  var cols = domainId == ROOT ? COLLECTIONS.concat(ROOT_COLLECTIONS) : COLLECTIONS;
  return Promise.all(_.map(cols, function(col) {
    return Collection.createIndices(domainId, col.id);
  }));
}

function buildCollectionBatch(authorId, domainId) {
  var cols = domainId == ROOT ? COLLECTIONS.concat(ROOT_COLLECTIONS) : COLLECTIONS;
  return _.flatMap(_.map(cols, function(col) {
    var c = _.cloneDeep(col);
    c.columns = DEFAULT_COLUMNS;
    c.searchColumns = DEFAULT_SEARCH_COLUMNS;
    c.search = {
      names: ["id.keyword", "title.keyword", "_meta.author.keyword"]
    };
    c.order = "[[5,\"desc\"],[4,\"desc\"]]";
    c._meta = createMeta(authorId, c);
    c._meta.metaId = '.meta-collection';
    return [{
      index: {
        _index: indexName(domainId, '.collections'),
        _type: Document.TYPE,
        _id: c.id
      }
    }, c];
  }));
}

function buildActionBatch(authorId, domainId) {
  return _.flatMap(_.map(ACTIONS, function(action) {
    var a = _.cloneDeep(action);
    a._meta = createMeta(authorId, a);
    a._meta.metaId = '.meta-action';
    return [{
      index: {
        _index: indexName(domainId, '.actions'),
        _type: Document.TYPE,
        _id: a.id
      }
    }, a];
  }));
}

function buildMetaBatch(authorId, domainId) {
  var metas = domainId == ROOT ? METAS.concat(ROOT_METAS) : METAS;
  return _.flatMap(_.map(metas, function(meta) {
    var m = _.cloneDeep(meta);
    m.acl = {
      create: {
        roles: ['administrator']
      }
    };
    m._meta = createMeta(authorId, m);
    return [{
      index: {
        _index: indexName(domainId, '.metas'),
        _type: Document.TYPE,
        _id: m.id
      }
    }, m];
  }));
}

function buildPageBatch(authorId, domainId) {
  return _.flatMap(_.map(PAGES, function(page) {
    var p = _.cloneDeep(page);
    p._meta = createMeta(authorId, p);
    p._meta.metaId = '.meta-page';
    return [{
      index: {
        _index: indexName(domainId, '.pages'),
        _type: Document.TYPE,
        _id: p.id
      }
    }, p];
  }));
}

function buildRoleBatch(authorId, domainId) {
  return _.flatMap(_.map(ROLES, function(role) {
    var r = _.cloneDeep(role);
    r._meta = createMeta(authorId, r);
    r._meta.metaId = '.meta-role';
    return [{
      index: {
        _index: indexName(domainId, '.roles'),
        _type: Document.TYPE,
        _id: r.id
      }
    }, r];
  }));
}

function buildUserBatch(authorId, authorTitle, domainId) {
  if (domainId == ROOT) {
    var adminProfile = {
      id: authorId,
      title: authorTitle,
      "roles": ["administrator"]
    }
      , anonyProfile = {
      id: 'anonymous',
      title: 'Anonymous',
      "roles": ["anonymous"]
    };

    adminProfile._meta = createMeta(authorId, adminProfile);
    anonyProfile._meta = createMeta(authorId, anonyProfile);

    var us = _.flatMap(_.map([ADMINISTRATOR, ANONYMOUS], function(user) {
      var u = _.cloneDeep(user);
      u._meta = createMeta(authorId, u);
      u._meta.metaId = '.meta-user';
      return [{
        index: {
          _index: indexName(domainId, '.users'),
          _type: Document.TYPE,
          _id: u.id
        }
      }, u];
    }));

    var ps = _.flatMap(_.map([adminProfile, anonyProfile], function(profile) {
      var p = _.cloneDeep(profile);
      p._meta = createMeta(authorId, p);
      p._meta.metaId = '.meta-profile';
      return [{
        index: {
          _index: indexName(domainId, '.profiles'),
          _type: Document.TYPE,
          _id: p.id
        }
      }, p];
    }));

    return us.concat(ps);
  } else {
    var profile = {
      id: authorId,
      title: authorTitle,
      "roles": ["administrator"]
    };
    profile._meta = createMeta(authorId, profile);
    profile._meta.metaId = '.meta-profile';
    return [{
      index: {
        _index: indexName(domainId, '.profiles'),
        _type: Document.TYPE,
        _id: authorId
      }
    }, profile]
  }
}

function initDomain(authorId, authorTitle, domainId) {
  return initTempates(domainId).then(result=>{
    return createIndices(domainId);
  }).then(result=>{
    var cb = buildCollectionBatch(authorId, domainId)
      , mb = buildMetaBatch(authorId, domainId)
      , ab = buildActionBatch(authorId, domainId)
      , pb = buildPageBatch(authorId, domainId)
      , rb = buildRoleBatch(authorId, domainId)
      , ub = buildUserBatch(authorId, authorTitle, domainId);
    return elasticsearch.bulk({
      body: cb.concat(mb).concat(ab).concat(pb).concat(rb).concat(ub)
    });
  });
}

var elasticsearch, cache;

function Domain(domainData) {
  Document.call(this, ROOT, '.domains', domainData);
}

_.assign(Domain, {

  ROOT: ROOT,

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Domain;
  },

  create: function(authorId, domainId, domainData, options) {
    var self = this, promise;

    if (domainId == ROOT) {
      promise = initDomain(authorId, 'Administrator', domainId);
    } else {
      promise = User.get(authorId, options).then(user=>initDomain(authorId, user.title, domainId));
    }

    if (!_.at(domainData, '_meta.metaId')[0])
      _.set(domainData, '_meta.metaId', '.meta-domain');

    return promise.then(result=>{
      return Document.create.call(self, authorId, ROOT, DOMAINS, domainId, domainData, options);
    }).then(()=>{
      return Domain.get(domainId, options)
    });
  },

  get: function(domainId, options) {
    return getEntity(elasticsearch, cache, ROOT, DOMAINS, domainId, options).then(source=>{
      return new Domain(source);
    }
    );
  },

  find: function(query, options) {
    return Document.find.call(this, ROOT, DOMAINS, query, options);
  }

});

inherits(Domain, Document, {
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  copy: function(authorId, targetId, targetTitle, options){
    var self = this, es = this._getElasticSearch(), includeData = options && options.includeData;

    function copyCollection(collection, targetDomainId){
      return Promise.all([
        collection.getSnapshotTemplate().then(template => {
          var temp = {aliases:{}, index_patterns:[targetDomainId+'~'+collection.id+'~snapshots~*-*']};
          temp.aliases[targetDomainId+'~'+collection.id+'~all~snapshots'] = {};
          temp.aliases[targetDomainId+'~'+collection.id+'~hot~snapshots'] = {};
          return Collection.putSnapshotTemplate(targetDomainId, collection.id, _.merge(template[targetDomainId+'~'+collection.id+'~snapshots'],temp));
        }),
        collection.getEventTemplate().then(template => {
          var temp = {aliases:{}, index_patterns:[targetDomainId+'~'+collection.id+'~events~*-*']};
          temp.aliases[targetDomainId+'~'+collection.id+'~all~events'] = {};
          temp.aliases[targetDomainId+'~'+collection.id+'~hot~events'] = {};
          return Collection.putEventTemplate(targetDomainId, collection.id, _.merge(template[targetDomainId+'~'+collection.id+'~events'],temp));
        })
      ]).then(()=>{
        return Collection.createIndices(targetDomainId, collection.id);
      });
    }

    function batch(documents) {
      return _.reduce(documents, (r, v, i) => {
        switch(v.id){
          case '.users':
          case '.domains':
          break;
          case '.metas':
          case '.collections':
          case '.actions':
          case '.forms':
          case '.groups':
          case '.pages':
          case '.profiles':
          case '.roles':
          case '.views':
            r.push(copyCollection(v, targetId).then( () => {
              return Collection.copySnapshotIndices(v.domainId, v.id, targetId, v.id);
            }).then(() => {
              return Collection.copyEventIndices(v.domainId, v.id, targetId, v.id);
            }));
          break;
          case '.files':
          default:
            if(includeData){
              r.push(copyCollection(v, targetId).then( () => {
                return Collection.copySnapshotIndices(v.domainId, v.id, targetId, v.id);
              }).then(() => {
                return Collection.copyEventIndices(v.domainId, v.id, targetId, v.id);
              }));
            } else {
              r.push(copyCollection(v, targetId));
            }
        }
        return r;
      }, []);
    }

    function doCopy(opts){
      return self.scroll(opts).then(result => {
        return Promise.all(batch(result.documents)).then(() => {
          if(result.offset + result.documents.length < result.total){
            return doCopy({scroll: '1m', scroll_id: result.scrollId});
          } else {
            return Domain.get(targetId);
          }        
        });      
      });
    }

    return Document.create(authorId, ROOT, '.domains', targetId, {
      title: targetTitle,
      _meta: {
        iconClass: "ti-layout-width-full"
      }
    }).then(()=>{
      return self.findCollections({scroll:'1m'});
    }).then(result => {
      return Promise.all(batch(result.documents)).then(() => {
        if(result.offset + result.documents.length < result.total){
          return doCopy({scroll: '1m', scroll_id: result.scrollId});
        } else {
          return Domain.get(targetId);
        }
      });
    });
  },

  delete: function(authorId, options) {
    var es = this._getElasticSearch(), self = this;
    return Domain.parent.delete.call(this, authorId, options).then(result=>{
      return es.indices.delete({ index: self.id + '~*' });
    }).then(result=>{
      return true;
    });
  },

  findCollections: function(query, options) {
    return Collection.find(this.id, query, options);
  },

  distinctQueryCollections: function(field, wildcard, options) {
    var query = {
      collapse: {
        field: field + '.keyword'
      },
      aggs: {
        itemCount: {
          cardinality: {
            field: field + '.keyword'
          }
        }
      }
    };

    if (wildcard) {
      query.query = {
        wildcard: {}
      };
      query.query.wildcard[field + ".keyword"] = wildcard;
    }

    return this.findCollections(query);
  },

  getDocument: function(collectionId, documentId, options) {
    switch (collectionId) {
    case '.metas':
      return Meta.get(this.id, documentId, options);
    case '.domains':
      return Domain.get(documentId, options);
    case '.collections':
      return Collection.get(this.id, documentId, options);
    case '.views':
      return View.get(this.id, documentId, options);
    case '.pages':
      return Page.get(this.id, documentId, options);
    case '.actions':
      return Action.get(this.id, documentId, options);
    case '.forms':
      return Form.get(this.id, documentId, options);
    case '.roles':
      return Role.get(this.id, documentId, options);
    case '.groups':
      return Group.get(this.id, documentId, options);
    case '.profiles':
      return Profile.get(this.id, documentId, options);
    case '.files':
      return File.get(this.id, documentId, options);
    case '.users':
      return User.get(documentId, options);
    default:
      return Document.get(this.id, collectionId, documentId, options);
    }
  },

  mgetDocuments: function(ids, options){
    var domainId = this.id;
    return this._getElasticSearch().mget({
      body: {
        docs: _.reduce(ids, function(result, value, key){
                result.push({_index:documentAllAlias(domainId, value.collectionId), _type: Document.TYPE, _id: value.id});
                return result;
              },[])
      }
    });
  },

  refresh: function(options) {
    return this._getElasticSearch().indices.refresh({ index: this.id + '~*' });
  },

});
