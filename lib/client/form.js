const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');

const
  FORMS = '.forms';

var cache, client;

function Form(domainId, formData) {
  Document.call(this, domainId, FORMS, formData);
}

_.assign(Form, {
  
  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Form;
  },

  create: function(domainId, id, formRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = formRaw;
      formRaw = id;
      id = uuidv4();
    }

    client.emit('createForm', domainId, id, formRaw, function(err, formData) {
      if(err) return callback ? callback(err) : console.log(err);

      var form = new Form(domainId, formData);
      callback ? callback(null, form) : console.log(form);
    });    
  },

  get: function(domainId, id, callback){
  　if(arguments.length < 2 || (arguments.length == 3 && typeof arguments[2] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}

    client.emit('getForm', domainId, id, function(err, formData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var form = new Form(domainId, formData);
      callback ? callback(null, form) : console.log(form);
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
  	  	  	
    client.emit('findForms', domainId, query, function(err, data) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var forms = _.map(data.hits.hits, function(formData){
      	    return new Form(domainId, formData._source);
          }), result = {total:data.hits.total, forms: forms};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});


inherits(Form, Document, {

  _create: function(domainId, collectionId, formData){
    return new Form(domainId, formData);
  },

  _getCache: function(){
    return cache;
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Form;  	
  },

  saveAs: function(id, title, callback){
  	var newForm = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newForm.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newForm.title = title;
   	delete newForm.id;
	
	Form.create(this.domainId, this.id, newForm, callback);
  }

});

module.exports = Form;
