
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, viewId, viewData) {
    if(!_.at(viewData, '_meta.metaId')[0]) _.set(viewData, '_meta.metaId', '.meta-view');
    return Document.create.call(this, authorId, domainId, VIEWS, viewId, viewData).then( document => {
      return View.get(domainId, viewId);
    });
  },

  get: function(domainId, viewId) {
    return getEntity(elasticsearch, cache, domainId, VIEWS, viewId).then( source => {
      return new View(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, VIEWS, query);
  }

});

inherits(View, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  findDocuments: function(query) {
    var indices = _joinIndices(this.domainId, this.collections);
    query.index = indices;
    query.type = Document.TYPE;
  	return this._getElasticSearch().search(query).then(function(data){
  	  var result = {
  	    total:data.hits.total,
  	    offset: query.from || 0,
  	    documents: _.reduce(data.hits.hits, function(r, v, k){
  	      var doc = _.cloneDeep(v._source);
  	      doc.id = doc.id || v._id;
  	      doc._meta.index = v._index;
  	      r.push(doc);
  	      return r;  	        	      
  	    },[])
  	  };
  	  
  	  if(data._scroll_id) result.scrollId = data._scroll_id;
  	  
  	  return result;
  	});
  },

  distinctQuery: function(field, wildcard) {
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
    return this.findDocuments(query);
  },

  refresh: function() {
    return this._getElasticSearch().indices.refresh({ index: _joinIndices(this.domainId, this.collections) });
  }

});

module.exports = View;
