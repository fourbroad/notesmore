
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, groupId, groupData, callback){
    if(!_.at(groupData, '_meta.metaId')[0]) _.set(groupData, '_meta.metaId', '.meta-group');
    Document.create.call(this, authorId, domainId, GROUPS, groupId, groupData, function(err, document){
      if(err) return callback && callback(err);
      Group.get(domainId, groupId, callback);
    });
  },

  get: function(domainId, groupId, callback) {
    getEntity(elasticsearch, cache, domainId, GROUPS, groupId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Form(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, GROUPS, query, callback);
  }

});

inherits(Group, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.groups~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.groups~events-1';
  }

});

module.exports = Group;
