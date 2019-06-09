import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import Domain from './domain';
import {inherits, uniqueId, makeError} from './utils';
  
const
  USERS = '.users';

var client;

export default function User(userData, isNew) {
  Document.call(this, Domain.ROOT, USERS, userData, isNew);
}

_.assign(User, {
  
  init(config) {
    client = config.client;
    return User;
  },

  create(id, userRaw, options){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      userRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arguments[0] == 'object' && typeof arguments[1] == 'object'){
      options = userRaw;
      userRaw = id;
      id = uuidv4();
    }
  	return client.emit('createUser', id, userRaw, options).then( userData => new User(userData));
  },

  get(id, options){
    return client.emit('getUser', id, options).then(userData => new User(userData));
  },

  find(query, options) {
    return client.emit('findUsers', query, options).then(data => {
      data.users = _.reduce(data.documents, function(r, v, k){
      	r.push(new User(v));
      	return r;
      }, []);
      delete data.documents;
      return data;
  	});
  }

});

inherits(User, Document, {

  _create(domainId, collectionId, userData){
    return new User(userData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return User;
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
  	let newUser = _.cloneDeep(this), opts = {};
   	newUser.title = title || newUser.title;
   	delete newUser.id;
	  return User.create(this.domainId, this.id, newUser, opts);
  },

  resetPassword(newPassword, options) {
    return this.getClient().emit('resetPassword', this.id, newPassword, options);
  }

});

