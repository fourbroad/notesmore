
const _ = require('lodash')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

const
  FORMS = '.forms';

var elasticsearch, cache;

function Form(domainId, formData) {
  Document.call(this, domainId, FORMS, formData);
}

_.assign(Form, {

  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = new NodeCache(config.ncConfig);
    return Form;
  },

  create: function(authorId, domainId, formId, formData, options){
    if(!_.at(formData, '_meta.metaId')[0]) _.set(formData, '_meta.metaId', '.meta-form');
    return createEntity(elasticsearch, authorId, domainId, FORMS, formId, formData, options).then((data) => {
      var form = new Form(domainId, data);
      cache.set(uniqueId(domainId, FORMS, formId),form);
      return form;
    });
  },

  get: function(domainId, formId, options) {
    var uid = uniqueId(domainId, FORMS, formId), version = _.at(options, 'version')[0], form;
    uid = version ? uid + '~' + version : uid;
    form = cache.get(uid);
    if(form){
      return Promise.resolve(form);
    }else{
      return getEntity(elasticsearch, domainId, FORMS, formId, options).then( source => {
        form = new Form(domainId, source);
        cache.set(uid, form);
        return form;
      });
    }
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, FORMS, query, options);
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
