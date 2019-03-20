
const _ = require('lodash')
  , Meta = require('./meta')
  , Domain = require('./domain')
  , Collection = require('./collection')
  , View = require('./view')
  , Page = require('./page')
  , Form = require('./form')
  , Role = require('./role')
  , Group = require('./group')
  , User = require('./user')
  , Profile = require('./profile')
  , Document = require('./document')
  , Utils = require('./utils')
  , NodeCache = require("node-cache")
  , elasticSearch = require('elasticsearch');

const
  secret = '!QAZ)OKM';

module.exports = function (options) {
    var module = {}, o = options, 
        nc = _.merge({}, {
          User:       {stdTTL: 100, checkperiod: 120}, 
          Meta:       {stdTTL: 100, checkperiod: 120}, 
          Form:       {stdTTL: 100, checkperiod: 120}, 
          Page:       {stdTTL: 100, checkperiod: 120}, 
          Role:       {stdTTL: 100, checkperiod: 120}, 
          View:       {stdTTL: 100, checkperiod: 120},
          Group:      {stdTTL: 100, checkperiod: 120}, 
          Domain:     {stdTTL: 100, checkperiod: 120}, 
          Profile:    {stdTTL: 100, checkperiod: 120}, 
          Document:   {stdTTL: 100, checkperiod: 120}, 
          Collection: {stdTTL: 100, checkperiod: 120}, 
        },o.nodeCache),
        esClient = new elasticSearch.Client(o.elasticSearch),
        nodeCache = new NodeCache({stdTTL: 100, checkperiod: 120});
        nodeCache = {
          get:function(){return null},
          set:function(){},
          del:function(){}
        }

    module.Utils = Utils;
    module.User = User.init({elasticSearch: esClient, nodeCache: nodeCache, md5:{secret: secret}});
    module.Meta = Meta.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Form = Form.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Page = Page.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Role = Role.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.View = View.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Group = Group.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Domain = Domain.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Profile = Profile.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Document = Document.init({elasticSearch: esClient, nodeCache: nodeCache});
    module.Collection = Collection.init({elasticSearch: esClient, nodeCache: nodeCache});

    Domain.get(Domain.ROOT).catch((e)=>{
      console.log("Root domain is initializing......!");
      Domain.create('administrator', Domain.ROOT, {title: 'Root'}).then(result => console.log("Root domain is initialized!")).catch(err => console.log(err));
    });

    return module;
};
