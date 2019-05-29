import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  METAS = '.metas';

var client;

export default function Meta(domainId, metaData, isNew) {
  Document.call(this, domainId, METAS, metaData, isNew);
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
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = metaRaw;
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
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
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      var err = makeError(400, 'argumentsError', 'Arguments is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
    } else if(arguments.length == 3 && typeof arguments[2]=='function'){
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
	
	Meta.create(this.domainId, this.id, newMeta, opts, callback);
  }

});

