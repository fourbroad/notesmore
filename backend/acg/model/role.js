
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
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
    cache = new NodeCache(config.ncConfig);
    return Role;
  },

  create: function(authorId, domainId, roleId, roleData, options) {
    if(!_.at(roleData, '_meta.metaId')[0]) _.set(roleData, '_meta.metaId', '.meta-role');
    return createEntity(elasticsearch, authorId, domainId, ROLES, roleId, roleData, options).then((data) => {
      var role = new Role(domainId, data);
      cache.set(uniqueId(domainId, ROLES, roleId), role);
      return role;
    });
  },

  get: function(domainId, roleId, options) {
    var uid = uniqueId(domainId, ROLES, roleId), version = _.at(options, 'version')[0], role;
    uid = version ? uid + '~' + version : uid;
    role = cache.get(uid);
    if(role){
      return Promise.resolve(role);
    }else{
      return getEntity(elasticsearch, domainId, ROLES, roleId, options).then( data => {
        role = new Role(domainId, data);
        cache.set(uid, role);
        return role;
      });
    }
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
