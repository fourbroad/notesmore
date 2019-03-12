
const _ = require('lodash')
  , createError = require('http-errors')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity, buildMeta} = require('./utils');

const
  COLLECTIONS = '.collections';

var elasticsearch, cache;

function Collection(domainId, colData) {
  Document.call(this, domainId, COLLECTIONS, colData);
}

_.assign(Collection, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Collection;
  },

  create: function(authorId, domainId, collectionId, collectionData, callback){
    if(!_.at(collectionData, '_meta.metaId')[0]) _.set(collectionData, '_meta.metaId', '.meta-collection');
    Document.create.call(this, authorId, domainId, COLLECTIONS, collectionId, collectionData, function(err, document){
      if(err) return callback && callback(err);
      Collection.get(domainId, collectionId, callback);
    });
  },

  get: function(domainId, collectionId, callback) {
    getEntity(elasticsearch, cache, domainId, COLLECTIONS, collectionId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Collection(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, COLLECTIONS, query, callback);
  }
});

inherits(Collection, Document,{

  _getElasticSearch: function(){
    return elasticsearch;
  },

  _getCache: function(){
    return cache;
  },

  getIndex: function(){
    return this.domainId + '~.collections~snapshots-1';
  },

  getEventIndex: function(){
    return this.domainId + '~.collections~events-1';
  },

  delete: function(authorId, callback){
    var es = this._getElasticSearch(), self = this;
    Collection.parent.delete.call(this, authorId, function(err, result){
      if(err) return callback && callback(err);
      es.indices.delete({ index: self.domainId + '~' + self.id + '~*' }, function(err, result){
        if(err) return callback && callback(err);
        callback && callback(null, true);
      });
    });
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

  bulk: function(authorId, docs, callback){
    var self = this, es = this._getElasticSearch(), batch = [], domainId = this.domainId, promises;

    if(docs.length > 1000){
      return callback && callback(createError(403, 'The number of documents submitted in batches must be less than or equal to 1000.'));
    }

    promises = _.map(docs, function(doc, index){
      var metaId = _.at(doc, '_meta.metaId')[0] || '.meta';
      return new Promise(function(resolve, reject){
        buildMeta(domainId, doc, authorId, metaId, function(err, doc){
          if(err) return resolve({index: index, error:err.toString()});
          return resolve([{index:{_index: domainId + '~' + self.id + '~snapshots-1', _type: Document.TYPE, _id: doc.id || uuidv4()}}, doc]);
        });
      });
    });
    
    Promise.all(promises).then(function(values) {
      var errors = _.filter(values, function(v) { return v.error; });
      if(errors.length > 0){
        callback && callback(errors);
      }else{
        es.bulk({body: _.flatMap(values)}, callback);
      }
    });
  },

  refresh: function(callback){
    this._getElasticSearch().indices.refresh({ index: this.domainId + '~' + this.id + '~*' },callback);
  }

});

module.exports = Collection;
