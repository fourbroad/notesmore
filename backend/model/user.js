module.exports = User;

const _ = require('lodash')
  ,  createError = require('http-errors')
  , Domain = require('./domain')
  , Document = require('./document')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , redis = require('./cache')
  , jsonPatch = require('fast-json-patch')
  , uuidv4 = require('uuid/v4')
  , SESSION_PREFIX = 'session-'
  , {inherits, uniqueId, getEntity} = require('./utils');

const USERS = '.users';

var elasticsearch, cache, secret;

function User(userData) {
  Document.call(this, Domain.ROOT, USERS, userData);
}
 
_.assign(User, {
  
  init: function(config) {
    elasticsearch = config.elasticSearch;
    cache = config.nodeCache;
    secret = config.md5.secret
    return User;
  },

  verify: function(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function(err, decoded){
        var userId;

        if (err){
          return reject(err);
        }

        userId = decoded.userId
      
        redis.get(SESSION_PREFIX + userId,function(err, data){
          if(err || token != (data && data.token))
            return reject(createError(406, 'Token is invalid!'));
          return resolve(userId);
        });
      });  
    });
  },

  login: function(userId, password) {
    return new Promise((resolve, reject) => {
      function createToken(userId){
        var newToken = jwt.sign({ userId: userId}, secret, {expiresIn: 60*60});
        redis.set(SESSION_PREFIX + userId, {token: newToken});
        return resolve(newToken);
      }

      if(userId == 'anonymous'){
        redis.get(SESSION_PREFIX + userId, function(err, data){
          if(err) return reject(err);
          if(data && data.token){
            jwt.verify(data.token, secret, function(err, decoded){
              if(err){
                return createToken(userId);
              }else{
                return resolve(data.token);
              }
            })
          }else{
            return createToken(userId);
          }
        })          
      } else {
        return User.get(userId).then( user => {
          var md5 = crypto.createHash('md5');
          if (md5.update(password + secret).digest('hex') == user.password) {
            return createToken(userId);
          } else {
            return reject(createError(406, "Username or password is incorrect!"));
          }
        });
      }
     
    });
  },

  logout: function(userId) {
    redis.del(SESSION_PREFIX + userId);
    return Promise.resolve(true);
  },

  create: function(authorId, userId, userData) {
    var md5 = crypto.createHash('md5');
    if (!userId || !userData.password) {
      return Promise.reject(createError(400, "Username or password is empty!"));
    }

    userData.password = md5.update(userData.password + secret).digest('hex');
    if(!_.at(userData, '_meta.metaId')[0]) _.set(userData, '_meta.metaId', '.meta-user');
    
    return Document.create.call(this, authorId, Domain.ROOT, USERS, userId, userData).then( document => {
      return User.get(userId);
    });
  },

  get: function(userId) {
    return getEntity(elasticsearch, cache, Domain.ROOT, USERS, userId).then( source => {
      return new User(source);
    });
  },

  find: function(query){
    return Document.find.call(this, Domain.ROOT, USERS, query);
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

  resetPassword: function(authorId, newPassword) {
    var self = this, md5 = crypto.createHash('md5'), password = md5.update(newPassword + secret).digest('hex'),
        patch = [{op: 'replace', path:'/password', value: password}];
    return this._doPatch({patch:patch, _meta:{author:authorId, created: new Date().getTime()}}).then(result => {
      self._getCache().del(uniqueId(Domain.ROOT, USERS, self.id));
      return true;
    });
  }

});
