const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  PROFILES = '.files';

var client;

function File(domainId, fileData) {
  Document.call(this, domainId, PROFILES, fileData);
}

_.assign(File, {
  
  init: function(config) {
    client = config.client;
    return File;
  },

  create: function(domainId, id, fileRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = fileRaw;
      fileRaw = id;
      id = uuidv4();
    }
  	
    client.emit('createFile', domainId, id, fileRaw, function(err, fileData) {
      if(err) return callback ? callback(err) : console.error(err);

      var file = new File(domainId, fileData);
      callback ? callback(null, file) : console.log(file);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}

    client.emit('getFile', domainId, id, function(err, fileData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var file = new File(domainId, fileData);
      callback ? callback(null, file) : console.log(file);
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
  	  	  	
    client.emit('findFiles', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.file = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new File(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(File, Document, {

  _create: function(domainId, collectionId, fileData){
    return new File(domainId, fileData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return File;
  },

  delete: function(callback) {
  	var client = this.getClient();
    client.emit('deleteFile', this.domainId, this.id, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },
  
  saveAs: function(id, title, callback){
  	var newFile = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newFile.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newFile.title = title;
   	delete newFile.id;
	
	File.create(this.domainId, this.id, newFile, callback);
  }

});

module.exports = File;
