
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, documentIndex, eventIndex, inherits, getEntity} = require('./utils');

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

  create: function(authorId, domainId, formId, formData, callback){
    if(!_.at(formData, '_meta.metaId')[0]) _.set(formData, '_meta.metaId', '.meta-form');
    Document.create.call(this, authorId, domainId, FORMS, formId, formData, function(err, document){
      if(err) return callback && callback(err);
      Form.get(domainId, formId, callback);
    });
  },

  get: function(domainId, formId, callback) {
    getEntity(elasticsearch, cache, domainId, FORMS, formId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new Form(domainId, source));      
    });
  },

  find: function(domainId, query, callback){
    Document.find.call(this, domainId, FORMS, query, callback);
  }

});

inherits(Form, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return this.domainId + '~.forms~snapshots-1';
  },

  getEventIndex: function() {
    return this.domainId + '~.forms~events-1';
  }

});

module.exports = Form;
