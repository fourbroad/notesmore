
const _ = require('lodash')
  , User = require('./user')
  , Meta = require('./meta')
  , View = require('./view')
  , Page = require('./page')
  , Form = require('./form')
  , Role = require('./role')
  , Group = require('./group')
  , Domain = require('./domain')
  , Profile = require('./profile')
  , Document = require('./document')
  , Collection = require('./collection')
  , { makeError } = require('./utils')
  , io = require('socket.io-client');

var client = {
     
  options: {
    port: 3000,
    nodeCache: {
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
      Collection: {stdTTL: 100, checkperiod: 120}
    }
  },

  _init: function(){
    var o = this.options, nc = o.nodeCache;
    client.User = User.init({client: client, nodeCache: nc.user});
    client.Meta = Meta.init({client: client, nodeCache: nc.meta});
    client.Form = Form.init({client: client, nodeCache: nc.form});
    client.Page = Page.init({client: client, nodeCache: nc.page});
    client.Role = Role.init({client: client, nodeCache: nc.role});
    client.View = View.init({client: client, nodeCache: nc.view});
    client.Group = Group.init({client: client, nodeCache: nc.group});
    client.Domain = Domain.init({client: client, nodeCache: nc.domain});
    client.Profile = Profile.init({client: client, nodeCache: nc.profile});
    client.Document = Document.init({client: client, nodeCache: nc.document});
    client.Collection = Collection.init({client: client, nodeCache: nc.collection});
  },

  emit: function() {
    this.socket.emit.apply(this.socket, arguments);
  },

  getToken: function(){
    return this.token;
  },

  connect: function(token, callback) {
    var o = this.options, self = this;
    this.socket = io.connect('http://192.168.1.107:'+o.port+'/domains?token=' + token);
    this.socket.on('connect', function() {
      self.token = token;
      callback ? callback(null, token) : console.log(token);
    });
  },

  login: function(userId, password, callback) {
    var o = this.options, self = this, socket;
    
    function cb(err, result){
      if(err) return console.log(err);
      console.log(result);
    }
    
    if (arguments.length == 0) {
      userId = 'anonymous',
      password = 'anonymous'; 
      callback = cb;
    } else if (arguments.length == 1 && typeof arguments[0] == 'function') {
      callback = userId;
      userId = 'anonymous',
      password = 'anonymous'; 
    } else if (arguments.length == 2 && typeof arguments[0] == 'string' && typeof arguments[1] == 'string') {
      callback = cb;
    } else if (arguments.length != 3 || typeof arguments[2] != 'function') {
      var error = makeError(10001, 'argumentError', 'Number or type of arguments is not correct!')
      callback ? callback(null, error) : console.log(error);
    }

    socket = io.connect('http://192.168.1.107:'+o.port+'/domains');
    socket.on('connect', function() {
      socket.emit('login', userId, password, function(err, token) {
        if (err) return callback ? callback(err) : console.log(err);
        self.connect(token, callback);
        socket.disconnect();
      });
    });
  },

  logout: function(callback){
    this.emit('logout', function(err, result){
      if (err) return callback ? callback(err) : console.log(err);
      callback? callback(null, result) : console.log(result);
    });
  }

};


module.exports = function (options) {
  _.merge(client.options, options);
  client._init();
  return client;
};