
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity} = require('./utils');

const
  ROLES = '.roles';

var elasticsearch, cache;

function Role(domainId, roleData) {
  Document.call(this, domainId, ROLES, roleData);
}

_.assign(Role, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Role;
  },

  create: function(authorId, domainId, roleId, roleData, metaId, callback) {
    if(!_.at(roleData, '_meta.metaId')[0]) _.set(roleData, '_meta.metaId', '.meta-role');
    Document.create.call(this, authorId, domainId, ROLES, roleId, roleData, metaId, function(err, document){
      if(err) return callback && callback(err);
      Role.get(domainId, roleId, callback);
    });
  },

  get: function(domainId, roleId, callback) {
    getEntity(elasticsearch, cache, domainId, ROLES, roleId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Role(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, ROLES, query, callback);
  }
  
});

inherits(Role, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.roles~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.roles~events-1';
  }

});

module.exports = Role;
