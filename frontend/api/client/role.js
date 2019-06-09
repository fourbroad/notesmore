import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  ROLES = '.roles';

var client;

export default function Role(domainId, roleData, isNew) {
  Document.call(this, domainId, ROLES, roleData, isNew);
}

_.assign(Role, {
  
  init(config) {
    client = config.client;
    return Role;
  },

  create(domainId, id, roleRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = roleRaw;
      roleRaw = id;
      id = uuidv4();
    }
  	return client.emit('createRole', domainId, id, roleRaw, options).then(roleData => new Role(domainId, roleData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'))
  　}
    return client.emit('getRole', domainId, id, options).then(roleData => new Role(domainId, roleData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }  	  	  	
    return client.emit('findRoles', domainId, query, options).then( data => {
      data.roles = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Role(index[0], v));
      	return r;
      }, []);

      delete data.documents;
      return data;
  	});
  }

});

inherits(Role, Document, {

  _create(domainId, collectionId, roleData){
    return new Role(domainId, roleData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Role;
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
  	let newRole = _.cloneDeep(this), opts = {};
   	newRole.title = title||newRole.title;
   	delete newRole.id;
    return Role.create(this.domainId, this.id, newRole, opts);
  }

});
