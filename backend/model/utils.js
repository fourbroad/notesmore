const _ = require('lodash')
  , createError = require('http-errors')
  , Meta = require('./meta')
  , Document = require('./document');

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

function getEntity(elasticsearch, cache, domainId, collectionId, documentId){
  var uid = uniqueId(domainId, collectionId, documentId), doc = cache.get(uid);
  if (!doc) {
    return elasticsearch.get({index: documentAllAlias(domainId, collectionId), type: Document.TYPE, id: documentId}).then( data => {
      data._source._meta.index = data._index;
      data._source._meta.version = data._version;
      cache.set(uid, data._source);
      return data._source;
    });
  } else {
    return Promise.resolve(doc);
  }
}

function buildMeta(domainId, doc, authorId, metaId){
  return Meta.get(domainId, metaId).then( meta => {
    var defaultAcl = _.cloneDeep(meta.acl), _meta = doc._meta || {}, timestamp = new Date().getTime();
    delete defaultAcl.create;
    _meta.acl = _.merge(defaultAcl, _.at(doc, '_meta.acl')[0]);
    _meta = _.merge(_meta, {created:timestamp, updated:timestamp, version:1});
    _meta.author = authorId;
    doc._meta = _meta;
    return doc;
  });
}

module.exports = {
  uniqueId : uniqueId,
  documentHotAlias : documentHotAlias,
  documentAllAlias: documentAllAlias,
  eventHotAlias : eventHotAlias,
  eventAllAlias: eventAllAlias,
  inherits : inherits,
  getEntity : getEntity,
  buildMeta : buildMeta
}