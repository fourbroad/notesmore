module.exports = View;

const _ = require('lodash')
  , {inherits, uniqueId, makeError} = require('./utils')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Meta = require('./meta')
  , Collection = require('./collection')
  , Domain = require('./domain')
  , Form = require('./form')
  , Group = require('./group')
  , Page = require('./page')
  , Action = require('./action')
  , Profile = require('./profile')
  , File = require('./file')
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document');

const
  VIEWS = '.views';

var client;

function View(domainId, viewData) {
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

      var view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
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
 
    client.emit('getView', domainId, id, options, function(err, viewData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var view = new View(domainId, viewData);
      callback ? callback(null, view) : console.log(view);
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
  	  	
    client.emit('findViews', domainId, query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.views = _.reduce(data.documents, function(r, v, k){
      	var index = v._meta.index.split('~');
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

  	var newView = _.cloneDeep(this), opts = {};

   	newView.title = title;
   	delete newView.id;

	View.create(this.domainId, id, newView, callback);
  },

  _buildDatetimeRange: function(searchColumn){
    var earliest, latest, range = {};
    switch(searchColumn.option){
      case 'overdue':
        latest = +moment();
        break;
      case 'overdue_more':
        if(searchColumn.latest && searchColumn.unit){
          latest = + moment().subtract(searchColumn.latest, searchColumn.unit);
        }
        break;
      case 'expire_yn':
        if((searchColumn.earliest || searchColumn.latest) && searchColumn.unit){
          var now = moment();
          if(searchColumn.willYn == 'yes'){
            earliest = + now.clone().subtract(searchColumn.earliest, searchColumn.unit);
            latest = + now;
          } else {
            earliest = + now.add(searchColumn.earliest, searchColumn.unit);
          }
        }
        break;
      case 'latest':
        if(searchColumn.earliest && searchColumn.unit){
          var now = moment();
          latest = + now;
          earliest = + now.clone().subtract(searchColumn.earliest, searchColumn.unit);
        }
        break;
      case 'before':
        if(searchColumn.latest && searchColumn.unit){
          latest = +moment().subtract(searchColumn.latest, searchColumn.unit);
        }
        break;
      case 'between':
        earliest = searchColumn.earliest
        latest = searchColumn.latest;
        break;
      case 'range':
        if(searchColumn.sEarliest || searchColumn.sLatest){
          var now = moment();
          if(searchColumn.sEarliest){
            earliest = +now.clone().add(moment.duration(searchColumn.sEarliest));
          }
          if(searchColumn.sLatest){
            latest = +now.clone().add(moment.duration(searchColumn.sLatest));
          }
        }
        break;
      default:
    }

    if(_.isNumber(earliest)){
      range[searchColumn.name] = range[searchColumn.name] || {};
      range[searchColumn.name].gte = earliest;
    }
    if(_.isNumber(latest)){
      range[searchColumn.name] = range[searchColumn.name] || {};
      range[searchColumn.name].lte = latest;
    }

    return range;
  },  

  _buildQuery: function(){
    var self = this, body = {body:{}}, 
        searchColumns = _.filter(this.searchColumns, function(sc) { return sc.visible == undefined || sc.visible == true; }),
        bool = _.reduce(searchColumns, function(bool, sc){
      switch(sc.type){
        case 'keywords':
          if(!_.isEmpty(sc.values)){
            bool.must = bool.must || [];
            bool.must.push(_.reduce(sc.values, function(bool, value){
              var term = {};
              term[sc.name+'.keyword'] = value;
              bool.bool.should.push({term:term});
              return bool;
            },{bool:{should:[]}}));
          }                            
          break;
         case 'containsText':
           if(!_.isEmpty(sc.containsText)){
             bool.must = bool.must || [];
             bool.must.push({query_string: {default_field: sc.name, query: '*'+sc.containsText+'*'}});
           }                    
            break;
         case 'datetimeRange':
         case 'datetimeDuedate':
           var range = self._buildDatetimeRange(sc);
           if(!_.isEmpty(range)){
             bool.filter = bool.filter || [];
             bool.filter.push({range:range});
           }
           break;
         case 'numericRange':
           var range = {};
           if(_.isNumber(sc.lowestValue)){
             range[sc.name] = range[sc.name] || {};
             range[sc.name].gte = sc.lowestValue;
           }
           if(_.isNumber(sc.highestValue)){
             range[sc.name] = range[sc.name] || {};
             range[sc.name].lte = sc.highestValue;
           }

           if(!_.isEmpty(range)){
             bool.filter = bool.filter || [];
             bool.filter.push({range:range});
           }
           break;
      }
      return bool;
    },{});

    if(!_.isEmpty(this.search.keyword)){
      bool.must = bool.must || [];
      bool.must.push({query_string:{fields:this.search.names, query: '*' + this.search.keyword + '*'}});
    }
    body.body.query = _.isEmpty(bool) ? {match_all:{}} : {bool: bool};

    return body;
  },

  _buildEntities: function(data){
      data.documents = _.reduce(data.documents, function(r, v, k){
        var indices = v._meta.index.split('~'), domainId = indices[0], collectionId = indices[1];
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
    const domainId = this.domainId, self = this, viewId = this.id, client = this.getClient();
    client.emit('findViewDocuments', domainId, viewId, this._buildQuery(), options, function(err, data) {
      if (err) return callback ? callback(err) : console.error(err);
      self._buildEntities(data);
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

    var self = this;
    client.emit('scroll', options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
      self._buildEntities(data);
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

// module.exports = View;
