module.exports = Document;

const _ = require('lodash')
  , createError = require('http-errors')
  , jsonPatch = require('fast-json-patch')
  , { uniqueId, documentHotAlias, documentAllAlias, eventAllAlias, buildMeta, getEntity} = require('./utils');

const DOC_TYPE = 'snapshot'
  , EVENT_TYPE = 'event'
  , DEFAULT_ACL = {
    patch: {
      roles: ["administrator"]
    },
    delete: {},
    getAcl: {
      roles: ["administrator"]
    },
    patchAcl: {
      roles: ["administrator"]
    },
    clearAclSubject: {
      roles: ["administrator"]
    }
  };

var elasticsearch, cache;

function Document(domainId, collectionId, docData) {
  Object.defineProperties(this, {
    domainId: {
     value: domainId,
     writable: false,
     enumerable: false,
     configurable: false
    },
    collectionId: {
      value: collectionId,
      writable: false,
      enumerable: false,
      configurable: false
    },
    id: {
      value: docData.id,
      writable: false,
      enumerable: true,
      configurable: false
    }
  });
    
  _.assign(this, docData);

  Object.defineProperties(this, {
    _meta: {
      value: this._meta,
      writable: true,
      enumerable: true,
      configurable: false
    }
  });
}

_.assign(Document, {
  
  TYPE: DOC_TYPE,

  EVENT_TYPE:EVENT_TYPE,

  DEFAULT_ACL: DEFAULT_ACL,

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Document;
  },

  create: function(authorId, domainId, collectionId, documentId, docData){
    var self = this, metaId = _.at(docData, '_meta.metaId')[0] || '.meta';
    docData.id = documentId;
    return buildMeta(domainId, docData, authorId, metaId).then( docData => {
      return elasticsearch.create({ index: documentHotAlias(domainId, collectionId), type: DOC_TYPE, id: documentId, body: docData });
    }).then( result => {
      return Document.get(domainId, collectionId, documentId);
    });
  },

  get: function(domainId, collectionId, documentId){
    return getEntity(elasticsearch, cache, domainId, collectionId, documentId).then(source => {
      return new Document(domainId, collectionId, source);
    });
  },

  find: function(domainId, collectionId, query) {
    query.index = documentAllAlias(domainId, collectionId || '*');
    query.type = DOC_TYPE;
  	return elasticsearch.search(query);
  },

  scroll: function(params){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　  return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!')); 
  　}
  　return elasticsearch.scroll(params);
  },

  clearScroll: function(params){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　  return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!')); 
  　}
  　return elasticsearch.clearScroll(params);
  }

});

_.assign(Document.prototype, {
  _getElasticSearch: function(){
    return elasticsearch;
  },

  _getCache: function(){
    return cache;
  },

  getEventHotAlias: function(){
    return this.domainId + '~' + this.collectionId + '~hot~events';
  },

  get: function() {
    return Promise.resolve(this);
  },

  _doPatch: function(patch) {
    var esc = this._getElasticSearch(), cache = this._getCache(), batch = [], p = patch.patch, errors = jsonPatch.validate(p, this);

    if(errors && errors.length > 0){
      return Promise.reject(errors);
    }

    try {
      newDoc = jsonPatch.applyPatch(jsonPatch.deepClone(this), p).newDocument
	  for(var key in this) {
  		if(this.hasOwnProperty(key)&&!_.isFunction(this[key])) try{delete this[key];}catch(e){}
	  }
      _.merge(this, newDoc);
    } catch (e) {
      return Promise.reject(e);
    }

    if (this._meta.created == this._meta.updated) {
      batch.push({index:{_index: this.getEventHotAlias(), _type: EVENT_TYPE}});
      batch.push({
        id: this.id, 
        patch: [{ op: 'add', path: '', value: JSON.stringify(_.cloneDeep(this)) }],
        version: this._meta.version - 1,
        _meta: patch._meta
      });
    }

    batch.push({index:{_index: this.getEventHotAlias(), _type: EVENT_TYPE}});
    batch.push({
      id: this.id,
      patch: _.reduce(p, function(result,value,key){
               var v = _.cloneDeep(value);
               v.value = JSON.stringify(v.value);
               result.push(v);
               return result;
             }, []),
      version: this._meta.version,
      _meta:patch._meta
    });

    batch.push({index:{ _index: this._meta.index, _type: DOC_TYPE, _id: this.id, _version: this._meta.version }});
    _.merge(this, {_meta:{updated: new Date().getTime(), version: this._meta.version + 1}});
    batch.push(this);

    return esc.bulk({body:batch});
  },

  patch: function(authorId, patch) {
    var self = this, uid = uniqueId(this.domainId, this.collectionId, this.id), 
        metas = _.filter(patch, function(p) { return p.path=="/_meta" || p.path.startsWith("/_meta/"); });
    if(metas.length > 0){
      return Promise.reject(createError(403, 'Modifying "/_meta" in the document is not allowed!'));
    }

    return this._doPatch({patch: patch, _meta:{author: authorId, created: new Date().getTime()}}).then(result => {
      cache.del(uid);
      return self;
    });
  },

  delete: function(authorId) {
    var self = this, docData = JSON.stringify(this), meta = {author: authorId, created: new Date().getTime()};
    return this._getElasticSearch().bulk({ body:[
      {delete:{_index: this._meta.index, _type: DOC_TYPE, _id: this.id}},
      {index: {_index: this.getEventHotAlias(), _type: EVENT_TYPE}},
      {patch: [{op: 'remove', path: '', value: JSON.stringify(docData)}], id:this.id, version: this._meta.version, _meta:meta}
    ]}).then( result =>{
      self._getCache().del(uniqueId(self.domainId, self.collectionId, self.id));
      return true;
    });
  },

  getEvents: function(){
    return this._getElasticSearch().search({
      index: eventAllAlias(this.domainId, this.collectionId), 
      type: EVENT_TYPE,
      body: {
        query:{
          match:{id:this.id}
        }
      }
    });
  },

  getAcl: function() {
    return Promise.resolve(this._meta.acl);
  },


  patchAcl: function(authorId, aclPatch) {
    var self = this, uid = uniqueId(this.domainId, this.collectionId, this.id);
    _.each(aclPatch, function(p){ p.path = "/_meta/acl" + p.path; });
    return this._doPatch({patch: aclPatch, _meta:{author: authorId, created: new Date().getTime()}}).then(result => {
      return self._meta.acl;
    }).finally(()=>{
      self._getCache().del(uid);
    });
  },

  clearAclSubject: function(visitorId, method, rgu, subjectId) {
    var self = this, uid = uniqueId(this.domainId, this.collectionId, this.id), acl = _.cloneDeep(this._meta.acl), patch;
    if(method == '*'){
      _.each(acl,function(v1,k1){
        _.each(v1, function(v2,k2){
         if(k2 == rgu){
            _.remove(v2, function(u){return u == subjectId});
            return false;           
         }else if('*' == rgu){
           _.remove(v2, function(u){return u == subjectId});
         }
        });
      });
    } else if(acl[method]){
      _.each(acl[method], function(v2,k2){
         if(k2 == rgu){
            _.remove(v2, function(u){return u == subjectId});
            return false;           
         }else if('*' == rgu){
           _.remove(v2, function(u){return u == subjectId});
         }
      });
    }

    patch = jsonPatch.compare({_meta:{acl:this._meta.acl}}, {_meta:{acl:acl}});

    return this._doPatch({patch: patch, _meta:{author: authorId, created: new Date().getTime()}}).then( result => {
      return self._meta.acl;
    }).finally(()=>{
      self._getCache().del(uid);
    });
  },

  getMetaId: function() {
    return Promise.resolve(this._meta.metaId);
  }

});

// module.exports = Document;
