const
  $ = require('jquery'),
  _ = require('lodash'),
  moment = require('moment'),
  jsonPatch = require('fast-json-patch'),
  validate = require("validate.js"),
  utils = require('core/utils'),
  Loader = require('core/loader'),
  uuidv4 = require('uuid/v4'),
  FileSaver = require('file-saver');

// const PerfectScrollbar = require('perfect-scrollbar');
// require('perfect-scrollbar/css/perfect-scrollbar.css');

require('jquery-ui/ui/widget');
require('jquery-ui/ui/data');
require('jquery.urianchor');
require('bootstrap'),
require('datatables.net-bs4');
require('datatables.net-bs4/css/dataTables.bootstrap4.css');

require('search/keywords/keywords');
require('search/numeric-range/numeric-range');
require('search/datetime-range/datetime-range');
require('search/datetime-duedate/datetime-duedate');
require('search/contains-text/contains-text');
require('search/full-text/full-text');

require('./view.scss');
const viewHtml = require('./view.html');

$.widget("nm.view", {

  options:{
    isNew: false
  },

  _create: function() {
    let o = this.options, self = this;

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
    this.$searchContainer = $('.search-container', this.$view);

    this.refresh();

    this.$viewContainer.on('click', 'table.view-table tbody>tr', function(evt){
      let $this = $(this);
      if(self._isRowActive($this)){
        self._clearRowActive($this);
      } else {
        self._setRowActive($this);
      }
    });

    this.$viewContainer.on('show.bs.dropdown', 'table.view-table tbody>tr', function(evt){
      let $this = $(this);
      if(!self._isRowActive($this)){
        self._setRowActive($this);
      }
      self._showDocMenu($(evt.target).find('.dropdown-menu'), self.table.row(this).data());
    });

    this.$viewContainer.on('click','table.view-table li.dropdown-item.delete', function(evt){
      let $this = $(this), $tr = $this.parents('tr'), v = self.table.row($tr).data();
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
      let $this = $(this), $tr = $this.parents('tr'), doc = self.table.row($tr).data();
      if(evt.ctrlKey){
        self.element.trigger('docctrlclick', doc);
      }else{
        self.element.trigger('docclick', doc);
      }
      evt.preventDefault();
      evt.stopPropagation();
    });

    this._on(this.$actionMoreMenu, {
      'click li.dropdown-item.save-as': this._onItemSaveAs,
      'click li.dropdown-item.export-csv-all': this._exportCsvAll,
      'click li.dropdown-item.export-csv-current': this._exportCsvCurrent,
      'click li.dropdown-item.delete' : this._onDeleteSelf
    });   
    this._on(this.$saveBtn, {click: this.save});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$favorite, {click: this._onFavorite});
  },

  _onFavorite: function(e){
    let o = this.options, view = o.view, self = this, client = view.getClient(), currentUser = client.currentUser, Profile = client.Profile;
    Profile.get(view.domainId, currentUser.id, function(err, profile){
      if(err) return console.error(err);
      let oldFavorites = _.cloneDeep(profile.favorites), patch,
          index = _.findIndex(profile.favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;});
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
      profile.patch({patch: patch}, function(err, profile){
        if(err) return console.error(err);
        self._refreshFavorite(profile.favorites);
        self.element.trigger('favoritechanged', [profile.favorites, oldFavorites]);
      });
    });
  },

  _onDeleteSelf: function(e){
    let view = this.options.view, self = this, client = view.getClient(), currentUser = client.currentUser;
    view.delete(function(err, result){
      if(err) return console.error(err);
        Profile.get(view.domainId, currentUser.id, function(err, profile){
        if(err) return console.error(err);
        let oldFavorites = _.cloneDeep(profile.favorites), 
            index = _.findIndex(profile.favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;});
        if(index >= 0){
          profile.patch({patch:[{
            op:'remove',
            path: '/favorites/'+index            
          }]}, function(err, profile){
            if(err) return console.error(err);
            self.element.trigger('favoritechanged', [profile.favorites, oldFavorites]);
          });
        }
      });
      self.$actionMoreMenu.dropdown('toggle').trigger('documentdeleted', view);
    });

    e.stopPropagation();
  },

  _armActionMoreMenu: function(){
    let o = this.options, self = this, view = o.view, viewLocale = view.get(o.locale), client = view.getClient(), currentUser = client.currentUser;
    this.$actionMoreMenu.empty();

    if(o.view.collectionId == ".collections"){
      $('<li class="dropdown-item save-as">'+ _.at(viewLocale, 'toolbox.saveAsView')[0] +'</li>').appendTo(this.$actionMoreMenu);
    } else {
      $('<li class="dropdown-item save-as">' + _.at(viewLocale, 'toolbox.saveAs')[0] +'</li>').appendTo(this.$actionMoreMenu);
    }

    $('<div class="dropdown-divider"></div>').appendTo(this.$actionMoreMenu);
    $('<li class="dropdown-item export-csv-all">' + _.at(viewLocale, 'toolbox.exportAllCSV')[0] + '</li>').appendTo(this.$actionMoreMenu);
    $('<li class="dropdown-item export-csv-current">' + _.at(viewLocale, 'toolbox.exportCurrentCSV')[0] + '</li>').appendTo(this.$actionMoreMenu);
    $('<div class="dropdown-divider"></div>').appendTo(this.$actionMoreMenu);
    
    utils.checkPermission(view.domainId, currentUser.id, 'delete', view, function(err, result){
      if(result){
        $('<li class="dropdown-item delete">' + (_.at(viewLocale, 'toolbox.delete')[0]||'Delete') +'</li>').appendTo(self.$actionMoreMenu);
      }
    });

    Loader.armActions(client, this, o.view, this.$actionMoreMenu, o.actionId, o.locale);
  },  

  refresh: function() {
    let o = this.options, self = this, view = o.view, viewLocale = view.get(o.locale), language = {};
    this.$viewTitle.html(viewLocale.title||viewLocale.id);

    $('i', this.$icon).removeClass().addClass(view._meta.iconClass||'ti-file');

    this._refreshFavorite()
    this._armActionMoreMenu();
    this._refreshHeader();
    this._refreshSearchBar();

    if(this.table) {
      this.table.destroy();
      this.$viewTable.remove();
      delete this.table;
    }

    if(o.locale == 'zh-CN'){
      language = {
        "sProcessing": "处理中...",
        "sLengthMenu": "显示 _MENU_ 项结果",
        "sZeroRecords": "没有匹配结果",
        "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
        "sInfoPostFix": "",
        "sSearch": "搜索:",
        "sUrl": "",
        "sEmptyTable": "表中数据为空",
        "sLoadingRecords": "载入中...",
        "sInfoThousands": ",",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页"
        },
        "oAria": {
            "sSortAscending": ": 以升序排列此列",
            "sSortDescending": ": 以降序排列此列"
        }
      }
    }

    this.$viewTable = $('<table class="table view-table table-striped table-hover" cellspacing="0" width="100%"></table>').insertAfter(this.$searchContainer);
    this.table = this.$viewTable.DataTable({
      dom: '<"top"i>rt<"bottom"lp><"clear">',
      lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]],      
      processing: true,
      serverSide: true,
      columns: _.map(_.cloneDeep(view.columns), (c)=>{if(c&&c.name&&!c.data){c.data = c.name} return c;}),
      searchCols: this._armSearchCol(),
      search: {search: _.at(view,'.search.fulltext.keyword')[0]},
      order: this._buildOrder(_.at(view, 'search.sort')[0]),
      language: language,
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
          let column = meta.settings.aoColumns[meta.col], d = utils.get(row, column.name);
          if(column.type == 'date'){
            let date = moment(d);
            d = (date && date.isValid()) ? date.format('YYYY-MM-DD HH:mm:ss') : '';
          }
          if(d && column.defaultLink){
            d = '<a href="#">'+ d||"" + '</a>';
          }
          return d ? d : '';
        },
        defaultContent:''
      }],
      sAjaxSource: "view",
      fnServerData: function (sSource, aoData, fnCallback, oSettings ) {
        let kvMap = self._kvMap(aoData);
        view.findDocuments({
          from:kvMap['iDisplayStart'],
          size:kvMap['iDisplayLength'],
          sort: self._buildSort(kvMap)
        }, function(err, docs){
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
            "aaData": self._toLocale(docs.documents)
          });
        });
      }
    });

//     new PerfectScrollbar('.dataTables_wrapper',{suppressScrollY:true, wheelPropagation: false});
  },

  _toLocale: function(documents){
    let o = this.options;
    return _.reduce(documents, function(docs, doc){
      docs.push(doc.get(o.locale));
      return docs;
    },[]);
  },

  _onLoadAction: function(e){
    let o = this.options, view = o.view, $li = $(e.target), action = $li.data('action');
    this.element.trigger('actionclick', {dom: view.domainId, col: view.collectionId, doc: view.id, act:action.id});    
  },

  _refreshSearchBar: function(){
    let o = this.options, self = this, view = o.view, viewLocale = view.get(o.locale),
        searchFields = _.filter(view.search.fields, function(sf) { return sf.visible == undefined || sf.visible == true; });

    this.$searchContainer.empty();
    _.each(searchFields, function(sf){
      let title = _.filter(viewLocale.search.fields, function(sfl) { return sfl.name == sf.name })[0].title;
      switch(sf.type){
        case 'keywords':
          $("<div/>").appendTo(self.$searchContainer).keywords({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            mode: 'multi',
            locale: o.locale,
            selectedItems: sf.values,
            menuItems: function(filter, callback){
              view.distinctQuery(sf.name, {include:filter, size:10000}, function(err, data){
                if(err) return console.error(err);
                callback(data.values);
              });
            },
            valueChanged: function(event, values){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.values = values.selectedItems;
              self.table.column(sf2.name+':name').search(sf2.values.join(',')).draw();
              self._refreshHeader();
            }
          });
          break;
        case 'numericRange':
          $("<div/>").appendTo(self.$searchContainer).numericrange({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            locale: o.locale,
            lowestValue: sf.lowestValue,
            highestValue: sf.highestValue,
            valueChanged: function(event, range){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.lowestValue = range.lowestValue;
              sf2.highestValue = range.highestValue;
              self.table.column(sf2.name+':name')
                .search(sf2.lowestValue||sf2.highestValue ? [sf2.lowestValue, sf2.highestValue].join(','):'')
                .draw();
              self._refreshHeader();
            }
          });
          break;
        case 'datetimeRange':
          $("<div/>").appendTo(self.$searchContainer).datetimerange({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            option: sf.option,
            unit: sf.unit,
            locale: o.locale,
            earliest: sf.option == "range" ? sf.sEarliest: sf.earliest,
            latest: sf.option == "range" ? sf.sLatest: sf.latest,
            valueChanged: function(event, range){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.option = range.option;
              delete sf2.earliest;
              delete sf2.latest;
              delete sf2.unit;
              delete sf2.sEarliest;
              delete sf2.sLatest;
              
              switch(sf2.option){
                case 'latest':
                  sf2.earliest = range.earliest;
                  sf2.unit = range.unit;
                break;
                case 'before':
                  sf2.latest = range.latest;
                  sf2.unit = range.unit;
                break;
                case 'between':
                  if(range.earliest){
                    sf2.earliest = range.earliest;                    
                  }

                  if(range.latest){
                    sf2.latest = range.latest;                    
                  }
                  break;
                case 'range':
                  if(range.earliest){
                    sf2.sEarliest = range.earliest;                    
                  }

                  if(range.latest){
                    sf2.sLatest = range.latest;                                        
                  }
                  break;
                default:
              }
                    
              self.table.column(sf2.name+':name')
                .search(self._buildDatetimeRangeSearch(sf2))
                .draw();
              self._refreshHeader();
            }
          });
          break;
        case 'datetimeDuedate':
          $("<div/>").appendTo(self.$searchContainer).datetimeduedate({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            option: sf.option,
            unit: sf.unit,
            willYn: sf.willYn,
            locale: o.locale,
            earliest: sf.option == "range" ? sf.sEarliest: sf.earliest,
            latest: sf.option == "range" ? sf.sLatest: sf.latest,
            valueChanged: function(event, range){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.option = range.option;
              delete sf2.earliest;
              delete sf2.latest;
              delete sf2.unit;
              delete sf2.sEarliest;
              delete sf2.sLatest;
              
              switch(sf2.option){
                case 'overdue':
                  break;
                case 'overdue_more':
                  sf2.latest = range.latest;
                  sf2.unit = range.unit;
                break;
                case 'expire_yn':
                  sf2.willYn = range.willYn;
                  if(sf2.willYn == 'yes'){
                    sf2.latest = range.latest;
                  }else{
                    sf2.earliest = range.earliest;
                  }
                  sf2.unit = range.unit;
                break;
                case 'between':{
                  if(range.earliest){
                    sf2.earliest = range.earliest;                    
                  }

                  if(range.latest){
                    sf2.latest = range.latest;                    
                  }
                }
                break;
                case 'range':{
                  if(range.earliest){
                    sf2.sEarliest = range.earliest;                    
                  }
                  if(range.latest){
                    sf2.sLatest = range.latest;                                        
                  }
                }
                break;
                default:
              }
                    
              self.table.column(sf2.name+':name')
                .search(self._buildDatetimeRangeSearch(sf2))
                .draw();
              self._refreshHeader();
            }
          });
          break;
        case 'containsText':
          $("<div/>").appendTo(self.$searchContainer).containstext({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            containsText: sf.containsText,
            locale: o.locale,
            valueChanged: function(event, range){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.containsText = range.containsText;
              self.table.column(sf2.name+':name')
                .search(sf2.containsText)
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
      keyword: _.at(view,'search.fulltext.keyword')[0],
      valueChanged: function(event, keyword){
        _.set(view, 'search.fulltext.keyword', keyword.keyword);
        self.table.search(keyword.keyword).draw();
        self._refreshHeader();
      }
    });
  },

  _buildDatetimeRangeSearch: function(searchColumn){
    let earliest, latest;
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
          let now = moment();
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
          let now = moment();
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
          let now = moment();
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
    let o = this.options, self = this, view = o.view;
    return _.reduce(view.columns, function(searchCols, col){
      let sf = _.find(view.search.fields, {'name': col.name});
      if(sf){
        switch(sf.type){
          case 'keywords':
            searchCols.push({search: _.isEmpty(sf.values) ? '' : sf.values.join(',')});
            break;
          case 'numericRange':
            searchCols.push({search: sf.lowestValue||sf.highestValue ? [sf.lowestValue, sf.highestValue].join(','):''});
            break;
          case 'datetimeRange':
            searchCols.push({search: self._buildDatetimeRangeSearch(sf)});
            break;
          case 'datetimeDuedate':
            searchCols.push({search: self._buildDatetimeRangeSearch(sf)});
            break;
          case 'containsText':
            searchCols.push({search: sf.containsText});
            break;
        }
      }else{
        searchCols.push(null);
      }

      return searchCols;            
    },[]);
  },

  _refreshHeader: function(){
    var o = this.options, view = o.view.get(o.locale);
    if(this._isDirty()){
      this.$saveBtn.show().html(_.at(view, 'toolbox.save')[0]);
      this.$cancelBtn.show().html(_.at(view, 'toolbox.cancel')[0]);
    }else{
      this.$saveBtn.hide();
      this.$cancelBtn.hide();
    }
  },

  _refreshFavorite: function(favorites){
    let o = this.options;
    if(o.isNew){
      this.$favorite.hide();
    }else{
      let self = this, view = o.view,　client = view.getClient(), currentUser = client.currentUser, Profile = client.Profile;
      this.$favorite.show();

      function doRefreshFavorite(favorites){
        let $i = $('i', self.$favorite).removeClass();
        if(_.find(favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;})){
          $i.addClass('c-red-500 ti-star');
        }else{
          $i.addClass('ti-star');
        }
      }

      if(favorites){
        doRefreshFavorite(favorites);
      } else {
        Profile.get(view.domainId, currentUser.id, {refresh: true}, function(err, profile){
          if(err) return console.error(err);
          doRefreshFavorite(profile.favorites);        
        });
      }
    }
  },

  _i18n: function(name, defaultValue){
    let o = this.options;
    return (o.i18n[o.locale] && o.i18n[o.locale][name]) || defaultValue;
  },

  _getPatch: function(){
    return jsonPatch.compare(this.clone,  this.options.view);
  },

  _isDirty: function(){
    return this.options.isNew || this._getPatch().length > 0
  },

  _columnType: function(name){
    let view = this.options.view;
    let index = _.findIndex(view.columns, function(sf) { return (sf&&sf.name) == name;});
    return view.columns[index].type;
  },

  _kvMap: function(aoData){
    return _.reduce(aoData, function(result, kv){result[kv.name] = kv.value; return result;},{});
  },

  _buildOrder: function(sort){
    let o = this.options, self = this, view = o.view;
    return _.reduce(sort, function(order, value){
      order.push([_.findIndex(view.columns, ['name', _.keys(value)[0]]), value[_.keys(value)[0]].order]);
      return order;
    },[]);
  },

  _buildSort: function(kvMap){
    let iSortingCols = kvMap["iSortingCols"], sort = new Array(iSortingCols);
    for(let i = 0; i < iSortingCols; i++){
      let current = {}, colName = kvMap['mDataProp_'+kvMap['iSortCol_'+i]];
      switch(this._columnType(colName)){
        case 'keyword':
          current[colName+'.keyword'] = kvMap['sSortDir_'+i];
          break;
        case 'date':
        case 'integer':
        default:
          current[colName] = {order:kvMap['sSortDir_'+i]};
          break;
      }
      sort[i] = current;
    }
    return sort.reverse();
  },

  _showDocMenu: function($dropdownMenu, doc){
    let o = this.options, view = o.view, viewLocale = view.get(o.locale), client = view.getClient(), currentUser = client.currentUser;
    $dropdownMenu.empty();
    
    utils.checkPermission(doc.domainId, currentUser.id, 'delete', doc, function(err, result){
      if(result){
        $('<li class="dropdown-item delete">'+ (_.at(viewLocale, 'contextMenu.delete')[0] || 'Delete')+'</li>').appendTo($dropdownMenu);        
      }
    });

    Loader.armActions(client, this, doc, $dropdownMenu, this.options.actionId, o.locale);
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

  _onItemSaveAs: function(evt){
    let view = this.options.view, self = this;
    this.showIdTitleDialog({
      modelTitle:'Save as...', 
      id: uuidv4(), 
      title: view.title || '', 
      placeholder:{
        id: 'Enter id of view',
        title: 'Enter title of view'
      },
      submit:function(e, data){
      self.saveAs(data.id, data.title);
    }});
  },

  saveAs: function(id, title, callback){
    let o = this.options, client = o.view.getClient(), View = client.View, view = _.cloneDeep(o.view), self = this;
    view.title = title;
    delete view._meta;
    if(o.view.collectionId == '.collections'){
      view.collections = [o.view.id];
      _.set(view, '_meta.acl.delete.roles', ['administrator']);
    }

    View.create(o.view.domainId, id||uuidv4(), view, function(err, view){
        if(err) return console.error(err);
        let isNew = o.isNew;
        o.isNew = false;
        o.view = view;
        self.clone = _.cloneDeep(view);
        self.refresh();
        self.closeIdTitleDialog();        
        self.element.trigger('documentcreated', [view, isNew]);
    });
  },

  _doExportCsv: function(columns){
    let o = this.options, view = this.options.view, rows = [];
    rows.push(_.values(_.mapValues(columns, function(c) {if(c.title) return c.title;})).join(','));
    function doExport(scrollId){
      let opts = {scroll:'1m'};
      if(scrollId) opts.scrollId = scrollId;
      view[scrollId ? 'scroll' : 'findDocuments'](opts, function(err, data){
        if(err) return console.error(err);
        _.each(data.documents, function(doc){
          let row = _.reduce(columns, function(r, c){
            let d = utils.get(doc.get(o.locale), c.name);
            if(c.type == 'date'){
              let date = moment(d);
              d = (date && date.isValid()) ? date.format('YYYY-MM-DD HH:mm:ss') : '';
            }
            if(_.isArray(d)){
              d = '\"'+ d.toString() + '\"';
            }
            r.push(d);
            return r;
          }, []);
          rows.push(row.join(','));
        });

        if(data.documents.length > 0){
          doExport(data.scrollId);
        } else {
          let blob = new Blob(["\uFEFF" + rows.join('\n')],{ type: "text/plain;charset=utf-8"});
          FileSaver.saveAs(blob, view.title + ".csv");
        }
      });
    }

    doExport();
  },

  _exportCsvAll: function(){
    let columns = _.cloneDeep(this.options.view.columns);
    columns = _.omitBy(columns, function(c){return !c.title});
    this._doExportCsv(columns);
  },

  _exportCsvCurrent: function(){
    let columns = _.cloneDeep(this.options.view.columns);
    columns = _.omitBy(columns, function(c){return !c.title || c.visible == false});
    this._doExportCsv(columns);
  },

  save: function(){
    let o = this.options, self = this;
    if(this._isDirty()){
      o.view.patch({patch: this._getPatch()}, function(err, view){
        if(err) return console.error(err);
  	    _.forOwn(o.view,function(v,k){delete o.view[k]});
        _.merge(o.view, view);
        self.clone = _.cloneDeep(view);
        self._refreshHeader();
      });
    }
  },  

  _onCancel: function(){
    let o = this.options, self = this, view = o.view;

  	 _.forOwn(view,function(v,k){delete view[k]});
    _.merge(view, this.clone);

    this._refreshHeader();
    this._refreshSearchBar();

    _.each(o.view.search.fields, function(sf){
      switch(sf.type){
        case 'keywords':
          self.table.column(sf.name+':name')
               .search(_.isEmpty(sf.values) ? '' : sf.values.join(','));
          break;
        case 'containsText':
          self.table.column(sf.name+':name')
               .search(sf.containsText);
        case 'numericRange':
          self.table.column(sf.name+':name')
               .search(sf.lowestValue||sf.highestValue ? [sf.lowestValue, sf.highestValue].join(','):'');
          break;
        case 'datetimeRange':
          self.table.column(sf.name+':name')
               .search(sf.earliest||sf.latest ? [sf.earliest, sf.latest].join(','):'');
          break;
      }
    });

    this.table.draw();
  },

  showIdTitleDialog: function(options){
    let self = this;
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
    let o = this.options, self = this;

    this._super(key, value);

    if(key === "view") {
      if(!o.isNew){
        this.clone = _.cloneDeep(o.view);      
      }
      this.refresh();
    }

  }
  
});
