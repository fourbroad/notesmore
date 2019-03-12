
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity} = require('./utils');

const
  VIEWS = '.views';

var elasticsearch, cache;

function View(domainId, viewData) {
  Document.call(this, domainId, VIEWS, viewData);
}

function _joinIndices(domainId, collections){
  return _.reduce(collections, function(result, value, key) {
      result.push(domainId+'~'+value+'~*');
      return result;
    }, []).join(',');
}

_.assign(View, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return View;
  },

  create: function(authorId, domainId, viewId, viewData, callback) {
    if(!_.at(viewData, '_meta.metaId')[0]) _.set(viewData, '_meta.metaId', '.meta-view');
    Document.create.call(this, authorId, domainId, VIEWS, viewId, viewData, function(err, document){
      if(err) return callback && callback(err);
      View.get(domainId, viewId, callback);
    });
  },

  get: function(domainId, viewId, callback) {
    getEntity(elasticsearch, cache, domainId, VIEWS, viewId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new View(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, VIEWS, query, callback);
  }

});

inherits(View, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.views~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.views~events-1';
  },

  findDocuments: function(query, callback) {
    var indices = _joinIndices(this.domainId, this.collections),
        q = {
          index: indices, 
          type: Document.TYPE,
          body: query
    };
  	this._getElasticSearch().search(q, callback);  	
  },

  distinctQuery: function(field, wildcard, callback) {
    var query = {
      collapse: { field: field + '.keyword' },
      aggs: {
        itemCount: {
          cardinality: { field: field + '.keyword' }
        }
      },
      _source: [field]
    };

    if (wildcard) {
      query.query = { wildcard: {} };
      query.query.wildcard[field + ".keyword"] = wildcard;
    }
    this.findDocuments(query, callback);
  },

  refresh: function(callback) {
    this._getElasticSearch().indices.refresh({ index: _joinIndices(this.domainId, this.collections) },callback);
  }

});

module.exports = View;
