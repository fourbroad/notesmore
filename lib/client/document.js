module.exports = Document;

const _ = require('lodash')
  , Domain = require('./domain')
  , jsonPatch = require('fast-json-patch')
  , {inherits, uniqueId, makeError} = require('./utils');


var cache, client;

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
    },
    id: {
      value: docData.id,
      writable: false,
      enumerable: true,
      configurable: false
    }
  });
    
  _.assign(this, docData);

  var self = this;
  Object.defineProperties(this, {
    _meta: {
      value: this._meta,
      writable: true,
      enumerable: false,
      configurable: false
    }
  });

  Object.defineProperties(this, {
  	old: {
  	  value: _.cloneDeep(self),
   	  writable: true,
   	  enumerable: false,
   	  configurable: false
   	}
  });  
}

_.assign(Document, {
  
  init: function(config) {
    client = config.client;
    return Document;
  },

  create: function(domainId, collectionId, id, docRaw, callback){
    if(arguments.length == 3 && typeof arguments[2] == 'object'){
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[3] == 'function'){
      callback = docRaw;
      docRaw = id;
      id = uuidv4();
    }
      	
    client.emit('createDocument', domainId, collectionId, id, docRaw, function(err, docData) {
      if(err) return callback ? callback(err) : console.log(err);

      var document = new Document(domainId, collectionId, docData);
      callback ? callback(null, document) : console.log(document);
    });    
  },

  get: function(domainId, collectionId, id, callback){
  　if(arguments.length < 3 || (arguments.length == 4 && typeof arguments[3] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}
  	
    client.emit('getDocument', domainId, collectionId, id, function(err, docData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var document = new Document(domainId, collectionId, docData);
      callback ? callback(null, document) : console.log(document);
    });
  },

  find: function(domainId, collectionId, query, callback) {
  	if(arguments.length == 0) {
  	  domainId = '*';
  	  collectionId = '*';
  	  query = {}
  	}else if(arguments.length == 1 && typeof arguments[0]=='function'){
  	  callback = domainId;
  	  query = {};
  	  collectionId = '*';
  	  domainId = '*';	
  	} else if(arguments.length == 1 && typeof arguments[0]=='object'){
  	  query = collectionId;
  	  collectionId = '*';
  	  domainId = '*';	
  	}else if(arguments.length == 2 && typeof arguments[1] == 'function'){
  	  callback = collectionId;
  	  query = domainId;
  	  collectionId = '*';
  	  domainId = '*';	
  	}

    client.emit('findDocuments', domainId, collectionId, query, function(err, docsData) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var documents = _.map(docsData.hits.hits, function(docData){
      	    return new Document(domainId, collectionId, docData._source);
          }), result = {total:docsData.hits.total, documents: documents};

	  callback ? callback(null, result) : console.log(result);
	});
  },

  scroll: function(params, callback){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

    client.emit('scroll', params, function(err, docsData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var documents = _.map(docsData.hits.hits, function(docData){
      	    return new Document(domainId, collectionId, docData._source);
          }), result = {total:docsData.hits.total, documents: documents};
	  callback ? callback(null, result) : console.log(result);
    });
  },

  clearScroll: function(params, callback){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

    client.emit('clearScroll', params, function(err, result) {
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, result) : console.log(result);
    });
  }

});

_.assign(Document.prototype, {

  _getCache: function(){
    return cache;
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
  	var newDoc = jsonPatch.deepClone(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newDoc.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }
    
   	newDoc.title = title;
   	delete newDoc.id;
	
	Document.create(this.domainId, this.collectionId, id, newDoc, callback);
  },

  replace: function(doc){
    for(var key in this) {
	  if(this.hasOwnProperty(key)&&!_.isFunction(this[key])) try{delete this[key];}catch(e){}
    }
    _.merge(this, doc);
  },

  cancel: function(){
  	if(this.isDirty()){
  	  this.replace(this.old);
  	}  	
  },

  value: function(path){
  	return jsonPatch.getValueByPointer(this, path);  	
  },

  is: function(path, value){
  	var errors = jsonPatch.validate([{op:'test', path: path, value:value}], this);
  	return !(errors && errors.length > 0)
  },

  getPatch: function(){
  	return jsonPatch.compare(this.old,  this);
  },

  isDirty: function(){
  	return this.getPatch().length > 0;
  },

  save: function(callback){
  	var patch = this.getPatch();
  	if(patch.length > 0){
      var self = this, client = this.getClient(), domainId = this.domainId, collectionId = this.collectionId;
      client.emit('patchDocument', domainId, collectionId, this.id, patch, function(err, docData) {
        if(err) return callback ? callback(err) : console.log(err);

	    for(var key in self) {
  		  if(self.hasOwnProperty(key)&&!_.isFunction(self[key])) try{delete self[key];}catch(e){}
	    }

        _.merge(self, docData);
        self.old = jsonPatch.deepClone(self);
        callback ? callback(null, self): console.log(self);
      });
  	}else{
  	  callback ? callback(null, this): console.log(this);  	
  	}
  },

  delete: function(callback) {
  	var client = this.getClient();
    client.emit('deleteDocument', this.domainId, this.collectionId, this.id, function(err, result) {
      if(err) return callback ? callback(err) : console.log(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },

  getAcl: function(callback) {
    callback ? callback(null, this._meta.acl) : console.log(this._meta.acl);
  },

  patchAcl: function(aclPatch, callback) {
    var self = this, client = this.getClient(), acl = this._meta.acl;
    client.emit('patchAcl', this.domainId, this.collectionId, this.id, aclPatch, function(err, metaData) {
      if(err) return callback ? callback(err) : console.log(err);
      self._meta = metaData;
      self.old._meta = metaData;
      callback ? callback(null, acl): console.log(acl);
    });
  },

  clearAclSubject: function(method, rgu, subjectId, callback) {
  	var self = this, client = this.getClient(), acl = this._meta.acl;
    client.emit('clearAclSubject', this.domainId, this.collectionId, this.id, method, rgu, subjectId, function(err, metaData){
      if(err) return callback ? callback(err) : console.log(err);
      self._meta = metaData;
      self.old._meta = metaData;
      callback ? callback(null, acl): console.log(acl);
    });
  },

  getMetaId: function(callback) {
  	var metaId = this._meta.metaId;
    callback ? callback(null, metaId) : console.log(metaId);
  }

});
