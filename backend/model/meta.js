module.exports = Meta;

const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity, recoverEntity} = require('./utils');

const METAS = '.metas';

var elasticsearch, cache;

function Meta(domainId, metaData) {
  Document.call(this, domainId, METAS, metaData);
}

_.assign(Meta, {

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Meta;
  },

  create: function(authorId, domainId, metaId, metaData, callback){
    if(metaId == '.meta'){
      var _meta = metaData._meta || {}, timestamp = new Date().getTime();
      _meta.acl = doc._meta.acl || {};
      _meta = _.merge(_meta, {created:timestamp, updated:timestamp, version:1});
      _meta.author = authorId;
      metaData._meta = _meta;
      metaData.id = metaId;
      elasticsearch.create({ index: documentIndex(domainId, METAS), type: Document.TYPE, id: metaId, body: metaData }, function(err, result){
        if (err) return callback && callback(err);
        Meta.get(domainId, metaId, function(err, meta){
          if(err) return callback && callback(err);
          if(meta._meta.version != 1){
            recoverEntity(elasticsearch, cache, authorId, meta, callback);
          }else{
            callback && callback(null, meta);            
          }
        });
      });
    }else{
      Document.create.call(this, authorId, domainId, METAS, metaId, metaData, function(err, document){
      if(err) return callback && callback(err);
      Meta.get(domainId, metaId, callback);
    });      
    }
  },

  get: function(domainId, metaId, callback) {
    getEntity(elasticsearch, cache, domainId, METAS, metaId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Meta(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, METAS, query, callback);
  }

});

inherits(Meta, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.metas~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.metas~events-1';
  }

});

// module.exports = Meta;
