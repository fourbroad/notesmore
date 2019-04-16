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

function getEntity(elasticsearch, cache, domainId, collectionId, documentId, options){
  var uid = uniqueId(domainId, collectionId, documentId), version = options && options.version, doc = cache.get(uid);
  if (!doc) {
    return elasticsearch.get({index: documentAllAlias(domainId, collectionId), type: 'snapshot', id: documentId}).then( data => {
      if(version && version < data._meta.version){
        elasticsearch.search({index: eventAllAlias(domainId, collectionId), type: 'event', body: {
          query:{ term:{'id.keyword': documentId} },
          sort: [{
            '_meta.created': {order : "desc"}
          },{
            version: {order: "desc"}
          }]
        }}).then(result => {
          var patch = [], version, created, updated, author;
          _.each(result.hits.hits, (v,k)=>{
            var evt = v._source;
            if(k == 0){
              version = evt.version + 1;
              updated = evt._meta.created;              
            }
            if(evt.patch[0].op=="add" && evt.patch[0].path==""){
              evt.patch = _.reduce(evt.patch, (r,v,k)=>{
                if(v.value) v.value = JSON.parse(v.value);
                r.push(v);
              },[]);
              patch = patch.concat(evt.patch);
              author = evt._meta.author;
              created = evt._meta.created;
              return false;
            }else{
              patch = patch.concat(v._source);
              return true;
            }
          });

          return _.merge(jsonPatch.applyPatch({}, patch).newDocument,{_meta:{
            author: author,
            version: version,
            created: created,
            updated: updated
          }});
        });
      }else{

      }

      data._source.id = data._source.id || data._id;
      data._source._meta.index = data._index;
      data._source._meta.version = data._version;
      cache.set(uid, data._source);
      return data._source;
    }).catch(e => Promise.reject(e.toString()));
  } else {
    return Promise.resolve(doc);
  }
}

function buildMeta(domainId, doc, authorId, metaId){
  return Meta.get(domainId, metaId).then( meta => {
    var defaultAcl = _.cloneDeep(meta.acl||{}), _meta = doc._meta || {}, timestamp = new Date().getTime();
    delete defaultAcl.create;
    _meta.acl = _.merge(defaultAcl, _.at(doc, '_meta.acl')[0]);
    _meta = _.merge(_meta, {iconClass: meta._meta.iconClass, created:timestamp, updated:timestamp, version:1});
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
    return Promise.reject(createError(401, "Unauthorized access", {code:401}));
  }
}

module.exports = {
  uniqueId : uniqueId,
  documentHotAlias : documentHotAlias,
  documentAllAlias: documentAllAlias,
  eventHotAlias : eventHotAlias,
  eventAllAlias: eventAllAlias,
  inherits : inherits,
  getEntity : getEntity,
  buildMeta : buildMeta,
  checkPermission: checkPermission
}