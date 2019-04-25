
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
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
    cache = new NodeCache(config.ncConfig);
    return Action;
  },

  create: function(authorId, domainId, actionId, actionData, options){
    if(!_.at(actionData, '_meta.metaId')[0]) _.set(actionData, '_meta.metaId', '.meta-action');
    return createEntity(elasticsearch, authorId, domainId, ACTIONS, actionId, actionData, options).then((data) => {
      var action = new Action(domainId, data);
      cache.set(uniqueId(domainId, ACTIONS, actionId), action);
      return action;
    });
  },

  get: function(domainId, actionId, options) {
    var uid = uniqueId(domainId, ACTIONS, actionId), version = _.at(options, 'version')[0], action;
    uid = version ? uid + '~' + version : uid;
    action = cache.get(uid);
    if(action){
      return Promise.resolve(action);
    }else{
      return getEntity(elasticsearch, domainId, ACTIONS, actionId, options).then( source => {
        action = new Action(domainId, source);
        cache.set(uid, action);
        return action;
      });
    }
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, ACTIONS, query, options);
  }

});

inherits(Action, Document, {
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Action;
