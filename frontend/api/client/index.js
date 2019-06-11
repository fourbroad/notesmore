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
import io from 'socket.io-client';

const eventEmitter = new EventEmitter();
const client = {     
  options: {
    url: 'localhost:3000/domains',
    updateToken: true
  },

  on(){
    return eventEmitter.on.apply(eventEmitter, arguments);
  },

  off(){
    return eventEmitter.off.apply(eventEmitter, arguments);
  },

  once(){
    return eventEmitter.once.apply(eventEmitter, arguments);
  },

  emitEvent(){
    return eventEmitter.emit.apply(eventEmitter, arguments);
  },

  addListener(){
    return eventEmitter.addListener.apply(eventEmitter, arguments);
  },

  removeListener(){
    return eventEmitter.removeListener.apply(eventEmitter, arguments);
  },

  connect(options){
    _.merge(this.options, options);
    let {url, token} = this.options;
    return this.initSocket(url, token);
  },

  initSocket(url, token){
    return new Promise((resolve, reject)=>{
      if(token){
        this.socket = io.connect(url, {query:{token: token}});
        this.socket.on('connect', () =>{
          this.token = token;
          this._checkExpired(token);
          resolve(true);
        });
      }else{
        this.socket = io.connect(url);
        this.socket.on('connect', () =>{
          resolve(true);
        });
      }
  
      this.socket.on('TokenExpiredError', ()=>{
        this.emitEvent('tokenExpired');
      });

      this.socket.on('InvalidTokenError', ()=>{
        this.emitEvent('invalidToken');
      });
  
      this.socket.on('error', (err) => {
        if(err == 'InvalidTokenError'){
          this.emitEvent('invalidToken');
        }else{
          this.emitEvent(err);
        }
      });
    });
  },

  emit() {
    let o = this.options;
    if(this.isTokenValid()){
      let token = this.token, decodedToken = jwtDecode(token), time = new Date().getTime()/1000;
      if(o.updateToken && ((time - decodedToken.iat) > (decodedToken.exp-decodedToken.iat)*2/3)) {
        this.socket.emit('updateToken', (err, token) => {
          if(token){
            this.token = token;
            _.merge(this.socket.io.opts.query, {token: token});
            this._checkExpired(token);
            this.emitEvent('updateToken', token);
          }
        });
      }
    }
    return new Promise((resolve, reject)=>{
      let args = _.values(arguments);
      args.push(function(){
        let response = _.values(arguments);
        if(response[0]) reject(response[0]);
        response.shift();
        resolve.apply(null, response);
      });
      if(o.printApiMessage) console.log(args);
      this.socket.emit.apply(this.socket, args);
    });
  },

  getToken(){
    return this.token;
  },

  _checkExpired(token){
    if(this.interval){
      clearInterval(this.interval);
      delete this.interval;      
    } 
    this.interval = setTimeout(()=>{
      delete this.interval;
      this.emitEvent('tokenExpired');
    }, (jwtDecode(token).exp*1000) - new Date().getTime() + 100);
  },

  isTokenValid(){
    var token = this.token, decodedToken, time = new Date().getTime()/1000, valid = false;
    try{
      decodedToken = jwtDecode(token);
      valid = time < decodedToken.exp;
    } catch(e) {}
    return valid;
  },

  isConnected(){
    return this.socket && this.socket.connected;
  },

  login(userId, password) {
    return this.emit('login', userId, password).then(token => {
      _.set(this,'socket.io.opts.query.token', token);
      _.set(this, 'token', token);
      this._checkExpired(token);
      return token;
    });
  },

  logout(){
    return this.emit('logout').then(()=>{
      _.unset(this,'socket.io.opts.query.token');
      _.unset(this,'token');
      this.emitEvent('loggedOut');
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

export default client;
