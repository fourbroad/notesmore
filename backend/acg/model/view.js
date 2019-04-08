
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
  if(_.isEmpty(collections)){
    return domainId + '~*~all~snapshots';
  } else {
    return _.reduce(collections, function(result, value, key) {
      result.push(domainId+'~'+value+'~all~snapshots');
      return result;
    }, []).join(',');
  }
}

function _buildMQuery(domainId, collections, query){
  var mQuery = [], q = _.cloneDeep(query);
  _.merge(q, q.body);
  delete q.body;
  if(_.isEmpty(collections)){
    mQuery.push({index: domainId + '~*~all~snapshots', type: Document.TYPE});
    mQuery.push(q);
  }else{
    _.each(collections, function(value, key) {
      mQuery.push({index: domainId + '~' + value + '~all~snapshots'});
      mQuery.push(q);
    });
  }
  return mQuery;
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
    query.index = _joinIndices(this.domainId, this.collections);
    query.type = Document.TYPE;
  	return this._getElasticSearch().search(query).then(function(data){
  	  var result = {
  	    total:data.hits.total,
  	    offset: query.from || 0,
  	    documents: _.reduce(data.hits.hits, function(r, v, k){
  	      var doc = _.cloneDeep(v._source);
  	      doc.id = doc.id || v._id;
  	      _.set(doc, '_meta.index', v._index);
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
