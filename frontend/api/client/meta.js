import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  METAS = '.metas';

var client;

export default function Meta(domainId, metaData, isNew) {
  Document.call(this, domainId, METAS, metaData, isNew);
}

_.assign(Meta, {
  
  init(config) {
    client = config.client;
    return Meta;
  },

  create(domainId, id, metaRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      metaRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = metaRaw;
      metaRaw = id;
      id = uuidv4();
    }
    return client.emit('createMeta', domainId, id, metaRaw, options).then(metaData => new Meta(domainId, metaData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}  	
    return client.emit('getMeta', domainId, id, options).then(metaData => new Meta(domainId, metaData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    } 	  	
    return client.emit('findMetas', domainId, query, options).then( data => {
      data.metas = _.reduce(data.documents, (r, v) => {
      	let index = v._meta.index.split('~');
      	r.push(new Meta(index[0], v));
      	return r;
      }, []);
      delete data.documents;
      return data;
  	});
  }

});

inherits(Meta, Document, {

  _create(domainId, collectionId, metaData){
    return new Meta(domainId, metaData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Meta;
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
    let newMeta = _.cloneDeep(this), opts = {};
   	newMeta.title = title||newMeta.title;
    delete newMeta.id;
    return Meta.create(this.domainId, this.id, newMeta, opts);
  }

});

