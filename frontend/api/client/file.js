import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, makeError} from './utils';
  
const
  PROFILES = '.files';

var client;

export default function File(domainId, fileData, isNew) {
  Document.call(this, domainId, PROFILES, fileData, isNew);
}

_.assign(File, {
  
  init(config) {
    client = config.client;
    return File;
  },

  create(domainId, id, fileRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      fileRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = fileRaw;
      fileRaw = id;
      id = uuidv4();
    }  	
    return client.emit('createFile', domainId, id, fileRaw, options).then(fileData => new File(domainId, fileData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
    return client.emit('getFile', domainId, id, options).then(fileData => new File(domainId, fileData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }
    return client.emit('findFiles', domainId, query, options).then(data => {
      data.file = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
      	r.push(new File(index[0], v));
      	return r;
      }, []);

      delete data.documents;
      return data;
	  });
  }

});

inherits(File, Document, {

  _create(domainId, collectionId, fileData){
    return new File(domainId, fileData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return File;
  },

  delete(options) {
    return this.getClient().emit('deleteFile', this.domainId, this.id, options);
  },
  
  saveAs: function(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
  	let newFile = _.cloneDeep(this), opts = {};
   	newFile.title = title || newFile.title;
   	delete newFile.id;
	  return File.create(this.domainId, this.id, newFile, opts);
  }

});
