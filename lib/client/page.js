const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');
  
const
  PAGES = '.pages';

var cache, client;

function Page(domainId, pageData) {
  Document.call(this, domainId, PAGES, pageData);
}

_.assign(Page, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Page;
  },

  create: function(domainId, id, pageRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = pageRaw;
      pageRaw = id;
      id = uuidv4();
    }
      	
    client.emit('createPage', domainId, id, pageRaw, function(err, pageData) {
      if(err) return callback ? callback(err) : console.log(err);

      var page = new Page(domainId, pageData);
      callback ? callback(null, page) : console.log(page);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}
  	
    client.emit('getPage', domainId, id, function(err, pageData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var page = new Page(domainId, pageData);
      callback ? callback(null, page) : console.log(page);
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
  	  	  	
    client.emit('findPages', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var pages = _.map(data.hits.hits, function(pageData){
      	    return new Page(domainId, pageData._source);
          }), result = {total:data.hits.total, pages: pages};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Page, Document, {

  _create: function(domainId, collectionId, pageData){
    return new Page(domainId, pageData);
  },

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Page;
  },

  saveAs: function(id, title, callback){
  	var newPage = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newPage.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newPage.title = title;
   	delete newPage.id;
	
	Page.create(this.domainId, this.id, newPage, callback);
  }

});

module.exports = Page;
