
const _ = require('lodash')
  , createError = require('http-errors')
  , config = require('config')
  , model = require('./model')({elasticSearch: JSON.parse(JSON.stringify(config.get('elasticSearch')))});

const
  { Collection, Document, Domain, Form, Group, Meta, Page, Action, Role, Profile, User, View, Utils} = model;

var io, initSocket;

function filterQuery(visitorId, domainId, query){
  query = query || {body:{query:{}}};
  query.body = query.body || {};
  return Profile.get(domainId, visitorId).then( profile => {
    var body = query.body, q = body.query, should;
    if(_.isEmpty(q)) q = {match_all:{}};
    body.query = { bool:{ filter:{ bool:{ should:[] } }, must:[q]}};
    should = body.query.bool.filter.bool.should;
    _.each(profile.roles, function(role) { should.push({term:{"_meta.acl.get.roles.keyword":role}}); });
    _.each(profile.groups, function(group) { should.push({term:{"_meta.acl.get.groups.keyword":group}}); });
    should.push({term:{"_meta.acl.get.users.keyword":visitorId}});
    should.push({bool:{must_not:{exists:{field: '_meta.acl.get'}}}});

    return query;
  }).catch((err)=> {
    return Promise.reject(createError(401, "Unauthorized access", {code:401}));
  });
}

function checkPermission(visitorId, domainId, obj, method, data){
  var permissions;

  if(method == 'create'){
    permissions = _.at(obj,'acl.create')[0];
  } else {
    permissions = _.at(obj,'_meta.acl.'+method)[0];
  }

  function doCheckPermission(visitorId, domainId, permissions){
    if(!permissions) return Promise.resolve(true);
    if(!visitorId) return Promise.reject(createError(401, 'Have no permission to access '+ method +'!'));
    return Profile.get(domainId, visitorId).then( profile => {
      if(_.intersection(profile.roles, permissions.roles).length > 0 
      || _.intersection(profile.groups, permissions.groups).length > 0 
      || (permissions.users && permissions.users.indexOf(visitorId) >= 0) ){
        return true;
      } else {
        return Promise.reject(createError(401, "Unauthorized access", {code:401}));
      }
    }).catch(()=> {
      return Promise.reject(createError(401, "Unauthorized access", {code:401}));
    });
  }

  if(method == 'patch' && data.length > 0){
    var metas = _.filter(data, function(p) { return p.path=="/_meta" || p.path.startsWith("/_meta/"); });
    if(metas.length == 0){
      return doCheckPermission(visitorId, domainId, permissions);
    } else {
      var metaPermissions = _.at(obj,'_meta.acl.patchMeta')[0];
      if(metas.length == data.length){
        return doCheckPermission(visitorId, domainId, metaPermissions);
      } else {
        return Promise.all([doCheckPermission(visitorId, domainId, metaPermissions), doCheckPermission(visitorId, domainId, permissions)]);
      }
    }
  } else {
    return doCheckPermission(visitorId, domainId, permissions);
  }
}

function checkCreate(visitorId, domainId, metaId){
  metaId = metaId || '.meta';
  return Meta.get(domainId, metaId).then( meta => {
    return checkPermission(visitorId, domainId, meta, 'create');
  });
}

function checkAcl1(visitorId, clsObj, objId, method, data){
  return clsObj.get(objId).then( obj => {
    return checkPermission(visitorId, Domain.ROOT, obj, method, data).then( result => {
      return obj;
    });
  });
}

function checkAcl2(visitorId, clsObj, domainId, objId, method, data){
  return clsObj.get(domainId, objId).then( obj => {
    return checkPermission(visitorId, domainId, obj, method, data).then( result => {
      return obj;
    });
  });
}

function checkAcl3(visitorId, clsObj, domainId, collectionId, objId, method, data){
  return clsObj.get(domainId, collectionId, objId).then( obj => {
    return checkPermission(visitorId, domainId, obj, method, data).then( result => {
      return obj;
    });
  });
}


initSocket = function(socket, visitorId) {

  socket.on('login', function(userId, password, callback){
    User.login(userId, password).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('logout', function(callback){
    User.logout(visitorId).then( result => {
      setTimeout(() => { socket.disconnect(); }, 3000);
      return visitorId + " has logged out";
    }).then(result => callback(null, result)).catch(err => callback(err));;
  });

  socket.on('createMeta', function(domainId, metaId, metaData, callback){
    if(metaId == '.meta'){
      Meta.create(visitorId, domainId, metaId, metaData).then(result => callback(null, result)).catch(err => callback(err));
    }else{
      checkCreate(visitorId, domainId, '.meta').then(result =>{
        return Meta.create(visitorId, domainId, metaId, metaData);
      }).then(result => callback(null, result)).catch(err => callback(err));
    }
  });

  socket.on('getMeta', function(domainId, metaId, callback){
    checkAcl2(visitorId, Meta, domainId, metaId, 'get').then( meta => {
      return meta.get();
    }).then(result => callback(null, result)).catch(err => { callback(err);});
  });

  socket.on('patchMeta', function(domainId, metaId, patch, callback){
    checkAcl2(visitorId, Meta, domainId, metaId, 'patch', patch).then( meta => {
      return meta.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteMeta', function(domainId, metaId, callback){
    checkAcl2(visitorId, Meta, domainId, metaId, 'delete').then( meta =>{
      return meta.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });  

  socket.on('findMetas', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Meta.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createUser', function(userId, userData, callback){
    var metaId = _.at(userData, '_meta.metaId')[0] || '.meta-user';
    checkCreate(visitorId, Domain.ROOT, metaId).then( result => {
      return User.create(visitorId, userId, userData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getUser', function(userId, callback){
    var args = _.values(arguments);
    if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = userId
      userId = visitorId;
      args = [userId, callback];
    }else if(arguments.length != 2 || typeof arguments[1] != 'function'){
      console.log(arguments);
    }

    checkAcl1(visitorId, User, userId, 'get').then( user => {
      return user.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchUser', function(userId, patch, callback){
    checkAcl1(visitorId, User, userId, 'patch', patch).then( user => {
      return user.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteUser', function(userId, callback){
    checkAcl1(visitorId, User, userId, 'delete').then( user => {
      return user.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('resetPassword', function(userId, newPassword, callback){
    checkAcl1(visitorId, User, userId, 'resetPassword').then( user => {
      return user.resetPassword(visitorId, newPassword);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findUsers', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return User.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findDomains', function(query, callback){
    filterQuery(visitorId, Domain.ROOT, query).then( query => {
      return Domain.find(query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createDomain', function(domainId, domainData, callback){
    var metaId = _.at(domainData, '_meta.metaId')[0] || '.meta-domain';
    checkCreate(visitorId, Domain.ROOT, metaId).then( result => {
      return Domain.create(visitorId, domainId, domainData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getDomain', function(domainId, callback){
    checkAcl1(visitorId, Domain, domainId, 'get').then( domain => {
      return domain.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('mgetDomainDocuments', function(domainId, ids, callback){
    Domain.get(domainId).then(domain => {
      return domain.mgetDocuments(ids);
    }).then(data => {
      return Profile.get(domainId, visitorId).then( profile => {
        return _.reduce(data.docs, function(result, value, key){
          if(value.found){
            var doc = value._source, permissions = _.at(doc, '_meta.acl.get')[0];
            if( !permissions 
            ||_.intersection(profile.roles, permissions.roles).length > 0 
            || _.intersection(profile.groups, permissions.groups).length > 0 
            || (permissions.users && permissions.users.indexOf(visitorId) >= 0) ){
              doc._meta.index = value._index;
              result.push(doc);
            }
          }
          return result;
        },[]);
      });
    }).then(docs => callback(null, {docs:docs})).catch(err => callback(err));
  });

  socket.on('patchDomain', function(domainId, patch, callback){
    checkAcl1(visitorId, Domain, domainId, 'patch', patch).then( domain => {
      return domain.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('refreshDomain', function(domainId, callback){
    checkAcl1(visitorId, Domain, domainId, 'refresh').then( domain => {
      return domain.refresh();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteDomain', function(domainId, callback){
    checkAcl1(visitorId, Domain, domainId, 'delete').then( domain => {
      return domain.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createCollection', function(domainId, collectionId, collectionData, callback){
    var metaId = _.at(collectionData, '_meta.metaId')[0] || '.meta-collection';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Collection.create(visitorId, domainId, collectionId, collectionData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getCollection', function(domainId, collectionId, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'get').then( collection => {
      return collection.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findCollections', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Collection.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchCollection', function(domainId, collectionId, patch, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'patch', patch).then( collection => {
      return collection.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteCollection', function(domainId, collectionId, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'delete').then( collection => {
      return collection.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => { callback(err); });
  });

  socket.on('bulk', function(domainId, collectionId, docs, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'bulk').then( collection => {
      return collection.bulk(visitorId, docs);
    }).then(result => { callback(null, result);}).catch(err => callback(err));
  });

  socket.on('refreshCollection', function(domainId, collectionId, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'refresh').then( collection => {
      return collection.refresh();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createView', function(domainId, viewId, viewData, callback){
    var metaId = _.at(viewData, '_meta.metaId')[0] || '.meta-view';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return View.create(visitorId, domainId, viewId, viewData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getView', function(domainId, viewId, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'get').then( view => {
      return view.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findViews', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return View.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchView', function(domainId, viewId, patch, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'patch', patch).then( view => {
      return view.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteView', function(domainId, viewId, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'delete').then( view => {
      return view.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findViewDocuments', function(domainId, viewId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return View.get(domainId, viewId);
    }).then(view => {
      return view.findDocuments(query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('refreshView', function(domainId, viewId, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'refresh').then( view => {
      return view.refresh();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createForm', function(domainId, formId, formData, callback){
    var metaId = _.at(formData, '_meta.metaId')[0] || '.meta-form';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Form.create(visitorId, domainId, formId, formData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getForm', function(domainId, formId, callback){
    checkAcl2(visitorId, Form, domainId, formId, 'get').then( form => {
      return form.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findForms', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Form.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchForm', function(domainId, formId, patch, callback){
    checkAcl2(visitorId, Form, domainId, formId, 'patch', patch).then( form => {
      return form.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteForm', function(domainId, formId, callback){
    checkAcl2(visitorId, Form, domainId, formId, 'delete').then( form => {
      return form.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createPage', function(domainId, pageId, pageData, callback){
    var metaId = _.at(pageData, '_meta.metaId')[0] || '.meta-page';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Page.create(visitorId, domainId, pageId, pageData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getPage', function(domainId, pageId, callback){
    checkAcl2(visitorId, Page, domainId, pageId, 'get').then( page => {
      return page.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchPage', function(domainId, pageId, patch, callback){
    checkAcl2(visitorId, Page, domainId, pageId, 'patch', patch).then( page => {
      return page.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deletePage', function(domainId, pageId, callback){
    checkAcl2(visitorId, Page, domainId, pageId, 'delete').then( page => {
      return page.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createAction', function(domainId, actionId, actionData, callback){
    var metaId = _.at(actionData, '_meta.metaId')[0] || '.meta-action';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Action.create(visitorId, domainId, actionId, actionData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getAction', function(domainId, actionId, callback){
    checkAcl2(visitorId, Action, domainId, actionId, 'get').then( action => {
      return action.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchAction', function(domainId, actionId, patch, callback){
    checkAcl2(visitorId, Action, domainId, actionId, 'patch', patch).then( action => {
      return action.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteAction', function(domainId, actionId, callback){
    checkAcl2(visitorId, Action, domainId, actionId, 'delete').then( action => {
      return action.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findActions', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Action.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createRole', function(domainId, roleId, roleData, callback){
    var metaId = _.at(roleData, '_meta.metaId')[0] || '.meta-role';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Role.create(visitorId, domainId, roleId, roleData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getRole', function(domainId, roleId, callback){
    checkAcl2(visitorId, Role, domainId, roleId, 'get').then( role => {
      return role.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findRoles', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Role.find(domainId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchRole', function(domainId, roleId, patch, callback){
    checkAcl2(visitorId, Role, domainId, roleId, 'patch', patch).then( role => {
      return role.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteRole', function(domainId, roleId, callback){
    checkAcl2(visitorId, Role, domainId, roleId, 'delete').then( role => {
      return role.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createGroup', function(domainId, groupId, groupData, callback){
    var metaId = _.at(groupData, '_meta.metaId')[0] || '.meta-group';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Group.create(visitorId, domainId, groupId, groupData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getGroup', function(domainId, groupId, callback){
    checkAcl2(visitorId, Group, domainId, groupId, 'get').then( group => {
      return group.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchGroup', function(domainId, groupId, patch, callback){
    checkAcl2(visitorId, Group, domainId, groupId, 'patch', patch).then( group => {
      return group.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteGroup', function(domainId, groupId, callback){
    checkAcl2(visitorId, Group, domainId, groupId, 'delete').then( group => {
      return group.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createProfile', function(domainId, profileId, profileData, callback){
    var metaId = _.at(profileData, '_meta.metaId')[0] || '.meta-profile';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Profile.create(visitorId, domainId, profileId, profileData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getProfile', function(domainId, profileId, callback){
    checkAcl2(visitorId, Profile, domainId, profileId, 'get').then( profile => {
      return profile.get();
     }).then(result => callback(null, result)).catch(err => callback(err));
 });

  socket.on('findProfiles', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Profile.find(domainId, query)
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchProfile', function(domainId, profileId, patch, callback){
    checkAcl2(visitorId, Profile, domainId, profileId, 'patch', patch).then( profile => {
      return profile.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteProfile', function(domainId, profileId, callback){
    checkAcl2(visitorId, Profile, domainId, profileId, 'delete').then( profile => {
      return profile.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('createDocument', function(domainId, collectionId, documentId, docData, callback){
    var metaId = _.at(docData, '_meta.metaId')[0] || '.meta';
    checkCreate(visitorId, domainId, metaId).then( result => {
      return Document.create(visitorId, domainId, collectionId, documentId, docData);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getDocument', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'get').then( document => {
      return document.get();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('findDocuments', function(domainId, collectionId, query, callback){
    filterQuery(visitorId, domainId, query).then( query => {
      return Document.find(domainId, collectionId, query);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchDocument', function(domainId, collectionId, documentId, patch, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'patch', patch).then( document => {
      return document.patch(visitorId, patch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('deleteDocument', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'delete').then( document => {
      return document.delete(visitorId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('scroll', function(params, callback){
    Document.scroll(params).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('clearScroll', function(params, callback){
    Document.clearScroll(params).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('getEvents', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'getEvents').then( document => {
      return document.getEvents();
    }).then(result => {
      console.log(result);
      callback(null, result)
    }).catch(err => {
      console.log(err);
      callback(err)
    });
  });

  socket.on('getDocumentMeta', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'getMeta').then( document => {
      return document.getMeta();
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('patchDocumentMeta', function(domainId, collectionId, documentId, aclPatch, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'patchMeta').then( document => {
      return document.patchMeta(visitorId, aclPatch);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('clearAclSubject', function(domainId, collectionId, documentId, method, rgu, subjectId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'clearAclSubject').then( document => {
      return document.clearAclSubject(visitorId, method, rgu, subjectId);
    }).then(result => callback(null, result)).catch(err => callback(err));
  });

  socket.on('disconnect', function(){
    console.log('%s disconnected.', visitorId);
  });
};

module.exports = {
  connect: function(io) {
    io.of('/domains').on('connection', function(socket) {
      const token = socket.handshake.query.token;
      if (token) {
        User.verify(token).then( visitorId  => {
          initSocket(socket, visitorId);
        }).catch((err)=>{
          socket.emit(err.name, err);
          setTimeout(()=>{ socket.disconnect(); }, 5000);
        });
      } else {
        initSocket(socket);
      }
    });
  }
};