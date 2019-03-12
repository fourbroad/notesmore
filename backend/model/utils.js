const _ = require('lodash')
  , createError = require('http-errors')
  , Meta = require('./meta')
  , Document = require('./document');

function uniqueId(domainId, collectionId, documentId){
  return domainId+'~'+collectionId+'~'+documentId;
}

function documentIndex(domainId, collectionId){
  return domainId + '~' + collectionId + '~snapshots-1';
}

function eventIndex(domainId, collectionId){
  return domainId + '~' + collectionId + '~events-1';
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

function getEntity(elasticsearch, cache, domainId, collectionId, documentId, callback){
  var uid = uniqueId(domainId, collectionId, documentId), doc = cache.get(uid);
  if (!doc) {
    elasticsearch.get({index: documentIndex(domainId, collectionId), type: Document.TYPE, id: documentId}, function(err, data){
      if (err) return callback && callback(createError(400,err.toString()));

      data._source._meta.version = data._version;
      cache.set(uid, data._source);
      callback && callback(null, data._source);
    });
  } else {
    callback && callback(null, doc);
  }
}

function buildMeta(domainId, doc, authorId, metaId, callback){
  Meta.get(domainId, metaId, function(err, meta){
    if(err) return callback && callback(err);

    var defaultAcl = _.cloneDeep(meta.acl), _meta = doc._meta || {}, timestamp = new Date().getTime();
    delete defaultAcl.create;
    _meta.acl = _.merge(defaultAcl, _.at(doc, '_meta.acl')[0]);
    _meta = _.merge(_meta, {created:timestamp, updated:timestamp, version:1});
    _meta.author = authorId;
    doc._meta = _meta;

    callback && callback(null, doc);
  });
}

function recoverEntity(elasticsearch, cache, authorId, document, callback){
  var batch = [], uid = uniqueId(document.domainId, document.collectionId, document.id);

  batch.push({index:{_index: document.getEventIndex(), _type: Document.EVENT_TYPE}});
  batch.push({
    id: document.id, 
    patch: [{ op: 'replace', path: '', value: JSON.stringify(_.cloneDeep(document)) }],
    version: document._meta.version,
    _meta: { author:authorId, created:new Date().getTime()}
  });

  batch.push({index:{ _index: document.getIndex(), _type: Document.TYPE, _id: document.id, _version: document._meta.version }});
  _.merge(document, {_meta:{updated: new Date().getTime(), version: document._meta.version + 1}});
  batch.push(document);

  elasticsearch.bulk({body:batch}, function(err, result){
    if(err) return callback && callback(createError(400,err));
    cache.set(uid, document);
    callback && callback(null, document)              
  });
}

module.exports = {
  uniqueId : uniqueId,
  documentIndex : documentIndex,
  eventIndex : eventIndex,
  inherits : inherits,
  getEntity : getEntity,
  buildMeta : buildMeta,
  recoverEntity : recoverEntity
}