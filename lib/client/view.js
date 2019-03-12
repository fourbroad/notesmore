const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Meta = require('./meta')
  , Collection = require('./collection')
  , Domain = require('./domain')
  , Form = require('./form')
  , Group = require('./group')
  , Page = require('./page')
  , Profile = require('./profile')
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');

const
  VIEWS = '.views';

var cache, client;

function View(domainId, viewData) {
  Document.call(this, domainId, VIEWS, viewData);
}

_.assign(View, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return View;
  },

  create: function(domainId, id, viewRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = viewRaw;
      viewRaw = id;
      id = uuidv4();
    }

    client.emit('createView', domainId, id, viewRaw, function(err, viewData) {
      if(err) return callback ? callback(err) : console.log(err);

      var view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

    client.emit('getView', domainId, id, function(err, viewData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
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
  	  	
    client.emit('findViews', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var views = _.map(data.hits.hits, function(viewData){
      	    return new View(domainId, viewData._source);
          }), result = {total:data.hits.total, views: views};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(View, Document, {

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return View;
  },

  saveAs: function(id, title, callback){
  	var newView = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newView.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = title;
      title = id;
      id = uuidv4();
    }

   	newView.title = title;
   	delete newView.id;
	
	View.create(this.domainId, id, newView, callback);
  },

  findDocuments: function(query, callback) {
    const domainId = this.domainId, viewId = this.id, client = this.getClient();
    client.emit('findViewDocuments', domainId, viewId, query, function(err, docsData) {
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

    this.findDocuments(query, callback);
  },

  refresh: function(callback) {
  	var client = this.getClient();
    client.emit('refreshView', this.domainId, this.id, function(err, result){
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});

module.exports = View;
