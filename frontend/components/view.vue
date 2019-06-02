<template>
  <div class="view-container">
    <div class="row">
      <div class="col-md-12">
        <div class="view-header pB-5 mB-15">
          <span class="icon mR-5">
            <i :class="document._meta.iconClass || 'fa fa-file-text-o'"></i>
          </span>
          <h4 class="c-grey-900 d-ib">{{i18n_title}}</h4>
          <span class="favorite mL-10" @click="onFavoriteClick()">
            <i class="fa fa-star-o" :class="{'c-red-500': isFavorite}"></i>
          </span>
          <div class="actions btn-group float-right">
            <button type="button" v-if="isNew||isDirty" @click="onSaveClick" class="save btn btn-primary btn-sm">{{$t('save')}}</button>
            <button type="button" v-if="isNew||isDirty" @click="onCancelClick" class="cancel btn btn-sm">{{$t('cancel')}}</button>
            <button
              type="button"
              class="more btn btn-outline-secondary btn-sm btn-light"
              data-toggle="dropdown">
              <i class="fa fa-ellipsis-h"></i>
              <ul class="dropdown-menu dropdown-menu-right">
                <li class="dropdown-item save-as" @click="onSaveAsClick">{{$t('saveAs')}}</li>
                <div class="dropdown-divider"></div>
                <li class="dropdown-item export-csv-all" @click="exportCsv('allColumns')">{{$t('exportAllCSV')}}</li>
                <li class="dropdown-item export-csv-current" @click="exportCsv('visibleColumns')">{{$t('exportCurrentCSV')}}</li>
                <div class="dropdown-divider"></div>
                <template v-for="act in localeActions">
                  <li class="dropdown-item" v-if="act.id!=actionId" @click="onActionClick(act)" :key="act.collectionId+'~'+act.id">
                    {{act.title}}
                  </li>
                </template>
                <div class="dropdown-divider" v-if="deleteable"></div>
                <li class="dropdown-item delete" v-if="deleteable" @click="deleteSelf">{{$t('delete')}}</li>
              </ul>
            </button>
            <div class="modal fade" id="save-as" ref="saveAs" tabindex="-1" role="dialog" aria-labelledby="save-as" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">{{$t('save')}}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <form class="id-title">
                      <div class="form-group">
                        <label for="id">{{$t('id')}}</label>
                        <input type="text" class="form-control" name="id" v-model="saveAsId" aria-describedby="docHelp">
                        <span class="messages"></span>
                      </div>
                      <div class="form-group">
                        <label for="title">{{$t('title')}}</label>
                        <input type="text" class="form-control" name="title" v-model="saveAsTitle" aria-describedby="docHelp">
                        <span class="messages"></span>
                      </div>
                      <button type="submit" class="btn btn-primary d-none" @click="onSaveAsSubmit">{{$t('submit')}}</button>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="cancel btn btn-secondary" data-dismiss="modal">{{$t('cancel')}}</button>
                    <button type="button" class="submit btn btn-primary" @click="onSaveAsSubmit" data-loading-text="<i class='fa fa-circle-o-notch fa-spin'></i> Please wait...">
                      <span v-if="wait" class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true">{{$t('wait')}}</span>
                      <span v-if="!wait">{{$t('submit')}}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>            
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="search-container mB-10">
          <template v-for="sf in i18n_searchFields">
            <Keywords
              v-if="sf.type=='keywords'&&(sf.visible == undefined || sf.visible)"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :selectedItems.sync="getSearchField(sf.name).values"
              :fetchItems="distinctQuery"
            ></Keywords>
            <ContainsText
              v-if="sf.type=='containsText'&&(sf.visible == undefined || sf.visible)"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :containsText.sync="getSearchField(sf.name).containsText"
            ></ContainsText>
            <NumericRange
              v-if="sf.type=='numericRange'&&(sf.visible == undefined || sf.visible)"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :range.sync = "getSearchField(sf.name).range"
            ></NumericRange>
            <DatetimeRange
              v-if="sf.type=='datetimeRange'&&(sf.visible == undefined || sf.visible)"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :range.sync="getSearchField(sf.name).range"
            ></DatetimeRange>
            <DatetimeDuedate
              v-if="sf.type=='datetimeDuedate'&&(sf.visible == undefined || sf.visible)"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :range.sync="getSearchField(sf.name).range"
            ></DatetimeDuedate>            
          </template>
          <FullTextSearch :keyword.sync="document.search.fulltext.keyword"></FullTextSearch>
          <div class="search-item dropdown btn-group">
            <button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown">
              <i class="fa fa-ellipsis-h"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-right">
              <ul class="item-container fa-ul mx-1 mb-0">
                <li class="dropdown-item px-2" v-for="sf in i18n_searchFields" :key="sf.name" @click.stop.prevent="onSearchConfigurationItemClick(sf.name)" >
                  <i class="fa-li fa" v-bind:class="{'fa-square-o': sf.visible==false, 'fa-check-square-o': sf.visible==undefined||sf.visible}"></i>
                    {{sf.title }}
                  </li>
              </ul>
            </div>
          </div>          
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">{{$t('tableHint',{start:from+1, end:from+documents.length, total:total})}}</div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="table-responsive">
          <table class="view-table table table-striped table-hover table-sm">
            <thead>
              <tr>
                <th class="text-center" width="46px"></th>
                <template v-for="(column, colIndex) in i18n_columns">
                  <th
                    scope="col"
                    v-if="column.visible==undefined||column.visible"
                    :key="keyColumn(column,colIndex)" 
                    @click="onColumnHeaderClick(column.name)">
                    {{renderHeaderCell(column, colIndex)}}
                    <i class="fa" :class="{'fa-sort':column.sortable&&!column.order, 'fa-sort-desc':column.order=='desc', 'fa-sort-asc': column.order=='asc'}"></i>
                  </th>
                </template>
                <th class="text-center" width="46px">
                  <div class="column-configuration">
                    <button type="button" class="btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown">
                      <i class="fa fa-columns"></i>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                      <ul class="item-container fa-ul mx-1 mb-0">
                        <li class="dropdown-item px-2" v-for="col in i18n_columns" :key="col.name" @click.stop.prevent="onColumnConfigurationItemClick(col.name)">
                          <i class="fa-li fa" v-bind:class="{'fa-square-o': col.visible==false, 'fa-check-square-o': col.visible==undefined||col.visible}"></i>
                            {{col.title }}
                          </li>                        
                      </ul>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, row) in documents" :class="{'table-active':isActive(doc)}" @click="setActive(doc)" :key="keyRow(doc, row)">
                <td class="text-center" width="46px">
                  <span class="icon-holder">
                    <i :class="[doc._meta.iconClass || 'fa fa-file-text-o']"></i>
                  </span>
                </td>
                <template v-for="(column, col) in document.columns">
                  <td :key="keyCell(doc, column, row, col)" v-if="column.visible==undefined||column.visible">
                    <a
                      href="javascript:void(0)"
                      v-if="column.defaultLink"
                      @click="onDefaultLinkClick($event, doc)"
                    >{{renderCell(doc, column, row, col)}}</a>
                    <span v-if="!column.defaultLink">{{renderCell(doc, column, row, col)}}</span>
                  </td>
                </template>
                <td class="text-center" width="46px">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm btn-light"
                    data-toggle="dropdown" @click="setActive(doc)">
                    <i class="fa fa-ellipsis-h"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-right">
                    <template v-for="act in localeRowActions">
                      <li class="dropdown-item" @click="onRowActionClick(doc, act)" :key="act.collectionId+'~'+act.id">
                        {{act.title}}
                      </li>
                    </template>
                    <li class="dropdown-item delete" v-if="rowDeleteable" @click="deleteRow(doc)">{{$t('delete')}}</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">
        <span>{{$t('pageSettingPrefix')}}</span>
        <select class="custom-select custom-select-sm page-setting" style="display:inline;width:62px" v-model="size">
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>{{$t('pageSettingSuffix')}}</span>
      </div>
      <div class="col-md-6">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-end">
            <li
              class="page-item"
              :class="{disabled:currentPage==1}"
              @click="goToPage(currentPage - 1)">
              <a
                class="page-link"
                href="javascript:void(0)"
                tabindex="-1"
                :aria-disabled="currentPage==1?true:null">{{$t('previous')}}</a>
            </li>
            <template v-for="pageBtn in pageBtns">
              <li
                :key="pageBtn.btnNo"
                class="page-item"
                :class="{active:pageBtn.active, disabled: pageBtn.disabled}"
                :aria-current="pageBtn.active ? 'page': null"                
                @click="pageBtn.pageNo?goToPage(pageBtn.pageNo):null">
                <a 
                  class="page-link" 
                  href="javascript:void(0)"
                  :aria-disabled="pageBtn.disabled">{{pageBtn.label}}</a>
              </li>
            </template>
            <li
              class="page-item"
              :class="{disabled:currentPage==totalPage}"
              @click="goToPage(currentPage+1)">
              <a
                class="page-link"
                href="javascript:void(0)"
                :aria-disabled="currentPage==totalPage?true:null"
              >{{$t('next')}}</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";

import Keywords from "./search/keywords";
import ContainsText from "./search/contains-text";
import NumericRange from "./search/numeric-range";
import DatetimeRange from "./search/datetime-range";
import DatetimeDuedate from "./search/datetime-duedate";
import FullTextSearch from "./search/full-text-search";

import utils from 'core/utils';

import jsonPatch from "fast-json-patch";
import validate from "validate.js";
import FileSaver from "file-saver";
import uuidv4 from "uuid/v4";

export default {
  data() {
    return {
      error: null,
      saveAsId: '',
      saveAsTitle:'',
      wait: false,
      actions: [],
      deleteable: false,
      activeRow:null,
      rowActions:[],
      rowDeleteable: false,
      clone: _.cloneDeep(this.document),
      isNew: false,
      from: 0,
      size: 15,
      total: 0,
      documents: [],
      previous:{},
      next:{},
      pageBtns:[]
    };
  },
  props: ["document","actionId"],
  i18n: {
    messages: {
      en:{
        id: "ID",
        title: "title",
        save: "Save",
        saveAs: "Save as...",
        wait: "Please wait...",
        cancel: "Cancel",
        delete: "Delete",
        submit: "Submit",
        previous: "Previous",
        next: "Next",
        tableHint: "Showing {start} to {end} of {total} entries",
        pageSettingPrefix: "Show",
        pageSettingSuffix: "entries",
        exportAllCSV: "Exports CSV (All Fields)",
        exportCurrentCSV: "Exports CSV (Current Fields)" 
      },
      cn: {
        id: "唯一标识",
        title: "标题",
        save: "保存",
        saveAs: "另存为...",
        wait: "请稍等...",
        cancel: "取消",
        delete: "删除",
        submit: "提交",
        previous: "上页",
        next: "下页",
        tableHint: "第{start}至{end}项，共{total}项",
        pageSettingPrefix: "每页显示",
        pageSettingSuffix: "项",
        exportAllCSV: "导出为CSV文件（所有字段）",
        exportCurrentCSV: "导出为CSV文件（当前字段）" 
      }
    }
  },  
  created() {
    this.fetchDocuments();
    this.fetchActions(this.document).then((actions)=>{
      this.actions = actions;
    });
    this.checkPermission();
  },
  watch: {
    searchFields:{
      handler(newValue, oldValue) {
        this.fetchDocuments();
      },
      deep:true
    },
    columns:{
      handler(newValue, oldValue) {
        this.fetchDocuments();
      },
      deep:true
    },
    size(){
      this.fetchDocuments();
    },
    
  },
  computed: {
    patch(){
      return jsonPatch.compare(this.clone, this.document);
    },
    isDirty(){
      return this.patch.length > 0;
    },
    localeDoc() {
      return this.document.get(this.locale);
    },
    localeActions(){
      return _.reduce(this.actions, (acts, act)=>{
        acts.push(act.get(this.locale));
        return acts;
      }, []);
    },
    localeRowActions(){
      return _.reduce(this.rowActions, (acts, act)=>{
        acts.push(act.get(this.locale));
        return acts;
      }, []);
    },
    searchFields() {
      return this.document.search.fields;
    },
    i18n_searchFields() {
      return this.localeDoc.search.fields;
    },
    columns(){
      return this.document.columns;
    },
    i18n_columns() {
      return this.localeDoc.columns;
    },
    i18n_title() {
      return this.localeDoc.title;
    },
    currentPage() {
      return Math.ceil((this.from + 1) / this.size);
    },
    totalPage() {
      return Math.ceil(this.total / this.size);
    },
    isFavorite(){
      let { domainId, collectionId, id } = this.document,
        index = _.findIndex(this.profile.favorites, f => _.isEqual(f, {domainId:domainId, collectionId:collectionId, id: id}));
      return index >= 0;
    },
    $saveAs(){
      return $(this.$refs.saveAs);
    },    
    ...mapState(["currentDomainId", "profile", "locale"])
  },
  methods: {
    isActive(doc){
      return this.activeRow == doc;
    },
    setActive(doc){
      this.rowActions = [];
      this.fetchActions(doc).then((actions)=>{
        this.rowActions = actions;
      });
      this.activeRow = doc;
      this.checkRowDeleteable(doc);
    },
    onFavoriteClick() {
      let { domainId, collectionId, id } = this.document
      this.$store.dispatch('TOGGLE_FAVORITE',{domainId:domainId, collectionId:collectionId, id: id});
    },
    goToPage(pageNo) {
      if (pageNo < 1) pageNo = 1;
      if (pageNo > this.totalPage) pageNo = this.totalPage;
      this.fetchDocuments((pageNo - 1) * this.size);
    },
    fetchDocuments(from) {
      this.document.findDocuments(
        {
          from: from != undefined ? from : this.from,
          size: this.size,
          source: "visibleColumns"
        },
        (err, docs) => {
          if (err) return this.error = err.toString();
          this.from = from != undefined ? from : this.from;
          this.total = docs.total;
          this.documents = docs.documents;
          this.updatePagination()
          this.$emit('resize')
        }
      );
    },
    updatePagination(){
      if(this.totalPage <= 7){
        this.pageBtns = _.times(this.totalPage, (btnNo)=>{
          let btn = {
            btnNo: btnNo,
            pageNo: btnNo+1,
            label: `${btnNo+1}`
          }          
          return btn;
        });
      } else {
        this.pageBtns = _.times(7, (btnNo)=>{
          let btn = {
            btnNo: btnNo,
            pageNo: btnNo+1,
            label: `${btnNo+1}`
          }
          if(this.currentPage <= 4){
            if(btnNo == 5){
              delete btn.pageNo;
              btn.label = '...'
              btn.disabled = true
            }
            if(btnNo == 6){
              btn.pageNo = this.totalPage
              btn.label = `${this.totalPage}`
              if(this.totalPage*this.size >= 10000){
                btn.disabled = true
              }
            }
          } else {
            if(btnNo == 1){
              delete btn.pageNo;
              btn.label = '...'
              btn.disabled = true
            }
            if(this.currentPage<this.totalPage-3){
              if(btnNo == 2){
                btn.pageNo = this.currentPage - 1 
                btn.label = `${btn.pageNo}`
              } else if(btnNo == 3){
                btn.pageNo = this.currentPage
                btn.label = `${btn.pageNo}`
              } else if(btnNo == 4){
                btn.pageNo = this.currentPage + 1
                btn.label = `${btn.pageNo}`
              } else if(btnNo == 5){
                delete btn.pageNo;
                btn.label = '...'
                btn.disabled = true
              }               
            } else {
              if(btnNo == 2){
                btn.pageNo = this.totalPage - 4 
                btn.label = `${btn.pageNo}`
              } else if(btnNo == 3){
                btn.pageNo = this.totalPage - 3
                btn.label = `${btn.pageNo}`
              } else if(btnNo == 4){
                btn.pageNo = this.totalPage - 2
                btn.label = `${btn.pageNo}`
              } else if(btnNo == 5){
                btn.pageNo = this.totalPage - 1
                btn.label = `${btn.pageNo}`
              }               
            }
            if(btnNo == 6){
              btn.pageNo = this.totalPage
              btn.label = `${btn.pageNo}`
              if(this.totalPage*this.size >= 10000){
                btn.disabled = true
              }
            }
          }
          if(btn.pageNo == this.currentPage){
            btn.active = true;
          }
          return btn;
        });
      }      
    },
    distinctQuery(field, filter, callback) {
      this.document.distinctQuery(
        field,
        {
          include: filter,
          size: 200
        },
        (err, data) => {
          callback(err, data && data.values);
        }
      );
    },
    renderHeaderCell(column, colIndex) {
      return column.title;
    },
    renderCell(doc, column, row, col) {
      let localeDoc = doc.get(this.locale),
        d = this.at(localeDoc, column.name);
      if (column.type == "date") {
        let date = moment(d);
        d = date && date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : "";
      }
      return d || "";
    },
    keyRow(doc, row) {
      return doc.id + row;
    },
    keyColumn(column, col) {
      return column.name || col;
    },
    keyCell(doc, column, row, col) {
      return doc.id + "#" + (column.name || col);
    },
    getSearchField(name) {
      return _.filter(this.document.search.fields, f => {
        return f.name == name;
      })[0];
    },
    getColumn(name) {
      return _.filter(this.document.columns, c => {
        return c.name == name;
      })[0];
    },
    onSaveClick(){
      this.document.patch({patch: this.patch}, (err, view) => {
        if (err) return this.error = err.toString();
        this.replace(this.clone, view);
        this.replace(this.document, view);
      });
    },
    onSaveAsClick(){
      this.saveAsId = uuidv4();
      this.saveAsTitle = '';
      this.$saveAs.modal('show');
    },
    onDefaultLinkClick(evt, doc){
      let path = `/${doc.collectionId}/${doc.id}`
      if(evt.ctrlKey){
        path = `/${doc.collectionId}/${doc.id}/edit`
      }
      this.$router.push(path)
    },
    onSaveAsSubmit(){
      this.saveAs(this.saveAsId, this.saveAsTitle).then(()=>{
        this.$saveAs.modal('hide');
        this.$router.replace(`/.views/${this.saveAsId}`);
      });
    },
    onCancelClick(){
      this.replace(this.document, this.clone);
    },
    saveAs(id, title){
      let {View} = this.$client, view = _.cloneDeep(this.document);
      view.title = title;
      delete view._meta;
      if (this.document.collectionId == '.collections') {
        view.collections = [this.document.id];
      }
      return new Promise((resolve, reject)=>{
        View.create(this.currentDomainId, id, view, (err, view) => {
          if (err) return reject(err);
          resolve(view);
        });
      });
    },    
    replace(source, target){
       // erase all current keys from data
       Object.keys(source).forEach(key => {
         if(key != 'id'){
           source[key] = null
         }
      });
       // set all properties from newdata into data
      Object.entries(_.cloneDeep(target)).forEach(entry => {
        if(entry[0] != 'id'){
          this.$set(source, entry[0], entry[1])
        }
      });
    },
    onSearchConfigurationItemClick(fieldName){
      let field = this.getSearchField(fieldName), visible = field.visible == undefined || field.visible;
      this.$set(field, 'visible', !visible)
    },
    onColumnConfigurationItemClick(columnName){
      let col = this.getColumn(columnName), visible = col.visible == undefined || col.visible;
      this.$set(col, 'visible', !visible)
    },
    fetchActions(doc){
      let {Meta, Action} = this.$client;
      function armItems(domainId, actIds) {
        return new Promise((resolve, reject)=>{
          Action.mget(domainId, actIds, (err, result) => {
            if (err) return reject(err);
            resolve(result.actions);
          });
        });
      }
      if (doc._meta.actions) {
        return armItems(doc.domainId, doc._meta.actions);
      } else {
        return new Promise((resolve, reject)=>{
          Meta.get(doc.domainId, doc._meta.metaId||'.meta', (err, meta) => {
            if (err) return reject(err);
            resolve(armItems(doc.domainId, meta.actions));
          });
        });
      }
    },
    checkPermission(){
      let {currentUser} = this.$client, doc = this.document;
      return new Promise((resolve, reject)=>{
        utils.checkPermission(doc.domainId, currentUser.id, 'delete', doc, (err, result) => {
          if(err) return reject(err);
          this.deleteable = result;
        });
      });
    },
    checkRowDeleteable(row){
      let {currentUser} = this.$client;
      return new Promise((resolve, reject)=>{
        utils.checkPermission(row.domainId, currentUser.id, 'delete', row, (err, result) => {
          if(err) return reject(err);
          this.rowDeleteable = result;
          resolve(result);
        });
      });
    },
    onActionClick(act){
      this.$router.push(`/${this.document.collectionId}/${this.document.id}/${act.id}`);
    },
    onRowActionClick(doc, act){
      this.$router.push(`/${doc.collectionId}/${doc.id}/${act.id}`);
    },
    onColumnHeaderClick(columnName){
      let column = _.filter(this.columns, c=>c.name==columnName)[0]
      if(column&&column.sortable){
        if(!column.order){
          this.$set(column, 'order', 'asc');
        } else if(column.order == 'asc'){
          column.order = 'desc'          
        } else {
          this.$delete(column, 'order')
        }
      }
    },
    deleteSelf(){
      let {currentUser} = this.$client, { domainId, collectionId, id } = this.document;
      return new Promise((resolve, reject)=>{
        this.document.delete((err, result) => {
          if (err) return reject(err);
          if(this.isFavorite)
            this.$store.dispatch('TOGGLE_FAVORITE',{domainId:domainId, collectionId:collectionId, id: id});
          this.$router.go(-1);
          resolve(result);
        });
      });
    },
    deleteRow(doc){
      let {Collection} = this.$client;
      return new Promise((resolve, reject)=>{
        doc.delete((err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }).then(()=>{
        return new Promise((resolve, reject)=>{
          Collection.get(doc.domainId, doc.collectionId, (err, collection) => {
            if (err) return reject(err);
            resolve(collection);
          })
        });
      }).then((collection)=>{
        return new Promise((resolve, reject)=>{
          collection.refresh((err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
      }).then(()=>{
        this.fetchDocuments();
      });
    },
    exportCsv(source) {
      let doc = this.document, localeDoc = this.localeDoc, columns = localeDoc.columns,
        title = `${_.at(localeDoc, 'export.prompt.export')[0] || 'Exports'} ${localeDoc.title}`,
        rows = [], start = +moment(), count = 0, nonce = uuidv4();

      if (source == 'visibleColumns') {
        columns = _.omitBy(columns, function (c) {
          return !c.title || c.visible == false
        });
      } else if (source == 'allColumns') {
        columns = _.omitBy(columns, function (c) {
          return !c.title
        });
      }

      rows.push(_.values(_.mapValues(columns, function (c) {
        if (c.title) return c.title;
      })).join(','));

      let doExport = (scrollId) => {
        let opts = {scroll: '1m'};
        if (scrollId) {
          opts.scrollId = scrollId;
        } else {
          opts.source = source;
          opts.size = _.at(doc, 'export.size')[0] || 1000;
        }
        doc[scrollId ? 'scroll' : 'findDocuments'](opts, (err, data) => {
          if (err) return console.error(err);
          _.each(data.documents, (doc) => {
            let row = _.reduce(columns, (r, c) => {
              let d = utils.get(doc.get(this.locale), c.name);
              if (c.type == 'date') {
                let date = moment(d);
                d = (date && date.isValid()) ? date.format('YYYY-MM-DD HH:mm:ss') : '';
              }
              if (_.isArray(d)) {
                d = '\"' + d.toString() + '\"';
              }
              r.push(d);
              return r;
            }, []);
            rows.push(row.join(','));
          });

          if (data.documents.length > 0) {
            count = count + data.documents.length;
            this.$store.commit('UPDATE_TOAST', {
              title: title,
              hint: `${moment.duration(moment()-start).asSeconds()}(s)`,
              nonce: nonce,
              message: `${(count*100/data.total).toFixed(2)}% ${_.at(localeDoc, 'export.prompt.completed')[0] || 'completed'} (${count}/${data.total}).`
            });
            doExport(data.scrollId);
          } else {
            let blob = new Blob([`\uFEFF${rows.join('\n')}`], { type: "text/plain;charset=utf-8" });
            FileSaver.saveAs(blob, `${localeDoc.title}.csv`);
            this.$store.commit('UPDATE_TOAST', {
              title: title,
              hint: `${moment.duration(moment()-start).asSeconds()}(s)`,
              nonce: nonce,
              message: `${localeDoc.title}.csv ${_.at(localeDoc, 'export.prompt.hasBeenExported')[0] || 'has been exported!'}`
            });
          }
        });
      }

      this.$store.commit('ADD_TOAST', {
        title: title,
        hint: moment().format('HH:MM:SS'),
        nonce: nonce,
        message: `${_.at(localeDoc, 'export.prompt.startExporting')[0] || 'Start exporting'} ${localeDoc.title}`
      });
      doExport();
    },    
    at(object, path) {
      if (!object || !path) return;
      if (_.isString(path)) path = path.split(".");
      if (_.isArray(object)) {
        if (path.length == 1) {
          return _.reduce(object, (r, v, k) => {
              if (v[path[0]]) r.push(v[path[0]]);
              return r;
            }, []).toString();
        } else {
          return this.at(_.reduce(object, (r, v, k) => {
                if (v[path[0]]) r.push(v[path[0]]);
                return r;
              }, []),
            _drop[path]
          );
        }
      } else {
        if (path.length == 1) {
          return object[path[0]];
        } else {
          return this.at(object[path[0]], _.drop(path));
        }
      }
    }
  },
  components: {
    Keywords,
    ContainsText,
    NumericRange,
    DatetimeRange,
    DatetimeDuedate,
    FullTextSearch
  }
};
</script>

<style lang="scss" scoped>
.view-container {
  padding: 30px;
}

.view-header {
  border-bottom: 1px solid lightgray;

  .icon {
    font-size: 24px;
  }

  h4 {
    vertical-align: baseline;
  }

  .favorite {
    font-size: 16px;
    vertical-align: super;
  }

  .dropdown-item {
    font-size: 0.875rem;
  }

  .btn {
    border-color: lightgray;
    border-radius: 0.2rem;
  }
}

.search-item {
  font-size: 0.8rem;
  padding-bottom: 5px;
  margin-right: 2px;

  .btn {
    border-color: lightgray;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-container {
    font-size: 0.875rem;
    position: relative;

    li > i {
      position: relative;
      left: 0px;
      top: 0px;
      width: auto;
    }
  }  
}


.view-table {
  th, td {
    vertical-align: middle;
    .fa-sort{
      color:darkgray;
    }
  }

  .column-configuration{
    .btn.btn-outline-secondary {
      border-color: lightgray !important;
    }
    .item-container {
      position: relative;
      font-size: 0.875rem;

      li > i {
        position: relative;
        left: 0px;
        top: 0px;
        width: auto;
      }
    }    
  }

  tbody {
    .table-active {
      .btn {
        visibility: visible;
      }
    }
    .btn {
      border: none;
      visibility: hidden;
    }

    tr:hover {
      .btn {
        visibility: visible;
      }
    }

    .dropdown-menu{
      font-size: 0.875rem;
    }
  }

  a:hover {
    text-decoration: underline;
  }
}
</style>
