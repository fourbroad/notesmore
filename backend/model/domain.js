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
  , Profile = require('./profile')
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document')
  , initDomain = require('./init')
  , {uniqueId, documentIndex, eventIndex, inherits, buildMeta, getEntity, recoverEntity} = require('./utils');

const
  DOMAINS = '.domains',
  ROOT = '.root';

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

  create: function(authorId, domainId, domainData, callback){
    var metaId = _.at(domainData, '_meta.metaId')[0] || '.meta-domain';
    buildMeta(Domain.ROOT, domainData, authorId, metaId, function(err, domainData){
      if (err) return callback && callback(err);
      domainData.id = domainId;
      elasticsearch.create({ index: documentIndex(ROOT, DOMAINS), type: Document.TYPE, id: domainId, body: domainData }, function(err, result){
        if (err) return callback && callback(err);
        User.get(authorId, function(err, user){
          if (err) return callback && callback(err);
          initDomain(elasticsearch, authorId, domainId, function(err, result){
            if (err) return callback && callback(err);
            Domain.get(domainId, function(err, domain){
              if(err) return callback && callback(err);
              if(domain._meta.version != 1){
                recoverEntity(elasticsearch, cache, authorId, domain, callback);
              }else{
                callback && callback(null, domain);
              }
            });
          })
        });
      });
    })
  },

  get: function(domainId, callback) {
    getEntity(elasticsearch, cache, ROOT, DOMAINS, domainId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Domain(source));      
    });
  },

  find: function(query, callback){
    Document.find.call(this, ROOT, DOMAINS, query, callback);
  }

});

inherits(Domain, Document,{
  _getElasticSearch: function(){
    return elasticsearch;
  },

  _getCache: function(){
    return cache;
  },

  getIndex: function(){
    return '.root~.domains~snapshots-1';
  },

  getEventIndex: function(){
    return '.root~.domains~events-1';
  },

  delete: function(meta, callback){
    var es = this._getElasticSearch(), self = this;
    Domain.parent.delete.call(this, meta, function(err, result){
      if(err) return callback && callback(err);
      es.indices.delete({ index: self.id + '~*'}, function(err, result){
        if(err) return callback && callback(err);
        callback && callback(null, true);
      });
    });
  },  

  findCollections: function(query, callback) {
    Collection.find(this.id, query, callback);
  },

  distinctQueryCollections: function(field, wildcard, callback) {
    var query = {
      collapse: { field: field + '.keyword' },
      aggs: {
        itemCount: {
          cardinality: { field: field + '.keyword' }
        }
      }
    };

    if (wildcard) {
      query.query = { wildcard: {}};
      query.query.wildcard[field + ".keyword"] = wildcard;
    }

    this.findCollections(query, callback);
  },

  getDocument: function(collectionId, documentId, callback) {
    switch(collectionId){
      case '.metas':
        return Meta.get(documentId, callback);
      case '.domains':
        return Domain.get(documentId, callback);
      case '.collections':
        return Collection.get(documentId, callback);
      case '.views':
        return View.get(documentId, callback);
      case '.pages':
        return Page.get(documentId, callback);
      case '.forms':
        return Form.get(documentId, callback);
      case '.roles':
        return Role.get(documentId, callback);
      case '.groups':
        return Group.get(documentId, callback);
      case '.profiles':
        return Profile.get(documentId, callback);
      case '.users':
        return User.get(documentId, callback);
      default:
      	return Document.get(this.id, collectionId, documentId, callback);
    }
  },

  refresh: function(callback){
    this._getElasticSearch().indices.refresh({ index: this.id + '~*' }, callback);
  },

});
