import _ from 'lodash';
import jsonPatch from 'fast-json-patch';
import uuidv4 from 'uuid/v4';
import Meta from './meta';
import Collection from './collection';
import View from './view';
import Form from './form';
import Group from './group';
import Page from './page';
import Action from './action';
import Profile from './profile';
import Role from './role';
import File from './file';
import User from './user';
import Document from './document';
import {inherits, uniqueId, makeError} from './utils';

const
  DOMAINS = '.domains',
  ROOT = '.root';

var client;

export default function Domain(domainData) {
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

  create: function(id, domainRaw, options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      domainRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arguments[1] == 'function'){
      callback = domainRaw;
      domainRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arguments[0] == 'object' && typeof arguments[1] == 'object'){
      options = domainRaw;
      domainRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arguments[0] == 'object' && typeof arguments[1] == 'function'){
      callback = domainRaw;
      domainRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[0] == 'object'　&& typeof arguments[2] == 'function'){
      callback = options;
      options = domainRaw;
      domainRaw = id;
      id = uuidv4();
    } else if(arguments.length == 3 && typeof arguments[0] == 'string'　&& typeof arguments[2] == 'function'){
      callback = options;
      options = undefined;
    }

        
    client.emit('createDomain', id, domainRaw, options, function(err, domainData) {
      if(err) return callback ? callback(err) : console.error(err);

      var domain = new Domain(domainData);
      callback ? callback(null, domain) : console.log(domain);
    });    
  },

  get: function(id, options, callback){
  　if(arguments.length < 1){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 2 && typeof arguments[1] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}
    
    client.emit('getDomain', id, options, function(err, domainData) {
      if(err) return callback ? callback(err) : console.error(err);
      
      var domain = new Domain(domainData);
      callback ? callback(null, domain) : console.log(domain);
    });
  },

  find: function(query, options, callback) {
  	if(arguments.length == 2 && typeof arguments[1]=='function'){
  	  callback = options;
  	  options = undefined;
  	}

    client.emit('findDomains', query, options, function(err, data) {
      if(err) return callback ? callback(err) : console.error(err);
       
      data.domains = _.reduce(data.documents, function(r, v, k){
        r.push(new Domain(v));
        return r;
      }, []);

      delete data.documents;

	  callback ? callback(null, data) : console.log(data);
	});
  },

  mgetDocuments: function(domainId, ids, options, callback){
  　if(arguments.length < 2){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 3 && typeof arguments[2] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}

  　if(_.isEmpty(ids)){
  　  return callback(null, {total:0, offset:0, documents:[]});
  　}

    client.emit('mgetDomainDocuments', domainId, ids, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      var docs = _.reduce(result.docs, function(r,v,k){
        var ids = v._meta.index.split('~');
        r.push(makeDocument(ids[0], ids[1], v));
        return r;
      },[]);
      callback ? callback(null, docs) : console.log(docs);
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

  copy: function(targetId, targetTitle, options, callback){
    if(arguments.length == 3 && typeof arguments[2] == 'function'){
      callback = options,
      options = undefined;
    }

    targetId = targetId || uuidv4();

    this.getClient().emit('copyDomain', this.id, targetId, targetTitle, options, function(err, domainData){
      if(err) return callback ? callback(err) : console.error(err);
      var domain = new Domain(domainData);
	  callback ? callback(null, domain) : console.log(domain);
    });
  },

  delete: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }

    this.getClient().emit('deleteDomain', this.id, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
	  callback ? callback(null, result) : console.log(result);
	});    
  },

  createMeta: function(metaId, metaRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Meta.create.apply(Meta, args);
  },

  getMeta: function(metaId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Meta.get.apply(Meta, args);
  },

  findMetas: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Meta.find.apply(Meta, args);
  },

  createDocument: function(colId, docId, docRaw, options, callback) {
    var args = [this.id].concat(_.values(arguments));
  	Document.create.apply(Document, args);
  },

  getDocument: function(collectionId, documentId, options, callback) {
    if(arguments.length == 3 && typeof arguments[2]=='function'){
      callback = options;
      options = undefined;
    }    
    Document.get(this.id, collectionId, documentId, options, function(err, document){
      if(err) return callback ? callback(err) : console.error(err);
      var doc = makeDocument(domainId, collectionId, document);
      callback ? callback(null, doc) : console.log(doc);
    })
  },

  mgetDocuments: function(ids, options, callback){
  　if(arguments.length < 1){
  　	var err = makeError(400, 'parameterError', 'Parameters is incorrect!');
  　  return callback ? callback(err) : console.error(err); 
  　}else if(arguments.length == 2 && typeof arguments[1] == 'function'){
  　  callback = options;
  　  options = undefined;
  　}

  　if(_.isEmpty(ids)){
  　  return callback(null, {total:0, offset:0, documents:[]});
  　}

    var client = this.getClient();
    client.emit('mgetDomainDocuments', this.id, ids, options, function(err, result){
      if(err) return callback ? callback(err) : console.error(err);
      var docs = _.reduce(result.docs, function(r,v,k){
        var ids = v._meta.index.split('~');
        r.push(makeDocument(ids[0], ids[1], v));
        return r;
      },[]);
      callback ? callback(null, docs) : console.log(docs);
    });
  },

  findDocuments: function(query, options, callback) {
    var args = [this.id].concat(_.values(arguments));
  	Document.find.apply(Document, args);
  },

  createCollection: function(collectionId, collectionRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Collection.create.apply(Collection, args);
  },

  getCollection: function(collectionId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Collection.get.apply(Collection, args);
  },

  findCollections: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Collection.find.apply(Collection, args);
  },

  distinctQueryCollections: function(field, wildcard, options, callback) {
    if(arguments.length == 3 && arguments[2] == 'function'){
      callback = options;
      options = undefined;
    }

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

   this.findCollections(query, options, callback);
  },

  createView: function(viewId, viewRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    View.create.apply(View, args);
  },

  getView: function(viewId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    View.get.apply(View, args);
  },

  findViews: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    View.find.apply(View, args);
  },

  createForm: function(formId, formRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Form.create.apply(Form, args);
  },

  getForm: function(formId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Form.get.apply(Form, args);
  },

  findForms: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Form.find.apply(Form, args);
  },

  createPage: function(pageId, pageRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Page.create.apply(Page, args);
  },

  getPage: function(pageId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Page.get.apply(Page, args);
  },

  findPages: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Page.find.apply(Page, args);
  },

  createRole: function(roleId, roleRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Role.create.apply(Role, args);
  },

  getRole: function(roleId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Role.get(Role, args);
  },

  findRoles: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Role.find.apply(Role, args);
  },

  createGroup: function(groupId, groupRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Group.create.apply(Group, args);
  },

  getGroup: function(groupId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Group.get.apply(Group, args);
  },

  findGroups: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Group.find.apply(Group, args);
  },

  createProfile: function(profileId, profileRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Profile.create.apply(Profile, args);
  },

  getProfile: function(profileId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Profile.get.apply(Profile, args);
  },

  findProfiles: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    Profile.find.apply(Profile, args);
  },

  createUser: function(userId, userRaw, options, callback){
    var args = [this.id].concat(_.values(arguments));
    User.create.apply(User, args);
  },

  getUser: function(userId, options, callback){
    var args = [this.id].concat(_.values(arguments));
    User.get.apply(User, args);
  },

  findUsers: function(query, options, callback){
    var args = [this.id].concat(_.values(arguments));
    User.find.apply(User, args);
  },

  refresh: function(options, callback){
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = options;
      options = undefined;
    }
    var client = this.getClient();
    client.emit('refreshDomain', this.id, options, function(err, result) {
      if(err) return callback ? callback(err) : console.error(err);
      callback ? callback(null, true) : console.log(true);
    });
  }

});
