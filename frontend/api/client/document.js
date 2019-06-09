import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import jsonPatch from 'fast-json-patch';
import {makeError} from './utils';


var client;

export default function Document(domainId, collectionId, docData, isNew) {
  Object.defineProperties(this, {
    domainId: {
     value: domainId,
     writable: false,
     enumerable: false,
     configurable: false
    },
    collectionId: {
      value: collectionId,
      writable: false,
      enumerable: false,
      configurable: false
    }
  });

  _.assign(this, docData);

  Object.defineProperties(this, {
    id: {
      value: docData.id,
      writable: isNew ? true : false,
      enumerable: true,
      configurable: false
    }
  });
}

_.assign(Document, {
  
  init(config) {
    client = config.client;
    return Document;
  },

  create(domainId, collectionId, id, docRaw, options){
    if(arguments.length == 3 && typeof arguments[2] == 'object'){
      docRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[2] == 'object' && typeof arguments[3] == 'object'){
      options = docRaw;
      docRaw = id;
      id = uuidv4();
    }
      	
    return client.emit('createDocument', domainId, collectionId, id, docRaw, options).then(docData => new Document(domainId, collectionId, docData));
  },

  get(domainId, collectionId, id, options){
  　if(arguments.length < 3){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
    return client.emit('getDocument', domainId, collectionId, id, options).then(docData => new Document(domainId, collectionId, docData));
  },

  mget(domainId, collectionId, ids, options){
  　if(arguments.length < 3){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
  　if(_.isEmpty(ids)){
  　  return Promise.resolve({total:0, offset:0, documents:[]});
  　}
    return this.find(domainId, collectionId, {
      body:{
        query: { bool: {should: _.reduce(ids, (result, id)=>{
          result.push({term: {'id.keyword': id}});
          return result;        	
        },[])}}
      },
      size:100
    }, options);
  },

  find(domainId, collectionId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }
    return client.emit('findDocuments', domainId, collectionId, query, options).then( data => {
      data.documents =_.reduce(data.documents, (r, v)=>{
      	var index = v._meta.index.split('~');
      	r.push(new Document(index[0], index[1], v));
      	return r;
      }, []); 
      return data;
	  });
  },

  scroll(options){
    return client.emit('scroll', options).then(data => {
      data.documents =_.reduce(data.documents, (r, v)=>{
      	var index = v._meta.index.split('~');
      	r.push(new Document(index[0], index[1], v));
      	return r;
      }, []);
      return data;
    });
  },

  clearScroll(options){
    return client.emit('clearScroll', options);
  }

});

_.assign(Document.prototype, {

  _create(domainId, collectionId, docData){
    return new Document(domainId, collectionId, docData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Document;  	
  },

  get(locale) {
    let data = _.cloneDeep(this);
    return this._create(this.domainId, this.collectionId, _.merge(data, data._i18n && data._i18n[locale]));
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }

    var newDoc = jsonPatch.deepClone(this), opts = {};
   	newDoc.title = title||newDoc.title;
    delete newDoc.id;
    return Document.create(this.domainId, this.collectionId, id, newDoc, opts);
  },

  replace(doc){
    return this._create(this.domainId, this.collectionId, doc);
  },

  value(path){
  	return jsonPatch.getValueByPointer(this, path);  	
  },

  is(path, value){
  	var errors = jsonPatch.validate([{op:'test', path: path, value:value}], this);
  	return !(errors && errors.length > 0)
  },

  patch(patch, options){
    return this.getClient().emit('patchDocument', this.domainId, this.collectionId, this.id, patch, options)
                 .then(docData => this._create(this.domainId, this.collectionId, docData));
  },

  delete(options) {
    return this.getClient().emit('deleteDocument', this.domainId, this.collectionId, this.id, options);
  },

  getEvents(options){
    return this.getClient().emit('getEvents', this.domainId, this.collectionId, this.id, options);
  },

  getMeta() {
    return this._meta;
  },

  patchMeta(metaPatch, options) {
    return this.getClient().emit('patchDocumentMeta', this.domainId, this.collectionId, this.id, metaPatch, options).then(metaData => {
      this._meta = metaData;
      return metaData;
    });
  },

  clearAclSubject(method, rgu, subjectId, options) {
    this.getClient().emit('clearAclSubject', this.domainId, this.collectionId, this.id, method, rgu, subjectId, options).then(metaData => {
      this._meta = metaData;
      return metaData;
    });
  },

  getMetaId() {
    return this._meta.metaId;
  }

});
