const config = {
  elasticSearch: {
    host: '',
    requestTimeout: 60000
  },
  hdfs: {
    user: '',
    host: '',
    port: 9870
  },  
  redis: {
    host:''
  },
  nodeCache:{
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
  }
};

module.exports = config;
