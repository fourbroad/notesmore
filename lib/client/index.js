import _ from 'lodash';
import User from './user';
import Meta from './meta';
import View from './view';
import Page from './page';
import Form from './form';
import Role from './role';
import Group from './group';
import Action from './action';
import Domain from './domain';
import Profile from './profile';
import File from './file';
import Document from './document';
import Collection from './collection';
import jwtDecode from 'jwt-decode';
import EventEmitter from 'events';
import { makeError } from './utils';
import io from 'socket.io-client';

const eventEmitter = new EventEmitter();

const client = {
     
  options: {
    url: 'localhost:3000/domains',
    updateToken: true
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

  init: function(options){
    _.merge(this.options, options);
  },

  emit: function() {
    var o = this.options, self = this, token = this.token;
    if(!this.isExpired()){
      if(this.socket.connected){
        this.socket.emit.apply(this.socket, arguments);
        var decodedToken = jwtDecode(token), time = new Date().getTime()/1000;
        if(o.updateToken && ((time - decodedToken.iat) > (decodedToken.exp-decodedToken.iat)*2/3)) {
          this.socket.emit('updateToken', (err, token) => {
            if(token){
              self.token = token;
              self._checkExpired(token);
              self.emitEvent('updateToken', token);
            }
          });
        }
      }else{
        this._doConnect(token, () => {
          self.socket.emit.apply(self.socket, arguments);
        });        
      }
    } else {
      this.emitEvent('tokenExpired');
    }
  },

  getToken: function(){
    return this.token;
  },

  _checkExpired: function(token){
    var self = this;
    if(this.interval){
      clearInterval(this.interval);
      delete this.interval;      
    } 
    this.interval = setTimeout(function(){
      delete self.interval;
      self.emitEvent('tokenExpired');
    }, (jwtDecode(token).exp*1000) - new Date().getTime() + 100);
  },

  _initSocket(socket){
    var self = this;
    socket.on('TokenExpiredError', function(){
      if(self.isExpired()){
        self.emitEvent('tokenExpired');
      }
    });

    socket.on('invalidToken', function(){
      self.emitEvent('invalidToken');
    });

    socket.on('error', function(err){
      self.emitEvent(err);        
    });
  },

  _doConnect: function(token, callback){
    var o = this.options, self = this;
    this.socket = io.connect(o.url, {
      query: {
        token: token
      }
    });

    this.socket.on('connect', function() {
      self.token = token;
      self._checkExpired(token);
      User.get(function(err, user){
        if (err) return callback ? callback(err) : console.error(err);
        self.currentUser = user;
        callback? callback(null, user) : console.log(user);
      });
    });

    this._initSocket(this.socket);
  },

  isExpired: function(){
    var token = this.token, decodedToken = jwtDecode(token), time = new Date().getTime()/1000;
    return time >= decodedToken.exp;
  },

  isConnected: function(){
    return this.socket && this.socket.connected;
  },

  connect: function(token, callback) {
    var self = this;
    this._doConnect(token, function(err, user){
      if (err) return callback ? callback(err) : console.error(err);
      callback? callback(null, user) : console.log(user);
      self.emitEvent('connected', user);
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

    this.socket = io.connect(o.url);
    this.socket.on('connect', function() {
      self.socket.emit('login', userId, password, function(err, token) {
        if (err) return callback ? callback(err) : console.error(err);
        _.merge(self.socket.io.opts.query, {token: token});

        self.token = token;
        self._checkExpired(token);
        User.get(function(err, user){
          if (err) return callback ? callback(err) : console.error(err);
          self.currentUser = user;
          callback? callback(null, user) : console.log(user);
          self.emitEvent('loggedIn', user);
        });
      });
    });

    this._initSocket(this.socket);
  },

  logout: function(callback){
    var self = this;
    User.get(function(err, user){
      if (err) return callback ? callback(err) : console.error(err);
      self.emit('logout', function(err, result){
        if (err) return callback ? callback(err) : console.error(err);
        delete self.token;
        callback? callback(null, result) : console.log(result);
        self.emitEvent('loggedOut', user);
      });
    });
  }

};

User.init({client: client});
Meta.init({client: client});
Form.init({client: client});
Page.init({client: client});
Role.init({client: client});
View.init({client: client});
Group.init({client: client});
Action.init({client: client});
Domain.init({client: client});
Profile.init({client: client});
File.init({client: client});
Document.init({client: client});
Collection.init({client: client});

_.assign(client, {
  User: User,
  Meta: Meta,
  Form: Form,
  Page: Page,
  Role: Role,
  View: View,
  Group: Group,
  Action: Action,
  Domain: Domain,
  Profile: Profile,
  File: File,
  Document: Document,
  Collection: Collection,
});

client.install = (Vue, options) => {
  Vue.prototype.$client = client
}

export default client;
