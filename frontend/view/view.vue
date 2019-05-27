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
            <button type="button" v-if="isNew||isDirty" @click="onSaveClick" class="save btn btn-primary btn-sm">Save</button>
            <button type="button" v-if="isNew||isDirty" @click="onCancelClick" class="cancel btn btn-sm">Cancel</button>
            <button
              type="button"
              class="more btn btn-outline-secondary btn-sm btn-light"
              data-toggle="dropdown"
            >
              <i class="fa fa-ellipsis-h"></i>
              <ul class="dropdown-menu dropdown-menu-right">
                <li class="dropdown-item save-as">Save as ...</li>
              </ul>
            </button>
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
          </template>
          <FullTextSearch :keyword.sync="document.search.fulltext.keyword"></FullTextSearch>
          <!-- <SearchSetting :fields="i18n_searchFields"></SearchSetting> -->
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
      <div class="col-md-12">显示第{{from+1}}至{{from+documents.length}}项结果，共{{total}}项</div>
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
                    :key="keyColumn(column,colIndex)">
                    {{renderHeaderCell(column, colIndex)}}
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
              <tr v-for="(doc, row) in documents" :key="keyRow(doc, row)">
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
                      @click="$router.push(`/${doc.collectionId}/${doc.id}`)"
                    >{{renderCell(doc, column, row, col)}}</a>
                    <span v-if="!column.defaultLink">{{renderCell(doc, column, row, col)}}</span>
                  </td>
                </template>
                <td class="text-center" width="46px">
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm btn-light"
                    data-toggle="dropdown">
                    <i class="fa fa-ellipsis-h"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-right"></ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-6">显示第{{from+1}}至{{from+documents.length}}项结果，共{{total}}项</div>
      <div class="col-md-12">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-end">
            <li
              class="page-item"
              :class="{disabled:currentPage==1}"
              @click="goToPage(currentPage - 1)"
            >
              <a
                class="page-link"
                href="javascript:void(0)"
                tabindex="-1"
                :aria-disabled="currentPage==1?true:null"
              >Previous</a>
            </li>
            <li
              class="page-item"
              :class="{active:currentPage==1}"
              :aria-current="currentPage == 1 ? 'page': null"
              @click="goToPage(1)"
            >
              <a class="page-link" href="javascript:void(0)">1</a>
            </li>
            <li
              class="page-item"
              v-if="totalPage >= 2"
              :class="{active:currentPage==2}"
              :aria-current="currentPage == 2 ? 'page': null"
              @click="goToPage(2)"
            >
              <a class="page-link" href="javascript:void(0)">2</a>
            </li>
            <li
              class="page-item"
              v-if="totalPage >= 3"
              :class="{active:currentPage==3}"
              :aria-current="currentPage == 3 ? 'page': null"
              @click="goToPage(3)"
            >
              <a class="page-link" href="javascript:void(0)">3</a>
            </li>
            <li
              class="page-item"
              v-if="totalPage >= 4"
              :class="{active:currentPage==4}"
              :aria-current="currentPage == 4 ? 'page': null"
              @click="goToPage(4)"
            >
              <a class="page-link" href="javascript:void(0)">4</a>
            </li>
            <li
              class="page-item"
              v-if="totalPage >= 5"
              :class="{active:currentPage==5}"
              :aria-current="currentPage == 5 ? 'page': null"
              @click="goToPage(5)"
            >
              <a class="page-link" href="javascript:void(0)">5</a>
            </li>
            <li
              class="page-item"
              v-if="totalPage >= 6"
              :class="{active:currentPage==6}"
              :aria-current="currentPage == 6 ? 'page': null"
              @click="goToPage(6)"
            >
              <a class="page-link" href="javascript:void(0)">6</a>
            </li>
            <li
              class="page-item"
              v-if="totalPage >= 7"
              :class="{active:currentPage==7}"
              :aria-current="currentPage == 7 ? 'page': null"
              @click="goToPage(7)"
            >
              <a class="page-link" href="javascript:void(0)">7</a>
            </li>
            <li
              class="page-item"
              :class="{disabled:currentPage==totalPage}"
              @click="goToPage(currentPage+1)"
            >
              <a
                class="page-link"
                href="javascript:void(0)"
                :aria-disabled="currentPage==totalPage?true:null"
              >Next</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Keywords from "search/keywords/keywords.vue";
import ContainsText from "search/contains-text/contains-text.vue";
import NumericRange from "search/numeric-range/numeric-range.vue";
import DatetimeRange from "search/datetime-range/datetime-range.vue";
import FullTextSearch from "search/full-text/full-text-search";

import _ from "lodash";
import jsonPatch from "fast-json-patch";
import validate from "validate.js";
import FileSaver from "file-saver";

// const PerfectScrollbar from'perfect-scrollbar')
// import 'perfect-scrollbar/css/perfect-scrollbar.css')

// import "search/datetime-duedate/datetime-duedate";

export default {
  data() {
    return {
      error: null,
      clone: _.cloneDeep(this.document),
      isNew: false,
      from: 0,
      size: 10,
      total: 0,
      documents: []
    };
  },
  props: ["document"],
  created() {
    this.fetchDocuments();
  },
  watch: {
    'document.search':{
      handler(newValue, oldValue) {
        this.fetchDocuments();
      },
      deep:true
    }
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
    sort() {
      return this.document.search.sort || [];
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
    ...mapState(["currentDomainId", "profile", "locale"])
  },
  methods: {
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
          source: "visibleColumns",
          sort: this.sort
        },
        (err, docs) => {
          if (err) return (this.error = err.toString());
          this.from = from != undefined ? from : this.from;
          this.total = docs.total;
          this.documents = docs.documents;
        }
      );
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
    onCancelClick(){
      this.replace(this.document, this.clone);
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
    at(object, path) {
      if (!object || !path) return;
      if (_.isString(path)) path = path.split(".");
      if (_.isArray(object)) {
        if (path.length == 1) {
          return _.reduce(
            object,
            function(r, v, k) {
              if (v[path[0]]) r.push(v[path[0]]);
              return r;
            },
            []
          );
        } else {
          return this.at(
            _.reduce(
              object,
              function(r, v, k) {
                if (v[path[0]]) r.push(v[path[0]]);
                return r;
              },
              []
            ),
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
    FullTextSearch
  }
};
</script>

<style lang="scss" scoped>
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
    font-size: 0.9rem;
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
  }

  .column-configuration{
    .btn.btn-outline-secondary {
      border-color: lightgray !important;
    }
    .item-container {
      position: relative;
      font-size: 0.9rem;

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
  }

  a:hover {
    text-decoration: underline;
  }
}
</style>
