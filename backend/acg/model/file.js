
const _ = require('lodash')
  , Path = require('path')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , WebHDFS = require('webhdfs')
  , hdfs = WebHDFS.createClient({
      user: 'fourbroad',
      host: 'localhost',
      port: 9870
    })  
  , {uniqueId, inherits, getEntity} = require('./utils');

const
  FILES = '.files';

var elasticsearch, cache;

function File(domainId, fileData) {
  Document.call(this, domainId, FILES, fileData);
}

_.assign(File, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    return File;
  },

  create: function(authorId, domainId, fileId, fileData, options) {
    if(!_.at(fileData, '_meta.metaId')[0]) _.set(fileData, '_meta.metaId', '.meta-file');
    return Document.create.call(this, authorId, domainId, FILES, fileId, fileData, options).then( document => {
      return File.get(domainId, fileId, options);
    });
  },

  get: function(domainId, fileId, options) {
    return getEntity(elasticsearch, cache, domainId, FILES, fileId, options).then( source => {
      return new File(domainId, source);
    });
  },

  find: function(domainId, query, options){
    return Document.find.call(this, domainId, FILES, query, options);
  }

});

inherits(File, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  delete: function(authorId, options){
    var path = '/'+this.domainId+'/'+this.id + Path.extname(this.name||'');
    return File.parent.delete.call(this, authorId, options).then(result => {
      hdfs.unlink(path, function(err, result){if(err) console.error(err)});
      return true;
    }).then(result => {
      return true;
    });
  }  

});

module.exports = File;
