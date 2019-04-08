module.exports = Collection;

const _ = require('lodash')
  , {inherits, uniqueId, makeError} = require('./utils')
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
  , File = require('./file')
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document');

const
  COLLECTIONS = '.collections';

var client;

function Collection(domainId, colData) {
  Document.call(this, domainId, COLLECTIONS, colData);
}

_.assign(Collection, {
  
  init: function(config) {
    client = config.client;
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
      if(err) return callback ? callback(err) : console.error(err);

      var collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}

    client.emit('getCollection', domainId, id, function(err, colData) {
      if(err) return callback ? callback(err) : console.error(err);
      
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

    client.emit('findCollections', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.collections = _.reduce(data.documents, function(r, v, k){
        var index = v._meta.index.split('~');
        r.push(new Collection(index[0], v));
        return r;
      },[]);
      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Collection, Document, {

  _create: function(domainId, collectionId, colData){
    return new Collection(domainId, colData);
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
      if(err) return callback ? callback(err) : console.error(err);
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
    client.emit('findDocuments', domainId, viewId, query, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      data.documents = _.reduce(data.documents, function(r, v, k){
        var colId = v._meta.index.split('~')[1];
        switch (colId) {
        case '.domains':
          r.push(new Domain(v));
          break;
        case '.metas':
          r.push(new Meta(domainId, v));
          break;
        case '.collections':
          r.push(new Collection(domainId, v));
          break;
        case '.views':
          r.push(new View(domainId, v));
          break;
        case '.pages':
          r.push(new Page(domainId, v));
          break;
        case '.actions':
          r.push(Action(domainId, v));
          break;
        case '.forms':
          r.push(new Form(domainId, v));
          break;
        case '.roles':
          r.push(new Role(domainId, v));
          break;
        case '.groups':
          r.push(new Group(domainId, v));
          break;
        case '.profiles':
          r.push(new Profile(domainId, v));
          break;
        case '.files':
          r.push(new File(domainId, v));
          break;
        case '.users':
          r.push(new User(v));
          break;
        default:
          r.push(new Document(domainId, colId, v));
        }
        return r;
      },[]);

      callback(null, data);
    });
  },

  distinctQuery: function(field, wildcard, opts, callback) {
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
      _source: [field],
      sort:{}
    };

    if (wildcard) {
      query.query = { wildcard: {}};
      query.query.wildcard[field + ".keyword"] = wildcard;
    }

    query.sort[field + ".keyword"] = 'asc';

    this.findDocuments(_.merge({body:query}, opts), callback);
  },


  bulk: function(docs, callback){
    var client = this.getClient();
    client.emit('bulk', this.domainId, this.id, docs, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
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

  scroll: function(params, callback){
  	Document.scroll.apply(this, arguments);
  },

  clearScroll: function(params, callback){
  	Document.clearScroll.apply(this, arguments);
  },

  refresh: function(callback) {
  	var client = this.getClient();
    client.emit('refreshCollection', this.domainId, this.id, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});

// module.exports = Collection;
