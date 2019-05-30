import Cookies from 'js-cookie';
import Loader from './loader';
import jsonPatch from "fast-json-patch";

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.urianchor';

import jwtDecode from 'jwt-decode';
import client from 'lib/client';

window.client = client;
window.User = client.User;
window.Collection = client.Collection;
window.Document = client.Document;
window.Domain = client.Domain;
window.Form = client.Form;
window.Group = client.Group;
window.Meta = client.Meta;
window.Page = client.Page;
window.Action = client.Action;
window.Profile = client.Profile;
window.File =client.File;
window.Role = client.Role;
window.View = client.View;

/**
 * NOTE: Register resize event for Masonry layout
 */
const EVENT = document.createEvent('UIEvents');
EVENT.initUIEvent('resize', true, false, window, 0);
window.EVENT = EVENT;

// // Trigger window resize event after page load for recalculation of masonry layout.
// window.addEventListener('load', ()=>{
//   window.dispatchEvent(EVENT);
// });

// // Trigger resize on any element click
// document.addEventListener('click', ()=>{
//   window.dispatchEvent(window.EVENT);
// });

window.Cookies = Cookies;
window.jwtDecode = jwtDecode;

$.widget('nm.runtime',{
  options:{
    currentDomain:document.domain,
    defaultAnchor:{col:'.pages', doc:'.workbench'}
  },

  _create: function(){
    let o = this.options, _this = this, token = this.getToken();

    client.init(o.client);

    this._connectedListener = $.proxy(this._gotoConnected, this);
    this._loggedInListener = $.proxy(this._gotoConnected, this);
    this._loggedOutListener = $.proxy(this._gotoLogin, this);
    this._invalidTokenListener = $.proxy(this._gotoLogin,this);
    this._tokenExpiredListener = $.proxy(this._gotoLogin,this);

    this._exportStartListener = $.proxy(this._onExportStart,this);
    this._exportProgressListener = $.proxy(this._onExportProgress,this);
    this._exportEndListener = $.proxy(this._onExportEnd,this);

    client.on("connected", this._connectedListener);
    client.on("loggedIn", this._loggedInListener);
    client.on("loggedOut", this._loggedOutListener);
    client.on("tokenExpired", this._tokenExpiredListener);
    client.on("invalidToken", this._invalidTokenListener);
    client.on('updateToken', this.setToken);

    client.on('exportStart', this._exportStartListener);

    this._on({
      "createdocument": function(event, meta){
        let anchor = {col:meta.collectionId, doc: meta.id, act: 'new'}
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
        let uriAnchor = _.cloneDeep(o.uriAnchor);
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
      },
      "documentdeleted": function(event, doc){
        window.history.back();
      },
      "documenterror": function(event, doc){
        window.history.back();
      }
    });

    if(token){
      let decodedToken = jwtDecode(token);
      if((new Date().getTime()/1000) < decodedToken.exp){
        client.connect(token, function(err, user){
          if(err) {
            _this.clearToken();
            return console.error(err); 
          }
          $(window).trigger('hashchange');
        });
      } else {
        this.clearToken();
        client.login(function(err, user){
          if(err) return console.error(err);
          $(window).trigger('hashchange');          
        });
      }
    } else {
      client.login(function(){});
    }

    window.runtime = this;

    this._on(window, {hashchange: this._onHashchange});
  },

  _gotoConnected: function(user){
    let o = this.options, anchor = this._makeAnchorMap();
    this.setToken(client.token);
    if(user.id == "anonymous"){
      if(anchor.col == '.pages' && anchor.doc == '.workbench'){
        anchor = {col:'.pages', doc:'.login'};
      }
      this.option({'uriAnchor':anchor, override: false});
    } else {
      if(anchor.col == '.pages' && (anchor.doc == '.login' || anchor.doc == '.signup')){
        anchor = {col: '.pages', doc: '.workbench'};
      }
      this.option({'uriAnchor': anchor, override: true});
    }
  },

  clearToken: function(){
    localStorage.removeItem('token');
    $.ajaxSetup({headers:{authorization: ''}});
    Cookies.remove('token');
  },

  setToken: function(token){
    $.ajaxSetup({headers:{authorization: 'Bearer ' + token}});
    Cookies.set('token', token);
    localStorage.setItem('token', token);
  },

  getToken: function(){
    return localStorage.getItem('token') || Cookies.get('token');
  },

  _gotoLogin: function(){
    let _this = this;
    this.clearToken();
    client.login(function(err, result){
      _this.option({'uriAnchor': {col:'.pages', doc:'.login'}, override: true});
    });
  },

  _setUriAnchor(event, doc){
    let o = this.options, anchor = {col:doc.collectionId, doc:doc.id};
    if(doc.domainId != o.currentDomain){
      anchor.dom = doc.domainId;
    }
    this.option({uriAnchor:anchor, override: false});
  },

  _setOptions: function( options) {
    let _this = this, o = this.options, override = options.override || o.override;
    $.each(options, function(key, value) {
      if(key === "uriAnchor" && jsonPatch.compare(o.uriAnchor||{}, value).length > 0){
        let oldAnchor = $.extend(true, {}, o.uriAnchor);
        function callback(err, doc){
          if(err){
            o.urlAnchor = oldAnchor;
            return console.error($.extend(err,{domainId: value.dom||o.currentDomain, collectionId: value.col, documentId:value.doc, actionId:value.act, opts:value._doc}));
          } 
          _this._setAnchor(o.uriAnchor, override);
        }

        if(value.col == '.metas' && value.act == 'new'){
          Loader.createDocument(client, _this.element, domainId, metaId, o.locale, callback);
        } else {
          Loader.loadDocument(client, _this.element, value.dom||o.currentDomain, value.col, value.doc, value.act, value._doc, o.locale, callback);
        }
      }else if(key == 'currentDomain' && value != o.currentDomain){
        let anchor = o.uriAnchor, oldDomainId = o.currentDomain;
        Loader.loadDocument(client, _this.element, value, anchor.col, anchor.doc, anchor.act, anchor._doc, o.locale, function(err, doc){
          if(err){
            _this._setOption('currentDomain', oldDomainId);
            return console.log($.extend(err,{domainId: value, collectionId: anchor.col, documentId:anchor.doc, actionId:anchor.act, opts:anchor._doc}));
          }
          _this._setAnchor(o.uriAnchor);
        });
      }
      _this._setOption( key, value );
    });
  },

  loadDocument: function(domId, colId, docId, actId, opts){
    let anchor = {col:colId, doc:docId};
    if(domId && domId != currentDomain.id) anchor.dom = domId;
    if(actId) anchor.act = actId;
    if(!$.isEmptyObject(opts)) anchor._doc = opts;
    this.option('uriAnchor', anchor);
  },

  _encodeAnchor: function(uriAnchor){
    let anchor = _.cloneDeep(uriAnchor);
    if(anchor._doc){
      anchor._doc = _.reduce(anchor._doc, function(result, value, key) {
        result[key] = encodeURIComponent(JSON.stringify(value));
        return result;
      }, {});
    }
    return anchor;
  },

  _decodeAnchor: function(uriAnchor){
    let anchor = _.cloneDeep(uriAnchor);
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
    let o = this.options;
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
    let o = this.options, _this = this, anchor = this._makeAnchorMap(), override = false;
    User.get(function(err, user){
      if(user.id == "anonymous"){
        if($.isEmptyObject(anchor) ||(anchor.col == '.pages' && anchor.doc == '.workbench')){
          anchor = {col:'.pages', doc:'.login'};
          override = true;
        }
        _this.option({uriAnchor:anchor, override: override});
      } else {
        if($.isEmptyObject(anchor)){
          anchor = {col:'.pages', doc:'.workbench'}
          override = true;
        }
        _this.option({uriAnchor: anchor, override: override});
      }
    });
    return false;
  },

  _makeAnchorMap: function(){
    let o = this.options, anchor;

    try {
      anchor = $.uriAnchor.makeAnchorMap();
    } catch(error) {console.error(error);}

    return this._decodeAnchor(anchor);
  },

  _onExportStart: function(options){
    let _this = this, nonce = options.nonce;

    if(!this.$toastContainer){
      this.$toastContainer = $('<div style="position: absolute; left: 5px; bottom: 5px; z-index: 1000"/>').appendTo('body');
    }
    
    import(/* webpackChunkName: "toast" */ 'toast/toast').then(() => {
      let $toast = $('<div/>').appendTo(_this.$toastContainer), 
          toast = $toast.nmtoast({
            title: options.title,
            hint: options.hint,
            message: options.message,
            autohide: false
          }).nmtoast('instance'),
          exportProgressListener = function(options){
            if(options.nonce == nonce){
              toast.option({
                title: options.title,
                hint: options.hint,
                message: options.message
              });
            }
          },
          exportEndListener = function(options){
            if(options.nonce == nonce){
              toast.option({
                title: options.title,
                hint: options.hint,
                message: options.message
              });
              client.off('exportProgress', exportProgressListener);
              client.off('exportEnd', exportEndListener);
            }
          };

      client.on('exportProgress', exportProgressListener);
      client.on('exportEnd', exportEndListener);

      $toast.on('hidden.bs.toast', () => {
        client.off('exportProgress', exportProgressListener);
        client.off('exportEnd', exportEndListener);
        $toast.remove();
      });
    });
  },

  _destroy: function(){
    client.off("connected", this._connectedListener);
    client.off("loggedIn", this._loggedInListener);
    client.off("loggedOut", this._loggedOutListener);
    client.off("tokenExpired", this._tokenExpiredListener);
    client.off("invalidToken", this._invalidTokenListener);

    client.off('exportStart', this._exportStartListener);
  }

});
