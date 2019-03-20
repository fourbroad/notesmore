module.exports = Meta;

const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentHotAlias, inherits, getEntity} = require('./utils');

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
    getAcl: {
      roles: ["administrator"]
    },
    patchAcl: {
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

  create: function(authorId, domainId, metaId, metaData){
    return Document.create.call(this, authorId, domainId, METAS, metaId, metaData).then( document =>{
      return Meta.get(domainId, metaId);
    });      
  },

  get: function(domainId, metaId) {
    return getEntity(elasticsearch, cache, domainId, METAS, metaId).then( source => {
      return new Meta(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, METAS, query);
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
