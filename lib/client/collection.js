import _ from 'lodash';
import {inherits, uniqueId, makeError} from './utils';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Meta from './meta';
import View from './view';
import Domain from './domain';
import Form from './form';
import Group from './group';
import Page from './page';
import Action from './action';
import Profile from './profile';
import File from './file';
import Role from './role';
import User from './user';
import Document from './document';

const
  COLLECTIONS = '.collections';

let client;

export default function Collection(domainId, colData) {
  Document.call(this, domainId, COLLECTIONS, colData);
}

_.assign(Collection, {
  
  init: function(config) {
    client = config.client;
    return Collection;
  },

  create: function(domainId, id, colRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = colRaw;
      colRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }

    client.emit('createCollection', domainId, id, colRaw, options, function(err, colData) {
      if(err) return callback ? callback(err) : console.error(err);

      let collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
    });    
  },

  get: function(domainId, id, options, callback){
  　if(arguments.length < 2){
  　	let err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 3 && typeof arguments[2] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}

    client.emit('getCollection', domainId, id, options, function(err, colData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      let collection = new Collection(domainId, colData);
      callback ? callback(null, collection) : console.log(collection);
    });
  },

  find: function(domainId, query, options, callback){
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      let err = makeError(400, 'argumentsError', 'Arguments is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
    } else if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}

    client.emit('findCollections', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.collections = _.reduce(data.documents, function(r, v, k){
        let index = v._meta.index.split('~');
        r.push(new Collection(index[0], v));
        return r;
      },[]);
      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Collection, Document, {

  _create: function(domainId, collectionId, colData){
    return new Collection(domainId, colData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Collection;  	
  },

  delete: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

  	let client = this.getClient();
    client.emit('deleteCollection', this.domainId, this.id, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newCol.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

  	let newCol = _.cloneDeep(this), opts = {};

   	newCol.title = title;
   	delete newCol.id;
	
	Collection.create(this.domainId, this.id, newCol, opts, callback);
  },

  _buildDatetimeRange: function(searchColumn){
    let earliest, latest, range = searchColumn.range, rangeClause = {};
    switch(range && range.option){
      case 'overdue':
        latest = +moment();
        break;
      case 'overdue_more':
        if(range.latest && range.unit){
          latest = + moment().subtract(range.latest, range.unit);
        }
        break;
      case 'expire_yn':
        if((range.earliest || range.latest) && range.unit){
          let now = moment();
          if(range.willYn == 'yes'){
            earliest = + now.clone().subtract(range.earliest, range.unit);
            latest = + now;
          } else {
            earliest = + now.add(range.earliest, range.unit);
          }
        }
        break;
      case 'latest':
        if(range.earliest && range.unit){
          let now = moment();
          latest = + now;
          earliest = + now.clone().subtract(range.earliest, range.unit);
        }
        break;
      case 'before':
        if(range.latest && range.unit){
          latest = +moment().subtract(range.latest, range.unit);
        }
        break;
      case 'between':
        earliest = range.earliest
        latest = range.latest;
        break;
      case 'range':
        if(range.sEarliest || range.sLatest){
          let now = moment();
          if(range.sEarliest){
            earliest = +now.clone().add(moment.duration(range.sEarliest));
          }
          if(range.sLatest){
            latest = +now.clone().add(moment.duration(range.sLatest));
          }
        }
        break;
      default:
    }

    if(_.isNumber(earliest)){
      rangeClause[searchColumn.name] = rangeClause[searchColumn.name] || {};
      rangeClause[searchColumn.name].gte = earliest;
    }
    if(_.isNumber(latest)){
      rangeClause[searchColumn.name] = rangeClause[searchColumn.name] || {};
      rangeClause[searchColumn.name].lte = latest;
    }

    return rangeClause;
  },  

  _buildQuery: function(options){
    let _this = this, source, body = {body:{}}, bool = _.reduce(this.search.fields, function(bool, sf){
      switch(sf.type){
        case 'keywords':
          if(!_.isEmpty(sf.values)){
            bool.must = bool.must || [];
            bool.must.push(_.reduce(sf.values, function(bool, value){
              let term = {};
              term[sf.name+'.keyword'] = value;
              bool.bool.should.push({term:term});
              return bool;
            },{bool:{should:[]}}));
          }                            
          break;
         case 'containsText':
           if(!_.isEmpty(sf.containsText)){
             bool.must = bool.must || [];
             bool.must.push({query_string: {fields:[`${sf.name}.keyword`, `_i18n.*.${sf.name}.keyword`], query: `*${sf.containsText}*`}});
           }                    
            break;
         case 'datetimeRange':
         case 'datetimeDuedate':{
           let range = _this._buildDatetimeRange(sf);
           if(!_.isEmpty(range)){
             bool.filter = bool.filter || [];
             bool.filter.push({range:range});
           }
         }
           break;
         case 'numericRange':{
           let range = {};
           if(sf.range && _.isNumber(sf.range.lowestValue)){
             range[sf.name] = range[sf.name] || {};
             range[sf.name].gte = sf.range.lowestValue;
           }
           if(sf.range && _.isNumber(sf.range.highestValue)){
             range[sf.name] = range[sf.name] || {};
             range[sf.name].lte = sf.range.highestValue;
           }

           if(!_.isEmpty(range)){
             bool.filter = bool.filter || [];
             bool.filter.push({range:range});
           }
         }
           break;
      }
      return bool;
    },{});

    options = options||{};

    if(!_.isEmpty(this.search.fulltext.keyword)){
      bool.must = bool.must || [];
      bool.must.push({query_string:{fields:_.at(this, 'search.fulltext.fields')[0], query: `*${_.at(this, 'search.fulltext.keyword')[0]}*`}});
    }
    body.body.query = _.isEmpty(bool) ? {match_all:{}} : {bool: bool};

    switch(options.source){
      case 'visibleColumns':
        source = _.reduce(this.columns, (fields, col)=>{
          if(col.name && (col.visible==undefined || col.visible)){
            fields.push(col.name);
            fields.push(`_i18n.*.${col.name}`);
          }                    
          return fields;
        },[]);
      break;
      case 'allColumns':
        source = _.reduce(this.columns, (fields, col)=>{
          if(col.name){
            fields.push(col.name);
            fields.push(`_i18n.*.${col.name}`);
          }                    
          return fields;
        },[]);
      break;
      case 'allFields':
      default:
    }

    if(!_.isEmpty(source)){
      source.push('_meta.*');
      body.body._source = source;
    }

    return body;
  },

  _buildEntities: function(data){
      data.documents = _.reduce(data.documents, function(r, v, k){
        let indices = v._meta.index.split('~'), domainId = indices[0], collectionId = indices[1];
        switch (collectionId) {
        case '.domains':
          r.push(new Domain(v));
          break;
        case '.metas':
          r.push(new Meta(domainId, v));
          break;
        case '.collections':
          r.push(new Collection(domainId, v));
          break;
        case '.views':
          r.push(new View(domainId, v));
          break;
        case '.pages':
          r.push(new Page(domainId, v));
          break;
        case '.actions':
          r.push(new Action(domainId, v));
          break;
        case '.forms':
          r.push(new Form(domainId, v));
          break;
        case '.roles':
          r.push(new Role(domainId, v));
          break;
        case '.groups':
          r.push(new Group(domainId, v));
          break;
        case '.profiles':
          r.push(new Profile(domainId, v));
          break;
        case '.files':
          r.push(new File(domainId, v));
          break;
        case '.users':
          r.push(new User(v));
          break;
        default:
          r.push(new Document(domainId, collectionId, v));
        }
        return r;
      },[]);
  },

  findDocuments: function(options, callback) {
  	if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
  	}

    const domainId = this.domainId, _this = this, buildOpts = {}, viewId = this.id, client = this.getClient();
    if(options && options.source){
      buildOpts.source = options.source;
    }
    console.log(this);
    console.log(this._buildQuery(buildOpts));
    client.emit('findDocuments', domainId, viewId, this._buildQuery(buildOpts), options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      _this._buildEntities(data);
      callback ? callback(null, data) : console.log(data);
    });
  },

  distinctQuery: function(field, options, callback) {
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
  		callback = options;
  		options = undefined;
  	}
    this.getClient().emit('distinctQueryCollection', this.domainId, this.id, field, options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      callback(null, data);      
    });
  },

  bulk: function(docs, options, callback){
  	if(arguments.length == 2 && typeof arguments[1] == 'function'){
  		callback = options;
  		options = undefined;
  	}

    this.getClient().emit('bulk', this.domainId, this.id, docs, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  createDocument: function(docId, docRaw, options, callback) {
  	if(arguments.length == 1){
 	  docRaw = docId;
  	  docId = uuidv4();
  	} else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = docRaw;
      docRaw = docId;
      docId = uuidv4();
  	} else if(arguments.length == 2 && typeof arguments[1] == 'object'){
  	  options = docRaw;
  	  docId = uuidv4();
  	}
  	Document.create(this.domainId, this.id, docId, docRaw, options, callback);
  },

  getDocument: function(docId, options, callback) {
  	let args = [this.domainId, this.id].concat(_.values(arguments));
  	Document.get.apply(this, args);
  },

  putSnapshotTemplate: function(template, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('putSnapshotTemplate', this.domainId, this.id, template, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  getSnapshotTemplate: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('getSnapshotTemplate', this.domainId, this.id, options, function(err, template){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, template) : console.log(template);
    });
  },

  putEventTemplate: function(template, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('putEventTemplate', this.domainId, this.id, template, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  getEventTemplate: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('getEventTemplate', this.domainId, this.id, options, function(err, template){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, template) : console.log(template);
    });
  },

  reindexSnapshots: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('reindexSnapshots', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  reindexEvents: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('reindexEvents', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
    });
  },

  scroll: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    let _this = this;
    client.emit('scroll', options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
      _this._buildEntities(data);
	  callback ? callback(null, data) : console.log(data);
    });
  },  

  clearScroll: function(params, options, callback){
  	Document.clearScroll.apply(this, arguments);
  },

  refresh: function(options, callback) {
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }
  	
  	let client = this.getClient();
    client.emit('refreshCollection', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});
