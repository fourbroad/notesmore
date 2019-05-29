import * as $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import validate from "validate.js";
import jsonPatch from "fast-json-patch";
import uuidv4 from 'uuid/v4';
import Loader from 'core/loader';
import formHtml from './form.html';
import ace from 'brace'; 
import utils from 'core/utils';

import './form.scss';
import 'bootstrap';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import 'brace/mode/json';
import 'brace/theme/iplastic';
import 'brace/ext/searchbox';
// import 'brace/ext/error_marker';
// import 'brace/ext/beautify';
// import 'brace/ext/keybinding_menu';
// import 'brace/ext/linking';
// import 'brace/ext/statusbar';


$.widget("nm.form", {

  options:{
    isNew: false,
    constraints:{},
    i18n:{
      'zh-CN':{
        save: "保存",
        saveAs: "另存为",
        wait: "请稍等...",
        cancel: "取消",
        delete:　"删除"
      }
    }
  },

  _create: function() {
    let o = this.options, _this = this, client = o.document.getClient();

    this._addClass('nm-form', 'container-fluid');
    this.element.html(formHtml);

    if(!o.isNew){
      this.clone = _.cloneDeep(o.document);
    }

    this.$formHeader = $('.form-header', this.element),
    this.$icon = $('.icon', this.$formHeader);
    this.$favorite = $('.favorite', this.$viewHeader);
    this.$actions = $('.actions', this.$formHeader);
    this.$actionMoreMenu = $('.more>.dropdown-menu', this.$actions);
    this.$saveBtn =$('.save.btn', this.$actions);
    this.$cancelBtn = $('.cancel.btn', this.$actions);
    this.$formTitle = $('h4', this.$formHeader),
    this.$formContent = $('.form-content', this.element),
    this.$toolbox = $('.form-toolbox', this.$form),

    this.jsonEditor = ace.edit(this.$formContent.get(0));
    this.jsonEditor.$blockScrolling = Infinity
    this.jsonEditor.setTheme('ace/theme/iplastic');
    this.jsonEditor.getSession().setMode('ace/mode/json');
    this.jsonEditor.getSession().setOptions({
      tabSize:2
    });

    this.jsonEditor.setValue(JSON.stringify(o.document, null, 2), -1);
    this.jsonEditor.clearSelection();
    this.enableChange = true;
    this.jsonEditor.getSession().on('change', function(delta) {
      if(_this.enableChange){
        let json;
        try { json =  JSON.parse(_this.jsonEditor.getValue()); }catch(e){}
        if(json){
          o.document = o.document.replace(json);
          _this._refreshHeader();
        }
      }
    });

    this._on(this.$actionMoreMenu, {
      'click li.dropdown-item.save-as': this._onSaveAs,
      'click li.dropdown-item.delete' : this._onDeleteSelf      
    });
    this._on(this.$saveBtn, {click: this._onSave});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$favorite, {click: this._onFavorite});    

    this._refresh();
    this.jsonEditor.focus();
  },

  _onFavorite: function(e) {
    let o = this.options, doc = o.document, _this = this, client = doc.getClient(), currentUser = client.currentUser, Profile = client.Profile;
    Profile.get(doc.domainId, currentUser.id, function(err, profile){
      if(err) return console.error(err);
      let oldFavorites = _.cloneDeep(profile.favorites), patch,
          index = _.findIndex(profile.favorites, function(f) {return f.domainId==doc.domainId&&f.collectionId==doc.collectionId&&f.id==doc.id;});
      if(index >= 0){
        patch = [{
          op:'remove',
          path: '/favorites/'+index            
        }];
      } else {
        patch = [profile.favorites ? {
          op:'add',
          path:'/favorites/-',
          value:{domainId:doc.domainId, collectionId: doc.collectionId, id: doc.id}
        } : {
          op:'add',
          path:'/favorites',
          value:[{domainId:doc.domainId, collectionId: doc.collectionId, id: doc.id}]
        }];
      }
      profile.patch({patch: patch}, function(err, profile){
        if(err) return console.error(err);
        _this._refreshFavorite(profile.favorites);
        _this.element.trigger('favoritechanged', [profile.favorites, oldFavorites]);
      });
    });
  },

  _onDeleteSelf: function(e){
    let doc = this.options.document, _this = this, {User, Profile, Collection} = doc.getClient();
    doc.delete(function(err, result){
      if(err) return console.error(err);
      User.get(function(err, user){
        if(err) return console.error(err);
        Profile.get(doc.domainId, user.id, function(err, profile){
          if(err) return console.error(err);
          let index = _.findIndex(profile.favorites, function(f) {return f.domainId==doc.domainId&&f.collectionId==doc.collectionId&&f.id==doc.id;}),
              oldFavorites = _.cloneDeep(profile.favorites);
          if(index >= 0){
            profile.patch({patch:[{
              op:'remove',
              path: '/favorites/'+index            
            }]}, function(err, profile){
              if(err) return console.error(err);
              _this.element.trigger('favoritechanged', [profile.favorites, oldFavorites]);
            });
          }
        });
      });

      Collection.get(doc.domainId, doc.collectionId, function(err, collection){
        if(err) return console.error(err);
        collection.refresh(function(err, result){
          if(err) console.error(err);
          _this.$actionMoreMenu.dropdown('toggle').trigger('documentdeleted', doc);
        });
      })
    });

    e.stopPropagation();
  },

  _refresh: function(){
    let o = this.options, doc = o.document, _this = this, client = doc.getClient(), currentUser = client.currentUser;
    utils.checkPermission(doc.domainId, currentUser.id, 'patch', doc, function(err, result){
      if(!result){
        _this.jsonEditor.setReadOnly(true);
      }
    });
    this._refreshFavorite();
    this._armActionMoreMenu();
    this._refreshHeader();
  },

  _refreshFavorite: function(favorites){
    let o = this.options;
    if(o.isNew){
      this.$favorite.hide();
    } else {
      let _this = this, doc = o.document,　client = doc.getClient(), currentUser = client.currentUser, Profile = client.Profile;
      this.$favorite.show();
      
      function doRefreshFavorite(favorites){
        let $i = $('i', _this.$favorite).removeClass();
        if(_.find(favorites, function(f) {return f.domainId==doc.domainId&&f.collectionId==doc.collectionId&&f.id==doc.id;})){
          $i.addClass('c-red-500 fa fa-star-o');
        }else{
          $i.addClass('fa fa-star-o');
        }
      }

      if(favorites){
        doRefreshFavorite(favorites);
      } else {
        Profile.get(doc.domainId, currentUser.id, {refresh: true}, function(err, profile){
          if(err) return console.error(err);
          doRefreshFavorite(profile.favorites);
        });
      }
    }
  },

  _refreshHeader: function(){
    let o = this.options, doc = o.document,　docLocale = doc.get(o.locale);
    this.$formTitle.html(docLocale.title||docLocale.id);    
    $('i', this.$icon).removeClass().addClass(doc._meta.iconClass||'fa fa-file-text-o');

    if(this._isDirty()){
      this.$saveBtn.html(this._i18n('save', 'Save')).prop("disabled", false);
      this.$saveBtn.show();
      this.$cancelBtn.show().html(this._i18n('cancel', 'Cancel')).show();
    }else{
      this.$saveBtn.hide();
      this.$cancelBtn.hide();
    }
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
  },

  _getPatch: function(){
    return jsonPatch.compare(this.clone,  this.options.document);
  },

  _isDirty: function(){
    return this.options.isNew || this._getPatch().length > 0
  },

  _onSave: function(e){
    let o = this.options, doc = o.document;
    this.$saveBtn.html(`<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>${this._i18n("wait","Please wait...")}`).prop( "disabled", true);
    this.$cancelBtn.hide();
    if(o.isNew){
      this.saveAs(doc.id||uuidv4(), doc.title, ()=>{});
    }else{
      this.save();
    }
  },

  save: function(){
    let o = this.options, _this = this;
    if(this._isDirty()){
      o.document.patch({patch: this._getPatch()}, function(err, document){
        if(err) return console.error(err);

  	    _.forOwn(o.document,function(v,k){try{delete o.document[k]}catch(e){}});
        _.merge(o.document, document);

        _this.clone = _.cloneDeep(document);

        _this._setJsonEditorValue();
        _this._refresh();
      });
    }
  },

  saveAs: function(id, title, callback){
    let o = this.options, _this = this, client = o.document.getClient(), errors = validate(this.$formTag, o.constraints);
    if (errors) {
      console.log(errors);
    } else {
      let doc = o.document, docInfo = _.cloneDeep(doc), domainId = doc.domainId, collectionId = doc.collectionId, params = [];
      docInfo.title = title;
      switch(collectionId){
        case '.domains':
        case '.users':
          params = [id, docInfo];
          break;
        case '.collections':
        case '.actions':
        case '.forms':
        case '.groups':
        case '.metas':
        case '.pages':
        case '.profiles':
        case '.roles':
        case '.views':
          params = [domainId, id, docInfo];
          break;
        default:
          params = [domainId, collectionId, id, docInfo];
      }
      params.push(function(err, doc){
        if(err) return console.error(err);
        let isNew = o.isNew;
        o.isNew = false;
        o.actionId = 'edit';
        o.document = doc;
        _this.clone = _.cloneDeep(doc);
        _this._setJsonEditorValue();
        _this._refresh();
        callback ? callback(null, true) : console.log(true);
        _this.closeIdTitleDialog();
        _this.element.trigger('documentcreated', [doc, isNew]);
      });
      
      o.document.constructor.create.apply(o.document.constructor, params);
    }
  },

  _onShowSaveAsModel: function(e){
    let o = this.options, doc = o.document;
    this.$id.val(doc.id || uuidv4());
    this.$titleInput.val(doc.title||'');
  },

  _armActionMoreMenu: function(){
    let o = this.options, _this = this, doc = o.document, client = doc.getClient(), currentUser = client.currentUser;
    this.$actionMoreMenu.empty();
    $('<li class="dropdown-item save-as">'+ this._i18n('saveAs','Save as ...')+'</li>').appendTo(this.$actionMoreMenu);

    utils.checkPermission(doc.domainId, currentUser.id, 'delete', doc, function(err, result){
      if(result){
        $('<li class="dropdown-item delete">' + _this._i18n('delete','Delete') + '</li>').appendTo(_this.$actionMoreMenu);
      }
    });

    if(!o.isNew){
      Loader.armActions(client, this, o.document, this.$actionMoreMenu, o.actionId, o.locale);
    }
  },

  _onSaveAs: function(evt){
    let o = this.options, docLocale = o.document.get(o.locale), _this = this;
    this.showIdTitleDialog({
      modelTitle:_.at(docLocale, 'toolbox.saveAs')[0] || 'Save as...',
      id: docLocale.id || uuidv4(), 
      title: docLocale.title || '', 
      locale: o.locale,
      submit:function(e, data){
      _this.saveAs(data.id, data.title);
    }});
  },

  _onCancel: function(){
    let o = this.options;
    if(o.isNew){
      this.element.trigger('cancelaction');
    }else{
      let doc = o.document;
   	  _.forOwn(doc,function(v,k){try{delete doc[k]}catch(e){}});
      _.merge(doc, this.clone);
      this._setJsonEditorValue();
      this._refresh();
    }
  },

  _setOptions: function( options ) {
    let o = this.options, _this = this, isNew = options.isNew, document = options.document;
    this._super(options);
    if(document){
      if(isNew){
        delete _this.clone;
      }else{
        o.isNew = false;
        _this.clone = _.cloneDeep(document);
      }
      _this._setJsonEditorValue();
      _this._refresh();
    }
  },

  _setJsonEditorValue(){
    let o = this.options;
    this.enableChange = false;
    this.jsonEditor.setValue(JSON.stringify(o.document, null, 2), -1);
    this.jsonEditor.clearSelection();
    this.jsonEditor.focus();
    this.enableChange = true;
  },

  showIdTitleDialog: function(options){
    let _this = this;
    import(/* webpackChunkName: "idtitle-dialog" */ 'idtitle-dialog/idtitle-dialog').then(({default: itd}) => {
      _this.idtitleDialog = $('<div/>').idtitledialog(options).idtitledialog('show').idtitledialog('instance');
    });
    return this;
  },

  closeIdTitleDialog: function(){
    this.idtitleDialog && this.idtitleDialog.close();
    return this;
  },

  _destroy: function(){
    this.element.empty();    
  }
});