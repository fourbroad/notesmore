
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
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
    cache = new NodeCache(config.ncConfig);
    return Page;
  },

  create: function(authorId, domainId, pageId, pageData, options){
    if(!_.at(pageData, '_meta.metaId')[0]) _.set(pageData, '_meta.metaId', '.meta-page');
    return createEntity(elasticsearch, authorId, domainId, PAGES, pageId, pageData, options).then((data) => {
      var page = new Page(domainId, data);
      cache.set(uniqueId(domainId, PAGES, pageId), page);
      return page;
    });
  },

  get: function(domainId, pageId, options) {
    var uid = uniqueId(domainId, PAGES, pageId), version = _.at(options, 'version')[0], page;
    uid = version ? uid + '~' + version : uid;
    page = cache.get(uid);
    if(page){
      return Promise.resolve(page);
    }else{
      return getEntity(elasticsearch, domainId, PAGES, pageId, options).then( data => {
        page = new Page(domainId, data);
        cache.set(uid, page);
        return page;
      });
    }
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
