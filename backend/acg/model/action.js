
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

const
  ACTIONS = '.actions';

var elasticsearch, cache;

function Action(domainId, actionData) {
  Document.call(this, domainId, ACTIONS, actionData);
}

_.assign(Action, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Action;
  },

  create: function(authorId, domainId, actionId, actionData, options){
    if(!_.at(actionData, '_meta.metaId')[0]) _.set(actionData, '_meta.metaId', '.meta-action');
    return createEntity(elasticsearch, authorId, domainId, ACTIONS, actionId, actionData, options).then((data) => {
      return new Action(domainId, data);
    });
  },

  get: function(domainId, actionId, options) {
    return getEntity(elasticsearch, cache, domainId, ACTIONS, actionId, options).then( source => {
      return new Action(domainId, source);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, ACTIONS, query, options);
  }

});

inherits(Action, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Action;
