import * as $ from 'jquery';
import 'bootstrap';
import _ from 'lodash';
import moment from 'moment';

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import * as jsonPatch from "fast-json-patch";

import 'account/account';
import Loader from 'core/loader';

import workbenchHtml from './workbench.html';

const jwtDecode = require('jwt-decode');

$.widget('nm.workbench', {
  options: {
    anchor:{
      col: '.pages',
      doc: '.dashboard'
    }
  },

  _create: function(){
    var o = this.options, self = this, client = o.page.getClient(), anchor = o.anchor;

    this._addClass("nm-workbench");
    this.element.html(workbenchHtml);

    this.$workbench = $(".workbench", this.element);
    this.$mainContent = $("#mainContent", this.element);
 
    this.ps = new PerfectScrollbar($('.scrollable', this.element)[0],{suppressScrollX:true, wheelPropagation: true});

    this.$favorites = $('li.favorites', this.element);
    this.$badge = $('.badge', this.favorites);
    this.$favoriteItems = $('.favorite-item-container', this.$favorites);

    this.$newDocumentBtn = $('li.new-document', this.element);

    $('<li/>').appendTo($('.page-container .nav-right', this.element)).account({client: client});

    this._armSidebar();

    this._on(this.$newDocumentBtn, {click: this._loadNewDialog});
    this._on(this.$workbench, {
      'click .search-toggle': function(e){
        $('.search-box, .search-input', self.element).toggleClass('active');
        $('.search-input input', self.element).focus();
        e.preventDefault();
      },
      "createdocument": function(e, meta){
        var anchor = {col:meta.collectionId, doc: meta.id, act: 'new'}
        if(meta.domainId != o.page.domainId){
          anchor.dom = meta.domainId
        }
        self.option('anchor', anchor);
        e.stopPropagation();
      },
      'documentcreated': function(e, doc, isNew){
        var anchor = {col: doc.collectionId, doc: doc.id};
        if(doc.domainId != o.page.domainId){
          anchor.dom = doc.domainId;
        }

        this.options.anchor = anchor;
        this.element.trigger("history", [{anchor:anchor}, isNew]);

        e.stopPropagation();
      },
      'docclick': function(e, doc){
        var anchor = {col: doc.collectionId, doc: doc.id};
        if(anchor.col != '.pages' || anchor.doc != '.workbench'){
          if(doc.domainId != o.page.domainId){
            anchor.dom = doc.domainId;
          }
          self.option('anchor', anchor);
          e.stopPropagation();
        }
      },
      "docctrlclick": function(e, doc) {
        var anchor = {col:doc.collectionId, doc:doc.id, act:'edit'};
        if(doc.domainId != currentDomain.id){
          anchor.dom = doc.domainId;
        }
        this.option('anchor', anchor);
        e.stopPropagation();
      },
      "actionclick": function(e, anchor){
        this.option('anchor', anchor);
        e.stopPropagation();
      },
      "favoriteclick": function(e, doc){
        self._refreshFavorites();
      }
    });

    // Sidebar links
    $('.sidebar .sidebar-menu', this.element).on('click','li>a.document', function () {
      const $this = $(this), $parent = $this.parent(), anchor = $parent.data('anchor');
      if ($parent.hasClass('open')) {
        $parent.children('.dropdown-menu').slideUp(200, () => {
          $parent.removeClass('open');
        });
      } else {
        $parent.parent().children('li.open').children('.dropdown-menu').slideUp(200);
        $parent.parent().children('li.open').children('a').removeClass('open');
        $parent.parent().children('li.open').removeClass('open');
        $parent.children('.dropdown-menu').slideDown(200, () => {
          $parent.addClass('open');
        });
      }

      $('.sidebar').find('.sidebar-link').removeClass('active');
      $this.addClass('active');

      if(anchor){
        self.option('anchor', anchor);  
      }
    });

    // ٍSidebar Toggle
    $('.sidebar-toggle', this.element).on('click', e => {
      self.element.toggleClass('is-collapsed');
      e.preventDefault();
    });

    /**
     * Wait untill sidebar fully toggled (animated in/out)
     * then trigger window resize event in order to recalculate
     * masonry layout widths and gutters.
     */
    $('#sidebar-toggle', this.element).click(e => {
      e.preventDefault();
      setTimeout(() => {
        window.dispatchEvent(window.EVENT);
      }, 300);
    });

    function callback(err, doc){
      if(err) return console.error(err);
      self.element.trigger("history", {anchor: anchor});
    }
    if(anchor.col == '.metas' && anchor.act == 'new'){
      this._createDocument(anchor.dom||o.page.domainId, anchor.doc, callback);
    }else{
      this._loadDocument(anchor.dom||o.page.domainId, anchor.col, anchor.doc, anchor.act, anchor.opts, callback);
    }

    this._refreshFavorites();
  },

  _armFavoriteItem: function(doc){
    var item = String() + '<li class="view nav-item"><i class="'+doc._meta.iconClass+'"></i><a class="sidebar-link document">' + (doc.title || doc.id) + '</a></li>'
    return item;
  },

  _refreshFavorites: function(){
    var o = this.options, self = this, domainId = o.page.domainId, client = o.page.getClient(), 
      { Profile, Document } = client,  decodedToken = jwtDecode(client.token);
    this.$favoriteItems.empty();
    Profile.get(o.page.domainId, decodedToken.userId, function(err, profile){
      if(err) return console.error(err);
      self.$badge.html(profile.favorites&&profile.favorites.length||0);
      _.each(profile.favorites, function(f){
        Document.get(f.domainId, f.collectionId, f.id, function(err, doc){
          if(err) return console.error(err);
          $(self._armFavoriteItem(doc)).data('anchor',  {col: doc.collectionId, doc: doc.id}).appendTo(self.$favoriteItems);
        });
      });
    });
  },

  _armSidebarItem(item){
    var $item = $('<li class="nav-item">\
          <a class="sidebar-link document">\
            <span class="icon-holder">\
              <i></i>\
            </span>\
            <span class="title"></span>\
          </a>\
        </li>');
    $('.icon-holder>i', $item).addClass(item.iconClass).addClass(item.iconColor);
    $('.title', $item).html(item.title);    
    $item.data('anchor', {col: item.collectionId, doc: item.id});
    return $item;
  },

  _armSidebar: function(){
    var o = this.options, self = this, items = _.cloneDeep(o.page.sidebarItems);
    currentDomain.mgetDocuments(items, function(err, docs){
      _.each(docs, function(doc){
        var item = _.filter(items, function(i) { return i.collectionId == doc.collectionId && i.id == doc.id;});
        self._armSidebarItem(_.merge(item[0], {iconClass: doc._meta.iconClass||'ti-file', title: doc.title}))
            .insertBefore(self.$favorites);
      });
    });
  },

  _setOption: function(key, value){
    var o = this.options, self = this;
    if(key === "anchor" && jsonPatch.compare(o.anchor, value).length > 0){
      function callback(err, doc){
        if(err) return console.error(err);
        self.options.anchor = value;
        self.element.trigger("history", {anchor:value});
      }

      if(value.col == '.metas' && value.act == 'new'){
        this._createDocument(value.dom||o.page.domainId, value.doc, callback);
      }else{
        this._loadDocument(value.dom||o.page.domainId, value.col, value.doc, value.act, value.opts, callback);
      }
    } else if(key === 'client'){
      localStorage.setItem('token', client.getToken());
    }

    this._super(key, value);
  },

  _createDocument: function(domainId, metaId, callback){
    var o = this.options, client = o.page.getClient();
    Loader.createDocument(client, this.$mainContent, domainId, metaId, callback);
  },

  _loadDocument: function(domainId, collectionId, documentId, actionId, opts, callback){
    var o = this.options, client = o.page.getClient(), opts = opts ||{};
    Loader.loadDocument(client, this.$mainContent, domainId, collectionId, documentId, actionId, opts, callback);
  },

  _loadNewDialog: function(){
    var self = this;
    import(/* webpackChunkName: "new-dialog" */ 'new-dialog/new-dialog').then(({default: nd}) => {
      $('<div/>').newdialog({
        $anchor: this.$newDocumentBtn,
        domain: currentDomain
      }).newdialog('show');
    });
  },

  _loadView: function(domain, viewId, actId, opts){
    var o = this.options, self = this;
    domain.getView(viewId, function(err, view){
      if(actId){
        var action = _.find(view.actions, function(act){return act.plugin.name == actId});
        Loader.load(action.plugin, function(){
          $('<div/>').appendTo(self.$mainContent.empty())[action.plugin.name]({
            view: view,
            token: o.domain.getClient().getToken(),
            url: "http://localhost:8000/upload-files/"
          });
        });
      } else {
        import(/* webpackChunkName: "view" */ 'view/view').then(() => {
          $("<div/>").appendTo(self.$mainContent.empty()).view({
            domain: domain,
            view: view
          });
        });
      }
    });
  },

  _onClientChanged: function(event, client){
    this.option('client', client);
  }
    
});
