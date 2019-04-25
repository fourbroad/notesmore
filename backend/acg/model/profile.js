
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
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
    cache = new NodeCache(config.ncConfig);
    return Profile;
  },

  create: function(authorId, domainId, profileId, profileData, options) {
    if(!_.at(profileData, '_meta.metaId')[0]) _.set(profileData, '_meta.metaId', '.meta-profile');
    return createEntity(elasticsearch, authorId, domainId, PROFILES, profileId, profileData, options).then((data) => {
      var profile = new Profile(domainId, data);
      cache.set(uniqueId(domainId, PROFILES, profileId), profile);
      return profile;
    });
  },

  get: function(domainId, profileId, options) {
    var uid = uniqueId(domainId, PROFILES, profileId), version = _.at(options, 'version')[0], profile;
    uid = version ? uid + '~' + version : uid;
    profile = cache.get(uid);
    if(profile){
      return Promise.resolve(profile);
    }else{
      return getEntity(elasticsearch, domainId, PROFILES, profileId, options).then( source => {
        profile = new Profile(domainId, source);
        cache.set(uid, profile);
        return profile;
      });
    }
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
