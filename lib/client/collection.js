const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');

const
  COLLECTIONS = '.collections';

var cache, client;

function Collection(domainId, colData) {
  Document.call(this, domainId, COLLECTIONS, colData);
}

_.assign(Collection, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Collection;
  },

  create: function(domainId, id, colRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = colRaw;
      colRaw = id;
      id = uuidv4();
    }

    client.emit('createCollection', domainId, id, colRaw, function(err, colData) {
      if(err) return callback ? callback(err) : console.log(err);

      var collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

    client.emit('getCollection', domainId, id, function(err, colData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
    });
  },

  find: function(domainId, query, callback){
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

    client.emit('findCollections', domainId, query, function(err, colsData) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var collections = _.map(colsData.hits.hits, function(colData){
      	    return new Collection(domainId, colData._source);
          }), result = {total:colsData.hits.total, collections: collections};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Collection, Document, {

  _getCache: function(){
    return cache;
  },	

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Collection;  	
  },

  delete: function(callback) {
  	var client = this.getClient();
    client.emit('deleteCollection', this.domainId, this.id, function(err, result) {
      if(err) return callback ? callback(err) : console.log(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },

  saveAs: function(id, title, callback){
  	var newCol = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newCol.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newCol.title = title;
   	delete newCol.id;
	
	Collection.create(this.domainId, this.id, newCol, callback);
  },

  bulk: function(docs, callback){
    var client = this.getClient();
    client.emit('bulk', this.domainId, this.id, docs, function(err, result){
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  createDocument: function(docId, docRaw, callback) {
  	if(arguments.length == 1){
 	  docRaw = docId;
  	  docId = uuidv4();  		
  	}else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = docRaw;
      docRaw = docId;
      docId = uuidv4();
    }
  	Document.create(this.domainId, this.id, docId, docRaw, callback);
  },

  getDocument: function(docId, callback) {
  	Document.get(this.domainId, this.id, docId, callback);
  },

  findDocuments: function(query, callback) {
  	Document.find(this.domainId, this.id, query||{}, callback);
  },

  scroll: function(params, callback){
  	Document.scroll(params, callback);  	
  },

  refresh: function(callback) {
  	var client = this.getClient();
    client.emit('refreshCollection', this.domainId, this.id, function(err, result){
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});

module.exports = Collection;


