module.exports = Document;

const _ = require('lodash')
  , uuidv4 = require('uuid/v4')
  , Domain = require('./domain')
  , jsonPatch = require('fast-json-patch')
  , {inherits, uniqueId, makeError} = require('./utils');


var client;

function Document(domainId, collectionId, docData) {
  Object.defineProperties(this, {
    domainId: {
     value: domainId,
     writable: false,
     enumerable: false,
     configurable: false
    },
    collectionId: {
      value: collectionId,
      writable: false,
      enumerable: false,
      configurable: false
    }
  });

  _.assign(this, docData);

  var self = this;
  Object.defineProperties(this, {
    id: {
      value: docData.id,
      writable: false,
      enumerable: true,
      configurable: false
    }
//     _meta: {
//       value: this._meta,
//       writable: true,
//       enumerable: false,
//       configurable: false
//     }
  });
}

_.assign(Document, {
  
  init: function(config) {
    client = config.client;
    return Document;
  },

  create: function(domainId, collectionId, id, docRaw, options, callback){
    if(arguments.length == 3 && typeof arguments[2] == 'object'){
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[3] == 'function'){
      callback = docRaw;
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[2] == 'object' && typeof arguments[3] == 'object'){
      options = docRaw;
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[2] == 'object' && typeof arguments[3] == 'function'){
      callback = docRaw;
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 5 && typeof arguments[2] == 'object'){
      callback = options;
      options = docRaw;
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 5 && typeof arguments[2] == 'string' && typeof arguments[4] == 'function'){
      callback = options
      options = undefined;
    }

      	
    client.emit('createDocument', domainId, collectionId, id, docRaw, options, function(err, docData) {
      if(err) return callback ? callback(err) : console.error(err);

      var document = new Document(domainId, collectionId, docData);
      callback ? callback(null, document) : console.log(document);
    });
  },

  get: function(domainId, collectionId, id, options, callback){
  　if(arguments.length < 3){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 4 && typeof arguments[3] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}
  	
    client.emit('getDocument', domainId, collectionId, id, options, function(err, docData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var document = new Document(domainId, collectionId, docData);
      callback ? callback(null, document) : console.log(document);
    });
  },

  mget: function(domainId, collectionId, ids, options, callback){
  　if(arguments.length < 3){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 4 && typeof arguments[3] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}

  　if(_.isEmpty(ids)){
  　  return callback(null, {total:0, offset:0, documents:[]});
  　}
  　  	
    this.find(domainId, collectionId, {
      body:{
        query: { bool: {should: _.reduce(ids, function(result, id, index){
          result.push({term: {'id.keyword': id}});
          return result;        	
        },[])}}
      },
      size:100
    }, options, callback);
  },

  find: function(domainId, collectionId, query, options, callback) {
  	if(arguments.length == 4 && typeof arguments[3]=='function'){
  	  callback = options;
  	  options = undefined;
  	}

    client.emit('findDocuments', domainId, collectionId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.documents =_.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Document(index[0], index[1], v._source));
      	return r;
      }, []); 
      
	  callback ? callback(null, data) : console.log(data);
	});
  },

  scroll: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    client.emit('scroll', options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
      
      data.documents =_.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Document(index[0], index[1], v));
      	return r;
      }, []); 
      
	  callback ? callback(null, data) : console.log(data);
    });
  },

  clearScroll: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    client.emit('clearScroll', options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  }

});

_.assign(Document.prototype, {

  _create: function(domainId, collectionId, docData){
    return new Document(domainId, collectionId, docData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Document;  	
  },

  get: function(callback) {
    callback ? callback(null, this) : console.log(this);
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newDoc.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

    var newDoc = jsonPatch.deepClone(this), opts = {};

   	newDoc.title = title;
   	delete newDoc.id;

   	if(newDoc._meta.roadmap){
   	  opts.roadmap = newDoc._meta.roadmap;
   	}   	
	
	Document.create(this.domainId, this.collectionId, id, newDoc, opts, callback);
  },

  replace: function(doc){
  	var self = this;
  	 _.forOwn(self,function(v,k){delete self[k]});
    _.merge(this, doc);
  },

  value: function(path){
  	return jsonPatch.getValueByPointer(this, path);  	
  },

  is: function(path, value){
  	var errors = jsonPatch.validate([{op:'test', path: path, value:value}], this);
  	return !(errors && errors.length > 0)
  },

  patch: function(patch, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
    }

    var self = this;
    client.emit('patchDocument', this.domainId, this.collectionId, this.id, patch, options, function(err, docData) {
      if(err) return callback ? callback(err) : console.error(err);

      var newDocument = self._create(self.domainId, self.collectionId, docData);
      callback ? callback(null, newDocument): console.log(newDocument);
    });
  },

  delete: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

  	var client = this.getClient();
    client.emit('deleteDocument', this.domainId, this.collectionId, this.id, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },

  getEvents: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }
  	var client = this.getClient(), self = this;
    client.emit('getEvents', this.domainId, this.collectionId, this.id, options, function(err, evtData){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, evtData): console.log(evtData);
    });
  },

  getMeta: function(callback) {
    callback ? callback(null, this._meta) : console.log(this._meta);
  },

  patchMeta: function(metaPatch, options, callback) {
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
    }

    var self = this, client = this.getClient();
    client.emit('patchDocumentMeta', this.domainId, this.collectionId, this.id, metaPatch, options, function(err, metaData) {
      if(err) return callback ? callback(err) : console.error(err);
      self._meta = metaData;
      callback ? callback(null, metaData): console.log(metaData);
    });
  },

  clearAclSubject: function(method, rgu, subjectId, options, callback) {
    if(arguments.length == 4 && typeof arguments[3] == 'function'){
      callback = options;
      options = undefined;
    }
  	var self = this, client = this.getClient(), acl = this._meta.acl;
    client.emit('clearAclSubject', this.domainId, this.collectionId, this.id, method, rgu, subjectId, options, function(err, metaData){
      if(err) return callback ? callback(err) : console.error(err);
      self._meta = metaData;
      callback ? callback(null, acl): console.log(acl);
    });
  },

  getMetaId: function(callback) {
  	var metaId = this._meta.metaId;
    callback ? callback(null, metaId) : console.log(metaId);
  }

});
