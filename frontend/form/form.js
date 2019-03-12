import * as $ from 'jquery';

import 'bootstrap';
import _ from 'lodash';
import moment from 'moment';

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.urianchor';

import validate from "validate.js";
import jsonPatch from "fast-json-patch";
import uuidv4 from 'uuid/v4';
import JSONEditor from 'jsoneditor/dist/jsoneditor';

import 'select/select'

import './form.scss';
import formHtml from './form.html';

$.widget("nm.form", {
  options:{
    constraints:{}
  },

  _create: function() {
    var o = this.options, self = this, client = o.document.getClient();

    this._addClass('nm-form', 'container-fluid');
    this.element.html(formHtml);

    this.$formHeader = $('.form-header', this.element),
    this.$actions = $('.actions', this.$formHeader);
    this.$actionMoreMenu = $('.more>.dropdown-menu', this.$actions);
    this.$itemSaveAs = $('.dropdown-item.save-as', this.$actionMoreMenu);
    this.$saveBtn =$('.save.btn', this.$actions);
    this.$cancelBtn = $('.cancel.btn', this.$actions);

    this.$formTitle = $('h4', this.$formHeader),
    this.$formTitle.html(o.document.title||o.document.id);

    this.$formContent = $('.form-content', this.element),

    this.$saveAsModel = $('#save-as', this.$formHeader);
    this.$titleInput = $('input[name="title"]', this.$saveAsModel),
    this.$formTag = $('form.save-as', this.$saveAsModel),
    this.$domain = $('div.domain', this.$saveAsModel),
    this.$collection = $('div.collection', this.$saveAsModel),
    this.$id = $('input[name="id"]', this.$saveAsModel),
    this.$title = $('input[name="title"]', this.$saveAsModel),
    this.$submitBtn = $('.btn.submit', this.$saveAsModel),
    this.$toolbox = $('.form-toolbox', this.$form),

    this.jsonEditor = new JSONEditor(this.$formContent.get(0), {
      mode: 'code',
      modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
      onEditable: function (node) {
        switch (node.field) {
          case 'id':
            return false;
          case 'title':
            return {
              field: false,
              value: true
            };
          default:
            return true;
        }
      },
      onChangeText: function (jsonString) {
        var json = null;
        try {json = self.jsonEditor.get()}catch(e){}
        if(json){
          o.document.replace(json);
          self._refreshHeader();
        }
      },
      onError: function (err) { console.log(err.toString());},
      onModeChange: function (newMode, oldMode) {
        console.log('Mode switched from', oldMode, 'to', newMode);
      }
    }, o.document);

    this._refreshHeader();

    this.$saveAsModel.on('show.bs.modal', function () {
      if(!self.$domain.data("nm-select")){
        self.$domain.select({
          title: 'domain',
          mode: 'single',
          menuItems: function(filter, callback){
            client.Domain.find({}, function(err, domains){
              if(err) return console.log(err);
              var items = _.map(domains.domains, function(domain){
                return {label:domain['title']||domain['id'], value:domain['id']};
              });
              callback(items);
            });
          },
          onValueChanged: function(){
            self.collectionSelect.reset();
          }
        });
      }
      
      if(!self.$collection.data('nm-select')){
        self.$collection.select({
          title: 'collection',
          mode: 'single',
          menuItems: function(filter, callback){
            var selectedDomains = self.$domain.select('option', 'selectedItems');
            if(selectedDomains[0]){
              client.Domain.get(selectedDomains[0].value, function(err, domain){
                domain.findCollections({}, function(err, collections){
                  if(err) return console.log(err);
                  var items = _.map(collections.collections, function(collection){
                    return {label:collection['title']||collection['id'], value:collection['id']};
                  });
                  callback(items);
                });
              });
            }else{
              callback([]);
            }
          }
        });        
      }

      self.$id.val(uuidv4());
    });

    this.$saveAsModel.on('shown.bs.modal', function () {
      self.$titleInput.val('');
      self.$titleInput.trigger('focus')
    });

    this._on(this.$saveBtn, {click: this.save});
    this._on(this.$itemSaveAs, {click: this._onItemSaveAs});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$submitBtn, {click: this._onSubmit});
    this._on(this.$formTag, {submit: this._onSubmit});
  },

  _refreshHeader: function(){
    var o = this.options, doc = o.document;
    this.$formTitle.html(doc.title||doc.id);    

    if(this._isDirty()){
      this.$saveBtn.show();
      this.$cancelBtn.show();
    }else{
      this.$saveBtn.hide();
      this.$cancelBtn.hide();
    }
  },

  _isDirty: function(){
    var o = this.options;
    return o.document.isDirty();
  },

  save: function(){
    var o = this.options, self = this;
    if(this._isDirty()){
      o.document.save(function(err, result){
        if(err) return console.log(err);
        self._refreshHeader();
      });
    }
  },

  saveAs: function(){
    var o = this.options, self = this, client = o.document.getClient(), errors = validate(this.$formTag, o.constraints);
    if (errors) {
      console.log(errors);
    } else {
      var values = validate.collectFormValues(this.$formTag, {trim: true}), 
          docInfo = _.cloneDeep(o.document),
          domainId = this.$domain.select('option','selectedItems')[0].value, 
          collectionId = this.$collection.select('option','selectedItems')[0].value;
      client.Domain.get(domainId, function(err1, domain){
        domain.getCollection(collectionId, function(err2, collection){
          delete docInfo.id;
          docInfo.title = values.title;
          collection.createDocument(values.id, docInfo, function(err3, doc){
            if(err3) return console.log(err3);
            self.$saveAsModel.modal('toggle');
            self.option('document', doc);
          });
        });
      });
    }
  },

  _onItemSaveAs: function(evt){
    this.$saveAsModel.modal('toggle');
  },

  _onCancel: function(){
    var o = this.options;
    o.document.cancel();
    this.jsonEditor.set(o.document);
    this._refreshHeader();
  },

  _onSubmit: function(evt){
    evt.preventDefault();
    evt.stopPropagation();

    this.saveAs();
  },

  _setOption: function( key, value ) {
    var o = this.options;
    this._super( key, value );
    if ( key === "document" ) {
      this.jsonEditor.set(o.document);
      this._refreshHeader();
    }
  },

  _destroy: function(){
    this.element.empty();    
  }
});