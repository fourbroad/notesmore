import * as $ from 'jquery';

import 'bootstrap';
import _ from 'lodash';
import moment from 'moment';

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.urianchor';

import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';

// import * as jsonPatch from 'fast-json-patch';
var jsonPatch = require('fast-json-patch');
import validate from "validate.js";

import utils from 'core/utils';
import Loader from 'core/loader';

import 'select/select';
import 'numeric-range/numeric-range';
import 'datetime-range/datetime-range';
import 'full-text/full-text';

import './view.scss';
import viewHtml from './view.html';

$.widget("nm.view", {

  options:{
    constraints: {
      title: {
        presence: true
      }
    }
  },

  _create: function() {
    var o = this.options, self = this;

    this._addClass('nm-view', 'container-fluid');
    this.element.html(viewHtml);
    
    this.$viewContainer = $('.view-container', this.element);
    this.$viewHeader = $('.view-header', this.element);
    this.$actions = $('.actions', this.$viewHeader);
    this.$actionMoreMenu = $('.more>.dropdown-menu', this.$actions);
    this.$itemSaveAs = $('.dropdown-item.save-as', this.$actionMoreMenu);
    this.$saveBtn =$('.save.btn', this.$actions);
    this.$cancelBtn = $('.cancel.btn', this.$actions);

    this.$viewTitle = $('h4', this.$viewHeader);

    this.$viewTable = $('.view-table', this.element);
    this.$saveAsModel = $('#save-as', this.$viewHeader);
    this.$titleInput = $('input[name="title"]', this.$saveAsModel);
    this.$form = $('form.new-view', this.$saveAsModel);
    this.$submitBtn = $('.btn.submit', this.$saveAsModel);
    this.$searchContainer = $('.search-container', this.$view);

    this._refresh();

    this.$viewContainer.on('click show.bs.dropdown', 'table.view-table tbody>tr', function(evt){
      var $this = $(this);
      if(evt.type == 'show'){
        if(!self._isRowActive($this)){
          self._setRowActive($this);
        }
        self._showDocMenu($(evt.target).find('.dropdown-menu'), self.table.row(this).data());
      } else {
        if(self._isRowActive($this)){
          self._clearRowActive($this);
        } else {
          self._setRowActive($this);
        }
      }
    });

    this.$viewContainer.on('click','table.view-table li.dropdown-item', function(evt){
      var $this = $(this), $tr = $this.parents('tr'), v = self.table.row($tr).data();
      v.delete(function(err, result){
        setTimeout(function(){
          self.table.draw(false);
        }, 1000);
      });

      evt.stopPropagation();
    });

    this.$viewContainer.on('click','table.view-table a', function(evt){
      var $this = $(this), $tr = $this.parents('tr'), doc = self.table.row($tr).data();
      if(evt.ctrlKey){
        self.element.trigger('docctrlclick', doc);
      }else{
        self.element.trigger('docclick', doc);
      }
      evt.preventDefault();
      evt.stopPropagation();
    });

    this.$saveAsModel.on('shown.bs.modal', function () {
      self.$titleInput.val('');
      self.$titleInput.trigger('focus')
    })    

    this._on(this.$saveBtn, {click: this.save});
    this._on(this.$itemSaveAs, {click: this._onItemSaveAs});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$submitBtn, {click: this._onSubmit});
    this._on(this.$form, {submit: this._onSubmit});
  },

  _refresh: function(){
    var o = this.options, self = this, view = o.view;
    this.$viewTitle.html(view.title||view.id);
    view.columns = view.columns || [{title: "Id", name: "id", data: "id", className: "id"}];
    view.searchColumns = view.searchColumns || [{title: "Id", name: "id", type: "keywords"}];

    $.each(view._meta.actions, $.proxy(function(i, action){
      var $li = $('<li class="dropdown-item"></li>').html(action.label).appendTo(this.$actionMoreMenu).data('action', action);
      this._on($li, {click:this._onLoadAction});
    }, this));

    this._refreshHeader();
    this._initSearchBar();

    if(this.table){
      this.table.destroy();
      this.$viewTable.remove();
      delete this.table;
    }

    this.$viewTable = $('<table class="table view-table table-striped table-hover" cellspacing="0" width="100%"></table>').insertAfter(this.$searchContainer);
    this.table = this.$viewTable.DataTable({
      dom: '<"top"i>rt<"bottom"lp><"clear">',
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],      
      processing: true,
      serverSide: true,
      columns: _.cloneDeep(view.columns),
      searchCols: this._armSearchCol(),
      order: (view.order&&JSON.parse(view.order))||[],
      columnDefs : [{
        targets:'_all',
        render:function(data, type, row, meta){
          var column = meta.settings.aoColumns[meta.col], text = data;
          switch(column.className){
            case 'id':
            case 'title':
              text = '<a href="#">'+ data||"" + '</a>';
              break;
            case 'datetime':
              var date = moment.utc(data);
              text = (date && date.isValid()) ? date.format('YYYY-MM-DD HH:mm:ss') : '';
              break;
            default:
              break;
          }
          return text;
        }
      },{
        targets: -1,
        width: "30px",
        data: null,
        defaultContent: '<button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button><ul class="dropdown-menu dropdown-menu-right"></ul>'
      }],
      sAjaxSource: "view",
      fnServerData: function (sSource, aoData, fnCallback, oSettings ) {
        var kvMap = self._kvMap(aoData), query = self._buildSearch(kvMap);
        view.findDocuments(query, function(err, docs){
          if(err) return console.log(err);
          fnCallback({
            "sEcho": kvMap['sEcho'],
            "iTotalRecords": docs.total,
            "iTotalDisplayRecords": docs.total,
            "aaData": docs.documents
          });
        });
      }
    });
  },

  _onLoadAction: function(e){
    var o = this.options, view = o.view, $li = $(e.target), action = $li.data('action');
    this.element.trigger('actionclick', {dom: view.getDomainId(), col: view.getCollectionId(), doc: view.id, act:action.id});    
  },

  _initSearchBar: function(){
    var o = this.options, self = this, view = o.view;
    this.$searchContainer.empty();
    _.each(view.searchColumns, function(sc){
      switch(sc.type){
        case 'keywords':
          $("<div/>").appendTo(self.$searchContainer).select({
            class:'search-item',
            btnClass:'btn-sm',
            mode: 'multi',
            selectedItems: sc.selectedItems,
            menuItems: function(filter, callback){
              view.distinctQuery(sc.name, filter, function(err4, docs){
                if(err4) return console.log(err4);
                var items = _.map(docs.documents, function(doc){
                  return {label:doc['title']||_.at(doc, sc.name)[0], value:_.at(doc, sc.name)[0]};
                });
                callback(items);
              });
            },
            render: function(selectedItems){
              var label = _.reduce(selectedItems, function(text, item) {
                var label;
                if(text == ''){
                  label = item.label;
                }else{
                  label = text + ',' + item.label;
                }
                return label;
              }, '');
              return label == '' ? sc.title + ":all" : label;
            },
            valueChanged: function(event, values){
              var sc2 = _.find(view.searchColumns, function(o){return o.name == sc.name});
              sc2.selectedItems = values.selectedItems;
              self.table.column(sc2.name+':name').search(_(sc2.selectedItems).map("value").filter().flatMap().value().join(',')).draw();
              self._refreshHeader();
            }
          });
          break;
        case 'numericRange':
          $("<div/>").appendTo(self.$searchContainer).numericrange({
            class:'search-item',
            btnClass:'btn-sm',
            title: sc.title,
            lowestValue: sc.lowestValue,
            highestValue: sc.highestValue,
            valueChanged: function(event, range){
              var sc2 = _.find(view.searchColumns, function(o){return o.name == sc.name});
              sc2.lowestValue = range.lowestValue;
              sc2.highestValue = range.highestValue;
              self.table.column(sc2.name+':name')
                .search(sc2.lowestValue||sc2.highestValue ? [sc2.lowestValue, sc2.highestValue].join(','):'')
                .draw();
              self._refreshHeader();
            }
          });
          break;
        case 'datetimeRange':
          $("<div/>").appendTo(self.$searchContainer).datetimerange({
            class:'search-item',
            btnClass:'btn-sm',
            title: sc.title,
            earliest: sc.earliest,
            latest: sc.latest,
            valueChanged: function(event, range){
              var sc2 = _.find(view.searchColumns, function(o){return o.name == sc.name});
              sc2.earliest = range.earliest;
              sc2.latest = range.latest;
              self.table.column(sc2.name+':name')
                .search(sc2.earliest||sc2.latest ? [sc2.earliest, sc2.latest].join(','):'')
                .draw();
              self._refreshHeader();
            }
          });
          break;
      }
    });

    $("<div/>").appendTo(this.$searchContainer).fulltextsearch({
      class: 'search-item',
      valueChanged: function(event, keyword){
        self.table.search(keyword.keyword).draw();
      }
    });
  },

  _armSearchCol: function(){
    var o = this.options, self = this, view = o.view;
    return _.reduce(view.columns, function(searchCols, col){
      var sc = _.find(view.searchColumns, {'name': col.name});
      if(sc){
        switch(sc.type){
          case 'keywords':
            searchCols.push({search:_(sc.selectedItems).map("value").filter().flatMap().value().join(',')});
            break;
          case 'numericRange':
            searchCols.push({search: sc.lowestValue||sc.highestValue ? [sc.lowestValue, sc.highestValue].join(','):''});
            break;
          case 'datetimeRange':
            searchCols.push({search: sc.earliest||sc.latest ? [sc.earliest, sc.latest].join(','):''});
            break;
        }
      }else{
        searchCols.push(null);
      }

      return searchCols;            
    },[]);
  },

  _refreshHeader: function(){
    if(this._isDirty()){
      this.$saveBtn.show();
      this.$cancelBtn.show();
    }else{
      this.$saveBtn.hide();
      this.$cancelBtn.hide();
    }
  },

  _isDirty: function(){    
    return this.options.view.isDirty();
  },

  _searchColumnType: function(name){
    var view = this.options.view;
    var index = _.findIndex(view.searchColumns, function(sc) { return sc.name == name;});
    return view.searchColumns[index].type;
  },

  _kvMap: function(aoData){
    return _.reduce(aoData, function(result, kv){result[kv.name] = kv.value; return result;},{});
  },

  _buildSearch: function(kvMap){
    var
      o = this.options, view = o.view,
      iColumns = kvMap['iColumns'], iDisplayStart = kvMap['iDisplayStart'], iSortingCols = kvMap["iSortingCols"],
      iDisplayLength = kvMap['iDisplayLength'], sSearch = kvMap['sSearch'], mustArray=[], 
      searchNames = (view.search && view.search.names)||[], sort = [];

    for(var i=0; i<iColumns; i++){
      var mDataProp_i = kvMap['mDataProp_'+i], sSearch_i = kvMap['sSearch_'+i], shouldArray = [], range;

      if(sSearch_i.trim() != ''){
        switch(this._searchColumnType(mDataProp_i)){
          case 'keywords':
            _.each(sSearch_i.split(','), function(token){
              if(token.trim() !=''){
                var term = {};
                term[mDataProp_i+'.keyword'] = token;
                shouldArray.push({term:term});
              }
            });
            break;
         case 'datetimeRange':
         case 'numericRange':
            var ra = sSearch_i.split(','), lv = ra[0], hv = ra[1];
            range = {};
            range[mDataProp_i]={};
            if(lv){
              range[mDataProp_i].gte = lv;
            }
            if(hv){
              range[mDataProp_i].lte = hv;
            }
            break;         
        }

        if(shouldArray.length > 0){
          mustArray.push({bool:{should:shouldArray}});
        }
        if(range){
          mustArray.push({bool:{filter:{range:range}}});
        }
      }
    }

    if(sSearch != ''){
      mustArray.push({bool:{must:{query_string:{fields:searchNames||[], query:'*'+sSearch+'*'}}}});
    }

    if(iSortingCols > 0){
      sort= new Array(iSortingCols);
      for(var i = 0; i<iSortingCols; i++){
        var current = {}, colName = kvMap['mDataProp_'+kvMap['iSortCol_'+i]];
        switch(this._searchColumnType(colName)){
          case 'keywords':
            current[colName+'.keyword'] = kvMap['sSortDir_'+i];
            break;
          case 'numericRange':
          default:
            current[colName] = {order:kvMap['sSortDir_'+i]};
            break;
        }
        sort[i] = current;
      }
      sort = sort.reverse();
    }

    return {
      query:mustArray.length > 0 ? {bool:{must:mustArray}} : {match_all:{}},
      sort:sort,
      from:kvMap['iDisplayStart'],
      size:kvMap['iDisplayLength']
    };
  },

  _showDocMenu: function($dropdownMenu, doc){
    $dropdownMenu.empty();
    $('<li class="dropdown-item delete"><span>Delete</span></li>').appendTo($dropdownMenu);
  },

  _setRowActive: function($row){
    this.table.$('tr.table-active').removeClass('table-active');
    $row.addClass('table-active');
  },

  _clearRowActive: function($row){
    $row.removeClass('table-active');
  },

  _isRowActive: function($row){
    return $row.hasClass('table-active');
  },

  _onSubmit: function(evt){
    var o = this.options, self = this, errors = validate(this.$form, o.constraints);

    evt.preventDefault();
    evt.stopPropagation();

    if (errors) {
      utils.showErrors(this.$form, errors);
    } else {
      var values = validate.collectFormValues(this.$form, {trim: true}), title = values.title;
      this.saveAs(title, function(err, view){
        if(err) return console.log(err);
        utils.clearErrors(self.$form);
        self.$saveAsModel.modal('toggle')
        setTimeout(function(){
          $.uriAnchor.setAnchor({
            col: '.views',
            doc: view.id
          });
        },500);
      });
    }
  },

  _onItemSaveAs: function(evt){
    this.$saveAsModel.modal('toggle');
  },

  saveAs: function(title, callback){
    this.options.view.saveAs(title, callback);
  },

  save: function(){
    var o = this.options, view = o.view, self = this;
    view.save(function(err, view){
      if(err) return console.log(err);
      self._refreshHeader();
    });
  },

  _onCancel: function(){
    var o = this.options, self = this, view = o.view;

    view.cancel();

    this._refreshHeader();
    this._initSearchBar();

    _.each(view.searchColumns, function(sc){
      switch(sc.type){
        case 'keywords':
          self.table.column(sc.name+':name')
               .search(_(sc.selectedItems).map("value").filter().flatMap().value().join(','));
          break;
        case 'numericRange':
          self.table.column(sc.name+':name')
               .search(sc.lowestValue||sc.highestValue ? [sc.lowestValue, sc.highestValue].join(','):'');
          break;
        case 'datetimeRange':
          self.table.column(sc.name+':name')
               .search(sc.earliest||sc.latest ? [sc.earliest, sc.latest].join(','):'');
          break;
      }
    });

    this.table.draw();
  },

  _setOption: function(key, value){
    var o = this.options, self = this;

    if((key === "view") && (value.domainId != o.view.domainId
      || value.collectionId != o.view.collectionId
      || value.id != o.view.id )){
      this._super(key, value);
      this._refresh();
      return;
    }

    this._super(key, value);
  }
  
});

//   var table = $('#dataTable').DataTable({
//     "bProcessing": true,
//     "bServerSide": true,
//     "sAjaxSource": "view",
//     "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
//       console.log(arguments);
//       oSettings.jqXHR = $.ajax( {
//         "dataType": 'json',
//         "type": "POST",
//         "url": sSource,
//         "data": aoData,
//         "success": fnCallback
//       } );
//     },
//     initComplete: function () {
//       var api = this.api();
//       api.columns().indexes().flatten().each( function ( i ) {
//         var column = api.column( i );
//         var select = $('<select><option value=""></option></select>')
//           .appendTo( $(column.footer()).empty() )
//           .on( 'change', function () {
//             var val = $.fn.dataTable.util.escapeRegex($(this).val());
//             column.search( val ? '^'+val+'$' : '', true, false ).draw();
//           });
//         column.data().unique().sort().each( function ( d, j ) {
//           select.append( '<option value="'+d+'">'+d+'</option>' )
//         });
//       });
//     }    
//   });

//   var data = table.rows().data();
//   console.log(JSON.stringify(data));
  
//   table.columns().flatten().each( function ( colIdx ) {
//     // Create the select list and search operation
//     var select = $('<select />').appendTo(table.column(colIdx).footer())
//         .on('change', function(){
//           table.column( colIdx ).search($(this).val()).draw();
//          });
//     // Get the search data for the first column and add to the select list
//     table.column(colIdx).cache('search').sort().unique().each(function(d){
//       select.append($('<option value="'+d+'">'+d+'</option>'));
//     });
//   });
