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
  , {inherits, uniqueId, documentIndex, eventIndex, getEntity} = require('./utils');

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

  verify: function(token, callback) {
    jwt.verify(token, secret, function(err, decoded){
      var userId;

      if (err){
        return callback && callback(err);
      }

      userId = decoded.userId
      
      redis.get(SESSION_PREFIX + userId,function(err, data){
        if(err || token != (data && data.token))
          return callback && callback(createError(406, 'Token is invalid!'));

        callback && callback(null, userId);
      });
    });  
  },

  login: function(userId, password, callback) {

    function createToken(userId, cb){
      var newToken = jwt.sign({ userId: userId}, secret, {expiresIn: 60*60});
      redis.set(SESSION_PREFIX + userId, {token: newToken});
      cb && cb(null, newToken);
    }

    if(userId == 'anonymous'){
      redis.get(SESSION_PREFIX + userId, function(err, data){
        if(err) return callback && callback(err)
        if(data && data.token){
          jwt.verify(data.token, secret, function(err, decoded){
            if(err){
              createToken(userId, callback);
            }else{
              callback && callback(null, data.token);
            }
          })
        }else{
          createToken(userId, callback);
        }
      })          
    } else {
      User.get(userId, function(err, user){
        if (err) return callback && callback(err);          

        var md5 = crypto.createHash('md5');
        if (md5.update(password + secret).digest('hex') == user.password) {
          createToken(userId, callback);          
        } else {
          callback && callback(createError(406, "Username or password is incorrect!"));
        }
      });
    }
  },

  logout: function(userId, callback) {
    redis.del(SESSION_PREFIX + userId);
    callback && callback(null, true);
  },

  create: function(authorId, userId, userData, callback) {
    var md5 = crypto.createHash('md5');
    if (!userId || !userData.password) {
      return callback && callback(createError(400, "Username or password is empty!"));
    }
    userData.password = md5.update(userData.password + secret).digest('hex');
    if(!_.at(userData, '_meta.metaId')[0]) _.set(userData, '_meta.metaId', '.meta-user');
    Document.create.call(this, authorId, Domain.ROOT, USERS, userId, userData, function(err, document){
      if(err) return callback && callback(err);
      User.get(userId, callback);
    });
  },

  get: function(userId, callback) {
    getEntity(elasticsearch, cache, Domain.ROOT, USERS, userId, function(err, source){
      if(err) return callback && callback(err);
      callback && callback(null, new User(source));
    });
  },

  find: function(query, callback){
    Document.find.call(this, Domain.ROOT, USERS, query, callback);
  }

});

inherits(User, Document,{
  _getElasticSearch: function() {
    return elasticsearch;
  },

  _getCache: function() {
    return cache;
  },

  getIndex: function() {
    return 'root~.users~snapshots-1';
  },

  getEventIndex: function() {
    return 'root~.users~events-1';
  },

  get: function(callback) {
    var userData = _.cloneDeep(this);
    delete userData.password;
    callback && callback(null, userData);
  },

  resetPassword: function(authorId, newPassword, callback) {
    var md5 = crypto.createHash('md5'), password = md5.update(newPassword + secret).digest('hex'),
        patch = [{op: 'replace', path:'/password', value: password}];
    this._doPatch({patch:patch, _meta:{author:authorId, created: new Date().getTime()}}, callback);
    this._getCache().del(uniqueId(Domain.ROOT, USERS, this.id));      
  }

});
