import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, makeError} from './utils';

const
  FORMS = '.forms';

var client;

export default function Form(domainId, formData, isNew) {
  Document.call(this, domainId, FORMS, formData, isNew);
}

_.assign(Form, {
  
  init(config) {
    client = config.client;
    return Form;
  },

  create(domainId, id, formRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      formRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = formRaw;
      formRaw = id;
      id = uuidv4();
    }
    return client.emit('createForm', domainId, id, formRaw, options).then(formData => new Form(domainId, formData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
    return client.emit('getForm', domainId, id, options).then(formData => new Form(domainId, formData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }  	  	  	  	
    return client.emit('findForms', domainId, query, options).then(data => {
      data.forms = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new Form(index[0], v));
      	return r;
      }, []);

      delete data.documents;
      return data;
  	});
  }

});


inherits(Form, Document, {

  _create(domainId, collectionId, formData){
    return new Form(domainId, formData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Form;  	
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
  	let newForm = _.cloneDeep(this), opts = {};
   	newForm.title = title||newForm.title;
    delete newForm.id;
    return Form.create(this.domainId, this.id, newForm, opts);
  }

});
