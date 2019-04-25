
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
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
    cache = new NodeCache(config.ncConfig);
    return Group;
  },

  create: function(authorId, domainId, groupId, groupData, options){
    if(!_.at(groupData, '_meta.metaId')[0]) _.set(groupData, '_meta.metaId', '.meta-group');
    return createEntity(elasticsearch, authorId, domainId, GROUPS, groupId, groupData, options).then((data) => {
      var group = new Group(domainId, data);
      cache.set(uniqueId(domainId, GROUPS, groupId), group);
      return group;
    });
  },

  get: function(domainId, groupId, options) {
    var uid = uniqueId(domainId, GROUPS, groupId), version = _.at(options, 'version')[0], group;
    uid = version ? uid + '~' + version : uid;
    group = cache.get(uid);
    if(group){
      return Promise.resolve(group);
    }else{
      return getEntity(elasticsearch, domainId, GROUPS, groupId, options).then( source => {
        group = new Group(domainId, source);
        cache.set(uid, group);
        return group;
      });
    }
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
