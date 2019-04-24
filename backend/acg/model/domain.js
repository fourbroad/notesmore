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
  , {DEFAULT_ACL, DEVELOPER_ACL, DEFAULT_COLUMNS, DEFAULT_SEARCH_COLUMNS, COLLECTIONS, ROOT_COLLECTIONS, VIEWS, ACTIONS, METAS, ROOT_METAS, PAGES, ROLES, ADMINISTRATOR, ANONYMOUS} = require('./data')
  , {uniqueId, documentHotAlias, documentAllAlias, inherits, buildMeta, createEntity, getEntity} = require('./utils');

const DOMAINS = '.domains'
  , ROOT = '.root';

function indexName(domainId, collectionId) {
  return domainId + `~` + collectionId + '~snapshots~1-1';
}

function createMeta(authorId, doc) {
  var _meta = doc._meta || {}
    , timestamp = new Date().getTime();
  _meta.acl = _.merge(_.mergeWith(_.cloneDeep(DEFAULT_ACL), DEVELOPER_ACL,(objValue, srcValue)=>{
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }), _.at(doc, '_meta.acl')[0]);
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
      names: ["id", "title", "_meta.author"]
    };
    c.sort = [{"_meta.updated": {order: "desc"}},{"_meta.created": {order: "desc"}}];
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

function buildViewBatch(authorId, domainId) {
  return _.flatMap(_.map(VIEWS, function(view) {
    var v = _.cloneDeep(view);
    v.columns = DEFAULT_COLUMNS;
    v.searchColumns = DEFAULT_SEARCH_COLUMNS;
    v.search = {
      names: ["id", "title", "_meta.author"]
    };
    v.sort = [{"_meta.updated": {order: "desc"}},{"_meta.created": {order: "desc"}}];
    v._meta = createMeta(authorId, v);
    v._meta.metaId = '.meta-view';
    return [{
      index: {
        _index: indexName(domainId, '.views'),
        _type: Document.TYPE,
        _id: v.id
      }
    }, v];
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
      , vb = buildViewBatch(authorId, domainId)
      , ab = buildActionBatch(authorId, domainId)
      , pb = buildPageBatch(authorId, domainId)
      , rb = buildRoleBatch(authorId, domainId)
      , ub = buildUserBatch(authorId, authorTitle, domainId);
    return elasticsearch.bulk({
      body: cb.concat(mb).concat(vb).concat(ab).concat(pb).concat(rb).concat(ub)
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

    if (!_.at(domainData, '_meta.metaId')[0]) _.set(domainData, '_meta.metaId', '.meta-domain');

    return promise.then(result => {
      return createEntity(elasticsearch, authorId, ROOT, DOMAINS, domainId, domainData, options);
    }).then(data => {
      return new Domain(data);
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
