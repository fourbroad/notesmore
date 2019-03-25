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
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document')
  , {uniqueId, documentHotAlias, inherits, buildMeta, getEntity} = require('./utils');

const DOMAINS = '.domains'
  , ROOT = '.root'
  , DEFAULT_COLUMNS = [{
  title: "Id",
  name: "id",
  data: "id",
  className: "id"
}, {
  title: "Title",
  name: "title",
  data: "title",
  className: "title"
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
  type: "keywords"
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
  title: "Collections"
}, {
  id: ".metas",
  title: "Metas"
}, {
  id: ".pages",
  title: "Pages"
}, {
  id: ".views",
  title: "Views"
}, {
  id: ".forms",
  title: "Forms"
}, {
  id: ".actions",
  title: "Actions"
}, {
  id: ".files",
  title: "Files",
  _meta: {
    actions: ['uploadFiles']
  }
}, {
  id: ".roles",
  title: "Roles"
}, {
  id: ".groups",
  title: "Groups"
}, {
  id: ".profiles",
  title: "Profiles"
}]
  , ROOT_COLLECTIONS = [{
  id: ".users",
  title: "Users"
}, {
  id: ".domains",
  title: "Domains"
}]
  , ACTIONS = [{
  id: "edit",
  title: "Edit(Json)",
  plugin: {
    name: "@notesabc/form",
    mode: 'offline',
    js: "@notesabc/form/form.bundle.js",
    css: "@notesabc/form/form.bundle.css"
  }
}, {
  id: "gridView",
  title: "Grid View",
  plugin: {
    name: "@notesabc/view",
    mode: 'offline',
    js: "@notesabc/view/view.bundle.js",
    css: "@notesabc/view/view.bundle.css"
  }
}, {
  id: 'signup',
  title: 'Signup',
  plugin: {
    name: "@notesabc/signup",
    mode: 'offline',
    js: "@notesabc/signup/signup.bundle.js",
    css: "@notesabc/signup/signup.bundle.css"
  }
}, {
  id: 'workbench',
  title: "Workbench",
  plugin: {
    name: "@notesabc/workbench",
    mode: 'offline',
    js: "@notesabc/workbench/workbench.bundle.js",
    css: "@notesabc/workbench/workbench.bundle.css"
  }

}, {
  id: 'dashboard',
  title: 'Dashboard',
  plugin: {
    name: "@notesabc/dashboard",
    mode: 'offline',
    js: "@notesabc/dashboard/dashboard.bundle.js",
    css: "@notesabc/dashboard/dashboard.bundle.css"
  }
}, {
  id: 'calendar',
  title: "Calendar",
  plugin: {
    name: "@notesabc/calendar",
    mode: 'offline',
    js: "@notesabc/calendar/calendar.bundle.js",
    css: "@notesabc/calendar/calendar.bundle.css"
  }
}, {
  id: 'chat',
  title: "Chat",
  plugin: {
    name: "@notesabc/chat",
    mode: 'offline',
    js: "@notesabc/chat/chat.bundle.js",
    css: "@notesabc/chat/chat.bundle.css"
  }
}, {
  id: 'email',
  title: "Email",
  plugin: {
    name: "@notesabc/email",
    mode: 'offline',
    js: "@notesabc/email/email.bundle.js",
    css: "@notesabc/email/email.bundle.css"
  }
}, {
  id: "uploadFiles",
  title: "Upload Files",
  plugin: {
    name: "@notesabc/uploadfiles",
    mode: 'offline',
    js: "@notesabc/upload-files/upload-files.bundle.js",
    css: "@notesabc/upload-files/upload-files.bundle.css"
  }
}]
  , METAS = [{
  id: ".meta",
  title: "Meta",
  actions: ['edit']
}, {
  id: ".meta-collection",
  title: "Collection",
  defaultAction: 'gridView',
  actions: ['gridView', 'edit']
}, {
  id: ".meta-page",
  title: "Page",
  actions: ['edit']  
}, {
  id: ".meta-view",
  title: "View",
  defaultAction: "gridView",
  actions: ['gridView', 'edit']
}, {
  id: ".meta-form",
  title: "Form",
  actions: ['edit']  
}, {
  id: ".meta-action",
  title: "Action",
  actions: ['edit']  
}, {
  id: ".meta-file",
  title: "File",
  actions: ['edit']  
}, {
  id: ".meta-role",
  title: "Role",
  actions: ['edit']  
}, {
  id: ".meta-group",
  title: "Group",
  actions: ['edit']  
}, {
  id: ".meta-profile",
  title: "Profile",
  actions: ['edit']  
}]
  , ROOT_METAS = [{
  id: ".meta-user",
  title: "User",
  actions: ['edit']  
}, {
  id: ".meta-domain",
  title: "Domain",
  actions: ['edit']  
}, ]
  , PAGES = [{
  id: ".signup",
  title: "Signup",
  _meta: {
    actions: ['signup']
  }
}, {
  id: ".workbench",
  title: "Workbench",
  _meta: {
    actions: ['workbench']
  }
}, {
  id: ".dashboard",
  title: "Dashboard",
  _meta: {
    actions: ['dashboard']
  }
}, {
  id: ".calendar",
  title: "Calendar",
  _meta: {
    actions: ['calendar']
  }
}, {
  id: ".chat",
  title: "Chat",
  _meta: {
    actions: ['chat']
  }
}, {
  id: ".email",
  title: "Email",
  _meta: {
    actions: ['email']
  }
}]
  , ROLES = [{
  id: "administrator",
  title: "Administrator"
}, {
  id: "anonymous",
  title: "Anonymous"
}]
  , ADMINISTRATOR = {
  id: "administrator",
  title: "Administrator",
  password: "3c3f601a1960b8d7b347d376d52b6e59"
}
  , ANONYMOUS = {
  id: "anonymous",
  title: "anonymous",
  password: "a29b1ee7caefc17a3a73d6d137c8169b"
};

function indexName(domainId, collectionId) {
  return domainId + `~` + collectionId + '~snapshots-1';
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
    return Collection.putTemplate(domainId, col.id);
  }));
}

function createIndices(domainId) {
  var cols = domainId == ROOT ? COLLECTIONS.concat(ROOT_COLLECTIONS) : COLLECTIONS;
  return Promise.all(_.map(cols, function(col) {
    return Collection.createIndex(domainId, col.id);
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

  create: function(authorId, domainId, domainData) {
    var self = this, promise;

    if (domainId == ROOT) {
      promise = initDomain(authorId, 'Administrator', domainId);
    } else {
      promise = User.get(authorId).then(user=>initDomain(authorId, user.title, domainId));
    }

    if (!_.at(domainData, '_meta.metaId')[0])
      _.set(domainData, '_meta.metaId', '.meta-domain');

    return promise.then(result=>{
      return Document.create.call(self, authorId, ROOT, DOMAINS, domainId, domainData);
    }
    ).then(()=>{
      return Domain.get(domainId)
    }
    );

  },

  get: function(domainId) {
    return getEntity(elasticsearch, cache, ROOT, DOMAINS, domainId).then(source=>{
      return new Domain(source);
    }
    );
  },

  find: function(query) {
    return Document.find.call(this, ROOT, DOMAINS, query);
  }

});

inherits(Domain, Document, {
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  delete: function(authorId) {
    var es = this._getElasticSearch()
      , self = this;
    return Domain.parent.delete.call(this, authorId).then(result=>{
      return es.indices.delete({
        index: self.id + '~*'
      });
    }
    ).then(result=>{
      return true;
    }
    );
  },

  findCollections: function(query) {
    return Collection.find(this.id, query);
  },

  distinctQueryCollections: function(field, wildcard) {
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

  getDocument: function(collectionId, documentId) {
    switch (collectionId) {
    case '.metas':
      return Meta.get(documentId);
    case '.domains':
      return Domain.get(documentId);
    case '.collections':
      return Collection.get(documentId);
    case '.views':
      return View.get(documentId);
    case '.pages':
      return Page.get(documentId);
    case '.actions':
      return Action.get(documentId);
    case '.forms':
      return Form.get(documentId);
    case '.roles':
      return Role.get(documentId);
    case '.groups':
      return Group.get(documentId);
    case '.profiles':
      return Profile.get(documentId);
    case '.users':
      return User.get(documentId);
    default:
      return Document.get(this.id, collectionId, documentId);
    }
  },

  refresh: function() {
    return this._getElasticSearch().indices.refresh({
      index: this.id + '~*'
    });
  },

});
