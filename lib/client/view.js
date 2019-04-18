module.exports = View;

const _ = require('lodash')
  , {inherits, uniqueId, makeError} = require('./utils')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Meta = require('./meta')
  , Collection = require('./collection')
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
  VIEWS = '.views';

var client;

function View(domainId, viewData) {
  Document.call(this, domainId, VIEWS, viewData);
}

_.assign(View, {
  
  init: function(config) {
    client = config.client;
    return View;
  },

  create: function(domainId, id, viewRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }

    client.emit('createView', domainId, id, viewRaw, options, function(err, viewData) {
      if(err) return callback ? callback(err) : console.error(err);

      var view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
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
 
    client.emit('getView', domainId, id, options, function(err, viewData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
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
  	  	
    client.emit('findViews', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.views = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new View(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(View, Document, {

  _create: function(domainId, collectionId, viewData){
    return new View(domainId, viewData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return View;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newView.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = title;
      title = id;
      id = uuidv4();
    }

  	var newView = _.cloneDeep(this), opts = {};

   	newView.title = title;
   	delete newView.id;

	View.create(this.domainId, id, newView, callback);
  },

  findDocuments: function(query, options, callback) {
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
  	}

    const domainId = this.domainId, viewId = this.id, client = this.getClient();
    client.emit('findViewDocuments', domainId, viewId, query, options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);

      data.documents = _.reduce(data.documents, function(r, v, k){
        var indices = v._meta.index.split('~'), domId = indices[0], colId = indices[1];
        switch (colId) {
        case '.domains':
          r.push(new Domain(v));
          break;
        case '.metas':
          r.push(new Meta(domId, v));
          break;
        case '.collections':
          r.push(new Collection(domId, v));
          break;
        case '.views':
          r.push(new View(domId, v));
          break;
        case '.pages':
          r.push(new Page(domId, v));
          break;
        case '.actions':
          r.push(new Action(domId, v));
          break;
        case '.forms':
          r.push(new Form(domId, v));
          break;
        case '.roles':
          r.push(new Role(domId, v));
          break;
        case '.groups':
          r.push(new Group(domId, v));
          break;
        case '.profiles':
          r.push(new Profile(domId, v));
          break;
        case '.files':
          r.push(new File(domId, v));
          break;
        case '.users':
          r.push(new User(v));
          break;
        default:
          r.push(new Document(domId, colId, v));
        }
        return r;
      },[]);

      callback(null, data);
    });
  },

  distinctQuery: function(field, options, callback) {
    this.getClient().emit('distinctQueryView', this.domainId, this.id, field, options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      callback(null, data);      
    });
  },


  refresh: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }
    this.getClient().emit('refreshView', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});

// module.exports = View;
