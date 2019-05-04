import jsonPatch from'fast-json-patch';
import validate from"validate.js";
import utils from'core/utils';
import Loader from'core/loader';
import uuidv4 from'uuid/v4';
import FileSaver from'file-saver';

// const PerfectScrollbar from'perfect-scrollbar');
// import 'perfect-scrollbar/css/perfect-scrollbar.css');

import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';
import 'jquery.urianchor';
import 'bootstrap';
import 'datatables.net-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';

import 'search/keywords/keywords';
import 'search/numeric-range/numeric-range';
import 'search/datetime-range/datetime-range';
import 'search/datetime-duedate/datetime-duedate';
import 'search/contains-text/contains-text';
import 'search/full-text/full-text';

import './view.scss';
import viewHtml from'./view.html';

$.widget("nm.view", {

  options:{
    isNew: false    
  },

  _create: function() {
    let o = this.options, _this = this;

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
      if(_this._isRowActive($this)){
        _this._clearRowActive($this);
      } else {
        _this._setRowActive($this);
      }
    });

    this.$viewContainer.on('show.bs.dropdown', 'table.view-table tbody>tr', function(evt){
      let $this = $(this);
      if(!_this._isRowActive($this)){
        _this._setRowActive($this);
      }
      _this._showDocMenu($(evt.target).find('.dropdown-menu'), _this.table.row(this).data());
    });

    this.$viewContainer.on('click','table.view-table li.dropdown-item.delete', function(evt){
      let $this = $(this), $tr = $this.parents('tr'), v = _this.table.row($tr).data();
      v.delete(function(err, result){
        if(err) return console.error(err);
        Collection.get(v.domainId, v.collectionId, function(err, collection){
          if(err) return console.error(err);
          collection.refresh(function(err, result){
            if(err) return console.error(err);
            _this.table.draw(false);
          });
        })
      });

      evt.stopPropagation();
    });

    this.$viewContainer.on('click','table.view-table a', function(evt){
      let $this = $(this), $tr = $this.parents('tr'), doc = _this.table.row($tr).data();
      if(evt.ctrlKey){
        _this.element.trigger('docctrlclick', doc);
      }else{
        _this.element.trigger('docclick', doc);
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
    this._on(this.$saveBtn, {click: this._onSave});
    this._on(this.$cancelBtn, {click: this._onCancel});
    this._on(this.$favorite, {click: this._onFavorite});
  },

  _onFavorite: function(e){
    let o = this.options, view = o.view, _this = this, client = view.getClient(), currentUser = client.currentUser, Profile = client.Profile;
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
        _this._refreshFavorite(profile.favorites);
        _this.element.trigger('favoritechanged', [profile.favorites, oldFavorites]);
      });
    });
  },

  _onDeleteSelf: function(e){
    let view = this.options.view, _this = this, client = view.getClient(), currentUser = client.currentUser;
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
            _this.element.trigger('favoritechanged', [profile.favorites, oldFavorites]);
          });
        }
      });
      _this.$actionMoreMenu.dropdown('toggle').trigger('documentdeleted', view);
    });

    e.stopPropagation();
  },

  _armActionMoreMenu: function(){
    let o = this.options, _this = this, view = o.view, viewLocale = view.get(o.locale), client = view.getClient(), currentUser = client.currentUser;
    this.$actionMoreMenu.empty();

    if(o.view.collectionId == ".collections"){
      $('<li class="dropdown-item save-as">'+ (_.at(viewLocale, 'toolbox.saveAsView')[0] || 'Save as view...') +'</li>').appendTo(this.$actionMoreMenu);
    } else {
      $('<li class="dropdown-item save-as">' + (_.at(viewLocale, 'toolbox.saveAs')[0] || 'Save as...') +'</li>').appendTo(this.$actionMoreMenu);
    }

    $('<div class="dropdown-divider"></div>').appendTo(this.$actionMoreMenu);
    $('<li class="dropdown-item export-csv-all">' + (_.at(viewLocale, 'toolbox.exportAllCSV')[0]||'Exports CSV (All Fields)') + '</li>').appendTo(this.$actionMoreMenu);
    $('<li class="dropdown-item export-csv-current">' + (_.at(viewLocale, 'toolbox.exportCurrentCSV')[0]||'Exports CSV (Current Fields)') + '</li>').appendTo(this.$actionMoreMenu);
    $('<div class="dropdown-divider"></div>').appendTo(this.$actionMoreMenu);
    
    utils.checkPermission(view.domainId, currentUser.id, 'delete', view, function(err, result){
      if(result){
        $('<li class="dropdown-item delete">' + (_.at(viewLocale, 'toolbox.delete')[0]||'Delete') +'</li>').appendTo(_this.$actionMoreMenu);
      }
    });

    Loader.armActions(client, this, o.view, this.$actionMoreMenu, o.actionId, o.locale);
  },  

  refresh: function() {
    let o = this.options, _this = this, view = o.view, viewLocale = view.get(o.locale), language = {};
    this.$viewTitle.html(viewLocale.title||viewLocale.id);

    $('i', this.$icon).removeClass().addClass(view._meta.iconClass||'fa fa-file-text-o');

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
      columns: _.map(_.cloneDeep(viewLocale.columns), (c)=>{if(c&&c.name&&!c.data){c.data = c.name} return c;}),
      searchCols: this._armSearchCol(),
      search: {search: _.at(view,'.search.fulltext.keyword')[0]},
      order: this._buildOrder(_.at(view, 'search.sort')[0]),
      language: language,
      columnDefs : [{
        targets: 0,
        width: "10px",
        data: null,
        render: function(data, type, row, meta) {
          return '<span class="icon-holder"><i class="'+ (data._meta.iconClass||'fa fa-file-text-o')+'"></i></span>';
        }
      }, {
        targets: -1,
        width: "30px",
        data: null,
        render: function(data, type, row, meta) {
          return '<button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown"><i class="fa fa-ellipsis-h"></i></button><ul class="dropdown-menu dropdown-menu-right"></ul>';
        }
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
          return d||'';
        },
        defaultContent:''
      }],
      sAjaxSource: "view",
      fnServerData: function (sSource, aoData, fnCallback, oSettings ) {
        let kvMap = _this._kvMap(aoData), from = kvMap['iDisplayStart'], size = kvMap['iDisplayLength'];
        view.findDocuments({
          from: from,
          size: size,
          source: 'visibleColumns',
          sort: _this._buildSort(kvMap)
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
            "aaData": _this._toLocale(docs.documents)
          });
          
          let $pageBtn = $('li.page-item.next', _this.element).prev();
          if(Number($pageBtn.find('a').html())*size >= 10000){
            $pageBtn.hide();
          }
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
    let o = this.options, _this = this, view = o.view, viewLocale = view.get(o.locale),
        searchFields = _.filter(view.search.fields, function(sf) { return sf.visible == undefined || sf.visible == true; });

    this.$searchContainer.empty();
    _.each(searchFields, function(sf){
      let title = _.filter(viewLocale.search.fields, function(sfl) { return sfl.name == sf.name })[0].title;
      switch(sf.type){
        case 'keywords':
          $("<div/>").appendTo(_this.$searchContainer).keywords({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            mode: 'multi',
            locale: o.locale,
            selectedItems: sf.values,
            menuItems: function(filter, callback){
              view.distinctQuery(sf.name, {include:filter, size:200}, function(err, data){
                if(err) return console.error(err);
                callback(data.values);
              });
            },
            valueChanged: function(event, values){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.values = values.selectedItems;
              _this.table.column(sf2.name+':name').search(sf2.values.join(',')).draw();
              _this._refreshHeader();
            }
          });
          break;
        case 'numericRange':
          $("<div/>").appendTo(_this.$searchContainer).numericrange({
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
              _this.table.column(sf2.name+':name')
                .search(sf2.lowestValue||sf2.highestValue ? [sf2.lowestValue, sf2.highestValue].join(','):'')
                .draw();
              _this._refreshHeader();
            }
          });
          break;
        case 'datetimeRange':
          $("<div/>").appendTo(_this.$searchContainer).datetimerange({
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
                    
              _this.table.column(sf2.name+':name')
                .search(_this._buildDatetimeRangeSearch(sf2))
                .draw();
              _this._refreshHeader();
            }
          });
          break;
        case 'datetimeDuedate':
          $("<div/>").appendTo(_this.$searchContainer).datetimeduedate({
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
                    
              _this.table.column(sf2.name+':name')
                .search(_this._buildDatetimeRangeSearch(sf2))
                .draw();
              _this._refreshHeader();
            }
          });
          break;
        case 'containsText':
          $("<div/>").appendTo(_this.$searchContainer).containstext({
            title: title,
            name: sf.name,
            class:'search-item',
            btnClass:'btn-sm',
            containsText: sf.containsText,
            locale: o.locale,
            valueChanged: function(event, range){
              let sf2 = _.find(view.search.fields, function(o){return o.name == sf.name});
              sf2.containsText = range.containsText;
              _this.table.column(sf2.name+':name')
                .search(sf2.containsText)
                .draw();
              _this._refreshHeader();
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
        _this.table.search(keyword.keyword).draw();
        _this._refreshHeader();
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
    let o = this.options, _this = this, view = o.view;
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
            searchCols.push({search: _this._buildDatetimeRangeSearch(sf)});
            break;
          case 'datetimeDuedate':
            searchCols.push({search: _this._buildDatetimeRangeSearch(sf)});
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
    let o = this.options, viewLocale = o.view.get(o.locale);
    if(this._isDirty()){
      this.$saveBtn.show().html(_.at(viewLocale, 'toolbox.save')[0]).prop( "disabled", false);
      this.$cancelBtn.show().html(_.at(viewLocale, 'toolbox.cancel')[0]).show();
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
      let _this = this, view = o.view,　client = view.getClient(), currentUser = client.currentUser, Profile = client.Profile;
      this.$favorite.show();

      function doRefreshFavorite(favorites){
        let $i = $('i', _this.$favorite).removeClass();
        if(_.find(favorites, function(f) {return f.domainId==view.domainId&&f.collectionId==view.collectionId&&f.id==view.id;})){
          $i.addClass('c-red-500 fa fa-star-o');
        }else{
          $i.addClass('fa fa-star-o');
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
    let o = this.options, _this = this, view = o.view;
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
    let o = this.options, view = o.view, viewLocale = view.get(o.locale), _this = this;
    this.showIdTitleDialog({
      modelTitle:_.at(viewLocale, 'toolbox.saveAs')[0] || 'Save as...', 
      id: uuidv4(), 
      locale: o.locale,
      submit:function(e, data){
        _this.saveAs(data.id, data.title);
      }
    });
  },

  saveAs: function(id, title, callback){
    let o = this.options, locale = o.locale, client = o.view.getClient(), View = client.View, view = _.cloneDeep(o.view), _this = this;
    view.title = title;
    if(o.locale){
      _.set(view, `_i18n.${locale}.title`, title);
    }
    delete view._meta;
    if(o.view.collectionId == '.collections'){
      view.collections = [o.view.id];
    }

    View.create(o.view.domainId, id||uuidv4(), view, function(err, view){
        if(err) return console.error(err);
        let isNew = o.isNew;
        o.isNew = false;
        o.view = view;
        _this.clone = _.cloneDeep(view);
        _this.refresh();
        _this.closeIdTitleDialog();        
        _this.element.trigger('documentcreated', [view, isNew]);
    });
  },

  _doExportCsv: function(options){
    let o = this.options, columns = _.cloneDeep(this.options.view.columns), 
        view = o.view, viewLocale = view.get(o.locale), 
        title = `${_.at(viewLocale, 'export.export')[0] || 'Exports'} ${viewLocale.title}`,
        client = view.getClient(), rows = [], start = +moment(), count = 0, nonce = uuidv4();

    if(options.source == 'visibleColumns'){
      columns = _.omitBy(columns, function(c){return !c.title || c.visible == false});
    }else if(options.source == 'allColumns'){
      columns = _.omitBy(columns, function(c){return !c.title});
    }

    rows.push(_.values(_.mapValues(columns, function(c) {if(c.title) return c.title;})).join(','));

    function doExport(scrollId){
      let opts = {scroll:'1m'};
      if(scrollId) {
        opts.scrollId = scrollId;
      } else {
        opts.source = options.source;
      }
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
          count = count + data.documents.length;
          client.emitEvent('exportProgress', {
            title: title, 
            hint: moment.duration(moment()-start).asSeconds(),
            nonce: nonce,            
            message:`${(count*100/data.total).toFixed(2)}% ${_.at(viewLocale, 'export.completed')[0] || 'completed'} (${count}/${data.total}).`
          });
          doExport(data.scrollId);
        } else {
          let blob = new Blob([`\uFEFF${rows.join('\n')}`],{ type: "text/plain;charset=utf-8"});
          FileSaver.saveAs(blob, `${viewLocale.title}.csv`);
          client.emitEvent('exportEnd', {
            title: title, 
            hint: moment.duration(moment()-start).asSeconds(),
            nonce: nonce,
            message:`${view.title}.csv ${_.at(viewLocale, 'export.hasBeenExported')[0] || 'has been exported!'}`
          });
        }
      });
    }

    client.emitEvent('exportStart', {
      title: title,
      hint: moment().format('HH:MM:SS'),
      nonce: nonce,
      message:`${_.at(viewLocale, 'export.startExporting')[0] || 'Start exporting'} ${viewLocale.title}`
    });
    doExport();
  },

  _exportCsvAll: function(){
    this._doExportCsv({source: 'allColumns'});
  },

  _exportCsvCurrent: function(){
    this._doExportCsv({source: 'visibleColumns'});
  },

  _onSave: function(){
    let o = this.options, viewLocale = o.view.get(o.locale);
    this.$saveBtn.html(`<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>${_.at(viewLocale, 'toolbox.wait')[0] || "Please wait..."}`).prop( "disabled", true);
    this.$cancelBtn.hide();
    this.save();
  },

  save: function(){
    let o = this.options, _this = this;
    if(this._isDirty()){
      o.view.patch({patch: this._getPatch()}, function(err, view){
        if(err) return console.error(err);
  	    _.forOwn(o.view,function(v,k){try{delete o.view[k]}catch(e){}});
        _.merge(o.view, view);
        _this.clone = _.cloneDeep(view);
        _this._refreshHeader();
      });
    }
  },  

  _onCancel: function(){
    let o = this.options, _this = this, view = o.view;

  	 _.forOwn(view,function(v,k){try{delete view[k]}catch(e){}});
    _.merge(view, this.clone);

    this._refreshHeader();
    this._refreshSearchBar();

    _.each(o.view.search.fields, function(sf){
      switch(sf.type){
        case 'keywords':
          _this.table.column(sf.name+':name')
               .search(_.isEmpty(sf.values) ? '' : sf.values.join(','));
          break;
        case 'containsText':
          _this.table.column(sf.name+':name')
               .search(sf.containsText);
        case 'numericRange':
          _this.table.column(sf.name+':name')
               .search(sf.lowestValue||sf.highestValue ? [sf.lowestValue, sf.highestValue].join(','):'');
          break;
        case 'datetimeRange':
          _this.table.column(sf.name+':name')
               .search(sf.earliest||sf.latest ? [sf.earliest, sf.latest].join(','):'');
          break;
      }
    });

    this.table.draw();
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

  _setOption: function(key, value){
    let o = this.options, _this = this;

    this._super(key, value);

    if(key === "view") {
      if(!o.isNew){
        this.clone = _.cloneDeep(o.view);      
      }
      this.refresh();
    }

  }
  
});
