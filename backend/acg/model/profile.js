
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

const
  PROFILES = '.profiles';

var elasticsearch, cache;

function Profile(domainId, profileData) {
  Document.call(this, domainId, PROFILES, profileData);
}

_.assign(Profile, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Profile;
  },

  create: function(authorId, domainId, profileId, profileData, options) {
    if(!_.at(profileData, '_meta.metaId')[0]) _.set(profileData, '_meta.metaId', '.meta-profile');
    return createEntity(elasticsearch, authorId, domainId, PROFILES, profileId, profileData, options).then((data) => {
      return new Profile(domainId, data);
    });
  },

  get: function(domainId, profileId, options) {
    return getEntity(elasticsearch, cache, domainId, PROFILES, profileId, options).then( data => {
      return new Profile(domainId, data);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, PROFILES, query, options);
  }

});

inherits(Profile, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Profile;
