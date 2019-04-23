
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

const
  PAGES = '.pages';

var elasticsearch, cache;

function Page(domainId, pageData) {
  Document.call(this, domainId, PAGES, pageData);
}

_.assign(Page, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Page;
  },

  create: function(authorId, domainId, pageId, pageData, options){
    if(!_.at(pageData, '_meta.metaId')[0]) _.set(pageData, '_meta.metaId', '.meta-page');
    return createEntity(elasticsearch, authorId, domainId, PAGES, pageId, pageData, options).then((data) => {
      return new Page(domainId, data);
    });
  },

  get: function(domainId, pageId, options) {
    return getEntity(elasticsearch, cache, domainId, PAGES, pageId, options).then( data => {
      return new Page(domainId, data);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, PAGES, query, options);
  }

});

inherits(Page, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Page;
