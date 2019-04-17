
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
          "_meta":{
            "properties":{
              "version":{
                "type": "integer"
              },
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
          "_meta":{
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

  putTemplates: function(domainId, collectionId){
    return Promise.all([
      Collection.putSnapshotTemplate(domainId, collectionId),
      Collection.putEventTemplate(domainId, collectionId)
    ]);
  },

  putSnapshotTemplate: function(domainId, collectionId, template, options){
    return elasticsearch.indices.putTemplate(_.merge({
      name: domainId + '~' + collectionId + '~snapshots',
      body: template ? _.template(JSON.stringify(template))({domainId: domainId, collectionId: collectionId}) 
                     : snapshotsTemplate({domainId: domainId, collectionId: collectionId}),
      order: 1
    }, options));
  },

  putEventTemplate: function(domainId, collectionId, template, options){
    return elasticsearch.indices.putTemplate(_.merge({
      name: domainId + '~' + collectionId + '~events',
      body: template ? _.template(JSON.stringify(template))({domainId: domainId, collectionId: collectionId})
                     : eventsTemplate({domainId: domainId, collectionId: collectionId}), 
      order: 1
    }, options));
  },

  createIndices: function(domainId, collectionId){
    return Promise.all([
      Collection.createSnapshotsIndex(domainId, collectionId),
      Collection.createEventsIndex(domainId, collectionId)
    ]);
  },

  createSnapshotsIndex: function(domainId, collectionId){
    return elasticsearch.indices.create({index:domainId+`~`+collectionId+'~snapshots-1'});
  },

  createEventsIndex: function(domainId, collectionId){
    return elasticsearch.indices.create({index:domainId+`~`+collectionId+'~events-1'});
  },

  reindex: function(sourceDomainId, sourceCollectionId, targetDomainId, targetCollectionId, options){
    return elasticsearch.reindex(_.merge({
      body:{
        source: {
          index: sourceDomainId + '~' + sourceCollectionId + '~all~snapshots'
        },
        dest: {
          index: targetDomainId + '~' + targetCollectionId + '~hot~snapshots'
        }
      }
    }, options));
  },

  create: function(authorId, domainId, collectionId, collectionData, options){
    var self = this;

    if(!_.at(collectionData, '_meta.metaId')[0]) _.set(collectionData, '_meta.metaId', '.meta-collection');

    return this.putTemplates(domainId, collectionId).then( result => {
      self.createIndices(domainId, collectionId);
    }).then(result =>{
      return Document.create.call(self, authorId, domainId, COLLECTIONS, collectionId, collectionData, options);
    }).then(result => {
      return Collection.get(domainId, collectionId, options);
    });
  },

  get: function(domainId, collectionId, options) {
    return getEntity(elasticsearch, cache, domainId, COLLECTIONS, collectionId, options).then(source => {
      return new Collection(domainId, source);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(Document, domainId, COLLECTIONS, query, options).then(data => {
      data.documents = _.reduce(data.documents, (r,v,k) => {
        r.push(new Collection(domainId, v));
        return r;
      },[]);
      return data;
    });
  }
});

inherits(Collection, Document,{

  _getElasticSearch: function(){
    return elasticsearch;
  },

  _getCache: function(){
    return cache;
  },

  delete: function(authorId, options){
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

  bulk: function(authorId, docs, options){
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

  putSnapshotTemplate: function(params){
    params = params || {body: SNAPSHOT_TEMPLATE};
    params.name = this.domainId + '~' + this.id + '~snapshots';
    return this._getElasticSearch().indices.putTemplate(params);
  },

  getSnapshotTemplate: function(params){
    params = params || {};
    params.name = this.domainId + '~' + this.id + '~snapshots';
    return this._getElasticSearch().indices.getTemplate(params);
  },

  putEventTemplate: function(params){
    params = params || {body: EVENT_TEMPLATE};
    params.name = this.domainId + '~' + this.id + '~events';
    return this._getElasticSearch().indices.putTemplate(params);
  },

  getEventTemplate: function(params){
    params = params || {};
    params.name = this.domainId + '~' + this.id + '~events';
    return this._getElasticSearch().indices.getTemplate(params);
  },

  rollover: function(params){
    params.alias = this.domainId + '~' + this.id;
    return this._getElasticSearch().indices.rollover(params);
  },

  distinctQuery: function(field, options) {
    const query = {
      aggs: {
        values: {
          terms: {
            field: field + ".keyword",
            include: ".*.*",
            order: {
              _key: "asc"
            },
            size: 10000
          }
        }
      }
    };

    _.merge(query.aggs.values.terms, options);

    return this._getElasticSearch().search({
      index: this.domainId + '~' + this.id + '~all~snapshots',
      type: Document.TYPE,
      body: query, 
      size:0
    }).then(function(data){
      return {values:_.reduce(data.aggregations.values.buckets, function(r,v,k){
        r.push(v['key']);
        return r;
      },[])};
    });
  },

  refresh: function(options){
    return this._getElasticSearch().indices.refresh({ index: this.domainId + '~' + this.id + '~*' });
  }

});

module.exports = Collection;
