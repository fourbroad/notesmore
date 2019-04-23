
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

const
  GROUPS = '.groups';

var elasticsearch, cache;

function Group(domainId, groupData) {
  Document.call(this, domainId, GROUPS, groupData);
}

_.assign(Group, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Group;
  },

  create: function(authorId, domainId, groupId, groupData, options){
    if(!_.at(groupData, '_meta.metaId')[0]) _.set(groupData, '_meta.metaId', '.meta-group');
    return createEntity(elasticsearch, authorId, domainId, GROUPS, groupId, groupData, options).then((data) => {
      return new Group(domainId, data);
    });
  },

  get: function(domainId, groupId, options) {
    return getEntity(elasticsearch, cache, domainId, GROUPS, groupId, options).then( source => {
      return new Group(domainId, source);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, GROUPS, query, options);
  }

});

inherits(Group, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Group;
