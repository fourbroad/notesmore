module.exports = Meta;

const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentHotAlias, inherits, createEntity, getEntity} = require('./utils');

const 
  METAS = '.metas',
  DEFAULT_ACTION = {
    label: "Edit(Json)",
    plugin: {
      name: "@notesabc/form",
      js: "@notesabc/form/form.bundle.js",
      css: "@notesabc/form/form.bundle.css"
    }
  },
  DEFAULT_ACL = {
    create: {
      roles: ["administrator"]
    },
    patch: {
      roles: ["administrator"]
    },
    delete: {
      roles: ["administrator"]
    },
    getMeta: {
      roles: ["administrator"]
    },
    patchMeta: {
      roles: ["administrator"]
    },
    clearAclSubject: {
      roles: ["administrator"]
    }
  };


var elasticsearch, cache;

function Meta(domainId, metaData) {
  Document.call(this, domainId, METAS, metaData);
}

_.assign(Meta, {

  METAS: METAS,

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = new NodeCache(config.ncConfig);
    return Meta;
  },

  create: function(authorId, domainId, metaId, metaData, options){
    return createEntity(elasticsearch, authorId, domainId, METAS, metaId, metaData, options).then((data) => {
      var meta = new Meta(domainId, data);
      cache.set(uniqueId(domainId, METAS, metaId), meta);
      return meta;
    });
  },

  get: function(domainId, metaId, options) {
    var uid = uniqueId(domainId, METAS, metaId), version = _.at(options, 'version')[0], meta;
    uid = version ? uid + '~' + version : uid;
    meta = cache.get(uid);
    if(meta){
      return Promise.resolve(meta);
    }else{
      return getEntity(elasticsearch, domainId, METAS, metaId, options).then( data => {
        meta = new Meta(domainId, data);
        cache.set(uid, meta);
        return meta;
      });
    }
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, METAS, query, options);
  }

});

inherits(Meta, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

// module.exports = Meta;
