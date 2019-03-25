import * as $ from 'jquery';
import 'bootstrap';
import _ from 'lodash';
import moment from 'moment';

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.event.gevent';
import 'jquery.event.ue';
import 'jquery.urianchor';

import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import * as jsonPatch from "fast-json-patch";

import 'account/account';
import Loader from 'core/loader';

import workbenchHtml from './workbench.html';

$.widget('nm.workbench', {
  options: {
    content:{
      col: '.pages',
      doc: '.dashboard'
    }
  },

  _create: function(){
    var o = this.options, self = this, client = o.page.getClient(), c = o.content, Domain = client.Domain;

    this._addClass("nm-workbench");
    this.element.html(workbenchHtml);

    this.$mainContent = $("#mainContent", this.element);
 
    this.ps = new PerfectScrollbar($('.scrollable', this.element)[0],{suppressScrollX:true, wheelPropagation: true});

    this.$viewList = $('.favorite-views', this.element);
    this.$newDocumentBtn = $('li.new-document', this.element);

    $('<li/>').appendTo($('.page-container .nav-right', this.element)).account({client: client});

    this._on(this.$newDocumentBtn, {click: this._loadNewDialog});
    this._on(this.$mainContent, {
      'click .search-toggle': function(e){
        $('.search-box, .search-input', self.element).toggleClass('active');
        $('.search-input input', self.element).focus();
        e.preventDefault();
      },
      'docclick': function(e, doc){
        var anchor = {col: doc.collectionId, doc: doc.id};
        if(anchor.col != '.pages' || anchor.doc != '.workbench'){
          if(doc.domainId != currentDomain.id){
            anchor.dom = doc.domainId;
          }
          self.option('content', anchor);
          e.stopPropagation();
        }
      },
      "docctrlclick": function(e, doc) {
        var anchor = {col:doc.collectionId, doc:doc.id, act:'edit'};
        if(doc.domainId != currentDomain.id){
          anchor.dom = doc.domainId;
        }
        this.option('content', anchor);
        e.stopPropagation();
      },
      "actionclick": function(e, anchor){
        this.option('content', anchor);
        e.stopPropagation();
      }
    });

    // Sidebar links
    $('.sidebar .sidebar-menu', this.element).on('click','li>a.document', function () {
      const $this = $(this), $parent = $this.parent(), id = $parent.attr('id');
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

      var paths = id.split('~');
      self.option('content',{col: paths[0], doc: paths[1]});
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

    this._loadDocument(c.dom||o.page.domainId, c.col, c.doc, c.act, c.opts, function(err, doc){
      self.element.trigger("history", {content:c});
    });

    $.gevent.subscribe(this.element, 'clientChanged',  $.proxy(this._onClientChanged, this));

    Domain.get(o.page.domainId, function(err, domain){
      domain.findViews({}, function(err, views){
        if(err) return console.log(err);
        _.each(views.views, function(view){
          $(self._armViewListItem(view.collectionId + '~' + view.id, view.title||view.id)).data('item', view).appendTo(self.$viewList);
        });
      });
    });
  },

  _armViewListItem: function(id, title){
    var item = String() + '<li id="' + id + '" class="view nav-item"><a class="sidebar-link document">' + title + '</a></li>'
    return item;
  },

  _setOption: function(key, value){
    var o = this.options, self = this;
    if(key === "content"){
      if(jsonPatch.compare(o.content, value).length > 0){
        this._loadDocument(value.dom||o.page.domainId, value.col, value.doc, value.act, value.opts, function(err, doc){
//           self.ps.update();
          self.element.trigger("history", {content:value});
        });
        this._super(key, value);
      }
      return;
    } else if(key === 'client'){
      localStorage.setItem('token', client.getToken());
    }

    this._super(key, value);
  },

  _loadDocument: function(domainId,collectionId, documentId, actionId, opts, callback){
    var o = this.options, client = o.page.getClient(), opts = opts ||{};
    Loader.loadDocument(client, this.$mainContent, domainId, collectionId, documentId, actionId, opts, callback);
  },

  _loadNewDialog: function(){
    var self = this;
    import(/* webpackChunkName: "new-dialog" */ 'new-dialog/new-dialog').then(({default: nd}) => {
      $('<div/>').newdialog({
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
