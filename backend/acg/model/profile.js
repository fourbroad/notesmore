
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, profileId, profileData) {
    if(!_.at(profileData, '_meta.metaId')[0]) _.set(profileData, '_meta.metaId', '.meta-profile');
    return Document.create.call(this, authorId, domainId, PROFILES, profileId, profileData).then( document => {
      return Profile.get(domainId, profileId);
    });
  },

  get: function(domainId, profileId) {
    return getEntity(elasticsearch, cache, domainId, PROFILES, profileId).then( source => {
      return new Profile(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, PROFILES, query);
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