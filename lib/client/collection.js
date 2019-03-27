module.exports = Collection;

const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Meta = require('./meta')
  , View = require('./view')
  , Domain = require('./domain')
  , Form = require('./form')
  , Group = require('./group')
  , Page = require('./page')
  , Action = require('./action')
  , Profile = require('./profile')
  , Role = require('./role')
  , User = require('./user')
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

  _create: function(domainId, collectionId, colData){
    return new Collection(domainId, colData);
  },

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

  findDocuments: function(query, callback) {
    const domainId = this.domainId, viewId = this.id, client = this.getClient();
    client.emit('findDocuments', domainId, viewId, query, function(err, docsData) {
      if (err) return callback ? callback(err) : console.log(err);

      var documents = _.map(docsData.hits.hits, function(docData) {
        var colId = docData._index.split('~')[1];
        switch (colId) {
        case '.domains':
          return new Domain(docData._source)
        case '.metas':
          return new Meta(domainId, docData._source);
        case '.collections':
          return new Collection(domainId, docData._source);
        case '.views':
          return new View(domainId, docData._source);
        case '.pages':
          return new Page(domainId, docData._source);
        case '.actions':
          return new Action(domainId, docData._source);
        case '.forms':
          return new Form(domainId, docData._source);
        case '.roles':
          return new Role(domainId, docData._source);
        case '.groups':
          return new Group(domainId, docData._source);
        case '.profiles':
          return new Profile(domainId, docData._source);
        case '.users':
          return new User(docData._source);
        default:
          return new Document(domainId, colId, docData._source);
        }
      });

      callback(null, {
        total: docsData.hits.total,
        documents: documents
      });
    });
  },

  distinctQuery: function(field, wildcard, callback) {
    var query = {
      collapse: {
        field: field + '.keyword'
      },
      aggs: {
        itemCount: {
          cardinality: {
            field: field + '.keyword'
          }
        }
      },
      _source: [field]
    };

    if (wildcard) {
      query.query = { wildcard: {}};
      query.query.wildcard[field + ".keyword"] = wildcard;
    }

    this.findDocuments({body:query}, callback);
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
  	var args = [this.domainId, this.id].concat(_.values(arguments));
  	Document.get.apply(this, args);
  },

  findDocuments: function(query, callback) {
  	var args = [this.domainId, this.id].concat(_.values(arguments));
  	Document.find.apply(this, args);
  },

  scroll: function(params, callback){
  	Document.scroll.apply(this, arguments);
  },

  clearScroll: function(params, callback){
  	Document.clearScroll.apply(this, arguments);
  },

  refresh: function(callback) {
  	var client = this.getClient();
    client.emit('refreshCollection', this.domainId, this.id, function(err, result){
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});

// module.exports = Collection;
