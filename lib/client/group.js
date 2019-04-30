import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
const
  GROUPS = '.groups';

var client;

export default function Group(domainId, groupData) {
  Document.call(this, domainId, GROUPS, groupData);
}

_.assign(Group, {
  
  init: function(config) {
    client = config.client;
    return Group;
  },

  create: function(domainId, id, groupRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = groupRaw;
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = groupRaw;
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = groupRaw;
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = groupRaw;
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }

    client.emit('createGroup', domainId, id, groupRaw, options, function(err, groupData) {
      if(err) return callback ? callback(err) : console.error(err);

      var group = new Group(domainId, groupData);
      callback ? callback(null, group) : console.log(group);
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
  	
    client.emit('getGroup', domainId, id, options, function(err, groupData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var group = new Group(domainId, groupData);
      callback ? callback(null, group) : console.log(group);
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
  	  	  	
    client.emit('findGroups', domainId, query, options, function(err, data) {
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
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newGroup.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }
    
  	var newGroup = _.cloneDeep(this), opts = {};

   	newGroup.title = title;
   	delete newGroup.id;

	Group.create(this.domainId, this.id, newGroup, opts, callback);
  }

});
