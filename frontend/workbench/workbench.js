import './workbench.scss';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import jwtDecode from 'jwt-decode';
import Loader from 'core/loader';
import jsonPatch from "fast-json-patch";
import workbenchHtml from './workbench.html';

import PerfectScrollbar from 'perfect-scrollbar';

import 'bootstrap';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'notification/notification';

$.widget('nm.workbench', {
  options: {
    anchor:{
      col: '.pages',
      doc: '.dashboard'
    },
    i18n: {
      'zh-CN':{
        profile: "设置",
        logout: "退出登录"
      }
    }
  },

  _create: function(){
    let o = this.options, _this = this, client = o.page.getClient(), anchor = o.anchor;

    this._addClass("nm-workbench");
    this.element.html(workbenchHtml);

    this.$workbench = $(".workbench", this.element);
    this.$workbenchTitle = $(".workbench-title", this.element);
    this.$logoImg = $('.logo img', this.element);
    this.$slogan = $(".slogan", this.element);
    this.$mainContainer = $('.main-container', this.$workbench);
    this.$mainContent = $("#mainContent", this.$mainContainer);
    this.$avatar = $('.avatar', this.element);
    this.$nickname = $('.nickname', this.element);
    this.$profileMenu = $('.profile-menu', this.element);
    this.$profile = $('li.profile', this.$profileMenu);
    this.$signOff = $('li.sign-off', this.$profileMenu);

    this.ps = new PerfectScrollbar(this.$mainContainer[0],{suppressScrollX:true, wheelPropagation: true});

    this.$favorites = $('li.favorites', this.$workbench);
    this.$favoritesTitle = $('.title', this.$favorites);
    this.$badge = $('.badge', this.favorites);
    this.$favoriteItems = $('.favorite-item-container', this.$favorites);

    this.$newDocumentBtn = $('li.new-document', this.$workbench);
//     $('<li class="notifications dropdown"/>').prependTo($('.page-container .nav-right', this.$workbench)).notification();
//     $('<li/>').appendTo($('.page-container .nav-right', this.$workbench)).account({client: client, locale: o.locale});

    this._on(this.$newDocumentBtn, {click: this._loadNewDialog});
    this._on(this.$workbench, {
      'click .search-toggle': function(e){
        _this.option('anchor', {col:'.views', doc:'.searchDocuments'});
        e.preventDefault();
      },
      "createdocument": function(e, meta){
        let anchor = {col:meta.collectionId, doc: meta.id, act: 'new'}
        if(meta.domainId != o.page.domainId){
          anchor.dom = meta.domainId
        }
        _this.option('anchor', anchor);
        e.stopPropagation();
      },
      'documentcreated': function(e, doc, isNew){
        let anchor = {col: doc.collectionId, doc: doc.id};
        if(doc.domainId != o.page.domainId){
          anchor.dom = doc.domainId;
        }

        this.options.anchor = anchor;
        this.$workbench.trigger("history", [{anchor:anchor}, isNew]);

        e.stopPropagation();
      },
      'docclick': function(e, doc){
        let anchor = {col: doc.collectionId, doc: doc.id};
        if(anchor.col != '.pages' || anchor.doc != '.workbench'){
          if(doc.domainId != o.page.domainId){
            anchor.dom = doc.domainId;
          }
          _this.option('anchor', anchor);
          e.stopPropagation();
        }
      },
      "docctrlclick": function(e, doc) {
        let anchor = {col:doc.collectionId, doc:doc.id, act:'edit'};
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
      "favoritechanged": function(e, favorites, oldFavorites){
        _this._refreshFavorites(favorites);
      }
    });

    // Sidebar links
    $('.sidebar .sidebar-menu', this.$workbench).on('click','li>a.document', function () {
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
        _this.option('anchor', anchor);  
      }
    });

    /**
     * Wait untill sidebar fully toggled (animated in/out)
     * then trigger window resize event in order to recalculate
     * masonry layout widths and gutters.
     */
    $('.sidebar-toggle', this.$workbench).on('click', e => {
      _this.element.toggleClass('is-collapsed');
      setTimeout(() => {
        window.dispatchEvent(window.EVENT);
      }, 300);
      e.preventDefault();
    });

    function callback(err, doc){
      if(err) {
        _this.element.trigger('documenterror');
        return console.error(err); 
      }
      _this.element.trigger("history", {anchor: anchor});
    }

    if(anchor.col == '.metas' && anchor.act == 'new'){
      this._createDocument(anchor.dom||o.page.domainId, anchor.doc, callback);
    }else{
      this._loadDocument(anchor.dom||o.page.domainId, anchor.col, anchor.doc, anchor.act, anchor.opts, callback);
    }

    this._on(this.$signOff, {click: this._onSignoff});
    this._on(this.$profile, {click: this._onProfile});

    this._loggedInListener = $.proxy(this._onLoggedIn, this);
    this._loggedOutListener = $.proxy(this._onLoggedOut, this);
    client.on("loggedIn", this._loggedInListener);
    client.on("loggedOut", this._loggedOutListener);

    this.refresh();
  },

  _onProfile: function(){
    let currentUser = this.options.page.getClient().currentUser;
    this.option('anchor',{col:'.profiles', doc: currentUser.id});
  },

  _onSignoff: function(event){
    this.options.page.getClient().logout();
  },

  _refreshFavorites: function(favorites){
    let o = this.options, _this = this, domainId = o.page.domainId, client = o.page.getClient(), 
      { Profile, Document } = client,  currentUser = client.currentUser;
    this.$favoriteItems.empty();
    
    function doRefreshFavorites(favorites){
      _this.$badge.html((favorites && favorites.length)||0);
      _.each(favorites, function(f){
        Document.get(f.domainId, f.collectionId, f.id, function(err, doc){
          if(err) return console.error(err);
          doc = doc.get(o.locale);
          $(_this._armSidebarItem({collectionId:doc.collectionId, id:doc.id, iconClass: doc._meta.iconClass||'ti-file', title: doc.title}))
              .data('anchor',  {col: doc.collectionId, doc: doc.id}).appendTo(_this.$favoriteItems);
        });
      });
    }

    if(favorites){
      doRefreshFavorites(favorites);
    } else {
      Profile.get(domainId, currentUser.id, {refresh: true}, function(err, profile){
        if(err) return console.error(err);
        doRefreshFavorites(profile.favorites);
      });
    }
  },

  _armSidebarItem(item){
    let $item = $('<li class="nav-item">\
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

  _refreshSidebar: function(){
    let o = this.options, _this = this, items = _.cloneDeep(o.page.sidebarItems);
    currentDomain.mgetDocuments(items, function(err, docs){
      _.each(docs, function(doc){
        let item;
        doc = doc.get(o.locale);
        item = _.filter(items, function(i) { return i.collectionId == doc.collectionId && i.id == doc.id;});
        _this._armSidebarItem(_.merge(item[0], {iconClass: doc._meta.iconClass||'ti-file', title: doc.title}))
            .insertBefore(_this.$favorites);
      });
    });
  },

  _setOption: function(key, value){
    let o = this.options, _this = this;
    if(key === "anchor" && jsonPatch.compare(o.anchor, value).length > 0){
      function callback(err, doc){
        if(err) {
          _this.element.trigger('documenterror');
          return console.error(err); 
        }  
        _this.options.anchor = value;
        _this.ps.update();
        _this.element.trigger("history", {anchor:value});
      }

      if(value.col == '.metas' && value.act == 'new'){
        this._createDocument(value.dom||o.page.domainId, value.doc, callback);
      }else{
        this._loadDocument(value.dom||o.page.domainId, value.col, value.doc, value.act, value.opts, callback);
      }
    }

    this._super(key, value);
  },

  _createDocument: function(domainId, metaId, callback){
    let o = this.options, client = o.page.getClient();
    Loader.createDocument(client, this.$mainContent, domainId, metaId, o.locale, callback);
  },

  _loadDocument: function(domainId, collectionId, documentId, actionId, opts, callback){
    let o = this.options, client = o.page.getClient();
    opts = opts ||{};
    Loader.loadDocument(client, this.$mainContent, domainId, collectionId, documentId, actionId, opts, o.locale, callback);
  },

  _loadNewDialog: function(){
    let _this = this, o = this.options;
    import(/* webpackChunkName: "new-dialog" */ 'new-dialog/new-dialog').then(({default: nd}) => {
      $('<div/>').newdialog({
        client: o.page.getClient(),
        $anchor: this.$newDocumentBtn,
        domain: currentDomain,
        locale: o.locale
      }).newdialog('show');
    });
  },

  _loadView: function(domain, viewId, actId, opts){
    let o = this.options, _this = this;
    domain.getView(viewId, function(err, view){
      if(actId){
        let action = _.find(view.actions, function(act){return act.plugin.name == actId});
        Loader.load(action.plugin, function(){
          $('<div/>').appendTo(_this.$mainContent.empty())[action.plugin.name]({
            view: view,
            token: o.domain.getClient().getToken(),
            url: "http://localhost:8000/upload-files/"
          });
        });
      } else {
        import(/* webpackChunkName: "view" */ 'view/view').then(() => {
          $("<div/>").appendTo(_this.$mainContent.empty()).view({
            domain: domain,
            view: view
          });
        });
      }
    });
  },

  refresh: function(){
    let o = this.options, page = o.page, client = page.getClient(), Domain = client.Domain, _this = this;
    Domain.get(page.domainId, function(err, domain){
      if(err) return console.error(err);
      let domainLocale = domain.get(o.locale), pageLocale = page.get(o.locale);
      _this.$workbenchTitle.html(domainLocale.title || pageLocale.title);
      _this.$logoImg.attr('src', domainLocale.logo || pageLocale.logo);
      _this.$slogan.html(pageLocale.slogan || domainLocale.slogan);
      _this.$favoritesTitle.html(_.at(o.page.get(o.locale),'favorites.title')[0]);
    });    

    this._refreshProfile();
    this._refreshSidebar();
    this._refreshFavorites();
  },

  _refreshProfile: function(){
    var o = this.options, _this = this, client = o.page.getClient(), User = client.User;
    User.get(function(err, user){
      if(err) return console.error(err);
      let userLocale = user.get(o.locale);
      if(userLocale.avatar){
        _this.$avatar.attr('src', userLocale.avatar);
      }
      
      _this.$nickname.text(userLocale.title || userLocale.id);
    });
    this.$profile.find('span.label').html(this._i18n('profile', 'Profile'));
    this.$signOff.find('span.label').html(this._i18n('logout', 'Logout'));
  },

  _onLoggedIn: function(){
    this.refresh();
  },

  _onLoggedOut: function(){
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
  },

  _destroy() {
    var o = this.options, client = o.page.getClient();
    this.element.empty();
    client.off("loggedIn", this._loggedInListener);
    client.off("loggedOut", this._loggedOutListener);

    clearInterval(this.interval);
  }  
    
});
