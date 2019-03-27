const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  ROLES = '.roles';

var cache, client;

function Role(domainId, roleData) {
  Document.call(this, domainId, ROLES, roleData);
}

_.assign(Role, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Role;
  },

  create: function(domainId, id, roleRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      roleRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = roleRaw;
      roleRaw = id;
      id = uuidv4();
    }
  	
    client.emit('createRole', domainId, id, roleRaw, function(err, roleData) {
      if(err) return callback ? callback(err) : console.log(err);

      var role = new Role(domainId, roleData);
      callback ? callback(null, role) : console.log(role);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}
  	
    client.emit('getRole', domainId, id, function(err, roleData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var role = new Role(domainId, roleData);
      callback ? callback(null, role) : console.log(role);
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
  	  	  	
    client.emit('findRoles', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var roles = _.map(data.hits.hits, function(roleData){
      	    return new Role(domainId, roleData._source);
          }), result = {total:data.hits.total, roles: roles};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Role, Document, {

  _create: function(domainId, collectionId, roleData){
    return new Role(domainId, roleData);
  },

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Role;
  },

  saveAs: function(id, title, callback){
  	var newRole = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newRole.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newRole.title = title;
   	delete newRole.id;
	
	Role.create(this.domainId, this.id, newRole, callback);
  }

});

module.exports = Role;
