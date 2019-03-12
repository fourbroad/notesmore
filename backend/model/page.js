
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, pageId, pageData, callback){
    if(!_.at(pageData, '_meta.metaId')[0]) _.set(pageData, '_meta.metaId', '.meta-page');
    Document.create.call(this, authorId, domainId, PAGES, pageId, pageData, function(err, document){
      if(err) return callback && callback(err);
      Page.get(domainId, pageId, callback);
    });
  },

  get: function(domainId, pageId, callback) {
    getEntity(elasticsearch, cache, domainId, PAGES, pageId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Page(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, PAGES, query, callback);
  }

});

inherits(Page, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.pages~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.pages~events-1';
  }

});

module.exports = Page;
