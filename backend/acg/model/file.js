
const _ = require('lodash')
  , Path = require('path')
  , jsonPatch = require('fast-json-patch')
  , NodeCache = require("node-cache")
  , uuidv4 = require('uuid/v4')
  , Document = require('./document')
  , WebHDFS = require('webhdfs')
  , config = require('config')
  , hdfs = WebHDFS.createClient(JSON.parse(JSON.stringify(config.get('hdfs'))))
  , {uniqueId, inherits, createEntity, getEntity} = require('./utils');

const
  FILES = '.files';

var elasticsearch, cache;

function File(domainId, fileData) {
  Document.call(this, domainId, FILES, fileData);
}

_.assign(File, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = new NodeCache(config.ncConfig);
    return File;
  },

  create: function(authorId, domainId, fileId, fileData, options) {
    if(!_.at(fileData, '_meta.metaId')[0]) _.set(fileData, '_meta.metaId', '.meta-file');
    return createEntity(elasticsearch, authorId, domainId, FILES, fileId, fileData, options).then((data) => {
      var file = new File(domainId, data);
      cache.set(uniqueId(domainId, FILES, fileId), file);
      return file;
    });
  },

  get: function(domainId, fileId, options) {
    var uid = uniqueId(domainId, FILES, fileId), version = _.at(options, 'version')[0], file;
    uid = version ? uid + '~' + version : uid;
    file = cache.get(uid);
    if(file){
      return Promise.resolve(file);
    }else{
      return getEntity(elasticsearch, domainId, FILES, fileId, options).then( source => {
        file = new File(domainId, source);
        cache.set(uid, file);
        return file;
      });
    }
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
