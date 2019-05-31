import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  PROFILES = '.profiles';

var client;

export default function Profile(domainId, profileData, isNew) {
  Document.call(this, domainId, PROFILES, profileData, isNew);
}

_.assign(Profile, {
  
  init: function(config) {
    client = config.client;
    return Profile;
  },

  create: function(domainId, id, profileRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = profileRaw;
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = profileRaw;
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = profileRaw;
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = profileRaw;
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }
  	
    client.emit('createProfile', domainId, id, profileRaw, options, function(err, profileData) {
      if(err) return callback ? callback(err) : console.error(err);

      var profile = new Profile(domainId, profileData);
      callback ? callback(null, profile) : console.log(profile);
    });    
  },

  get: function(domainId, id, options, callback){
  　if(arguments.length < 2){
  　	var err = makeError(400, 'argumentsError', 'Arguments is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 3 && typeof arguments[2] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}

    client.emit('getProfile', domainId, id, options, function(err, profileData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var profile = new Profile(domainId, profileData);
      callback ? callback(null, profile) : console.log(profile);
    });
  },

  find: function(domainId, query, options, callback) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      var err = makeError(400, 'argumentsError', 'Arguments is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
    } else if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}
  	  	  	
    client.emit('findProfiles', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.profile = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Profile(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Profile, Document, {

  _create: function(domainId, collectionId, profileData){
    return new Profile(domainId, profileData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Profile;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newProfile.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newProfile = _.cloneDeep(this), opts = {};

   	newProfile.title = title;
   	delete newProfile.id;

	Profile.create(this.domainId, this.id, newProfile, opts, callback);
  }

});
