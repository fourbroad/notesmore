module.exports = Meta;

const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
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

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Meta;
  },

  create: function(authorId, domainId, metaId, metaData, options){
    return createEntity(elasticsearch, authorId, domainId, METAS, metaId, metaData, options).then((data) => {
      return new Meta(domainId, data);
    });
  },

  get: function(domainId, metaId, options) {
    return getEntity(elasticsearch, cache, domainId, METAS, metaId, options).then( data => {
      return new Meta(domainId, data);
    });
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
