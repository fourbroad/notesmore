import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  PAGES = '.pages';

var client;

export default function Page(domainId, pageData) {
  Document.call(this, domainId, PAGES, pageData);
}

_.assign(Page, {
  
  init: function(config) {
    client = config.client;
    return Page;
  },

  create: function(domainId, id, pageRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = pageRaw;
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = pageRaw;
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = pageRaw;
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = pageRaw;
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }
      	
    client.emit('createPage', domainId, id, pageRaw, options, function(err, pageData) {
      if(err) return callback ? callback(err) : console.error(err);

      var page = new Page(domainId, pageData);
      callback ? callback(null, page) : console.log(page);
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
  	
    client.emit('getPage', domainId, id, options, function(err, pageData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var page = new Page(domainId, pageData);
      callback ? callback(null, page) : console.log(page);
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
  	  	  	
    client.emit('findPages', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.pages = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Page(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Page, Document, {

  _create: function(domainId, collectionId, pageData){
    return new Page(domainId, pageData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Page;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newPage.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newPage = _.cloneDeep(this), opts = {};

   	newPage.title = title;
   	delete newPage.id;
	
	Page.create(this.domainId, this.id, newPage, opts, callback);
  }

});
