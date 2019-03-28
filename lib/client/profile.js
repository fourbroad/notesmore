const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  PROFILES = '.profiles';

var cache, client;

function Profile(domainId, profileData) {
  Document.call(this, domainId, PROFILES, profileData);
}

_.assign(Profile, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Profile;
  },

  create: function(domainId, id, profileRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = profileRaw;
      profileRaw = id;
      id = uuidv4();
    }
  	
    client.emit('createProfile', domainId, id, profileRaw, function(err, profileData) {
      if(err) return callback ? callback(err) : console.error(err);

      var profile = new Profile(domainId, profileData);
      callback ? callback(null, profile) : console.log(profile);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}

    client.emit('getProfile', domainId, id, function(err, profileData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var profile = new Profile(domainId, profileData);
      callback ? callback(null, profile) : console.log(profile);
    });
  },

  find: function(domainId, query, callback) {
  	if(arguments.length == 0) {
  	  domainId = '*';
  	  query = {}
  	}else if(arguments.length == 1 && typeof arguments[0]=='object'){
  	  query = domainId;
  	  domainId = '*'  		
  	}else if(arguments.length == 1 && typeof arguments[0]=='function'){
  	  callback = domainId;
  	  query = {};
  	  domainId = '*'
  	}
  	  	  	
    client.emit('findProfiles', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      var profiles = _.map(data.hits.hits, function(profileData){
      	    return new Profile(domainId, profileData._source);
          }), result = {total:data.hits.total, profiles: profiles};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Profile, Document, {

  _create: function(domainId, collectionId, profileData){
    return new Profile(domainId, profileData);
  },

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Profile;
  },

  saveAs: function(id, title, callback){
  	var newProfile = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newProfile.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newProfile.title = title;
   	delete newProfile.id;
	
	Profile.create(this.domainId, this.id, newProfile, callback);
  }

});

module.exports = Profile;
