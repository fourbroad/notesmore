module.exports = Domain;

const _ = require('lodash')
  , NodeCache = require("node-cache")
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Meta = require('./meta')
  , Collection = require('./collection')
  , View = require('./view')
  , Form = require('./form')
  , Group = require('./group')
  , Page = require('./page')
  , Action = require('./action')
  , Profile = require('./profile')
  , Role = require('./role')
  , User = require('./user')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');

const
  DOMAINS = '.domains',
  ROOT = '.root';

var cache, client;

function Domain(domainData) {
  Document.call(this, ROOT, DOMAINS, domainData);
}

_.assign(Domain, {
  
  ROOT: ROOT,

  init: function(config) {
    client = config.client;
    cache = new NodeCache(config.nodeCache);
    return Domain;
  },

  create: function(id, domainRaw, callback){
    if(arguments.length == 1){
      domainRaw = id;
      id = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = domainRaw;
      domainRaw = id;
      id = uuidv4();
    }
        
    client.emit('createDomain', id, domainRaw, function(err, domainData) {
      if(err) return callback ? callback(err) : console.log(err);

      var domain = new Domain(domainData);
      callback ? callback(null, domain) : console.log(domain);
    });    
  },

  get: function(id, callback){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.log(err); 
  　}
    
    client.emit('getDomain', id, function(err, domainData) {
      if(err) return callback ? callback(err) : console.log(err);
      
      var domain = new Domain(domainData);
      callback ? callback(null, domain) : console.log(domain);
    });
  },

  find: function(query, callback) {
    client.emit('findDomains', query||{}, function(err, domsData) {
      if(err) return callback ? callback(err) : console.log(err);
       
      var domains = _.map(domsData.hits.hits, function(domainData){
      	    return new Domain(domainData._source);
          }), result = {total:domsData.hits.total, domains: domains};

	  callback ? callback(null, result) : console.log(result);
	});
  }

});

inherits(Domain, Document, {
  
  _create: function(domainId, collectionId, domainData){
    return new Domain(domainData);
  },

  _getCache: function(){
    return cache;
  },
  
  getClient: function(){
   	return client;
  },

  getClass: function(){
  	return Domain;  	
  },

  saveAs: function(id, title, callback){
  	var newDom = _.cloneDeep(this);

    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = id;
      id = uuidv4();
      title = newDom.title;
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      title = id;
      callback = title;
      id = uuidv4();
    }

   	newDom.title = title;
   	delete newDom.id;
	
	Domain.create(this.id, newDom, callback);
  },

  delete: function(callback){
  	var client = this.getClient();
    client.emit('deleteDomain', this.id, function(err, result) {
      if(err) return callback ? callback(err) : console.log(err);
	  callback ? callback(null, result) : console.log(result);
	});    
  },

  createMeta: function(metaId, metaRaw, callback){
    if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = metaRaw;
      metaRaw = metaId;
      metaId = uuidv4();
    }
    Meta.create(this.id, metaId, metaRaw, callback);
  },

  getMeta: function(metaId, callback){
    Meta.get(this.id, metaId, callback);
  },

  findMetas: function(query, callback){
    Meta.find(this.id, query, callback);
  },

  createDocument: function(colId, docId, docRaw, callback) {
    if(arguments.length == 2 && typeof arguments[1] == 'object'){
      docRaw = docId;
      docId = uuidv4();      
    }else if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = docRaw;
      docRaw = docId;
      docId = uuidv4();
    }
  	Document.create(this.id, colId, docId, docRaw, callback);
  },

  getDocument: function(collectionId, documentId, callback) {
    const domainId = this.id, client = this.getClient();
    client.emit('getDocument', domainId, collectionId, documentId, function(err, docData) {
      if(err) return callback ? callback(err) : console.log(err);
            
      switch (collectionId) {
      case '.metas':
        var meta = Meta.create(domainId, docData);
        callback ? callback(null, meta) : console.log(meta);
        break;
      case '.domains':
        var domain = Domain.create(docData);
        callback ? callback(null, domain) : console.log(domain);
        break;
      case '.collections':
        var collection = Collection.create(domainId, docData);
        callback ? callback(null, collection) : console.log(collection);
        break;
      case '.views':
        var view = View.create(domainId, docData);
        callback ? callback(null, view) : console.log(view);
        break;
      case '.forms':
        var form = Form.create(domainId, docData);
        callback ? callback(null, form) : console.log(form);
        break;
      case '.pages':
        var page = Page.create(domainId, docData);
        callback ? callback(null, page) : console.log(page);
        break;
      case '.actions':
        var action = Action.create(domainId, docData);
        callback ? callback(null, action) : console.log(action);
        break;
      case '.roles':
        var role = Role.create(domainId, docData);
        callback ? callback(null, role) : console.log(role);
        break;
      case '.groups':
        var group = Group.create(domainId, docData);
        callback ? callback(null, group) : console.log(group);
        break;
      case '.profiles':
        var profile = Profile.create(domainId, docData);
        callback ? callback(null, profile) : console.log(profile);
        break;
      case '.users':
        var user = User.create(domainId, docData);
        callback ? callback(null, user) : console.log(user);
        break;
      default:
        callback(null, Document.create(domainId, collectionId, docData));
        break;
      }
    });
  },  

  findDocuments: function(query, callback) {
  	Document.find(this.id, '*', query, callback);
  },

  createCollection: function(collectionId, collectionRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      collectionRaw = collectionId;
      collectionId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = collectionRaw;
      collectionRaw = collectionId;
      collectionId = uuidv4();
    }
    Collection.create(this.id, collectionId, collectionRaw, callback);
  },

  getCollection: function(collectionId, callback){
    Collection.get(this.id, collectionId, callback);
  },

  findCollections: function(query, callback){
    Collection.find(this.id, query, callback);
  },

  distinctQueryCollections: function(field, wildcard, callback) {
    var query = {
      collapse: {
        field: field + '.keyword'
      },
      aggs: {
        itemCount: {
          cardinality: {
            field: field + '.keyword'
          }
        }
      }//          _source:[field]
    };

    if (wildcard) {
      query.query = {
        wildcard: {}
      };
      query.query.wildcard[field + ".keyword"] = wildcard;
    }

   this.findCollections(query, callback);
  },

  createView: function(viewId, viewRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      viewRaw = viewId;
      viewId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = viewRaw;
      viewRaw = viewId;
      viewId = uuidv4();
    }
    View.create(this.id, viewId, viewRaw, callback);
  },

  getView: function(viewId, callback){
    View.get(this.id, viewId, callback);
  },

  findViews: function(query, callback){
    View.find(this.id, query, callback);
  },

  createForm: function(formId, formRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      formRaw = formId;
      formId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = formRaw;
      formRaw = formId;
      formId = uuidv4();
    }
    Form.create(this.id, formId, formRaw, callback);
  },

  getForm: function(formId, callback){
    Form.get(this.id, formId, callback);
  },

  findForms: function(query, callback){
    Form.find(this.id, query, callback);
  },

  createPage: function(pageId, pageRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      pageRaw = pageId;
      pageId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = pageRaw;
      pageRaw = pageId;
      pageId = uuidv4();
    }
    Page.create(this.id, pageId, pageRaw, callback);
  },

  getPage: function(pageId, callback){
    Page.get(this.id, pageId, callback);
  },

  findPages: function(query, callback){
    Page.find(this.id, query, callback);
  },

  createRole: function(roleId, roleRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      roleRaw = roleId;
      roleId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = roleRaw;
      roleRaw = roleId;
      roleId = uuidv4();
    }
    Role.create(this.id, roleId, roleRaw, callback);
  },

  getRole: function(roleId, callback){
    Role.get(this.id, roleId, callback);
  },

  findRoles: function(query, callback){
    Role.find(this.id, query, callback);
  },

  createGroup: function(groupId, groupRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      groupRaw = groupId;
      groupId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = groupRaw;
      groupRaw = groupId;
      groupId = uuidv4();
    }
    Group.create(this.id, groupId, groupRaw, callback);
  },

  getGroup: function(groupId, callback){
    Group.get(this.id, groupId, callback);
  },

  findGroups: function(query, callback){
    Group.find(this.id, query, callback);
  },

  createProfile: function(profileId, profileRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      profileRaw = profileId;
      profileId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = profileRaw;
      profileRaw = profileId;
      profileId = uuidv4();
    }
    Profile.create(this.id, profileId, profileRaw, callback);
  },

  getProfile: function(profileId, callback){
    Profile.get(this.id, profileId, callback);
  },

  findProfiles: function(query, callback){
    Profile.find(this.id, query, callback);
  },

  createUser: function(userId, userRaw, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      userRaw = userId;
      userId = uuidv4();
    }else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = userRaw;
      userRaw = userId;
      userId = uuidv4();
    }
    User.create(this.id, userId, userRaw, callback);
  },

  getUser: function(userId, callback){
    User.get(this.id, userId, callback);
  },

  findUsers: function(query, callback){
    User.find(this.id, query, callback);
  },

  refresh: function(callback){
    var client = this.getClient();
    client.emit('refreshDomain', this.id, function(err, result) {
      if(err) return callback ? callback(err) : console.log(err);
      callback ? callback(null, true) : console.log(true);
    });
  }

});

// module.exports = Domain;
