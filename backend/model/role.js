
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, roleId, roleData, metaId) {
    if(!_.at(roleData, '_meta.metaId')[0]) _.set(roleData, '_meta.metaId', '.meta-role');
    return Document.create.call(this, authorId, domainId, ROLES, roleId, roleData, metaId).then( document => {
      return Role.get(domainId, roleId);
    });
  },

  get: function(domainId, roleId) {
    return getEntity(elasticsearch, cache, domainId, ROLES, roleId).then( source => {
      return new Role(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, ROLES, query);
  }
  
});

inherits(Role, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Role;
