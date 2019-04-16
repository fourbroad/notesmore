const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  ROLES = '.roles';

var lient;

function Role(domainId, roleData) {
  Document.call(this, domainId, ROLES, roleData);
}

_.assign(Role, {
  
  init: function(config) {
    client = config.client;
    return Role;
  },

  create: function(domainId, id, roleRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = roleRaw;
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = roleRaw;
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = roleRaw;
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = roleRaw;
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }
  	
    client.emit('createRole', domainId, id, roleRaw, options, function(err, roleData) {
      if(err) return callback ? callback(err) : console.error(err);

      var role = new Role(domainId, roleData);
      callback ? callback(null, role) : console.log(role);
    });    
  },

  get: function(domainId, id, options, callback){
  　if(arguments.length < 2){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 3 && typeof arguments[2] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}
  	
    client.emit('getRole', domainId, id, options, function(err, roleData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var role = new Role(domainId, roleData);
      callback ? callback(null, role) : console.log(role);
    });
  },

  find: function(domainId, query, options, callback) {
  	if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}
  	  	  	
    client.emit('findRoles', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.roles = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Role(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Role, Document, {

  _create: function(domainId, collectionId, roleData){
    return new Role(domainId, roleData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Role;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newRole.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newRole = _.cloneDeep(this), opts = {};

   	newRole.title = title;
   	delete newRole.id;

   	if(newRole._meta.roadmap){
   	  opts.roadmap = newRole._meta.roadmap;
   	}
	
	Role.create(this.domainId, this.id, newRole, opts, callback);
  }

});

module.exports = Role;
