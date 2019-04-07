
const _ = require('lodash')
  , User = require('./user')
  , Meta = require('./meta')
  , View = require('./view')
  , Page = require('./page')
  , Form = require('./form')
  , Role = require('./role')
  , Group = require('./group')
  , Action = require('./action')
  , Domain = require('./domain')
  , Profile = require('./profile')
  , File = require('./file')
  , Document = require('./document')
  , Collection = require('./collection')
  , EventEmitter = require('events')
  , { makeError } = require('./utils')
  , io = require('socket.io-client');

const eventEmitter = new EventEmitter();

const client = {
     
  options: {
    host: 'localhost',
    port: 3000
  },

  on: function(){
    return eventEmitter.on.apply(eventEmitter, arguments);
  },

  off: function(){
    return eventEmitter.off.apply(eventEmitter, arguments);
  },

  once: function(){
    return eventEmitter.once.apply(eventEmitter, arguments);
  },

  emitEvent: function(){
    return eventEmitter.emit.apply(eventEmitter, arguments);
  },

  addListener: function(){
    return eventEmitter.addListener.apply(eventEmitter, arguments);
  },

  removeListener: function(){
    return eventEmitter.removeListener.apply(eventEmitter, arguments);
  },

  _init: function(){
    var o = this.options;
    client.User = User.init({client: client});
    client.Meta = Meta.init({client: client});
    client.Form = Form.init({client: client});
    client.Page = Page.init({client: client});
    client.Role = Role.init({client: client});
    client.View = View.init({client: client});
    client.Group = Group.init({client: client});
    client.Action = Action.init({client: client});
    client.Domain = Domain.init({client: client});
    client.Profile = Profile.init({client: client});
    client.File = File.init({client: client});
    client.Document = Document.init({client: client});
    client.Collection = Collection.init({client: client});
  },

  emit: function() {
    this.socket.emit.apply(this.socket, arguments);
  },

  getToken: function(){
    return this.token;
  },

  _doConnect: function(token, callback){
    var o = this.options, self = this;
    this.socket = io.connect('http://' + o.host + ':' + o.port+'/domains?token=' + token);
    this.socket.on('connect', function() {
      self.token = token;
      callback ? callback(null, token) : console.log(token);
    });
    this.socket.on('TokenExpiredError', function(err){
      self.emitEvent('TokenExpiredError', err);
    });
    this.socket.on('invalidToken', function(err){
      self.emitEvent('invalidToken', err);
    });
  },

  connect: function(token, callback) {
    var self = this;
    this._doConnect(token, function(err, result){
      if (err) return callback ? callback(err) : console.error(err);
      User.get(function(err, user){
        if (err) return callback ? callback(err) : console.error(err);
        self.currentUser = user;
        callback? callback(null, user) : console.log(user);
        self.emitEvent('connected', user);
      });
    });
  },

  login: function(userId, password, callback) {
    var o = this.options, self = this, socket;
    
    if (arguments.length == 0) {
      userId = 'anonymous',
      password = 'anonymous'; 
    } else if(arguments.length == 1 && typeof arguments[0] == 'function'){
      callback = userId;
      userId = 'anonymous',
      password = 'anonymous'; 
    }

    socket = io.connect('http://' + o.host + ':' + o.port + '/domains');
    socket.on('connect', function() {
      socket.emit('login', userId, password, function(err, token) {
        if (err) return callback ? callback(err) : console.error(err);
        self._doConnect(token, function(err, result){
          User.get(function(err, user){
            if (err) return callback ? callback(err) : console.error(err);
            self.currentUser = user;
            callback? callback(null, user) : console.log(user);
            self.emitEvent('loggedIn', user);
          });
        });
        socket.disconnect();
      });
    });
  },

  logout: function(callback){
    var self = this;
    User.get(function(err, user){
      if (err) return callback ? callback(err) : console.error(err);
      self.emit('logout', function(err, result){
        if (err) return callback ? callback(err) : console.error(err);
        callback? callback(null, result) : console.log(result);
        self.emitEvent('loggedOut', user);
      });
    });
  }

};

module.exports = function (options) {
  _.merge(client.options, options);
  client._init();
  return client;
};
