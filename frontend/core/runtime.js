import Cookies from 'js-cookie';
import Loader from './loader';
import jsonPatch from "fast-json-patch";

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.urianchor';

const client = require('../../lib/client')()
  , jwtDecode = require('jwt-decode');

/**
 * NOTE: Register resize event for Masonry layout
 */
const EVENT = document.createEvent('UIEvents');
window.EVENT = EVENT;
EVENT.initUIEvent('resize', true, false, window, 0);

// Trigger window resize event after page load for recalculation of masonry layout.
window.addEventListener('load', ()=>{
  window.dispatchEvent(EVENT);
});

// Trigger resize on any element click
document.addEventListener('click', ()=>{
  window.dispatchEvent(window.EVENT);
});

$.widget('nm.runtime',{
  options:{
    currentDomain:document.domain,
    defaultAnchor:{col:'.pages', doc:'.workbench'}
  },

  _create: function(){
    var o = this.options, self = this, token = Cookies.get('token') || localStorage.getItem('token');

    this.connectedListener = $.proxy(this._gotoConnected, this);
    this.loggedInListener = $.proxy(this._gotoConnected, this);
    this.loggedOutListener = $.proxy(this._gotoLogin, this);
    this.TokenExpiredErrorListener = $.proxy(this._gotoLogin, this);
    this.invalidTokenListener = $.proxy(this._gotoLogin,this);

    client.on("connected", this.connectedListener);
    client.on("loggedIn", this.loggedInListener);
    client.on("loggedOut", this.loggedOutListener);
    client.on("TokenExpiredError", this.TokenExpiredErrorListener);
    client.on("invalidToken", this.invalidTokenListener);

    this._on({
      "createdocument": function(event, meta){
        var anchor = {col:meta.collectionId, doc: meta.id, act: 'new'}
        if(meta.domainId != o.currentDomain){
          anchor.dom = meta.domainId
        }
        this.option('uriAnchor', anchor);
      },
      "documentopened": this._setUriAnchor,
      "docclick": this._setUriAnchor,
      "docctrlclick": this._setUriAnchor,
      "actionclick": function(event, anchor){
        this.option('uriAnchor', anchor);
      },
      "history": function(event, history, override){
        var uriAnchor = _.cloneDeep(o.uriAnchor);
        if(uriAnchor.col == '.pages' && uriAnchor.doc == '.workbench' && $.isEmptyObject(uriAnchor._doc)){
          override = true;
        }
        delete uriAnchor._doc;
        o.uriAnchor = $.extend(true, uriAnchor, {_doc:history});
        this._setAnchor(o.uriAnchor, override);
      },
      "cancelaction": function(event){
        if(this.oldAnchor){
          $.uriAnchor.setAnchor(this._encodeAnchor(this.oldAnchor), null, true);
        }
      }
    });

    if(token){
      var decodedToken = jwtDecode(token);
      if((new Date().getTime()/1000) < decodedToken.exp){
        client.connect(token, function(){});
      } else {
        localStorage.removeItem('token');
        client.login(function(){});
      }
    } else {
      client.login(function(){});
    }

    window.runtime = this;

    this._on(window, {hashchange: this._onHashchange});
  },

  _gotoConnected: function(user){
    var o = this.options, anchor = this._makeAnchorMap();
    localStorage.setItem('token', client.token);
    this._setCurrentDomain(o.currentDomain);
    if(user.id == "anonymous"){
      if(anchor.col == '.pages' && anchor.doc == '.workbench'){
        anchor = {col:'.pages', doc:'.login'};
      }
      this.option({'uriAnchor':anchor, override: false});
    } else {
      this.option({'uriAnchor': o.defaultAnchor, override: true});
    }
  },

  _gotoLogin: function(){
    var self = this;
    localStorage.removeItem('token');
    client.login(function(){
      self.option({'uriAnchor': {col:'.pages', doc:'.login'}, override: true});
    });
  },

  _setUriAnchor(event, doc){
    var o = this.options, anchor = {col:doc.collectionId, doc:doc.id};
    if(doc.domainId != o.currentDomain){
      anchor.dom = doc.domainId;
    }
    this.option({uriAnchor:anchor, override: false});
  },

  _setCurrentDomain: function(domainId){
    var o = this.options;
    client.Domain.get(domainId, function(err, domain){
      if(err) return console.error(err);
      window.currentDomain = domain;
    });
  },

  _setOptions: function( options) {
    var self = this, o = this.options, override = options.override || o.override;
    $.each(options, function(key, value) {
      if(key === "uriAnchor" && jsonPatch.compare(o.uriAnchor||{}, value).length > 0){
        var oldAnchor = $.extend(true, {}, o.uriAnchor);
        function callback(err, doc){
          if(err){
            o.urlAnchor = oldAnchor;
            return console.error($.extend(err,{domainId: value.dom||o.currentDomain, collectionId: value.col, documentId:value.doc, actionId:value.act, opts:value._doc}));
          } 
          self._setAnchor(o.uriAnchor, override);
        }

        if(value.col == '.metas' && value.act == 'new'){
          Loader.createDocument(client, self.element, domainId, metaId, callback);
        } else {
          Loader.loadDocument(client, self.element, value.dom||o.currentDomain, value.col, value.doc, value.act, value._doc, callback);
        }
      }else if(key == 'currentDomain' && value != o.currentDomain){
        var anchor = o.uriAnchor, oldDomainId = o.currentDomain;
        Loader.loadDocument(client, self.element, value, anchor.col, anchor.doc, anchor.act, anchor._doc, function(err, doc){
          if(err){
            self._setOption('currentDomain', oldDomainId);
            return console.log($.extend(err,{domainId: value, collectionId: anchor.col, documentId:anchor.doc, actionId:anchor.act, opts:anchor._doc}));
          }
          self._setCurrentDomain(value);
          self._setAnchor(o.uriAnchor);
        });
      }
      self._setOption( key, value );
    });
  },

  loadDocument: function(domId, colId, docId, actId, opts){
    var anchor = {col:colId, doc:docId};
    if(domId && domId != currentDomain.id) anchor.dom = domId;
    if(actId) anchor.act = actId;
    if(!$.isEmptyObject(opts)) anchor._doc = opts;
    this.option('uriAnchor', anchor);
  },

  _encodeAnchor: function(uriAnchor){
    var anchor = _.cloneDeep(uriAnchor);
    if(anchor._doc){
      anchor._doc = _.reduce(anchor._doc, function(result, value, key) {
        result[key] = encodeURIComponent(JSON.stringify(value));
        return result;
      }, {});
    }
    return anchor;
  },

  _decodeAnchor: function(uriAnchor){
    var anchor = _.cloneDeep(uriAnchor);
    if(anchor._doc){
      anchor._doc = _.reduce(anchor._doc, function(result, value, key) {
        result[key] = JSON.parse(decodeURIComponent(value));
        return result;
      }, {});        
    }
    anchor = _.reduce(anchor, function(result, value, key) {
      if(!key.startsWith('_s')){
        result[key] = value;
      }
      return result;
    }, {});
    return anchor;
  },

  _setAnchor: function(uriAnchor, override){
    var o = this.options;
    this.oldAnchor = this._makeAnchorMap();
    try {
      $.uriAnchor.setAnchor(this._encodeAnchor(uriAnchor), null, override);
    } catch(error) {
      if(this.oldAnchor){
        $.uriAnchor.setAnchor(this._encodeAnchor(this.oldAnchor), null, true);
      }
    }
  },

  _onHashchange: function(event){
    var o = this.options, self = this, anchor = this._makeAnchorMap(), override = false;
    User.get(function(err, user){
      if(user.id == "anonymous"){
        if(anchor.col == '.pages' && anchor.doc == '.workbench'){
          anchor = {col:'.pages', doc:'.login'};
          override = true;
        }
        self.option({uriAnchor:anchor, override: override});
      } else {
        self.option({uriAnchor: anchor, override: override});
      }
    });
    return false;
  },

  _makeAnchorMap: function(){
    var o = this.options, anchor;

    try {
      anchor = $.uriAnchor.makeAnchorMap();
    } catch(error) {console.error(error);}

    return this._decodeAnchor(anchor);
  },

  _destroy: function(){
    client.off("loggedIn", this.loggedInListener);
    client.off("loggedOut", this.loggedOutListener);
    client.off("TokenExpiredError", this.TokenExpiredErrorListener);
    client.off("invalidToken", this.invalidTokenListener);
  }

});
