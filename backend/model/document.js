module.exports = Document;

const _ = require('lodash')
  , createError = require('http-errors')
  , jsonPatch = require('fast-json-patch')
  , { uniqueId, documentIndex, buildMeta, recoverEntity, getEntity} = require('./utils');

const DOC_TYPE = 'snapshot'
  , EVENT_TYPE = 'event';

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

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Document;
  },

  create: function(authorId, domainId, collectionId, documentId, docData, callback){
    var self = this, metaId = _.at(docData, '_meta.metaId')[0] || '.meta';
    docData.id = documentId;
    buildMeta(domainId, docData, authorId, metaId, function(err, docData){
      elasticsearch.create({ index: documentIndex(domainId, collectionId), type: DOC_TYPE, id: documentId, body: docData }, function(err, result){
        if (err) return callback && callback(createError(400,err));
        Document.get(domainId, collectionId, documentId, function(err, document){
          if(err) return callback && callback(err);
          if(document._meta.version != 1){
            recoverEntity(elasticsearch, cache, authorId, document, callback);
          }else{
            callback && callback(null, document);            
          }
        });
        
      });
    });
  },

  get: function(domainId, collectionId, documentId, callback){
    getEntity(elasticsearch, cache, domainId, collectionId, documentId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Document(domainId, collectionId, source));      
    });
  },

  find: function(domainId, collectionId, query, callback) {
    var q = {
      index: documentIndex(domainId, collectionId || '*'), 
      type: DOC_TYPE,
      body: {
        query: query.query
      }
    };
    delete query.query;
  	elasticsearch.search(_.merge(query, q), callback);
  },

  scroll: function(params, callback){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

  　elasticsearch.scroll(params, callback);
  },

  clearScroll: function(params, callback){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

  　elasticsearch.clearScroll(params, callback);
  }

});

_.assign(Document.prototype, {
  _getElasticSearch: function(){
    return elasticsearch;
  },

  _getCache: function(){
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~' + this.collectionId + '~snapshots-1';
  },

  getEventIndex: function(){
    return this.domainId + '~' + this.collectionId + '~events-1';
  },

  get: function(callback) {
    callback && callback(null, this);
  },

  _doPatch: function(patch, callback) {
    var esc = this._getElasticSearch(), cache = this._getCache(), batch = [], p = patch.patch, errors = jsonPatch.validate(p, this);

    if(errors && errors.length > 0){
      return callback && callback(errors);
    }

    try {
      newDoc = jsonPatch.applyPatch(jsonPatch.deepClone(this), p).newDocument
	  for(var key in this) {
  		if(this.hasOwnProperty(key)&&!_.isFunction(this[key])) try{delete this[key];}catch(e){}
	  }
      _.merge(this, newDoc);
    } catch (e) {
      return callback && callback(e);
    }

    if (this._meta.version == 1) {
      batch.push({index:{_index: this.getEventIndex(), _type: EVENT_TYPE}});
      batch.push({
        id: this.id, 
        patch: [{ op: 'add', path: '', value: JSON.stringify(_.cloneDeep(this)) }],
        version: 0,
        _meta: patch._meta
      });
    }

    batch.push({index:{_index: this.getEventIndex(), _type: EVENT_TYPE}});
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

    batch.push({index:{ _index: this.getIndex(), _type: DOC_TYPE, _id: this.id, _version: this._meta.version }});
    _.merge(this, {_meta:{updated: new Date().getTime(), version: this._meta.version + 1}});
    batch.push(this);

    esc.bulk({body:batch}, callback);
  },

  patch: function(authorId, patch, callback) {
    var self = this, uid = uniqueId(this.domainId, this.collectionId, this.id), 
        metas = _.filter(patch, function(p) { return p.path=="/_meta" || p.path.startsWith("/_meta/"); });
    if(metas.length > 0){
      return callback && callback(createError(403, 'Modifying "/_meta" in the document is not allowed!'));
    }
    this._doPatch({patch: patch, _meta:{author: authorId, created: new Date().getTime()}}, function(err, result){
      cache.del(uid);
      
      if(err) {
         return callback && callback(err); 
      }
      callback && callback(null, self);
    });
  },


  delete: function(authorId, callback) {
    var docData = JSON.stringify(this), meta = {author: authorId, created: new Date().getTime()};
    this._getElasticSearch().bulk({ body:[
      {delete:{_index: this.getIndex(), _type: DOC_TYPE, _id: this.id}},
      {index: {_index: this.getEventIndex(), _type: EVENT_TYPE}},
      {patch: [{op: 'remove', path: '', value: JSON.stringify(docData)}], id:this.id, version: this._meta.version, _meta:meta}
    ]}, function(err, result){
      if(err) return callback && callback(createError(400, err)); 
      callback && callback(null, true);   
    });
    this._getCache().del(uniqueId(this.domainId, this.collectionId, this.id));
  },

  getAcl: function(callback) {
    callback && callback(null, this._meta.acl);        
  },


  patchAcl: function(authorId, aclPatch, callback) {
    var self = this, uid = uniqueId(this.domainId, this.collectionId, this.id);
    _.each(aclPatch, function(p){ p.path = "/_meta/acl" + p.path; });
    this._doPatch({patch: aclPatch, _meta:{author: authorId, created: new Date().getTime()}}, function(err, result){
      if(err) {
         cache.del(uid);
         return callback && callback(err); 
      }
      callback && callback(null, self._meta.acl);
    });
  },

  clearAclSubject: function(visitorId, method, rgu, subjectId, callback) {
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
    this._doPatch({patch: patch, _meta:{author: authorId, created: new Date().getTime()}}, function(err, result){
      cache.del(uid);
      if(err) {
         return callback && callback(err); 
      }
      callback && callback(null, self._meta.acl);
    });
  },

  getMetaId: function(callback) {
    callback && callback(null, this._meta.metaId);
  }

});

// module.exports = Document;
