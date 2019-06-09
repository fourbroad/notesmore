import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  PAGES = '.pages';

var client;

export default function Page(domainId, pageData, isNew) {
  Document.call(this, domainId, PAGES, pageData, isNew);
}

_.assign(Page, {
  
  init(config) {
    client = config.client;
    return Page;
  },

  create(domainId, id, pageRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      pageRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = pageRaw;
      pageRaw = id;
      id = uuidv4();
    }      	
    return client.emit('createPage', domainId, id, pageRaw, options).then(pageData => new Page(domainId, pageData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}  	
    return client.emit('getPage', domainId, id, options).then(pageData => new Page(domainId, pageData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }  	  	  	
    return client.emit('findPages', domainId, query, options).then(data => {
      data.pages = _.reduce(data.documents, (r, v) => {
      	var index = v._meta.index.split('~');
      	r.push(new Page(index[0], v));
      	return r;
      }, []);

      delete data.documents;
      return data;
  	});
  }

});

inherits(Page, Document, {

  _create(domainId, collectionId, pageData){
    return new Page(domainId, pageData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Page;
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
  	let newPage = _.cloneDeep(this), opts = {};
   	newPage.title = title||newPage.title;
    delete newPage.id;
    return Page.create(this.domainId, this.id, newPage, opts);
  }

});
