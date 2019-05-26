import _ from 'lodash';
import {inherits, uniqueId, makeError} from './utils';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Meta from './meta';
import Collection from './collection';
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
  VIEWS = '.views';

let client;

export default function View(domainId, viewData) {
  Document.call(this, domainId, VIEWS, viewData);
}

_.assign(View, {
  
  init: function(config) {
    client = config.client;
    return View;
  },

  create: function(domainId, id, viewRaw, options, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'object'){
      options = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function'){
      callback = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'object'){
      callback = options;
      options = viewRaw;
      viewRaw = id;
      id = uuidv4();
    } else if(arguments.length == 4 && typeof arguments[1] == 'string' && typeof arguments[3] == 'function'){
      callback = options
      options = undefined;
    }

    client.emit('createView', domainId, id, viewRaw, options, function(err, viewData) {
      if(err) return callback ? callback(err) : console.error(err);

      let view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
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
 
    client.emit('getView', domainId, id, options, function(err, viewData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      let view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
    });
  },

  find: function(domainId, query, options, callback) {
    if(arguments.length < 1 || (arguments.length >= 1 && typeof arguments[0] != 'string')){
      let err = makeError(400, 'argumentsError', 'Arguments is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
    } else if(arguments.length == 3 && typeof arguments[2]=='function'){
  	  callback = options;
  	  options = undefined;
  	}
  	  	
    client.emit('findViews', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.views = _.reduce(data.documents, function(r, v, k){
      	let index = v._meta.index.split('~');
      	r.push(new View(index[0], v));
      	return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(View, Document, {

  _create: function(domainId, collectionId, viewData){
    return new View(domainId, viewData);
  },

  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return View;
  },

  saveAs: function(id, title, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newView.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = title;
      title = id;
      id = uuidv4();
    }

  	let newView = _.cloneDeep(this), opts = {};

   	newView.title = title;
   	delete newView.id;

	View.create(this.domainId, id, newView, callback);
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
    client.emit('findViewDocuments', domainId, viewId, this._buildQuery(buildOpts), options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      _this._buildEntities(data);
      callback ? callback(null, data) : console.log(data);
    });
  },

  distinctQuery: function(field, options, callback) {
    this.getClient().emit('distinctQueryView', this.domainId, this.id, field, options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      callback(null, data);      
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
    this.getClient().emit('refreshView', this.domainId, this.id, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, result) : console.log(result);
	});
  }

});
