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

  create: function(domainId, id, fileRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = fileRaw;
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = fileRaw;
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = fileRaw;
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = fileRaw;
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }
  	
    client.emit('createFile', domainId, id, fileRaw, options, function(err, fileData) {
      if(err) return callback ? callback(err) : console.error(err);

      var file = new File(domainId, fileData);
      callback ? callback(null, file) : console.log(file);
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

    client.emit('getFile', domainId, id, options, function(err, fileData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var file = new File(domainId, fileData);
      callback ? callback(null, file) : console.log(file);
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
  		
    client.emit('findFiles', domainId, query, options, function(err, data) {
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

  delete: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

  	var client = this.getClient();
    client.emit('deleteFile', this.domainId, this.id, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },
  
  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newFile.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newFile = _.cloneDeep(this), opts = {};

   	newFile.title = title;
   	delete newFile.id;
   	
	File.create(this.domainId, this.id, newFile, opts, callback);
  }

});

module.exports = File;
