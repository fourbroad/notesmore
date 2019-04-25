const _ = require('lodash')
, model = require('./model');

const
  { Collection, Document, Domain, Form, Group, Meta, Page, Action, Role, Profile, File, User, View, Utils} = model;

function getClass(collectionId){
  switch(collectionId){
    case '.collections':
      return Collection;
    case '.domains':
      return Domain;
    case '.forms':
      return Form;
    case '.groups':
      return Group;
    case '.metas':
      return Meta;
    case '.pages':
      return Page;
    case '.actions':
      return Action;
    case '.roles':
      return Role;
    case '.profiles':
      return Profile;
    case '.files':
      return File;
    case '.users':
      return User;
    case '.views':
      return View;
    default:
      return Document;
  }
}

function filterQuery(visitorId, domainId, query, options){
  query = query || {body:{query:{}}};
  query.body = query.body || {};
  return Profile.get(domainId, visitorId, options).then( profile => {
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

function checkPermission(visitorId, domainId, obj, method, data, options){
  var permissions;

  if(method == 'create'){
    permissions = _.at(obj,'acl.create')[0];
  } else {
    permissions = _.at(obj,'_meta.acl.'+method)[0];
  }

  function doCheckPermission(visitorId, domainId, permissions, options){
    if(!permissions) return Promise.resolve(true);
    if(!visitorId) return Promise.reject(createError(401, 'Have no permission to access '+ method +'!'));
    return Profile.get(domainId, visitorId, options).then( profile => {
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

  if(method == 'patch' && data.patch.length > 0){
    var metas = _.filter(data.patch, function(p) { return p.path=="/_meta" || p.path.startsWith("/_meta/"); });
    if(metas.length == 0){
      return doCheckPermission(visitorId, domainId, permissions, options);
    } else {
      var metaPermissions = _.at(obj,'_meta.acl.patchMeta')[0];
      if(metas.length == data.patch.length){
        return doCheckPermission(visitorId, domainId, metaPermissions, options);
      } else {
        return Promise.all([doCheckPermission(visitorId, domainId, metaPermissions), doCheckPermission(visitorId, domainId, permissions)]);
      }
    }
  } else {
    return doCheckPermission(visitorId, domainId, permissions, options);
  }
}

function checkCreate(visitorId, domainId, metaId, options){
  metaId = metaId || '.meta';
  return Meta.get(domainId, metaId, options).then( meta => {
    return checkPermission(visitorId, domainId, meta, 'create', null, options);
  });
}

function checkAcl1(visitorId, clsObj, objId, method, data, options){
  return clsObj.get(objId, options).then( obj => {
    return checkPermission(visitorId, Domain.ROOT, obj, method, data, options).then( result => {
      return obj;
    });
  });
}

function checkAcl2(visitorId, clsObj, domainId, objId, method, data, options){
  return clsObj.get(domainId, objId, options).then( obj => {
    return checkPermission(visitorId, domainId, obj, method, data, options).then( result => {
      return obj;
    });
  });
}

function checkAcl3(visitorId, clsObj, domainId, collectionId, objId, method, data, options){
  switch(collectionId){
    case '.collections':
    case '.forms':
    case '.groups':
    case '.metas':
    case '.pages':
    case '.actions':
    case '.roles':
    case '.profiles':
    case '.files':
    case '.views':
      return checkAcl2(visitorId, clsObj, domainId, objId, method, data, options);    
    case '.domains':
    case '.users':
      return checkAcl1(visitorId, clsObj, objId, method, data, options);
    default:
      return clsObj.get(domainId, collectionId, objId, options).then( obj => {
        return checkPermission(visitorId, domainId, obj, method, data, options).then( result => {
          return obj;
        });
      });
  }
}

module.exports = {
  getClass: getClass,
  filterQuery: filterQuery,
  checkPermission: checkPermission,
  checkCreate: checkCreate,
  checkAcl1: checkAcl1,
  checkAcl2: checkAcl2,
  checkAcl3: checkAcl3
}