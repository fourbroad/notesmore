const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
const
  GROUPS = '.groups';

var cache, client;

function Group(domainId, groupData) {
  Document.call(this, domainId, GROUPS, groupData);
}

_.assign(Group, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Group;
  },

  create: function(domainId, id, groupRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = groupRaw;
      groupRaw = id;
      id = uuidv4();
    }

    client.emit('createGroup', domainId, id, groupRaw, function(err, groupData) {
      if(err) return callback ? callback(err) : console.log(err);

      var group = new Group(domainId, groupData);
      callback ? callback(null, group) : console.log(group);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}
  	
    client.emit('getGroup', domainId, id, function(err, groupData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var group = new Group(domainId, groupData);
      callback ? callback(null, group) : console.log(group);
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
  	  	  	
    client.emit('findGroups', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var groups = _.map(data.hits.hits, function(groupData){
      	    return new Group(domainId, groupData._source);
          }), result = {total:data.hits.total, groups: groups};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Group, Document, {

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Group;
  },

  saveAs: function(id, title, callback){
  	var newGroup = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newGroup.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }
    
   	newGroup.title = title;
   	delete newGroup.id;
	
	Group.create(this.domainId, this.id, newGroup, callback);
  }

});

module.exports = Group;
