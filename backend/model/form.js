
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, getEntity} = require('./utils');

const
  FORMS = '.forms';

var elasticsearch, cache;

function Form(domainId, formData) {
  Document.call(this, domainId, FORMS, formData);
}

_.assign(Form, {

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return Form;
  },

  create: function(authorId, domainId, formId, formData){
    if(!_.at(formData, '_meta.metaId')[0]) _.set(formData, '_meta.metaId', '.meta-form');
    return Document.create.call(this, authorId, domainId, FORMS, formId, formData).then(document => {
      return Form.get(domainId, formId);
    });
  },

  get: function(domainId, formId) {
    return getEntity(elasticsearch, cache, domainId, FORMS, formId).then( source => {
      return new Form(domainId, source);
    });
  },

  find: function(domainId, query){
    return Document.find.call(this, domainId, FORMS, query);
  }

});

inherits(Form, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  }

});

module.exports = Form;
