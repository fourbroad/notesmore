const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  ACTIONS = '.actions';

var client;

function Action(domainId, actionData) {
  Document.call(this, domainId, ACTIONS, actionData);
}

_.assign(Action, {
  
  init: function(config) {
    client = config.client;
    return Action;
  },

  create: function(domainId, id, actionRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = actionRaw;
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = actionRaw;
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = actionRaw;
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = actionRaw;
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }
      	
    client.emit('createAction', domainId, id, actionRaw, options, function(err, actionData) {
      if(err) return callback ? callback(err) : console.error(err);

      var action = new Action(domainId, actionData);
      callback ? callback(null, action) : console.log(action);
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
  	
    client.emit('getAction', domainId, id, options, function(err, actionData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var action = new Action(domainId, actionData);
      callback ? callback(null, action) : console.log(action);
    });
  },

  mget: function(domainId, ids, options, callback){
  　if(arguments.length < 2){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 3 && typeof arguments[2] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}

  　if(_.isEmpty(ids)){
  　  return callback(null, {total:0, offset:0, actions:[]});
  　}

    this.find(domainId, {
      body:{
        query: { bool: {should: _.reduce(ids, function(result, id, index){
          result.push({term: {'id.keyword': id}});
          return result;        	
        },[])}}
      },
      size:100
    }, options, callback);
  },

  find: function(domainId, query, options, callback) {
  	if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}
  	  	  	
    client.emit('findActions', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.actions = _.reduce(data.documents, function(r, v, k){
        var index = v._meta.index.split('~');
   	    r.push(new Action(index[0], v));
   	    return r;
      }, []);
      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Action, Document, {

  _create: function(domainId, collectionId, actionData){
    return new Action(domainId, actionData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Action;
  },

  saveAs: function(id, title, callback){
  	var newAction = _.cloneDeep(this), opts = {};

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

	Action.create(this.domainId, this.id, newAction, opts, callback);
  }

});

module.exports = Action;
