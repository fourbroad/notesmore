import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, makeError} from './utils';
const
  GROUPS = '.groups';

var client;

export default function Group(domainId, groupData, isNew) {
  Document.call(this, domainId, GROUPS, groupData, isNew);
}

_.assign(Group, {
  
  init(config) {
    client = config.client;
    return Group;
  },

  create(domainId, id, groupRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      groupRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = groupRaw;
      groupRaw = id;
      id = uuidv4();
    }
    return client.emit('createGroup', domainId, id, groupRaw, options).then(groupData => new Group(domainId, groupData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
    return client.emit('getGroup', domainId, id, options).then(groupData => new Group(domainId, groupData));
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }  	  	  	
    return client.emit('findGroups', domainId, query, options).then(data => {
      data.groups = _.reduce(data.documents, (r, v) => {
      	let index = v._meta.index.split('~');
      	r.push(new Group(index[0], v));
      	return r;
      }, []);
      delete data.documents;
      return data;
  	});
  }

});

inherits(Group, Document, {

  _create(domainId, collectionId, groupData){
    return new Group(domainId, groupData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Group;
  },

  saveAs(id, title){
    if(arguments.length == 0){
      id = uuidv4();
    }
    let newGroup = _.cloneDeep(this), opts = {};
   	newGroup.title = title || newGroup.title;
    delete newGroup.id;
    return	Group.create(this.domainId, this.id, newGroup, opts);
  }

});
