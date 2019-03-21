
const _ = require('lodash')
  , createError = require('http-errors')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentHotAlias, inherits, getEntity, buildMeta} = require('./utils');

const
  COLLECTIONS = '.collections',
  SNAPSHOT_TEMPLATE = {
    "index_patterns": ["${domainId}~${collectionId}~snapshots-*"],
    "aliases" : {
      "${domainId}~${collectionId}~hot~snapshots" : {},
      "${domainId}~${collectionId}~all~snapshots" : {}
    },
    "settings": {
      "number_of_shards": 5,
      "number_of_replicas": 1
    },
    "mappings": {
      "snapshot": {
        "properties": {
          "_metadata":{
            "properties":{
              "created": {
                "type": "date"
              },
              "updated": {
                "type": "date"
              }
            }
          }
        }
      }
    }
  },
  EVENT_TEMPLATE = {
    "index_patterns": ["${domainId}~${collectionId}~events-*"],
    "aliases" : {
      "${domainId}~${collectionId}~hot~events" : {},
      "${domainId}~${collectionId}~all~events" : {}
    },      
    "settings": {
      "number_of_shards": 5,
      "number_of_replicas": 1
    },
    "mappings": {
      "event": {
        "properties": {
          "_metadata":{
            "properties":{
              "created": {
                "type": "date"
              }
            }
          }
        }
      }
    }
  },
  snapshotsTemplate = _.template(JSON.stringify(SNAPSHOT_TEMPLATE)),
  eventsTemplate = _.template(JSON.stringify(EVENT_TEMPLATE));

var elasticsearch, cache;

function Collection(domainId, colData) {
  Document.call(this, domainId, COLLECTIONS, colData);
}

_.assign(Collection, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Collection;
  },

  putTemplate: function(domainId, collectionId){
    return Promise.all([
      elasticsearch.indices.putTemplate({
        name: domainId + '~' + collectionId + '~snapshots', 
        body: snapshotsTemplate({domainId: domainId, collectionId: collectionId}),
        order: 1
      }),
      elasticsearch.indices.putTemplate({
        name: domainId + '~' + collectionId + '~events',
        body:eventsTemplate({domainId: domainId, collectionId: collectionId}), 
        order: 1
      })
    ]);
  },

  createIndex: function(domainId, collectionId){
    return Promise.all([
      elasticsearch.indices.create({index:domainId+`~`+collectionId+'~snapshots-1'}),
      elasticsearch.indices.create({index:domainId+`~`+collectionId+'~events-1'})
    ]);
  },

  create: function(authorId, domainId, collectionId, collectionData){
    var self = this;

    if(!_.at(collectionData, '_meta.metaId')[0]) _.set(collectionData, '_meta.metaId', '.meta-collection');

    return this.putTemplate(domainId, collectionId).then( result => {
      self.createIndex(domainId, collectionId);
    }).then(result =>{
      return Document.create.call(self, authorId, domainId, COLLECTIONS, collectionId, collectionData);
    }).then(result => {
      return Collection.get(domainId, collectionId);
    });

  },

  get: function(domainId, collectionId) {
    return getEntity(elasticsearch, cache, domainId, COLLECTIONS, collectionId).then(source => {
      return new Collection(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, COLLECTIONS, query);
  }
});

inherits(Collection, Document,{

  _getElasticSearch: function(){
    return elasticsearch;
  },

  _getCache: function(){
    return cache;
  },

  delete: function(authorId){
    var es = this._getElasticSearch(), self = this;
    return Collection.parent.delete.call(this, authorId).then(result => {
      return Promise.all([
        es.indices.delete({ index: self.domainId + '~' + self.id + '~*' }),
        es.indices.deleteTemplate({name:self.domainId + '~' + self.id +'~snapshots'}),
        es.indices.deleteTemplate({name:self.domainId + '~' + self.id +'~events'})
      ]);
    }).then(result => {
      return true;
    });
  },

  bulk: function(authorId, docs){
    var self = this, es = this._getElasticSearch(), batch = [], domainId = this.domainId, promises;

    if(docs.length > 1000){
      return callback && callback(createError(403, 'The number of documents submitted in batches must be less than or equal to 1000.'));
    }

    return Promise.all(_.map(docs, function(doc, index){
      var metaId = _.at(doc, '_meta.metaId')[0] || '.meta';
      return buildMeta(domainId, doc, authorId, metaId).then( doc => {
        return [{index:{_index: domainId + '~' + self.id + '~snapshots-1', _type: Document.TYPE, _id: doc.id || uuidv4()}}, doc];
      });
    })).then(function(values) {
      return es.bulk({body: _.flatMap(values)});
    });
  },

  putTemplate: function(params){
    params.name = this.domainId + '~' + this.id;
    return this._getElasticSearch().indices.putTemplate(params);
  },

  rollover: function(params){
    params.alias = this.domainId + '~' + this.id;
    return this._getElasticSearch().indices.rollover(params);
  },

  refresh: function(){
    return this._getElasticSearch().indices.refresh({ index: this.domainId + '~' + this.id + '~*' });
  }

});

module.exports = Collection;
