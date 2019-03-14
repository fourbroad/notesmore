module.exports = User;

const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , Domain = require('./domain')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  USERS = '.users';

var cache, client;

function User(userData) {
  Document.call(this, Domain.ROOT, USERS, userData);
}

_.assign(User, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return User;
  },

  create: function(id, userRaw, callback){
    if(arguments.length == 1){
      userRaw = id;
      id = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = userRaw;
      userRaw = id;
      id = uuidv4();
    }
  	
    client.emit('createUser', id, userRaw, function(err, userData) {
      if(err) return callback ? callback(err) : console.log(err);

      var user = new User(userData);
      callback ? callback(null, user) : console.log(user);
    });    
  },

  get: function(id, callback){
  	function cb(err, userData){
      if(err) return callback ? callback(err) : console.log(err);
      var user = new User(userData);
      callback ? callback(null, user) : console.log(user);
  	}

    if(arguments.length == 0) {
      client.emit('getUser', cb);
    } else if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = null;
      client.emit('getUser', cb);
    } else if(arguments.length == 1 && typeof arguments[0] == 'string'){
      client.emit('getUser', id, cb);
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      client.emit('getUser', id, cb);
    }
  },

  find: function(query, callback) {
    client.emit('findUsers', query||{}, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var users = _.map(data.hits.hits, function(userData){
      	    return new User(userData._source);
          }), result = {total:data.hits.total, users: users};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(User, Document, {

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return User;
  },

  saveAs: function(id, title, callback){
  	var newUser = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newUser.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newUser.title = title;
   	delete newUser.id;
	
	User.create(this.domainId, this.id, newUser, callback);
  },

  resetPassword: function(newPassword, callback) {
  	var client = this.getClient();
    client.emit('resetPassword', this.id, newPassword, function(err, result) {
      if(err) return callback ? callback(err) : console.log(err);
	  callback ? callback(null, result) : console.log(result);
	});
  }

});