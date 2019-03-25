const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  ACTIONS = '.actions';

var cache, client;

function Action(domainId, actionData) {
  Document.call(this, domainId, ACTIONS, actionData);
}

_.assign(Action, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Action;
  },

  create: function(domainId, id, actionRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = actionRaw;
      actionRaw = id;
      id = uuidv4();
    }
      	
    client.emit('createAction', domainId, id, actionRaw, function(err, actionData) {
      if(err) return callback ? callback(err) : console.log(err);

      var action = new Action(domainId, actionData);
      callback ? callback(null, action) : console.log(action);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}
  	
    client.emit('getAction', domainId, id, function(err, actionData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var action = new Action(domainId, actionData);
      callback ? callback(null, action) : console.log(action);
    });
  },

  mget: function(domainId, ids, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

    this.find(domainId, {
      body:{
        query: { bool: {should: _.reduce(ids, function(result, id, index){
          result.push({term: {'id.keyword': id}});
          return result;        	
        },[])}}
//         sort: sort
      },
      size:100
    }, callback);
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
  	  	  	
    client.emit('findActions', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var actions = _.map(data.hits.hits, function(actionData){
      	    return new Action(domainId, actionData._source);
          }), result = {total:data.hits.total, actions: actions};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Action, Document, {

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Action;
  },

  saveAs: function(id, title, callback){
  	var newAction = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newAction.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newAction.title = title;
   	delete newAction.id;
	
	Action.create(this.domainId, this.id, newAction, callback);
  }

});

module.exports = Action;
