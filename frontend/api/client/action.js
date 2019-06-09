import _ from 'lodash';
import uuidv4 from 'uuid/v4';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';
  
const
  ACTIONS = '.actions';

var client;

export default function Action(domainId, actionData, isNew) {
  Document.call(this, domainId, ACTIONS, actionData, isNew);
}

_.assign(Action, {
  
  init(config) {
    client = config.client;
    return Action;
  },

  create(domainId, id, actionRaw, options){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      actionRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = actionRaw;
      actionRaw = id;
      id = uuidv4();
    }
    return client.emit('createAction', domainId, id, actionRaw, options).then(actionData => new Action(domainId, actionData));
  },

  get(domainId, id, options){
  　if(arguments.length < 2){
  　  return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!')); 
  　}
    return client.emit('getAction', domainId, id, options).then(actionData => new Action(domainId, actionData));
  },

  mget(domainId, ids, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}

  　if(_.isEmpty(ids)){
      return Promise.resolve({total:0, offset:0, actions:[]});
  　}

    return this.find(domainId, {
      body:{
        query: { bool: {should: _.reduce(ids, (result, id, index) => {
          result.push({term: {'id.keyword': id}});
          return result;        	
        },[])}}
      },
      size:1000
    }, options);
  },

  find(domainId, query, options) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      return Promise.reject(makeError(400, 'argumentsError', 'Arguments is incorrect!'));
    }
    return client.emit('findActions', domainId, query, options).then( data => {
      data.actions = _.reduce(data.documents, (r, v, k) => {
        var index = v._meta.index.split('~');
   	    r.push(new Action(index[0], v));
   	    return r;
      }, []);
      delete data.documents;
      return data;
	  });
  }

});

inherits(Action, Document, {

  _create(domainId, collectionId, actionData){
    return new Action(domainId, actionData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Action;
  },

  saveAs(id, title){
  	var newAction = _.cloneDeep(this), opts = {};

    if(arguments.length == 0){
      id = uuidv4();
    }

   	newAction.title = title||newAction.title;
   	delete newAction.id;

	  return Action.create(this.domainId, this.id, newAction, opts);
  }

});
