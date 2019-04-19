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

  create: function(domainId, id, colRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }

    client.emit('createCollection', domainId, id, colRaw, options, function(err, colData) {
      if(err) return callback ? callback(err) : console.error(err);

      var collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
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

    client.emit('getCollection', domainId, id, options, function(err, colData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
    });
  },

  find: function(domainId, query, options, callback){
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      var err = makeError(400, 'argumentsError', 'Arguments is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
    } else if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}

    client.emit('findCollections', domainId, query, options, function(err, data) {
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

  delete: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

  	var client = this.getClient();
    client.emit('deleteCollection', this.domainId, this.id, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newCol.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newCol = _.cloneDeep(this), opts = {};

   	newCol.title = title;
   	delete newCol.id;
	
	Collection.create(this.domainId, this.id, newCol, opts, callback);
  },

  findDocuments: function(query, options, callback) {
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
  	}

    const domainId = this.domainId, viewId = this.id, client = this.getClient();
    client.emit('findDocuments', domainId, viewId, query, options, function(err, data) {
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
          r.push(new Action(domainId, v));
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

  distinctQuery: function(field, options, callback) {
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
  		callback = options;
  		options = undefined;
  	}
    this.getClient().emit('distinctQueryCollection', this.domainId, this.id, field, options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      callback(null, data);      
    });
  },

  bulk: function(docs, options, callback){
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
  		callback = options;
  		options = undefined;
  	}

    this.getClient().emit('bulk', this.domainId, this.id, docs, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  createDocument: function(docId, docRaw, options, callback) {
  	if(arguments.length == 1){
 	  docRaw = docId;
  	  docId = uuidv4();
  	} else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = docRaw;
      docRaw = docId;
      docId = uuidv4();
  	} else if(arguments.length == 2 && typeof arguments[1] == 'object'){
  	  options = docRaw;
  	  docId = uuidv4();
  	}
  	Document.create(this.domainId, this.id, docId, docRaw, options, callback);
  },

  getDocument: function(docId, options, callback) {
  	var args = [this.domainId, this.id].concat(_.values(arguments));
  	Document.get.apply(this, args);
  },

  putSnapshotTemplate: function(template, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('putSnapshotTemplate', this.domainId, this.id, template, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  getSnapshotTemplate: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('getSnapshotTemplate', this.domainId, this.id, options, function(err, template){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, template) : console.log(template);
    });
  },

  putEventTemplate: function(template, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('putEventTemplate', this.domainId, this.id, template, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  getEventTemplate: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('getEventTemplate', this.domainId, this.id, options, function(err, template){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, template) : console.log(template);
    });
  },

  reindexSnapshots: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('reindexSnapshots', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  reindexEvents: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('reindexEvents', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  scroll: function(params, options, callback){
  	Document.scroll.apply(this, arguments);
  },

  clearScroll: function(params, options, callback){
  	Document.clearScroll.apply(this, arguments);
  },

  refresh: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }
  	
  	var client = this.getClient();
    client.emit('refreshCollection', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});

// module.exports = Collection;
