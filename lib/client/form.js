const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');

const
  FORMS = '.forms';

var client;

function Form(domainId, formData) {
  Document.call(this, domainId, FORMS, formData);
}

_.assign(Form, {
  
  init: function(config) {
    client = config.client;
    return Form;
  },

  create: function(domainId, id, formRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = formRaw;
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = formRaw;
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = formRaw;
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = formRaw;
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }

    client.emit('createForm', domainId, id, formRaw, options, function(err, formData) {
      if(err) return callback ? callback(err) : console.error(err);

      var form = new Form(domainId, formData);
      callback ? callback(null, form) : console.log(form);
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
  	
    client.emit('getForm', domainId, id, options, function(err, formData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var form = new Form(domainId, formData);
      callback ? callback(null, form) : console.log(form);
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
  	  	  	  	
    client.emit('findForms', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.forms = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Form(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});


inherits(Form, Document, {

  _create: function(domainId, collectionId, formData){
    return new Form(domainId, formData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Form;  	
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newForm.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	var newForm = _.cloneDeep(this), opts = {};

   	newForm.title = title;
   	delete newForm.id;

	Form.create(this.domainId, this.id, newForm, opts, callback);
  }

});

module.exports = Form;
