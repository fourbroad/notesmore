
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
  , Action = require('./action')
  , Profile = require('./profile')
  , File = require('./file')
  , Document = require('./document')
  , Utils = require('./utils')
  , config = require('config')
  , elasticSearch = require('elasticsearch');

const
  secret = '!QAZ)OKM';

let esClient = new elasticSearch.Client(JSON.parse(JSON.stringify(config.get('elasticSearch'))));
let nc = _.merge({
  user:       {stdTTL: 100, checkperiod: 120, useClones:false},
  meta:       {stdTTL: 100, checkperiod: 120, useClones:false},
  form:       {stdTTL: 100, checkperiod: 120, useClones:false},
  page:       {stdTTL: 100, checkperiod: 120, useClones:false},
  role:       {stdTTL: 100, checkperiod: 120, useClones:false},
  view:       {stdTTL: 100, checkperiod: 120, useClones:false},
  file:       {stdTTL: 100, checkperiod: 120, useClones:false},
  group:      {stdTTL: 100, checkperiod: 120, useClones:false},
  action:     {stdTTL: 100, checkperiod: 120, useClones:false},
  domain:     {stdTTL: 100, checkperiod: 120, useClones:false},
  profile:    {stdTTL: 100, checkperiod: 120, useClones:false},
  document:   {stdTTL: 100, checkperiod: 120, useClones:false},
  collection: {stdTTL: 100, checkperiod: 120, useClones:false}
}, config.get('nodeCache'));

User.init({elasticSearch: esClient, ncConfig: nc.user, md5:{secret: secret}}),
Meta.init({elasticSearch: esClient, ncConfig: nc.meta}),
Form.init({elasticSearch: esClient, ncConfig: nc.form}),
File.init({elasticSearch: esClient, ncConfig: nc.file}),
Page.init({elasticSearch: esClient, ncConfig: nc.page}),
Role.init({elasticSearch: esClient, ncConfig: nc.role}),
View.init({elasticSearch: esClient, ncConfig: nc.view}),
Group.init({elasticSearch: esClient, ncConfig: nc.group}),
Action.init({elasticSearch: esClient, ncConfig: nc.action}),
Domain.init({elasticSearch: esClient, ncConfig: nc.domain}),
Profile.init({elasticSearch: esClient, ncConfig: nc.profile}),
Document.init({elasticSearch: esClient, ncConfig: nc.document}),
Collection.init({elasticSearch: esClient, ncConfig: nc.collection}),


Domain.get(Domain.ROOT).catch((e)=>{
  console.log("Root domain is initializing......!");
  Domain.create('administrator', Domain.ROOT, {
    title: 'Notesmore',
    slogan: 'Work is easy due to collaboration.',
    _i18n:{
      "zh-CN":{
        title: '协同',
        slogan: '工作因协同而轻松.'
      }
    },
    _meta: {
      acl: {
        get:{
          roles:['anonymous','member']
        }
      }
    }
  }).then(result => console.log("Root domain is initialized!")).catch(err => console.error(err));
});

module.exports = {
  Utils: Utils,
  User: User,
  Meta: Meta,
  Form: Form,
  File: File,
  Page: Page,
  Role: Role,
  View: View,
  Group: Group,
  Action: Action,
  Domain: Domain,
  Profile: Profile,
  Document: Document,
  Collection: Collection,
};
