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
  
  init(config) {
    client = config.client;
    return Profile;
  },

  create(domainId, id, profileRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      profileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = profileRaw;
      profileRaw = id;
      id = uuidv4();
    }  	
    return client.emit('createProfile', domainId, id, profileRaw, options).then(profileData => new Profile(domainId, profileData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'))
  　}
    return client.emit('getProfile', domainId, id, options).then(profileData => new Profile(domainId, profileData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'))
    }  	  	  	
    return client.emit('findProfiles', domainId, query, options).then(data => {
      data.profile = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Profile(index[0], v));
      	return r;
      }, []);

      delete data.documents;
      return data;
	  });
  }

});

inherits(Profile, Document, {

  _create(domainId, collectionId, profileData){
    return new Profile(domainId, profileData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Profile;
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
  	let newProfile = _.cloneDeep(this), opts = {};
   	newProfile.title = title || newProfile.title;
   	delete newProfile.id;
	  return Profile.create(this.domainId, this.id, newProfile, opts);
  }

});
