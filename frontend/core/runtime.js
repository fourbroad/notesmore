import Cookies from 'js-cookie';
import Loader from './loader';
import jsonPatch from "fast-json-patch";

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.urianchor';

var client = require('../../lib/client')();

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
        token = Cookies.get('token') || localStorage.token;

    function callback(err, result){
      if(err) return console.log(err);
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
      client.connect(token, callback);
    } else {
      client.login(callback);
    }

    this._on({
      "docclick": function(event, doc) {
        var anchor = {col:doc.collectionId, doc:doc.id};
        if(doc.domainId != o.currentDomain){
          anchor.domainId = doc.domainId;
        }
        this.option('uriAnchor', anchor);
      },
      "docctrlclick": function(event, doc) {
        var anchor = {col:doc.collectionId, doc:doc.id, act:'edit'};
        if(doc.domainId != o.currentDomain){
          anchor = doc.domainId;
        }
        this.option('uriAnchor', anchor);
      },
      "actionclick": function(event, anchor){
        this.option('uriAnchor', anchor);
      },
      "history": function(event, history){
        this.option('uriAnchor', $.extend(true, {}, o.uriAnchor, {_doc:history}));
      }
    });

    window.runtime = this;

    this._on(window, {hashchange: this._onHashchange});
  },

  _setCurrentDomain: function(domainId){
    var o = this.options;
    client.Domain.get(domainId, function(err, domain){
      if(err) return console.log(err);
      window.currentDomain = domain;
    });
  },

  _setOption: function(key, value){
    var o = this.options, self = this;
    if(key === "uriAnchor" && jsonPatch.compare(o.uriAnchor, value).length > 0){
      var oldAnchor = $.extend(true, {}, o.uriAnchor);
      Loader.loadDocument(client, this.element, value.dom||o.currentDomain, value.col, value.doc, value.act, value._doc, function(err, doc){
        if(err){
          self._setOption('uriAnchor', oldAnchor);
          return console.log($.extend(err,{domainId: value.dom||o.currentDomain, collectionId: value.col, documentId:value.doc, actionId:value.act, opts:value._doc}));
        } 
        self._setAnchor();
      });
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

  _setAnchor: function(){
    var o = this.options, anchor, _doc = o.uriAnchor._doc;
    
    if(_doc){
      _doc = _.reduce(_doc, function(result, value, key) {
        result[key] = encodeURIComponent(JSON.stringify(value));
        return result;
      }, {});
    }

    if($.isEmptyObject(_doc)){
      anchor = $.extend(true,{}, o.uriAnchor);
    }else{
      anchor = $.extend(true,{}, o.uriAnchor, {_doc: _doc});
    }

    try {
      $.uriAnchor.setAnchor(anchor);
    } catch(error) {
      $.uriAnchor.setAnchor(o.uriAnchor, null, true);
    }
  },

  _onHashchange: function(event){
    var o = this.options, self = this, el = this.element, anchorProposed = this._makeAnchorMap();

    if($.isEmptyObject(anchorProposed)){
      anchorProposed = $.extend(true, {}, $.nm.runtime.prototype.options.uriAnchor);
    }
    
    this.option('uriAnchor', anchorProposed);      
    
    return false;
  },

  _makeAnchorMap: function(){
    var o = this.options, anchor;

    try {
      anchor = $.uriAnchor.makeAnchorMap();
      if(anchor._doc){
        anchor._doc = _.reduce(anchor._doc, function(result, value, key) {
          result[key] = JSON.parse(decodeURIComponent(value));
          return result;
        }, {});        
      }
    } catch(error) {
      $.uriAnchor.setAnchor(o.uriAnchor, null, true);
    }

    if($.isEmptyObject(anchor)){
      anchor = $.extend(true, {}, o.uriAnchor);
    }

    anchor = _.reduce(anchor, function(result, value, key) {
      if(!key.startsWith('_s')){
        result[key] = value;
      }
      return result;
    }, {});

    return anchor
  }

});
