
const _ = require('lodash')
  , model = require('./model')
  , ACL = require('./acl');

const
  { Collection, Document, Domain, Form, Group, Meta, Page, Action, Role, Profile, File, User, View, Utils} = model,
  { getClass, filterQuery, checkPermission, checkCreate, checkAcl1, checkAcl2, checkAcl3 } = ACL;

var io, initSocket;

initSocket = function(socket) {

  socket.use((packet, next) => {
    const token = socket.handshake.query.token;
    if(token){
      User.verify(token).then( visitorId  => {
        _.merge(socket.handshake.query, {visitorId: visitorId});
        next();
      }).catch(e => {
        console.log(e);
        next(e);
        // setTimeout(()=>{socket.disconnect();}, 1000);
      });
    } else {
      next();
    }
  });

  socket.on('login', function(userId, password, callback){
    User.login(userId, password).then(token => {
      _.merge(socket.handshake.query, {token: token});
      callback(null, token)
    }).catch(err => callback(err));
  });

  socket.on('logout', function(callback){
    let visitorId = socket.handshake.query.visitorId;
    User.logout(visitorId).then( result => {
      delete socket.handshake.query.visitorId;
      delete socket.handshake.query.token;
      // setTimeout(() => { socket.disconnect(); }, 3000);
      return visitorId + " has logged out";
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createMeta', function(domainId, metaId, metaData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    if(metaId == '.meta'){
      Meta.create(visitorId, domainId, metaId, metaData, options).then(result => callback(null, result)).catch(err => {
        console.error(err);
        callback(err);
      });
    }else{
      checkCreate(visitorId, domainId, '.meta', options).then(result =>{
        return Meta.create(visitorId, domainId, metaId, metaData, options);
      }).then(result => callback(null, result)).catch(err => {
        console.error(err);
        callback(err);
      });
    }
  });

  socket.on('getMeta', function(domainId, metaId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Meta, domainId, metaId, 'get', null, options).then( meta => {
      return meta.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.log(metaId);
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchMeta', function(domainId, metaId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Meta, domainId, metaId, 'patch', patch, options).then( meta => {
      return meta.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteMeta', function(domainId, metaId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Meta, domainId, metaId, 'delete', null, options).then( meta =>{
      return meta.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });  

  socket.on('findMetas', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Meta.find(domainId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createUser', function(userId, userData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(userData, '_meta.metaId')[0] || '.meta-user';
    checkCreate(visitorId, Domain.ROOT, metaId, options).then( result => {
      return User.create(visitorId, userId, userData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getUser', function(userId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, User, userId || visitorId, 'get', null, options).then( user => {
      return user.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchUser', function(userId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, User, userId, 'patch', patch, options).then( user => {
      return user.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteUser', function(userId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, User, userId, 'delete', null, options).then( user => {
      return user.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('resetPassword', function(userId, newPassword, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, User, userId, 'resetPassword', null, options).then( user => {
      return user.resetPassword(visitorId, newPassword, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findUsers', function(query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, Domain.ROOT, query, options).then( query => {
      return User.find(query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findDomains', function(query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, Domain.ROOT, query, options).then( query => {
      return Domain.find(query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createDomain', function(domainId, domainData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(domainData, '_meta.metaId')[0] || '.meta-domain';
    checkCreate(visitorId, Domain.ROOT, metaId, options).then( result => {
      return Domain.create(visitorId, domainId, domainData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getDomain', function(domainId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, Domain, domainId, 'get', null, options).then( domain => {
      return domain.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('copyDomain', function(sourceId, targetId, targetTitle, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, Domain, sourceId, 'copy', null, options).then( domain => {
      return domain.copy(visitorId, targetId, targetTitle, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('mgetDomainDocuments', function(domainId, ids, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    Domain.get(domainId, options).then(domain => {
      return domain.mgetDocuments(ids, options);
    }).then(data => {
      return Profile.get(domainId, visitorId, options).then( profile => {
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
    }).then(docs => callback(null, {docs:docs})).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchDomain', function(domainId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, Domain, domainId, 'patch', patch, options).then( domain => {
      return domain.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('refreshDomain', function(domainId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, Domain, domainId, 'refresh', null, options).then( domain => {
      return domain.refresh(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteDomain', function(domainId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl1(visitorId, Domain, domainId, 'delete', null, options).then( domain => {
      return domain.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createCollection', function(domainId, collectionId, collectionData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(collectionData, '_meta.metaId')[0] || '.meta-collection';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Collection.create(visitorId, domainId, collectionId, collectionData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getCollection', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'get', null, options).then( collection => {
      return collection.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.log({domainId:domainId, collectionId:collectionId});
      console.error(err);
      callback(err);
    });
  });

  socket.on('findCollections', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Collection.find(domainId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchCollection', function(domainId, collectionId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'patch', patch, options).then( collection => {
      return collection.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteCollection', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'delete', null, options).then( collection => {
      return collection.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('bulk', function(domainId, collectionId, docs, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'bulk', null, options).then( collection => {
      return collection.bulk(visitorId, docs, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('distinctQueryCollection', function(domainId, collectionId, field, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'distinctQuery', null, options).then( collection => {
      return collection.distinctQuery(field, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('putSnapshotTemplate', function(domainId, collectionId, template, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'putSnapshotTemplate', null, options).then( collection => {
      return collection.putSnapshotTemplate(template, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getSnapshotTemplate', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'getSnapshotTemplate', null, options).then( collection => {
      return collection.getSnapshotTemplate(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('putEventTemplate', function(domainId, collectionId, template, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'putEventTemplate', null, options).then( collection => {
      return collection.putEventTemplate(template, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getEventTemplate', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'getEventTemplate', null, options).then( collection => {
      return collection.getEventTemplate(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('reindexSnapshots', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'reindexSnapshots', null, options).then( collection => {
      return collection.reindexSnapshots(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('reindexEvents', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'reindexEvents', null, options).then( collection => {
      return collection.reindexEvents(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('refreshCollection', function(domainId, collectionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Collection, domainId, collectionId, 'refresh', null, options).then( collection => {
      return collection.refresh(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createView', function(domainId, viewId, viewData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(viewData, '_meta.metaId')[0] || '.meta-view';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return View.create(visitorId, domainId, viewId, viewData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getView', function(domainId, viewId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, View, domainId, viewId, 'get', null, options).then( view => {
      return view.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findViews', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return View.find(domainId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchView', function(domainId, viewId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, View, domainId, viewId, 'patch', patch, options).then( view => {
      return view.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteView', function(domainId, viewId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, View, domainId, viewId, 'delete', null, options).then( view => {
      return view.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findViewDocuments', function(domainId, viewId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return View.get(domainId, viewId, options);
    }).then(view => {
      return view.findDocuments(query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('distinctQueryView', function(domainId, viewId, field, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, View, domainId, viewId, 'distinctQuery', null, options).then( view => {
      return view.distinctQuery(field, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });  

  socket.on('refreshView', function(domainId, viewId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, View, domainId, viewId, 'refresh', null, options).then( view => {
      return view.refresh(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createForm', function(domainId, formId, formData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(formData, '_meta.metaId')[0] || '.meta-form';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Form.create(visitorId, domainId, formId, formData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getForm', function(domainId, formId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Form, domainId, formId, 'get', null, options).then( form => {
      return form.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findForms', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Form.find(domainId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchForm', function(domainId, formId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Form, domainId, formId, 'patch', patch, options).then( form => {
      return form.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteForm', function(domainId, formId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Form, domainId, formId, 'delete', null, options).then( form => {
      return form.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createPage', function(domainId, pageId, pageData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(pageData, '_meta.metaId')[0] || '.meta-page';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Page.create(visitorId, domainId, pageId, pageData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getPage', function(domainId, pageId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Page, domainId, pageId, 'get', null, options).then( page => {
      return page.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.log({domainId: domainId, pageId:pageId});
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchPage', function(domainId, pageId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Page, domainId, pageId, 'patch', patch, options).then( page => {
      return page.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deletePage', function(domainId, pageId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Page, domainId, pageId, 'delete', null, options).then( page => {
      return page.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createAction', function(domainId, actionId, actionData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(actionData, '_meta.metaId')[0] || '.meta-action';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Action.create(visitorId, domainId, actionId, actionData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getAction', function(domainId, actionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Action, domainId, actionId, 'get', null, options).then( action => {
      return action.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.log({domainId: domainId, actionId:actionId});
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchAction', function(domainId, actionId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Action, domainId, actionId, 'patch', patch, options).then( action => {
      return action.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteAction', function(domainId, actionId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Action, domainId, actionId, 'delete', null, options).then( action => {
      return action.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findActions', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Action.find(domainId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createRole', function(domainId, roleId, roleData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(roleData, '_meta.metaId')[0] || '.meta-role';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Role.create(visitorId, domainId, roleId, roleData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getRole', function(domainId, roleId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Role, domainId, roleId, 'get', null, options).then( role => {
      return role.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findRoles', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Role.find(domainId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchRole', function(domainId, roleId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Role, domainId, roleId, 'patch', patch, options).then( role => {
      return role.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteRole', function(domainId, roleId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Role, domainId, roleId, 'delete', null, options).then( role => {
      return role.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createGroup', function(domainId, groupId, groupData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(groupData, '_meta.metaId')[0] || '.meta-group';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Group.create(visitorId, domainId, groupId, groupData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getGroup', function(domainId, groupId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Group, domainId, groupId, 'get', null, options).then( group => {
      return group.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchGroup', function(domainId, groupId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Group, domainId, groupId, 'patch', patch, options).then( group => {
      return group.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteGroup', function(domainId, groupId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Group, domainId, groupId, 'delete', null, options).then( group => {
      return group.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createProfile', function(domainId, profileId, profileData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(profileData, '_meta.metaId')[0] || '.meta-profile';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Profile.create(visitorId, domainId, profileId, profileData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getProfile', function(domainId, profileId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Profile, domainId, profileId, 'get', null, options).then( profile => {
      return profile.get(options);
     }).then(result => callback(null, result)).catch(err => {
      console.error({domainId: domainId, profileId: profileId});
      console.error(err);
      callback(err);
    });
 });

  socket.on('findProfiles', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Profile.find(domainId, query, options)
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchProfile', function(domainId, profileId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Profile, domainId, profileId, 'patch', patch, options).then( profile => {
      return profile.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteProfile', function(domainId, profileId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, Profile, domainId, profileId, 'delete', null, options).then( profile => {
      return profile.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createFile', function(domainId, fileId, fileData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(fileData, '_meta.metaId')[0] || '.meta-file';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return File.create(visitorId, domainId, fileId, fileData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getFile', function(domainId, fileId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, File, domainId, fileId, 'get', null, options).then( file => {
      return file.get(options);
     }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
 });

  socket.on('findFiles', function(domainId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return File.find(domainId, query, options)
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchFile', function(domainId, fileId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, File, domainId, fileId, 'patch', patch, options).then( file => {
      return file.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteFile', function(domainId, fileId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl2(visitorId, File, domainId, fileId, 'delete', null, options).then( file => {
      return file.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('createDocument', function(domainId, collectionId, documentId, docData, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    let metaId = _.at(docData, '_meta.metaId')[0] || '.meta';
    checkCreate(visitorId, domainId, metaId, options).then( result => {
      return Document.create(visitorId, domainId, collectionId, documentId, docData, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getDocument', function(domainId, collectionId, documentId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'get', null, options).then( document => {
      return document.get(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('findDocuments', function(domainId, collectionId, query, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    filterQuery(visitorId, domainId, query, options).then( query => {
      return Document.find(domainId, collectionId, query, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchDocument', function(domainId, collectionId, documentId, patch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'patch', patch, options).then( document => {
      return document.patch(visitorId, patch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('deleteDocument', function(domainId, collectionId, documentId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'delete', null, options).then( document => {
      return document.delete(visitorId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('scroll', function(options, callback){
    Document.scroll(options).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('clearScroll', function(options, callback){
    Document.clearScroll(options).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('getEvents', function(domainId, collectionId, documentId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'getEvents', null, options).then( document => {
      return document.getEvents(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err)
    });
  });

  socket.on('getDocumentMeta', function(domainId, collectionId, documentId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'getMeta', null, options).then( document => {
      return document.getMeta(options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('patchDocumentMeta', function(domainId, collectionId, documentId, aclPatch, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'patchMeta', null, options).then( document => {
      return document.patchMeta(visitorId, aclPatch, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('clearAclSubject', function(domainId, collectionId, documentId, method, rgu, subjectId, options, callback){
    let visitorId = socket.handshake.query.visitorId;
    checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'clearAclSubject', null, options).then( document => {
      return document.clearAclSubject(visitorId, method, rgu, subjectId, options);
    }).then(result => callback(null, result)).catch(err => {
      console.error(err);
      callback(err);
    });
  });


  socket.on('updateToken', function(callback){
    let visitorId = socket.handshake.query.visitorId;
    User.updateToken(visitorId).then(token => {
      _.merge(socket.handshake.query, {token: token});
      callback(null, token);
    }).catch(err => {
      console.error(err);
      callback(err);
    });
  });

  socket.on('disconnect', function(){
    let visitorId = socket.handshake.query.visitorId;
    console.log('%s disconnected.', visitorId);
  });

};

module.exports = {
  connect: function(io) {
    io.of('/domains').on('connection', function(socket){
      initSocket(socket);
    });
  }
};