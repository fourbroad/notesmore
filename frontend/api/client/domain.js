import _ from 'lodash';
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
import {inherits, makeError} from './utils';

const
  DOMAINS = '.domains',
  ROOT = '.root';

var client;

export default function Domain(domainData, isNew) {
  Document.call(this, ROOT, DOMAINS, domainData, isNew);
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

  init(config) {
    client = config.client;
    return Domain;
  },

  create(id, domainRaw, options){
    if(arguments.length == 1 && typeof arguments[0] == 'object'){
      domainRaw = id;
      id = uuidv4();
    } else if(arguments.length == 2 && typeof arguments[0] == 'object' && typeof arguments[1] == 'object'){
      options = domainRaw;
      domainRaw = id;
      id = uuidv4();
    }
    return client.emit('createDomain', id, domainRaw, options).then(domainData => new Domain(domainData));    
  },

  get(id, options){
  　if(arguments.length < 1){
      Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
    return client.emit('getDomain', id, options).then(domainData => new Domain(domainData));
  },

  find(query, options) {
    return client.emit('findDomains', query, options).then( data => {
      data.domains = _.reduce(data.documents, (r, v)=>{
        r.push(new Domain(v));
        return r;
      }, []);
      delete data.documents;
      return data;
  	});
  },

  mgetDocuments(domainId, ids, options){
  　if(arguments.length < 2){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
  　if(_.isEmpty(ids)){
  　  return Promise.resolve({total:0, offset:0, documents:[]});
  　}
    return client.emit('mgetDomainDocuments', domainId, ids, options).then( result => {
      return _.reduce(result.docs, (r,v) => {
        let ids = v._meta.index.split('~');
        r.push(makeDocument(ids[0], ids[1], v));
        return r;
      },[]);
    });
  }

});

inherits(Domain, Document, {
  
  _create(domainId, collectionId, domainData){
    return new Domain(domainData);
  },

  getClient(){
   	return client;
  },

  getClass(){
  	return Domain;  	
  },

  copy(targetId, targetTitle, options){
    targetId = targetId || uuidv4();
    this.getClient().emit('copyDomain', this.id, targetId, targetTitle, options).then(domainData => new Domain(domainData));
  },

  delete(options){
    return this.getClient().emit('deleteDomain', this.id, options);    
  },

  createMeta(metaId, metaRaw, options){
    return Meta.create.apply(Meta, [this.id].concat(_.values(arguments)));
  },

  getMeta(metaId, options){
    return Meta.get.apply(Meta, [this.id].concat(_.values(arguments)));
  },

  findMetas(query, options){
    return Meta.find.apply(Meta, [this.id].concat(_.values(arguments)));
  },

  createDocument(colId, docId, docRaw, options) {
  	return Document.create.apply(Document, [this.id].concat(_.values(arguments)));
  },

  getDocument(collectionId, documentId, options) {
    return Document.get(this.id, collectionId, documentId, options)
                   .then(document => makeDocument(domainId, collectionId, document));
  },

  mgetDocuments(ids, options){
  　if(arguments.length < 1){
      return Promise.reject(makeError(400, 'parameterError', 'Parameters is incorrect!'));
  　}
  　if(_.isEmpty(ids)){
  　  return Promise.resolve({total:0, offset:0, documents:[]});
  　}
    return this.getClient().emit('mgetDomainDocuments', this.id, ids, options).then(result => {
      return _.reduce(result.docs, (r,v) => {
        let ids = v._meta.index.split('~');
        r.push(makeDocument(ids[0], ids[1], v));
        return r;
      },[]);
    });
  },

  findDocuments(query, options) {
  	return Document.find.apply(Document, [this.id].concat(_.values(arguments)));
  },

  createCollection(collectionId, collectionRaw, options){
    return Collection.create.apply(Collection, [this.id].concat(_.values(arguments)));
  },

  getCollection(collectionId, options){
    return Collection.get.apply(Collection, [this.id].concat(_.values(arguments)));
  },

  findCollections(query, options){
    return Collection.find.apply(Collection, [this.id].concat(_.values(arguments)));
  },

  distinctQueryCollections(field, wildcard, options) {
    let query = {
      collapse: {
        field: field + '.keyword'
      },
      aggs: {
        itemCount: {
          cardinality: {
            field: field + '.keyword'
          }
        }
      }
      //          _source:[field]
    };

    if (wildcard) {
      query.query = {
        wildcard: {}
      };
      query.query.wildcard[field + ".keyword"] = wildcard;
    }

    return this.findCollections(query, options);
  },

  createView(viewId, viewRaw, options){
    return View.create.apply(View, [this.id].concat(_.values(arguments)));
  },

  getView(viewId, options){
    return View.get.apply(View, [this.id].concat(_.values(arguments)));
  },

  findViews(query, options){
    return View.find.apply(View, [this.id].concat(_.values(arguments)));
  },

  createForm(formId, formRaw, options){
    return Form.create.apply(Form, [this.id].concat(_.values(arguments)));
  },

  getForm(formId, options){
    return Form.get.apply(Form, [this.id].concat(_.values(arguments)));
  },

  findForms(query, options){
    return Form.find.apply(Form, [this.id].concat(_.values(arguments)));
  },

  createPage(pageId, pageRaw, options){
    return Page.create.apply(Page, [this.id].concat(_.values(arguments)));
  },

  getPage(pageId, options){
    return Page.get.apply(Page, [this.id].concat(_.values(arguments)));
  },

  findPages(query, options){
    return Page.find.apply(Page, [this.id].concat(_.values(arguments)));
  },

  createRole(roleId, roleRaw, options){
    return Role.create.apply(Role, [this.id].concat(_.values(arguments)));
  },

  getRole(roleId, options){
    return Role.get(Role, [this.id].concat(_.values(arguments)));
  },

  findRoles(query, options){
    return Role.find.apply(Role, [this.id].concat(_.values(arguments)));
  },

  createGroup(groupId, groupRaw, options){
    return Group.create.apply(Group, [this.id].concat(_.values(arguments)));
  },

  getGroup(groupId, options){
    return Group.get.apply(Group, [this.id].concat(_.values(arguments)));
  },

  findGroups(query, options){
    return Group.find.apply(Group, [this.id].concat(_.values(arguments)));
  },

  createProfile(profileId, profileRaw, options){
    return Profile.create.apply(Profile, [this.id].concat(_.values(arguments)));
  },

  getProfile(profileId, options){
    return Profile.get.apply(Profile, [this.id].concat(_.values(arguments)));
  },

  findProfiles(query, options){
    return Profile.find.apply(Profile, [this.id].concat(_.values(arguments)));
  },

  createUser(userId, userRaw, options){
    return User.create.apply(User, [this.id].concat(_.values(arguments)));
  },

  getUser(userId, options){
    return User.get.apply(User, [this.id].concat(_.values(arguments)));
  },

  findUsers(query, options){
    return User.find.apply(User, [this.id].concat(_.values(arguments)));
  },

  refresh(options){
    this.getClient().emit('refreshDomain', this.id, options);
  }

});
