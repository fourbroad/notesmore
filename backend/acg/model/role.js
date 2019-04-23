
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

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

  create: function(authorId, domainId, roleId, roleData, options) {
    if(!_.at(roleData, '_meta.metaId')[0]) _.set(roleData, '_meta.metaId', '.meta-role');
    return createEntity(elasticsearch, authorId, domainId, ROLES, roleId, roleData, options).then((data) => {
      return new Role(domainId, data);
    });
  },

  get: function(domainId, roleId, options) {
    return getEntity(elasticsearch, cache, domainId, ROLES, roleId, options).then( data => {
      return new Role(domainId, data);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, ROLES, query, options);
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
