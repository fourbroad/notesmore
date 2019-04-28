module.exports = User;

const _ = require('lodash')
  , createError = require('http-errors')
  , NodeCache = require("node-cache")
  , Domain = require('./domain')
  , Document = require('./document')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , redis = require('./cache')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , SESSION_PREFIX = 'session-'
  , {inherits, uniqueId, createEntity, getEntity} = require('./utils');

const USERS = '.users';

var elasticsearch, cache, secret;

function User(userData) {
  Document.call(this, Domain.ROOT, USERS, userData);
}
 
_.assign(User, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = new NodeCache(config.ncConfig);
    secret = config.md5.secret
    return User;
  },

  verify: function(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function(err, decoded){
        if (err) return reject(createError(403, err.name));

        var userId = decoded.userId
        if(userId == 'anonymous'){
          return resolve(userId);
        } else {
          redis.get(SESSION_PREFIX + userId,function(err, data){
            if(err || token != (data && data.token)){
              return reject(createError(406, "invalidToken"));
            }
              
            return resolve(userId);
          });
        }
      });  
    });
  },

  updateToken: function(userId){
    return User.get(userId).then( user => {
      var expiresIn = _.at(user, 'session.expiresIn')[0] || 60*60*1000+"ms",
          newToken = jwt.sign({ userId: userId}, secret, {expiresIn: expiresIn});
      redis.set(SESSION_PREFIX + userId, {token: newToken});
      return newToken;
    });
  },

  login: function(userId, password) {
    if(userId == 'anonymous'){
      return Promise.resolve(jwt.sign({ userId: userId}, secret, {expiresIn: 60*60*1000+"ms"}));
    } else {
      return User.get(userId).then( user => {
        var md5 = crypto.createHash('md5');
        if (md5.update(password + secret).digest('hex') == user.password) {
          var expiresIn = _.at(user, 'session.expiresIn')[0] || 60*60*1000+"ms",
              newToken = jwt.sign({userId: userId}, secret, {expiresIn: expiresIn});
          redis.set(SESSION_PREFIX + userId, {token: newToken});
          return Promise.resolve(newToken);            
        } else {
          return Promise.reject(createError(406, "usernamePasswordError"));
        }
      });
    }
  },

  logout: function(userId) {
    redis.del(SESSION_PREFIX + userId);
    return Promise.resolve(true);
  },

  create: function(authorId, userId, userData, options) {
    var md5 = crypto.createHash('md5');
    if (!userId || !userData.password) {
      return Promise.reject(createError(400, "usernamePasswordEmpty"));
    }

    userData.password = md5.update(userData.password + secret).digest('hex');
    if(!_.at(userData, '_meta.metaId')[0]) _.set(userData, '_meta.metaId', '.meta-user');
    
    return createEntity(elasticsearch,authorId, Domain.ROOT, USERS, userId, userData, options).then((data) => {
      var user = new User(data);
      cache.set(uniqueId(Domain.ROOT, USERS, userId), user);
      return user;
    });
  },

  get: function(userId, options) {
    var uid = uniqueId(Domain.ROOT, USERS, userId), version = _.at(options, 'version')[0], user;
    uid = version ? uid + '~' + version : uid;
    user = cache.get(uid);
    if(user){
      return Promise.resolve(user);
    }else{
      return getEntity(elasticsearch, Domain.ROOT, USERS, userId, options).then(data=>{
        user = new User(data);
        cache.set(uid, user);
        return user;
      });
    }
  },

  find: function(query, options){
    return Document.find.call(this, Domain.ROOT, USERS, query, options);
  }

});

inherits(User, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  get: function() {
    var userData = _.cloneDeep(this);
    delete userData.password;
    return Promise.resolve(userData);
  },

  resetPassword: function(authorId, newPassword, options) {
    var self = this, md5 = crypto.createHash('md5'), password = md5.update(newPassword + secret).digest('hex'),
        patch = [{op: 'replace', path:'/password', value: password}];
    return this._doPatch({patch:patch, _meta:{author:authorId, created: new Date().getTime()}}, options).then(result => {
      self._getCache().del(uniqueId(Domain.ROOT, USERS, self.id));
      return true;
    });
  }

});
