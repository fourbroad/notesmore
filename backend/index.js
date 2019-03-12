
const _ = require('lodash')
  ,  createError = require('http-errors')
  , { Collection, Document, Domain, Form, Group, Meta, Page, Role, Profile, User, View, Utils} = require('./model')({elasticSearch: { host: 'localhost:9200'}});

var io, initSocket;

function filterQuery(visitorId, domainId, query, callback){
  query = query || {query:{}};
  Profile.get(domainId, visitorId, (err, profile)=>{
    if(err) return callback && callback(err);

    var q = query.query, should;
    if(_.isEmpty(q)) q = {match_all:{}};
    query.query = { bool:{ filter:{ bool:{ should:[] } }, must:[q]}};
    should = query.query.bool.filter.bool.should;
    _.each(profile.roles, function(role) { should.push({term:{"_meta.acl.get.roles.keyword":role}}); });
    _.each(profile.groups, function(group) { should.push({term:{"_meta.acl.get.groups.keyword":group}}); });
    should.push({term:{"_meta.acl.get.users.keyword":visitorId}});
    should.push({bool:{must_not:{exists:{field: '_meta.acl.get'}}}});

    callback&& callback(null, query);
  });
}

function checkPermission(visitorId, domainId, method, permissions, callback){
  if(!permissions) return callback && callback(null, true);
  if(!visitorId) return callback && callback(createError(401, 'Have no permission to access '+ method +'!'));
  Profile.get(domainId, visitorId, (err, profile)=>{
    if(err) return callback && callback(err);
  
    if(_.intersection(profile.roles, permissions.roles).length > 0 
    || _.intersection(profile.groups, permissions.groups).length > 0 
    || (permissions.users && permissions.users.indexOf(visitorId) >= 0) ){
      callback && callback(null, true);
    } else {
      callback && callback(createError(401, 'Have no permission to access '+ method +'!'));
    }
  });
}

function checkCreate(visitorId, domainId, metaId, callback){
  metaId = metaId || '.meta';
  Meta.get(domainId, metaId, (err, meta) => {
    if(err) return callback && callback(err); 
    checkPermission(visitorId, domainId, 'create', _.at(meta,'acl.create')[0], callback);
  });
}

function checkAcl1(visitorId, clsObj, objId, method, callback){
  clsObj.get(objId, (err, obj)=>{
    if(err) return callback && callback(err);
    checkPermission(visitorId, Domain.ROOT, method, _.at(obj,'_meta.acl.'+method)[0], function(err, result){
      if(err) return callback && callback(err);
      callback && callback(null, obj);
    });
  });
}

function checkAcl2(visitorId, clsObj, domainId, objId, method, callback){
  clsObj.get(domainId, objId, (err, obj)=>{
    if(err) return callback && callback(err);
    checkPermission(visitorId, domainId, method, _.at(obj,'_meta.acl.'+method)[0], function(err, result){
      if(err) return callback && callback(err);
      callback && callback(null, obj);
    });
  });
}

function checkAcl3(visitorId, clsObj, domainId, collectionId, objId, method, callback){
  clsObj.get(domainId, collectionId, objId, (err, obj)=>{
    if(err) return callback && callback(err);
    checkPermission(visitorId, domainId, method, _.at(obj,'_meta.acl.'+method)[0], function(err, result){
      if(err) return callback && callback(err);
      callback && callback(null, obj);
    });
  });
}


initSocket = function(socket, visitorId) {

  socket.on('login', function(userId, password, callback){
    User.login(userId, password, callback);
  });

  socket.on('logout', function(callback){
    User.logout(visitorId, (err, result) => {
      if(err) return callback && callback(err);
      setTimeout(() => { socket.disconnect(); }, 3000);
      callback && callback(null, visitorId + " has logged out");
    })
  });

  socket.on('createMeta', function(domainId, metaId, metaData, callback){
    if(metaId == '.meta'){
      Meta.create(visitorId, domainId, metaId, metaData, callback);
    }else{
      checkCreate(visitorId, domainId, '.meta', function(err, result){
        if(err) return callback && callback(err);
        Meta.create(visitorId, domainId, metaId, metaData, callback);
      });
    }
  });

  socket.on('getMeta', function(domainId, metaId, callback){
    checkAcl2(visitorId, Meta, domainId, metaId, 'get', function(err, meta){
      if(err) return callback && callback(err);
      meta.get(callback);
    });
  });

  socket.on('patchMeta', function(domainId, metaId, patch, callback){
    checkAcl2(visitorId, Meta, domainId, metaId, 'patch', function(err, meta){
      if(err) return callback && callback(err);
      meta.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteMeta', function(domainId, metaId, callback){
    checkAcl2(visitorId, Meta, domainId, metaId, 'delete', function(err, meta){
      if(err) return callback && callback(err);
      meta.delete(visitorId, callback);
    });
  });  

  socket.on('createUser', function(userId, userData, callback){
    var metaId = _.at(userData, '_meta.metaId')[0] || '.meta-user';
    checkCreate(visitorId, Domain.ROOT, metaId, function(err, result){
      if(err) return callback && callback(err);
      User.create(visitorId, userId, userData, callback);
    });
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

    checkAcl1(visitorId, User, userId, 'get', function(err, user){
      if(err) return callback && callback(err);
      user.get(callback);      
    });
  });

  socket.on('patchUser', function(userId, patch, callback){
    checkAcl1(visitorId, User, userId, 'patch', function(err, user){
      if(err) return callback && callback(err);
      user.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteUser', function(userId, callback){
    checkAcl1(visitorId, User, userId, 'delete', function(err, user){
      if(err) return callback && callback(err);
      user.delete(visitorId, callback);
    });
  });

  socket.on('resetPassword', function(userId, newPassword, callback){
    checkAcl1(visitorId, User, userId, 'resetPassword', function(err, user){
      if(err) return callback && callback(err);
      user.resetPassword(visitorId, newPassword, callback);
    });
  });

  socket.on('findDomains', function(query, callback){
    filterQuery(visitorId, Domain.ROOT, query, function(err, query){
      if(err) return callback && callback(err);
      Domain.find(query, callback);      
    });
  });

  socket.on('createDomain', function(domainId, domainData, callback){
    var metaId = _.at(domainData, '_meta.metaId')[0] || '.meta-domain';
    checkCreate(visitorId, Domain.ROOT, metaId, function(err, result){
      if(err) return callback && callback(err);
      Domain.create(visitorId, domainId, domainData, callback);
    });
  });

  socket.on('getDomain', function(domainId, callback){
    checkAcl1(visitorId, Domain, domainId, 'get', function(err, domain){
      if(err) return callback && callback(err);
      domain.get(callback);
    });
  });

  socket.on('patchDomain', function(domainId, patch, callback){
    checkAcl1(visitorId, Domain, domainId, 'patch', function(err, domain){
      if(err) return callback && callback(err);
      domain.patch(visitorId, patch, callback);
    });
  });

  socket.on('refreshDomain', function(domainId, callback){
    checkAcl1(visitorId, Domain, domainId, 'refresh', function(err, domain){
      if(err) return callback && callback(err);
      domain.refresh(callback);
    });
  });

  socket.on('deleteDomain', function(domainId, callback){
    checkAcl1(visitorId, Domain, domainId, 'delete', function(err, domain){
      if(err) return callback && callback(err);
      domain.delete(visitorId, callback);
    });
  });

  socket.on('createCollection', function(domainId, collectionId, collectionData, callback){
    var metaId = _.at(collectionData, '_meta.metaId')[0] || '.meta-collection';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Collection.create(visitorId, domainId, collectionId, collectionData, callback);
    });
  });

  socket.on('getCollection', function(domainId, collectionId, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'get', function(err, collection){
      if(err) return callback && callback(err);
      collection.get(callback);
    });
  });

  socket.on('findCollections', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      Collection.find(domainId, query, callback);
    });
  });

  socket.on('patchCollection', function(domainId, collectionId, patch, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'patch', function(err, collection){
      if(err) return callback && callback(err);
      collection.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteCollection', function(domainId, collectionId, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'delete', function(err, collection){
      if(err) return callback && callback(err);
      collection.delete(visitorId, callback);
    });
  });

  socket.on('bulk', function(domainId, collectionId, docs, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'bulk', function(err, collection){
      if(err) return callback && callback(err);
      collection.bulk(visitorId, docs, callback);
    });
  });

  socket.on('refreshCollection', function(domainId, collectionId, callback){
    checkAcl2(visitorId, Collection, domainId, collectionId, 'refresh', function(err, collection){
      if(err) return callback && callback(err);
      collection.refresh(callback);
    });    
  });

  socket.on('createView', function(domainId, viewId, viewData, callback){
    var metaId = _.at(viewData, '_meta.metaId')[0] || '.meta-view';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      View.create(visitorId, domainId, viewId, viewData, callback);
    });
  });

  socket.on('getView', function(domainId, viewId, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'get', function(err, view){
      if(err) return callback && callback(err);
      view.get(callback);
    });
  });

  socket.on('findViews', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      if(err) return callback && callback(err);
      View.find(domainId, query, callback)
    });
  });

  socket.on('patchView', function(domainId, viewId, patch, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'patch', function(err, view){
      if(err) return callback && callback(err);
      view.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteView', function(domainId, viewId, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'delete', function(err, view){
      if(err) return callback && callback(err);
      view.delete(visitorId, callback);
    });
  });

  socket.on('findViewDocuments', function(domainId, viewId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      if(err) return callback && callback(err);
      View.get(domainId, viewId, function(err, view){
        if(err) return callback && callback(err);
        view.findDocuments(query, callback);
      });
    });
  });

  socket.on('refreshView', function(domainId, viewId, callback){
    checkAcl2(visitorId, View, domainId, viewId, 'refresh', function(err, view){
      if(err) return callback && callback(err);
      view.refresh(callback);
    });
  });

  socket.on('createForm', function(domainId, formId, formData, callback){
    var metaId = _.at(formData, '_meta.metaId')[0] || '.meta-form';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Form.create(visitorId, domainId, formId, formData, callback);
    });
  });

  socket.on('getForm', function(domainId, formId, callback){
    checkAcl2(visitorId, Form, domainId, formId, 'get', function(err, form){
      if(err) return callback && callback(err);
      form.get(callback);
    });
  });

  socket.on('findForms', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      if(err) return callback && callback(err);
      Form.find(domainId, query, callback)
    });
  });

  socket.on('patchForm', function(domainId, formId, patch, callback){
    checkAcl2(visitorId, Form, domainId, formId, 'patch', function(err, form){
      if(err) return callback && callback(err);
      form.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteForm', function(domainId, formId, callback){
    checkAcl2(visitorId, Form, domainId, formId, 'delete', function(err, form){
      if(err) return callback && callback(err);
      form.delete(visitorId, callback);
    });
  });

  socket.on('createPage', function(domainId, pageId, pageData, callback){
    var metaId = _.at(pageData, '_meta.metaId')[0] || '.meta-page';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Page.create(visitorId, domainId, pageId, pageData, callback);
    });
  });

  socket.on('getPage', function(domainId, pageId, callback){
    checkAcl2(visitorId, Page, domainId, pageId, 'get', function(err, page){
      if(err) return callback && callback(err);
      page.get(callback);
    });
  });

  socket.on('patchPage', function(domainId, pageId, patch, callback){
    checkAcl2(visitorId, Page, domainId, pageId, 'patch', function(err, page){
      if(err) return callback && callback(err);
      page.patch(visitorId, patch, callback);
    });
  });

  socket.on('deletePage', function(domainId, pageId, callback){
    checkAcl2(visitorId, Page, domainId, pageId, 'delete', function(err, page){
      if(err) return callback && callback(err);
      page.delete(visitorId, callback);
    });
  });

  socket.on('createRole', function(domainId, roleId, roleData, callback){
    var metaId = _.at(roleData, '_meta.metaId')[0] || '.meta-role';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Role.create(visitorId, domainId, roleId, roleData, callback);
    });
  });

  socket.on('getRole', function(domainId, roleId, callback){
    checkAcl2(visitorId, Role, domainId, roleId, 'get', function(err, role){
      if(err) return callback && callback(err);
      role.get(callback);
    });
  });

  socket.on('findRoles', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      if(err) return callback && callback(err);
      Role.find(domainId, query, callback)
    });
  });

  socket.on('patchRole', function(domainId, roleId, patch, callback){
    checkAcl2(visitorId, Role, domainId, roleId, 'patch', function(err, role){
      if(err) return callback && callback(err);
      role.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteRole', function(domainId, roleId, callback){
    checkAcl2(visitorId, Role, domainId, roleId, 'delete', function(err, role){
      if(err) return callback && callback(err);
      role.delete(visitorId, callback);
    });
  });

  socket.on('createGroup', function(domainId, groupId, groupData, callback){
    var metaId = _.at(groupData, '_meta.metaId')[0] || '.meta-group';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Group.create(visitorId, domainId, groupId, groupData, callback);
    });
  });

  socket.on('getGroup', function(domainId, groupId, callback){
    checkAcl2(visitorId, Group, domainId, groupId, 'get', function(err, group){
      if(err) return callback && callback(err);
      group.get(callback);
    });
  });

  socket.on('patchGroup', function(domainId, groupId, patch, callback){
    checkAcl2(visitorId, Group, domainId, groupId, 'patch', function(err, group){
      if(err) return callback && callback(err);
      group.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteGroup', function(domainId, groupId, callback){
    checkAcl2(visitorId, Group, domainId, groupId, 'delete', function(err, group){
      if(err) return callback && callback(err);
      group.delete(visitorId, callback);
    });
  });

  socket.on('createProfile', function(domainId, profileId, profileData, callback){
    var metaId = _.at(profileData, '_meta.metaId')[0] || '.meta-profile';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Profile.create(visitorId, domainId, profileId, profileData, callback);
    });
  });

  socket.on('getProfile', function(domainId, profileId, callback){
    checkAcl2(visitorId, Profile, domainId, profileId, 'get', function(err, profile){
      if(err) return callback && callback(err);
      profile.get(callback);
    });
  });

  socket.on('findProfiles', function(domainId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      if(err) return callback && callback(err);
      Profile.find(domainId, query, callback)
    });
  });

  socket.on('patchProfile', function(domainId, profileId, patch, callback){
    checkAcl2(visitorId, Profile, domainId, profileId, 'patch', function(err, profile){
      if(err) return callback && callback(err);
      profile.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteProfile', function(domainId, profileId, callback){
    checkAcl2(visitorId, Profile, domainId, profileId, 'delete', function(err, profile){
      if(err) return callback && callback(err);
      profile.delete(visitorId, callback);
    });
  });

  socket.on('createDocument', function(domainId, collectionId, documentId, docData, callback){
    var metaId = _.at(docData, '_meta.metaId')[0] || '.meta';
    checkCreate(visitorId, domainId, metaId, function(err, result){
      if(err) return callback && callback(err);
      Document.create(visitorId, domainId, collectionId, documentId, docData, callback);
    });
  });

  socket.on('getDocument', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'get', function(err, document){
      if(err) return callback && callback(err);
      document.get(callback);
    });
  });

  socket.on('findDocuments', function(domainId, collectionId, query, callback){
    filterQuery(visitorId, domainId, query, function(err, query){
      if(err) return callback && callback(err);
      Document.find(domainId, collectionId, query, callback)
    });
  });

  socket.on('patchDocument', function(domainId, collectionId, documentId, patch, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'patch', function(err, document){
      if(err) return callback && callback(err);
      document.patch(visitorId, patch, callback);
    });
  });

  socket.on('deleteDocument', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'delete', function(err, document){
      if(err) return callback && callback(err);
      document.delete(visitorId, callback);
    });
  });

  socket.on('scroll', function(params, callback){
    Document.scroll(params, callback);
  });

  socket.on('clearScroll', function(params, callback){
    Document.clearScroll(params, callback);
  });

  socket.on('getAcl', function(domainId, collectionId, documentId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'getAcl', function(err, document){
      if(err) return callback && callback(err);
      document.getAcl(callback);
    });
  });

  socket.on('patchAcl', function(domainId, collectionId, documentId, aclPatch, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'patchAcl', function(err, document){
      if(err) return callback && callback(err);
      document.patchAcl(visitorId, aclPatch, callback);
    });
  });

  socket.on('clearAclSubject', function(domainId, collectionId, documentId, method, rgu, subjectId, callback){
    checkAcl3(visitorId, Document, domainId, collectionId, documentId, 'clearAclSubject', function(err, document){
      if(err) return callback && callback(err);
      document.clearAclSubject(visitorId, method, rgu, subjectId, callback);
    });
  });

  socket.on('disconnect', function() {
    console.log('%s disconnected.', visitorId);
  });
};

module.exports = {
  connect: function(io) {
    io.of('/domains').on('connection', function(socket) {
      const token = socket.handshake.query.token;
      if (token) {
        User.verify(token, (err, visitorId) => {
          if(err){
//             socket.emit('error', err);
            setTimeout(()=>{ socket.disconnect(); }, 3000);
            return;
          }

          initSocket(socket, visitorId);
        });
      } else {
        initSocket(socket);
      }
    });
  }
};