
const _ = require('lodash')
  , createError = require('http-errors')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentHotAlias, inherits, createEntity, getEntity, buildMeta} = require('./utils');

const
  COLLECTIONS = '.collections',
  SNAPSHOT_TEMPLATE = {
    "index_patterns": ["${domainId}~${collectionId}~snapshots~*-*"],
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
    "index_patterns": ["${domainId}~${collectionId}~events~*-*"],
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
  };

var elasticsearch, cache;

function Collection(domainId, colData) {
  Document.call(this, domainId, COLLECTIONS, colData);
}

_.assign(Collection, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = new NodeCache(config.ncConfig);
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
                     : _.template(JSON.stringify(SNAPSHOT_TEMPLATE))({domainId: domainId, collectionId: collectionId}),
      order: 1
    }, options));
  },

  putEventTemplate: function(domainId, collectionId, template, options){
    return elasticsearch.indices.putTemplate(_.merge({
      name: domainId + '~' + collectionId + '~events',
      body: template ? _.template(JSON.stringify(template))({domainId: domainId, collectionId: collectionId})
                     : _.template(JSON.stringify(EVENT_TEMPLATE))({domainId: domainId, collectionId: collectionId}), 
      order: 1
    }, options));
  },

  createIndices: function(domainId, collectionId){
    return Promise.all([
      Collection.createSnapshotsIndex(domainId, collectionId),
      Collection.createEventsIndex(domainId, collectionId)
    ]);
  },

  createSnapshotsIndex: function(domainId, collectionId, version, rolloverSn){
    return elasticsearch.indices.create({index:domainId+`~`+collectionId+'~snapshots~' + (version||1) + '-' + (rolloverSn||1)});
  },

  createEventsIndex: function(domainId, collectionId, version, rolloverSn){
    return elasticsearch.indices.create({index:domainId+`~`+collectionId+'~events~' + (version||1) + '-' + (rolloverSn||1)});
  },

  copySnapshotIndices: function(sourceDomainId, sourceCollectionId, targetDomainId, targetCollectionId, options){
    function doCopySnapshotIndices(indices, targetDomainId, targetCollectionId){
      if(_.isEmpty(indices)) return Promise.resolve(true);

      var index = _.head(indices), segments = index.split('~'), suffix = segments[3].split('-'), 
        version = Number(suffix[0]), rolloverSn = suffix[1];
      return Collection.createSnapshotsIndex(targetDomainId, targetCollectionId, version, rolloverSn).then(() => {
        return elasticsearch.reindex({
          body:{
            source: {
              index: index
            },
            dest: {
              index: targetDomainId + '~' + targetCollectionId + '~snapshots~' + version + '-' + rolloverSn
            }
          }
        });
      }).then(() => {
        return doCopySnapshotIndices(_.drop(indices));
      });
    }

    return elasticsearch.indices.get({index: sourceDomainId + '~' + sourceCollectionId + '~all~snapshots'}).then(indices => {
      return doCopySnapshotIndices(_.keys(indices));
    });
  },

  copyEventIndices: function(sourceDomainId, sourceCollectionId, targetDomainId, targetCollectionId, options){
    function doCopyEventIndices(indices, targetDomainId, targetCollectionId){
      if(_.isEmpty(indices)) return Promise.resolve(true);

      var index = _.head(indices), segments = index.split('~'), suffix = segments[3].split('-'), 
        version = Number(suffix[0]), rolloverSn = suffix[1];
      return Collection.createSnapshotsIndex(targetDomainId, targetCollectionId, version, rolloverSn).then(() => {
        return elasticsearch.reindex({
          body:{
            source: {
              index: index
            },
            dest: {
              index: targetDomainId + '~' + targetCollectionId + '~events~' + version + '-' + rolloverSn
            }
          }
        });
      }).then(() => {
        return doCopyEventIndices(_.drop(indices));
      });
    }

    return elasticsearch.indices.get({index: sourceDomainId + '~' + sourceCollectionId + '~all~events'}).then(indices => {
      return doCopyEventIndices(_.keys(indices));
    });
  },

  create: function(authorId, domainId, collectionId, collectionData, options){
    var self = this;

    if(!_.at(collectionData, '_meta.metaId')[0]) _.set(collectionData, '_meta.metaId', '.meta-collection');

    return this.putTemplates(domainId, collectionId).then(() => {
      self.createIndices(domainId, collectionId);
    }).then(() =>{
      return createEntity(elasticsearch, authorId, domainId, COLLECTIONS, collectionId, collectionData, options);
    }).then((data) => {
      var collection = new Collection(domainId, data);
      cache.set(uniqueId(domainId, COLLECTIONS, collectionId), collection);
      return collection;
    });
  },

  get: function(domainId, collectionId, options) {
    var uid = uniqueId(domainId, COLLECTIONS, collectionId), version = _.at(options, 'version')[0], collection;
    uid = version ? uid + '~' + version : uid;
    collection = cache.get(uid);
    if(collection){
      return Promise.resolve(collection);
    }else{
      return getEntity(elasticsearch, domainId, COLLECTIONS, collectionId, options).then(data => {
        collection = new Collection(domainId, data);
        cache.set(uid, collection);
        return collection;
      });
    }
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
        return [{index:{_index: domainId + '~' + self.id + '~hot~snapshots', _type: Document.TYPE, _id: doc.id || uuidv4()}}, doc];
      });
    })).then(function(values) {
      return es.bulk({body: _.flatMap(values)});
    });
  },

  putSnapshotTemplate: function(template, options){
    return this._getElasticSearch().indices.putTemplate(_.merge({
      name: this.domainId + '~' + this.id + '~snapshots',
      body: template
    }, options));
  },

  getSnapshotTemplate: function(options){
    return this._getElasticSearch().indices.getTemplate(_.merge({
      name: this.domainId + '~' + this.id + '~snapshots'
    }, options)).then(data => {
      return data[this.domainId + '~' + this.id + '~snapshots'];
    });
  },

  putEventTemplate: function(template, options){
    return this._getElasticSearch().indices.putTemplate(_.merge({
      name: this.domainId + '~' + this.id + '~events',
      body: template
    }, options));
  },

  getEventTemplate: function(options){
    return this._getElasticSearch().indices.getTemplate(_.merge({
      name: this.domainId + '~' + this.id + '~events'
    }, options)).then(data => {
      return data[this.domainId + '~' + this.id + '~events'];
    });
  },

  rollover: function(options){
    return this._getElasticSearch().indices.rollover(_.merge({
      alias: this.domainId + '~' + this.id
    }, this.rollover, options));
  },

  reindexSnapshots: function(options){
    var esc = this._getElasticSearch(), domainId = this.domainId, collectionId = this.id;

    function doReindexSnapshots(indices){
      if(_.isEmpty(indices)) return Promise.resolve(true);

      var index = _.head(indices), segments = index.split('~'), domainId = segments[0], collectionId = segments[1], 
        suffix = segments[3].split('-'), version = Number(suffix[0]), rolloverSn = suffix[1];
      return Collection.createSnapshotsIndex(domainId, collectionId, version + 1).then(() => {
        return esc.reindex({
          body:{
            source: {
              index: index
            },
            dest: {
              index: domainId + '~' + collectionId + '~snapshots~' + (version + 1) + '-' + rolloverSn
            }
          }
        });
      }).then(() => {
        return esc.indices.delete({index:index});
      }).then(() => {
        return doReindexSnapshots(_.drop(indices));
      });
    }

    return esc.indices.get({index: domainId + '~' + collectionId + '~all~snapshots'}).then(indices => {
      return doReindexSnapshots(_.keys(indices));
    });
  },

  reindexEvents: function(options){
    var esc = this._getElasticSearch(), domainId = this.domainId, collectionId = this.id;

    function doReindexEvents(indices){
      if(_.isEmpty(indices)) return Promise.resolve(true);

      var index = _.head(indices), segments = index.split('~'), domainId = segments[0], collectionId = segments[1], 
        suffix = segments[3].split('-'), version = Number(suffix[0]), rolloverSn = suffix[1];
      return Collection.createEventsIndex(domainId, collectionId, version + 1).then(() => {
        return esc.reindex({
          body:{
            source: {
              index: index
            },
            dest: {
              index: domainId + '~' + collectionId + '~events~' + (version + 1) + '-' + rolloverSn
            }
          }
        });
      }).then(() => {
        return esc.indices.delete({index:index});
      }).then(() => {
        return doReindexEvents(_.drop(indices));
      });
    }
        
    return esc.indices.get({index: domainId + '~' + collectionId + '~all~events'}).then(indices => {
      return doReindexEvents(_.keys(indices));
    });
  },

  distinctQuery: function(field, options) {
    const query = {
      aggs: {
        values: {
          terms: {
            field: field + ".keyword",
            include: ".*",
//             order: {
//               _key: "desc"
//             },
            size: 100
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
