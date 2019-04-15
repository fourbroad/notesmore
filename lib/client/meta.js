const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  METAS = '.metas';

var client;

function Meta(domainId, metaData) {
  Document.call(this, domainId, METAS, metaData);
}

_.assign(Meta, {
  
  init: function(config) {
    client = config.client;
    return Meta;
  },

  create: function(domainId, id, metaRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = metaRaw;
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arugments[1] == 'object' && typeof arugments[2] == 'object'){
      options = metaRaw;
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arugments[1] == 'object' && typeof arugments[2] == 'function'){
      callback = metaRaw;
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = metaRaw;
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }
      	
    client.emit('createMeta', domainId, id, metaRaw, options, function(err, metaData) {
      if(err) return callback ? callback(err) : console.error(err);

      var meta = new Meta(domainId, metaData);
      callback ? callback(null, meta) : console.log(meta);
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
  	
    client.emit('getMeta', domainId, id, options, function(err, metaData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var meta = new Meta(domainId, metaData);
      callback ? callback(null, meta) : console.log(meta);
    });
  },

  find: function(domainId, query, options, callback) {
  	if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}
  	  	  	
    client.emit('findMetas', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.metas = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Meta(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Meta, Document, {

  _create: function(domainId, collectionId, metaData){
    return new Meta(domainId, metaData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Meta;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newMeta.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newMeta = _.cloneDeep(this), opts = {};

   	newMeta.title = title;
   	delete newMeta.id;

   	if(newMeta._meta.roadmap){
   	  opts.roadmap = newMeta._meta.roadmap;
   	}
	
	Meta.create(this.domainId, this.id, newMeta, opts, callback);
  }

});

module.exports = Meta;
