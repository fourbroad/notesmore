module.exports = User;

const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , Domain = require('./domain')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  USERS = '.users';

var client;

function User(userData) {
  Document.call(this, Domain.ROOT, USERS, userData);
}

_.assign(User, {
  
  init: function(config) {
    client = config.client;
    return User;
  },

  create: function(id, userRaw, options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      userRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = userRaw;
      userRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arugments[0] == 'object' && typeof arugments[0] == 'object'){
      options = userRaw;
      userRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arugments[0] == 'object' && typeof arugments[0] == 'function'){
      callback = userRaw;
      userRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[0] == 'object'){
      callback = options;
      options = userRaw;
      userRaw = id;
      id = uuidv4();
    }
  	
    client.emit('createUser', id, userRaw, options, function(err, userData) {
      if(err) return callback ? callback(err) : console.error(err);

      var user = new User(userData);
      callback ? callback(null, user) : console.log(user);
    });    
  },

  get: function(id, options, callback){
  	if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
  	  id = undefined;
  	} else if(arguments.length == 1 && typeof arguments[0] == 'function'){
  	  options = id;
  	  id = undefined;
  	} else if(arguments.length == 2 && typeof arguments[0] == 'object' && typeof arguments[1] == 'function'){
  	  callback = options;
  	  options = id;
  	  id = undefined;
  	} else if(arguments.length == 2 && typeof arguments[0] == 'string' && typeof arguments[1] == 'function'){
  	  callback = options,
  	  options = undefined;  		
  	}

    client.emit('getUser', id, options, function(err, userData){
      if(err) return callback ? callback(err) : console.error(err);
      var user = new User(userData);
      callback ? callback(null, user) : console.log(user);
    });
  },

  find: function(query, options, callback) {
  	if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}

    client.emit('findUsers', query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.users = _.reduce(data.documents, function(r, v, k){
      	r.push(new User(v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(User, Document, {

  _create: function(domainId, collectionId, userData){
    return new User(userData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return User;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newUser.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newUser = _.cloneDeep(this), opts = {};

   	newUser.title = title;
   	delete newUser.id;

   	if(newUser._meta.roadmap){
   	  opts.roadmap = newUser._meta.roadmap;
   	}
	
	User.create(this.domainId, this.id, newUser, opts, callback);
  },

  resetPassword: function(newPassword, options, callback) {
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
	  callback = options;
  	  options = undefined;
  	}
    this.getClient().emit('resetPassword', this.id, newPassword, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});
  }

});
