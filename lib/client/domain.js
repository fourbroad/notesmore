module.exports = Domain;

const _ = require('lodash')
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
  , File = require('./file')
  , User = require('./user')
  , Document = require('./document')
  , {inherits, uniqueId, makeError} = require('./utils');

const
  DOMAINS = '.domains',
  ROOT = '.root';

var client;

function Domain(domainData) {
  Document.call(this, ROOT, DOMAINS, domainData);
}

function makeDocument(domainId, collectionId, docData) {
  switch (collectionId) {
  case '.metas':
    return new Meta(domainId, docData);
  case '.domains':
    return new Domain(docData);
  case '.collections':
    return new Collection(domainId, docData);
  case '.views':
    return new View(domainId, docData);
  case '.forms':
    return new Form(domainId, docData);
  case '.pages':
    return new Page(domainId, docData);
  case '.actions':
    return new Action(domainId, docData);
  case '.roles':
    return new Role(domainId, docData);
  case '.groups':
    return new Group(domainId, docData);
  case '.profiles':
    return new Profile(domainId, docData);
  case '.files':
    return new File(domainId, docData);
  case '.users':
    return new User(domainId, docData);
  default:
    return new Document(domainId, collectionId, docData);
  }
}

_.assign(Domain, {
  
  ROOT: ROOT,

  init: function(config) {
    client = config.client;
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
      if(err) return callback ? callback(err) : console.error(err);

      var domain = new Domain(domainData);
      callback ? callback(null, domain) : console.log(domain);
    });    
  },

  get: function(id, callback){
  　if(arguments.length < 1 || (arguments.length == 2 && typeof arguments[1] != 'function')){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}
    
    client.emit('getDomain', id, function(err, domainData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var domain = new Domain(domainData);
      callback ? callback(null, domain) : console.log(domain);
    });
  },

  find: function(query, callback) {
    client.emit('findDomains', query||{}, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.domains = _.reduce(data.documents, function(r, v, k){
        r.push(new Domain(v));
        return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  }

});

inherits(Domain, Document, {
  
  _create: function(domainId, collectionId, domainData){
    return new Domain(domainData);
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
      if(err) return callback ? callback(err) : console.error(err);
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
      if(err) return callback ? callback(err) : console.error(err);

      var doc = makeDocument(domainId, collectionId, docData);
      callback ? callback(null, doc) : console.log(doc);
    });
  },

  mgetDocuments: function(ids, callback){
    var client = this.getClient();
    client.emit('mgetDomainDocuments', this.id, ids, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      var docs = _.reduce(result.docs, function(r,v,k){
        var ids = v._meta.index.split('~');
        r.push(makeDocument(ids[0], ids[1], v));
        return r;
      },[]);
      callback ? callback(null, docs) : console.log(docs);
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
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, true) : console.log(true);
    });
  }

});

// module.exports = Domain;
