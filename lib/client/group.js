const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
const
  GROUPS = '.groups';

var client;

function Group(domainId, groupData) {
  Document.call(this, domainId, GROUPS, groupData);
}

_.assign(Group, {
  
  init: function(config) {
    client = config.client;
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
      if(err) return callback ? callback(err) : console.error(err);

      var group = new Group(domainId, groupData);
      callback ? callback(null, group) : console.log(group);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}
  	
    client.emit('getGroup', domainId, id, function(err, groupData) {
      if(err) return callback ? callback(err) : console.error(err);
      
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
      if(err) return callback ? callback(err) : console.error(err);
       
      data.groups = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Group(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Group, Document, {

  _create: function(domainId, collectionId, groupData){
    return new Group(domainId, groupData);
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
