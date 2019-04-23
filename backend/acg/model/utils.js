const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , createError = require('http-errors')
  , Meta = require('./meta');

function uniqueId(domainId, collectionId, documentId){
  return domainId+'~'+collectionId+'~'+documentId;
}

function documentHotAlias(domainId, collectionId){
  return domainId + '~' + collectionId + '~hot~snapshots';
}

function documentAllAlias(domainId, collectionId){
  return domainId + '~' + collectionId + '~all~snapshots';
}

function eventHotAlias(domainId, collectionId){
  return domainId + '~' + collectionId + '~hot~events';
}

function eventAllAlias(domainId, collectionId){
  return domainId + '~' + collectionId + '~all~events';
}

function inherits(Child, Parent, proto) {
  var F = function() {};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  Child.prototype.constructor = Child;
  Child.parent = Parent.prototype;
  _.assign(Child.prototype, proto);
  return Child;
}


function buildMeta(domainId, doc, authorId, metaId){
  return Meta.get(domainId, metaId).then( meta => {
    var defaultAcl = _.cloneDeep(meta.acl||{}), _meta = doc._meta || {}, timestamp = new Date().getTime();
    delete defaultAcl.create;
    _meta.acl = _.merge(defaultAcl, _.at(doc, '_meta.acl')[0]);
    _meta.iconClass = _meta.iconClass || meta._meta.iconClass;
    _meta = _.merge(_meta, {created:timestamp, updated:timestamp, version:1});
    _meta.author = authorId;
    doc._meta = _meta;
    return doc;
  });
}

function checkPermission(profile, permissions){
  if(!permissions) return Promise.resolve(true);
  if(_.intersection(profile.roles, permissions.roles).length > 0 
  || _.intersection(profile.groups, permissions.groups).length > 0 
  || (permissions.users && permissions.users.indexOf(profile.id) >= 0) ){
    return true;
  } else {
    return Promise.reject(createError(401, "Unauthorized access"));
  }
}

function createEntity(elasticsearch, authorId, domainId, collectionId, documentId, docData, options) {
  var metaId = _.at(docData, '_meta.metaId')[0] || '.meta', 
      index = documentHotAlias(domainId, collectionId);
  docData.id = documentId;
  return buildMeta(domainId, docData, authorId, metaId).then( docData => {
    return elasticsearch.create({ index: index, type: "snapshot", id: documentId, body: docData });
  }).then( (result) => {
    if(result._version > 1){
      _.set(docData, '_meta.version', result._version + 1);
      return elasticsearch.index({ index: index, type: "snapshot", id: documentId, body: docData }).then(()=>{
        return elasticsearch.get({ index: index, type: "snapshot", id: documentId});
      });
    }else {
      return elasticsearch.get({ index: index, type: "snapshot", id: documentId});      
    }    
  }).then( data => {
    var source = data._source;
    source.id = source.id || data._id;
    source._meta.index = data._index;
    source._meta.version = data._version;
    return source;
  });
}

function getEntity(elasticsearch, cache, domainId, collectionId, documentId, options){
  var uid = uniqueId(domainId, collectionId, documentId), version = options && options.version, doc = cache.get(uid);
  if (!doc) {
    return elasticsearch.get({index: documentAllAlias(domainId, collectionId), type: 'snapshot', id: documentId }).then( data => {
      var source = data._source;
      if(version && version < source._meta.version){
        return elasticsearch.search({index: eventAllAlias(domainId, collectionId), type: 'event', body: {
          query:{ term:{'id.keyword': documentId} },
          sort: [{
            '_meta.created': {order : "desc"}
          },{
            version: {order: "desc"}
          }]
        }}).then(result => {
          var patch = [], ver, updated;
          _.each(result.hits.hits, (v,k)=>{
            var evt = v._source;

            if(evt.version > version - 1) return;

            if(evt.version == version - 1){
              ver = evt.version + 1;
              updated = evt._meta.created;              
            }

            if(evt.patch[0].op=="add" && evt.patch[0].path==""){
              evt.patch = _.reduce(evt.patch, (r,v,k)=>{
                if(v.value) v.value = JSON.parse(v.value);
                r.push(v);
                return r;
              },[]);
              patch = evt.patch.concat(patch);
              return false;
            }else{
              evt.patch = _.reduce(evt.patch, (r,v,k)=>{
                if(v.value) v.value = JSON.parse(v.value);
                r.push(v);
                return r;
              },[]);
              patch = evt.patch.concat(patch);
              return true;
            }
          });

          if(!_.isEmpty(patch)){
            source = _.merge(jsonPatch.applyPatch({}, patch).newDocument,{_meta:{
              version: ver,
              updated: updated
            }});

            cache.set(uid, source);
            return source;
          } else {
            return Promise.reject("Version is not exists!");
          }
        });
      } else if((version && version > source._meta.version) || version == 0 ){
        return Promise.reject("Version is not exists!");
      }else if(!version || version == source._meta.version){
        source.id = source.id || data._id;
        source._meta.index = data._index;
        source._meta.version = data._version;
        cache.set(uid, source);
        return source;
      }
    }).catch(e => Promise.reject(e.toString()));
  } else {
    return Promise.resolve(doc);
  }
}

module.exports = {
  uniqueId : uniqueId,
  documentHotAlias : documentHotAlias,
  documentAllAlias: documentAllAlias,
  eventHotAlias : eventHotAlias,
  eventAllAlias: eventAllAlias,
  inherits : inherits,
  createEntity: createEntity,
  getEntity : getEntity,
  buildMeta : buildMeta,
  checkPermission: checkPermission
}