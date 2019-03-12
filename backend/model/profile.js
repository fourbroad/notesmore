
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, profileId, profileData, callback) {
    if(!_.at(profileData, '_meta.metaId')[0]) _.set(profileData, '_meta.metaId', '.meta-profile');
    Document.create.call(this, authorId, domainId, PROFILES, profileId, profileData, function(err, document){
      if(err) return callback && callback(err);
      Profile.get(domainId, profileId, callback);
    });
  },

  get: function(domainId, profileId, callback) {
    getEntity(elasticsearch, cache, domainId, PROFILES, profileId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Profile(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, PROFILES, query, callback);
  }

});

inherits(Profile, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.profiles~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.profiles~events-1';
  }

});

module.exports = Profile;
