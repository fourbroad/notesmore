const
  $ = require('jquery'),
  _ = require('lodash'),
  moment = require('moment'),
  jsonPatch = require('fast-json-patch'),
  validate = require("validate.js"),
  utils = require('core/utils'),
  Loader = require('core/loader'),
  uuidv4 = require('uuid/v4'),
  client = require('../../lib/client')();

// const PerfectScrollbar = require('perfect-scrollbar');
// require('perfect-scrollbar/css/perfect-scrollbar.css');

require('jquery-ui/ui/widget');
require('jquery-ui/ui/data');
require('jquery.urianchor');
require('bootstrap'),
require('datatables.net-bs4');
require('datatables.net-bs4/css/dataTables.bootstrap4.css');

require('search/select/select');
require('search/numeric-range/numeric-range');
require('search/datetime-range/datetime-range');
require('search/datetime-duedate/datetime-duedate');
require('search/contains-text/contains-text');
require('search/full-text/full-text');

require('./view.scss');
const viewHtml = require('./view.html');

const {Action, Collection} = client;

$.widget("nm.view", {

  options:{
    isNew: false,
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
    
    if(!o.isNew){
      this.clone = _.cloneDeep(o.view);      
    }
    
    this.$viewContainer = $('.view-container', this.element);
    this.$viewHeader = $('.view-header', this.element);
    this.$icon = $('.icon', this.$viewHeader);
    this.$favorite = $('.favorite', this.$viewHeader);
    this.$actions = $('.actions', this.$viewHeader);
    this.$actionMoreMenu = $('.more>.dropdown-menu', this.$actions);
    this.$saveBtn =$('.save.btn', this.$actions);
    this.$cancelBtn = $('.cancel.btn', this.$actions);

    this.$viewTitle = $('h4', this.$viewHeader);

    this.$viewTable = $('.view-table', this.element);
    this.$saveAsModel = $('#save-as', this.$viewHeader);
    this.$titleInput = $('input[name="title"]', this.$saveAsModel);
    this.$form = $('form.new-view', this.$saveAsModel);
    this.$submitBtn = $('.btn.submit', this.$saveAsModel);
    this.$searchContainer = $('.search-container', this.$view);

    this.refresh();

    this.$viewContainer.on('click', 'table.view-table tbody>tr', function(evt){
      var $this = $(this);
      if(self._isRowActive($this)){
        self._clearRowActive($this);
      } else {
        self._setRowActive($this);
      }
    });

    this.$viewContainer.on('show.bs.dropdown', 'table.view-table tbody>tr', function(evt){
      var $this = $(this);
      if(!self._isRowActive($this)){
        self._setRowActive($this);
      }
      self._showDocMenu($(evt.target).find('.dropdown-menu'), self.table.row(this).data());
    });

    this.$viewContainer.on('click','table.view-table li.dropdown-item.delete', function(evt){
      var $this = $(this), $tr = $this.parents('tr'), v = self.table.row($tr).data();
      v.delete(function(err, result){
        if(err) return console.error(err);
        Collection.get(v.domainId, v.collectionId, function(err, collection){
          if(err) return console.error(err);
          collection.refresh(function(err, result){
            if(err) return console.error(err);
            self.table.draw(false);
          });
        })
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

    this._on(this.$actionMoreMenu, {
      'click li.dropdown-item.save-as': this._onItemSaveAs,
      'click li.dropdown-item.delete' : this._onDeleteSelf
    });   
    this._on(this.$saveBtn, {click: this.save});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$submitBtn, {click: this._onSubmit});
    this._on(this.$form, {submit: this._onSubmit});
    this._on(this.$favorite, {click: this._onFavorite});
  },

  _onFavorite: function(e){
    var o = this.options, view = o.view, self = this, { User, Profile } = client;
    User.get(function(err, user){
      if(err) return console.error(err);
      Profile.get(view.domainId, user.id, function(err, profile){
        if(err) return console.error(err);
        var index = _.findIndex(profile.favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;}),
            patch;
        if(index >= 0){
          patch = [{
            op:'remove',
            path: '/favorites/'+index            
          }];
        } else {
          patch = [profile.favorites ? {
            op:'add', 
            path:'/favorites/-', 
            value:{domainId:view.domainId, collectionId: view.collectionId, id: view.id}
          } : {
            op:'add', 
            path:'/favorites', 
            value:[{domainId:view.domainId, collectionId: view.collectionId, id: view.id}]
          }];
        }
        profile.patch(patch, function(err, result){
          if(err) return console.error(err);
          self._refreshFavorite();
          self.element.trigger('favoritechanged', view);
        });
      });
    });
  },

  _onDeleteSelf: function(e){
    var view = this.options.view, self = this;
    view.delete(function(err, result){
      if(err) return console.error(err);
      User.get(function(err, user){
        if(err) return console.error(err);
        Profile.get(view.domainId, user.id, function(err, profile){
          if(err) return console.error(err);
          var index = _.findIndex(profile.favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;});
          if(index >= 0){
            profile.patch([{
              op:'remove',
              path: '/favorites/'+index            
            }], function(err, result){
              if(err) return console.error(err);
              self.element.trigger('favoritechanged', view);              
            });
          }
        });
      });
      self.$actionMoreMenu.dropdown('toggle').trigger('documentdeleted', view);
    });

    e.stopPropagation();
  },

  _armActionMoreMenu: function(){
    var o = this.options, self = this, view = o.view, currentUser = view.getClient().currentUser;
    this.$actionMoreMenu.empty();

    if(o.view.collectionId == ".collections"){
      $('<li class="dropdown-item save-as">Save as view...</li>').appendTo(this.$actionMoreMenu);
    } else {
      $('<li class="dropdown-item save-as">Save as...</li>').appendTo(this.$actionMoreMenu);
    }
    
    utils.checkPermission(view.domainId, currentUser.id, 'delete', view, function(err, result){
      if(result){
        $('<li class="dropdown-item delete">Delete</li>').appendTo(self.$actionMoreMenu);
      }
    });

    Loader.armActions(client, this, o.view, this.$actionMoreMenu, o.actionId);
  },

  refresh: function() {
    var o = this.options, self = this, view = o.view;
    this.$viewTitle.html(view.title||view.id);

    $('i', this.$icon).removeClass().addClass(o.view._meta.iconClass||'ti-file');

    this._refreshFavorite()
    this._armActionMoreMenu();
    this._refreshHeader();
    this._refreshSearchBar();

    if(this.table) {
      this.table.destroy();
      this.$viewTable.remove();
      delete this.table;
    }

    this.$viewTable = $('<table class="table view-table table-striped table-hover" cellspacing="0" width="100%"></table>').insertAfter(this.$searchContainer);
    this.table = this.$viewTable.DataTable({
      stateSave: true,
      dom: '<"top"i>rt<"bottom"lp><"clear">',
      lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],      
      processing: true,
      serverSide: true,
      columns: _.cloneDeep(view.columns),
      searchCols: this._armSearchCol(),
      search: {search: view.search.keyword},
      order: (view.order&&JSON.parse(view.order))||[],
      columnDefs : [{
        targets: 0,
        width: "10px",
        data: null,
        render: function(data, type, row, meta) {
          return '<span class="icon-holder"><i class="'+ (data._meta.iconClass||'ti-file')+'"></i></span>';
        }
      }, {
        targets: -1,
        width: "30px",
        data: null,
        defaultContent: '<button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button><ul class="dropdown-menu dropdown-menu-right"></ul>'
      }, {
        targets:'_all',
        render:function(data, type, row, meta) {
          var column = meta.settings.aoColumns[meta.col], d = utils.get(row, column.data);
          
          if(column.className == 'datetime'){
            var date = moment(d);
            d = (date && date.isValid()) ? date.format('YYYY-MM-DD HH:mm:ss') : '';
          }

          if(column.defaultLink){
            d = '<a href="#">'+ d||"" + '</a>';
          }

          return d;
        },
        defaultContent:''
      }],
      sAjaxSource: "view",
      fnServerData: function (sSource, aoData, fnCallback, oSettings ) {
        var kvMap = self._kvMap(aoData), query = self._buildSearch(kvMap);
        query.size = query.size >= 0 ? query.size : 10000;
        view.findDocuments(query, function(err, docs){
          if(err) {
            if(err.code == 401){
              fnCallback({
                "sEcho": kvMap['sEcho'],
                "iTotalRecords": 0,
                "iTotalDisplayRecords": 0,
                "aaData": []
              });
            }
            return console.error(err); 
          }

          fnCallback({
            "sEcho": kvMap['sEcho'],
            "iTotalRecords": docs.total,
            "iTotalDisplayRecords": docs.total,
            "aaData": docs.documents
          });
        });
      }
    });

//     new PerfectScrollbar('.dataTables_wrapper',{suppressScrollY:true, wheelPropagation: false});
  },

  _onLoadAction: function(e){
    var o = this.options, view = o.view, $li = $(e.target), action = $li.data('action');
    this.element.trigger('actionclick', {dom: view.domainId, col: view.collectionId, doc: view.id, act:action.id});    
  },

  _refreshSearchBar: function(){
    var o = this.options, self = this, view = o.view;
    this.$searchContainer.empty();
    _.each(view.searchColumns, function(sc){
      switch(sc.type){
        case 'keywords':
          $("<div/>").appendTo(self.$searchContainer).select({
            name: sc.name,
            class:'search-item',
            btnClass:'btn-sm',
            mode: 'multi',
            selectedItems: sc.selectedItems,
            menuItems: function(filter, callback){
              view.distinctQuery(sc.name, {include:filter, size:10000}, function(err, data){
                if(err) return console.error(err);
                var items = _.map(data.values, function(item){
                  return {label:item, value:item};
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
            name: sc.name,
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
            name: sc.name,
            class:'search-item',
            btnClass:'btn-sm',
            title: sc.title,
            option: sc.option,
            unit: sc.unit,
            earliest: sc.option == "range" ? sc.sEarliest: sc.earliest,
            latest: sc.option == "range" ? sc.sLatest: sc.latest,
            valueChanged: function(event, range){
              var sc2 = _.find(view.searchColumns, function(o){return o.name == sc.name});
              sc2.option = range.option;
              delete sc2.earliest;
              delete sc2.latest;
              delete sc2.unit;
              delete sc2.sEarliest;
              delete sc2.sLatest;
              
              switch(sc2.option){
                case 'latest':
                  sc2.earliest = range.earliest;
                  sc2.unit = range.unit;
                break;
                case 'before':
                  sc2.latest = range.latest;
                  sc2.unit = range.unit;
                break;
                case 'between':
                  if(range.earliest){
                    sc2.earliest = range.earliest;                    
                  }

                  if(range.latest){
                    sc2.latest = range.latest;                    
                  }
                  break;
                case 'range':
                  if(range.earliest){
                    sc2.sEarliest = range.earliest;                    
                  }

                  if(range.latest){
                    sc2.sLatest = range.latest;                                        
                  }
                  break;
                default:
              }
                    
              self.table.column(sc2.name+':name')
                .search(self._buildDatetimeRangeSearch(sc2))
                .draw();
              self._refreshHeader();
            }
          });
          break;
        case 'datetimeDuedate':
          $("<div/>").appendTo(self.$searchContainer).datetimeduedate({
            name: sc.name,
            class:'search-item',
            btnClass:'btn-sm',
            title: sc.title,
            option: sc.option,
            unit: sc.unit,
            willYn: sc.willYn,
            earliest: sc.option == "range" ? sc.sEarliest: sc.earliest,
            latest: sc.option == "range" ? sc.sLatest: sc.latest,
            valueChanged: function(event, range){
              var sc2 = _.find(view.searchColumns, function(o){return o.name == sc.name});
              sc2.option = range.option;
              delete sc2.earliest;
              delete sc2.latest;
              delete sc2.unit;
              delete sc2.sEarliest;
              delete sc2.sLatest;
              
              switch(sc2.option){
                case 'overdue':
                  break;
                case 'overdue_more':
                  sc2.latest = range.latest;
                  sc2.unit = range.unit;
                break;
                case 'expire_yn':
                  sc2.willYn = range.willYn;
                  if(sc2.willYn == 'yes'){
                    sc2.latest = range.latest;
                  }else{
                    sc2.earliest = range.earliest;
                  }
                  sc2.unit = range.unit;
                break;
                case 'between':{
                  if(range.earliest){
                    sc2.earliest = range.earliest;                    
                  }

                  if(range.latest){
                    sc2.latest = range.latest;                    
                  }
                }
                break;
                case 'range':{
                  if(range.earliest){
                    sc2.sEarliest = range.earliest;                    
                  }
                  if(range.latest){
                    sc2.sLatest = range.latest;                                        
                  }
                }
                break;
                default:
              }
                    
              self.table.column(sc2.name+':name')
                .search(self._buildDatetimeRangeSearch(sc2))
                .draw();
              self._refreshHeader();
            }
          });
          break;
        case 'containsText':
          $("<div/>").appendTo(self.$searchContainer).containstext({
            name: sc.name,
            class:'search-item',
            btnClass:'btn-sm',
            title: sc.title,
            containsText: sc.containsText,
            valueChanged: function(event, range){
              var sc2 = _.find(view.searchColumns, function(o){return o.name == sc.name});
              sc2.containsText = range.containsText;
              self.table.column(sc2.name+':name')
                .search(sc2.containsText)
                .draw();
              self._refreshHeader();
            }
          });
          break;
        default:          
      }
    });

    $("<div/>").appendTo(this.$searchContainer).fulltextsearch({
      class: 'search-item',
      keyword: view.search.keyword,
      valueChanged: function(event, keyword){
        view.search.keyword = keyword.keyword; 
        self.table.search(keyword.keyword).draw();
        self._refreshHeader();
      }
    });
  },

  _buildDatetimeRangeSearch: function(searchColumn){
    var earliest, latest;
    switch(searchColumn.option){
      case 'overdue':
        latest = +moment();
        break;
      case 'overdue_more':
        if(searchColumn.latest && searchColumn.unit){
          latest = + moment().subtract(searchColumn.latest, searchColumn.unit);
        }
        break;
      case 'expire_yn':
        if((searchColumn.earliest || searchColumn.latest) && searchColumn.unit){
          var now = moment();
          if(searchColumn.willYn == 'yes'){
            earliest = + now.clone().subtract(searchColumn.earliest, searchColumn.unit);
            latest = + now;
          } else {
            earliest = + now.add(searchColumn.earliest, searchColumn.unit);
          }
        }
        break;
      case 'latest':
        if(searchColumn.earliest && searchColumn.unit){
          var now = moment();
          latest = + now;
          earliest = + now.clone().subtract(searchColumn.earliest, searchColumn.unit);
        }
        break;
      case 'before':
        if(searchColumn.latest && searchColumn.unit){
          latest = +moment().subtract(searchColumn.latest, searchColumn.unit);
        }
        break;
      case 'between':
        earliest = searchColumn.earliest
        latest = searchColumn.latest;
        break;
      case 'range':
        if(searchColumn.sEarliest || searchColumn.sLatest){
          var now = moment();
          if(searchColumn.sEarliest){
            earliest = +now.clone().add(moment.duration(searchColumn.sEarliest));
          }
          if(searchColumn.sLatest){
            latest = +now.clone().add(moment.duration(searchColumn.sLatest));
          }
        }
        break;
      default:
    }

    return earliest||latest ? [earliest, latest].join(','):'';
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
            searchCols.push({search: self._buildDatetimeRangeSearch(sc)});
            break;
          case 'datetimeDuedate':
            searchCols.push({search: self._buildDatetimeRangeSearch(sc)});
            break;
          case 'containsText':
            searchCols.push({search: sc.containsText});
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

  _refreshFavorite: function(){
    var o = this.options;
    if(o.isNew){
      this.$favorite.hide();
    }else{
      var self = this, view = o.view,　{ User, Profile } = client;
      this.$favorite.show();
      User.get(function(err, user){
        if(err) return console.error(err);
        Profile.get(view.domainId, user.id, function(err, profile){
          if(err) return console.error(err);
          var $i = $('i', self.$favorite).removeClass();
          if(_.find(profile.favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;})){
            $i.addClass('c-red-500 ti-star');
          }else{
            $i.addClass('ti-star');
          }
        });
      });        
    }
  },

  _getPatch: function(){
    return jsonPatch.compare(this.clone,  this.options.view);
  },

  _isDirty: function(){
    return this.options.isNew || this._getPatch().length > 0
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
         case 'containsText':
            shouldArray.push({query_string: {default_field: mDataProp_i, query: '*'+sSearch_i+'*'}});
            break;
         case 'datetimeRange':
         case 'datetimeDuedate':
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
      body:{
        query: mustArray.length > 0 ? {bool:{must:mustArray}} : {match_all:{}},
        sort: sort
      },
      from:kvMap['iDisplayStart'],
      size:kvMap['iDisplayLength']
    };
  },

  _showDocMenu: function($dropdownMenu, doc){
    var client = doc.getClient(), currentUser = client.currentUser;
    $dropdownMenu.empty();
    
    utils.checkPermission(doc.domainId, currentUser.id, 'delete', doc, function(err, result){
      if(result){
        $('<li class="dropdown-item delete">Delete</li>').appendTo($dropdownMenu);        
      }
    });

    Loader.armActions(client, this, doc, $dropdownMenu, this.options.actionId);
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
        if(err) return console.error(err);
        utils.clearErrors(self.$form);
        var isNew = o.isNew;
        o.isNew = false;
        o.view = view;
        self.clone = _.cloneDeep(view);
        self.refresh();
        self.$saveAsModel.modal('toggle')
        self.element.trigger('documentcreated', [view, isNew]);
      });
    }
  },

  _onItemSaveAs: function(evt){
    this.$saveAsModel.modal('toggle');
  },

  saveAs: function(title, callback){
    var o = this.options, {View} = o.view.getClient(), view = _.cloneDeep(o.view);
    view.title = title;
    delete view._meta;
    if(o.view.collectionId == '.collections'){
      view.collections = [o.view.id];
      _.set(view, '_meta.acl.delete.roles', ['administrator']);
    }
    View.create(o.view.domainId, uuidv4(), view, callback);
  },

  save: function(){
    var o = this.options, self = this;
    if(this._isDirty()){
      o.view.patch(this._getPatch(), function(err, view){
        if(err) return console.error(err);
  	    _.forOwn(o.view,function(v,k){delete o.view[k]});
        _.merge(o.view, view);
        self.clone = _.cloneDeep(view);
        self._refreshHeader();
      });
    }
  },  

  _onCancel: function(){
    var o = this.options, self = this, view = o.view;

  	 _.forOwn(view,function(v,k){delete view[k]});
    _.merge(view, this.clone);

    this._refreshHeader();
    this._refreshSearchBar();

    _.each(o.view.searchColumns, function(sc){
      switch(sc.type){
        case 'keywords':
          self.table.column(sc.name+':name')
               .search(_(sc.selectedItems).map("value").filter().flatMap().value().join(','));
          break;
        case 'containsText':
          self.table.column(sc.name+':name')
               .search(sc.containsText);
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

  showIdTitleDialog: function(options){
    var self = this;
    import(/* webpackChunkName: "idtitle-dialog" */ 'idtitle-dialog/idtitle-dialog').then(({default: itd}) => {
      self.idtitleDialog = $('<div/>').idtitledialog(options).idtitledialog('show').idtitledialog('instance');
    });
    return this;
  },

  closeIdTitleDialog: function(){
    this.idtitleDialog && this.idtitleDialog.close();
    return this;
  },

  _setOption: function(key, value){
    var o = this.options, self = this;

    this._super(key, value);

    if(key === "view") {
      if(!o.isNew){
        this.clone = _.cloneDeep(o.view);      
      }
      this.refresh();
    }

  }
  
});
