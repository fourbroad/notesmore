
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, pageId, pageData){
    if(!_.at(pageData, '_meta.metaId')[0]) _.set(pageData, '_meta.metaId', '.meta-page');
    return Document.create.call(this, authorId, domainId, PAGES, pageId, pageData).then( document => {
      return Page.get(domainId, pageId);
    });
  },

  get: function(domainId, pageId) {
    return getEntity(elasticsearch, cache, domainId, PAGES, pageId).then( source => {
      return new Page(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, PAGES, query);
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
