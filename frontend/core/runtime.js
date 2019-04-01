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
    uriAnchor: {col:'.pages', doc:'.workbench'}
  },

  _create: function(){
    var o = this.options, self = this, anchor = this._makeAnchorMap(),
        token = Cookies.get('token') || localStorage.getItem('token');

    function callback(err, result){
      if(err) return console.error(err);
      self._setCurrentDomain(o.currentDomain);
      o.uriAnchor = anchor;
      Loader.loadDocument(client, self.element, anchor.dom||o.currentDomain, anchor.col, anchor.doc, anchor.act, anchor._doc, function(err, doc){
        if(err){
          return console.log($.extend(err,{domainId: anchor.dom||o.currentDomain, collectionId: anchor.col, documentId:anchor.doc, actionId:anchor.act, opts:anchor._doc}));
        } 
        self._setAnchor();
      });
    }

    if(token){
      var decodedToken = jwtDecode(token);
      if(new Date().getTime()/1000 < decodedToken.exp){
        client.connect(token, callback);        
      } else {
        localStorage.removeItem('token');
        client.login(callback);        
      }
      
    } else {
      client.login(callback);
    }

    this.loggedInListener =function(user){
      localStorage.setItem('token', client.token);
    }

    this.loggedOutListener = function(user){
      client.login();
    }

    this.TokenExpiredErrorListener = function(err){
      console.error(err);
      localStorage.removeItem('token');
    }

    client.on("loggedIn", this.loggedInListener);
    client.on("loggedOut", this.loggedOutListener);
    client.on("TokenExpiredError", this.TokenExpiredErrorListener);

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
        delete uriAnchor._doc;
        this.options.uriAnchor = $.extend(true, uriAnchor, {_doc:history});
        this._setAnchor(override);
      },
      "cancelaction": function(event){
        if(this.oldAnchor){
          $.uriAnchor.setAnchor(this._encodeAnchor(this.oldAnchor), null, true);
        }
      }
    });

    window.runtime = this;

    this._on(window, {hashchange: this._onHashchange});
  },

  _setUriAnchor(event, doc){
    var o = this.options, anchor = {col:doc.collectionId, doc:doc.id};
    if(doc.domainId != o.currentDomain){
      anchor.dom = doc.domainId;
    }
    this.option('uriAnchor', anchor);
  },

  _setCurrentDomain: function(domainId){
    var o = this.options;
    client.Domain.get(domainId, function(err, domain){
      if(err) return console.error(err);
      window.currentDomain = domain;
    });
  },

  _setOption: function(key, value){
    var o = this.options, self = this;
    if(key === "uriAnchor" && jsonPatch.compare(o.uriAnchor, value).length > 0){
      var oldAnchor = $.extend(true, {}, o.uriAnchor);
      function callback(err, doc){
        if(err){
          self._setOption('uriAnchor', oldAnchor);
          return console.error($.extend(err,{domainId: value.dom||o.currentDomain, collectionId: value.col, documentId:value.doc, actionId:value.act, opts:value._doc}));
        } 
        self._setAnchor();
      }

      if(value.col == '.metas' && value.act == 'new'){
        Loader.createDocument(client, this.element, domainId, metaId, callback);
      } else {
        Loader.loadDocument(client, this.element, value.dom||o.currentDomain, value.col, value.doc, value.act, value._doc, callback);
      }
    }else if(key == 'currentDomain' && value != o.currentDomain){
      var anchor = o.uriAnchor, oldDomainId = o.currentDomain;
      Loader.loadDocument(client, this.element, value, anchor.col, anchor.doc, anchor.act, anchor._doc, function(err, doc){
        if(err){
          self._setOption('currentDomain', oldDomainId);
          return console.log($.extend(err,{domainId: value, collectionId: anchor.col, documentId:anchor.doc, actionId:anchor.act, opts:anchor._doc}));
        }
        self._setCurrentDomain(value);
        self._setAnchor();
      });
    }

    this._super(key, value);
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

  _setAnchor: function(override){
    var o = this.options;
    this.oldAnchor = this._makeAnchorMap();
    try {
      $.uriAnchor.setAnchor(this._encodeAnchor(o.uriAnchor), null, override);
    } catch(error) {
      if(this.oldAnchor){
        $.uriAnchor.setAnchor(this._encodeAnchor(this.oldAnchor), null, true);
      }
    }
  },

  _onHashchange: function(event){
    this.option('uriAnchor', this._makeAnchorMap());      
    return false;
  },

  _makeAnchorMap: function(){
    var anchor;

    try {
      anchor = $.uriAnchor.makeAnchorMap();
    } catch(error) {console.error(error);}

    anchor = this._decodeAnchor(anchor);

    if($.isEmptyObject(anchor)){
      anchor = $.extend(true, {}, $.nm.runtime.prototype.options.uriAnchor);
    }

    return anchor
  },

  _destroy: function(){
    client.off("loggedIn", this.loggedInListener);
    client.off("loggedOut", this.loggedOutListener);
    client.off("TokenExpiredError", this.TokenExpiredErrorListener);
  }

});
