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
            <button type="button" class="save btn btn-primary btn-sm">Save</button>
            <button type="button" class="cancel btn btn-sm">Cancel</button>
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
              v-if="sf.type=='keywords'"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :selectedItems.sync="getSearchField(sf.name).selectedItems"
              :fetchItems="distinctQuery"
            ></Keywords>
            <ContainsText
              v-if="sf.type=='containsText'"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :containsText.sync="getSearchField(sf.name).containsText"
            ></ContainsText>
            <NumericRange
              v-if="sf.type=='numericRange'"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :lowestValue.sync="getSearchField(sf.name).lowestValue"
              :highestValue.sync="getSearchField(sf.name).highestValue"
            ></NumericRange>
            <DatetimeRange
              v-if="sf.type=='datetimeRange'"
              :key="sf.name"
              :name="sf.name"
              :title="sf.title"
              :range.sync="getSearchField(sf.name).range"
            ></DatetimeRange>
          </template>
          <FullTextSearch :keyword="document.search.fulltext.keyword"></FullTextSearch>
          <SearchSetting :fields="i18n_searchFields"></SearchSetting>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">显示第{{from+1}}至{{from+documents.length}}项结果，共{{total}}项</div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th></th>
                <th
                  scope="col"
                  v-for="(column, colIndex) in i18n_columns"
                  :key="keyColumn(column,colIndex)"
                >{{renderHeaderCell(column, colIndex)}}</th>
                <th>
                  <ColumnSetting :columns="i18n_columns"></ColumnSetting>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, row) in documents" :key="keyRow(doc, row)">
                <td>
                  <span class="icon-holder">
                    <i :class="[doc._meta.iconClass || 'fa fa-file-text-o']"></i>
                  </span>
                </td>
                <td v-for="(column, col) in document.columns" :key="keyCell(doc, column, row, col)">
                  <a
                    href="javascript:void(0)"
                    v-if="column.defaultLink"
                    @click="$router.push(`/${doc.collectionId}/${doc.id}`)"
                  >{{renderCell(doc, column, row, col)}}</a>
                  <span v-if="!column.defaultLink">{{renderCell(doc, column, row, col)}}</span>
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm btn-light"
                    data-toggle="dropdown"
                  >
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

import ColumnSetting from "./components/ColumnSetting";
import SearchSetting from "./components/SearchSetting.vue";

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

// import "search/datetime-range/datetime-range";
// import "search/datetime-duedate/datetime-duedate";

export default {
  data() {
    return {
      error: null,
      isNew: false,
      clone: null,
      isFavorite: false,
      from: 0,
      size: 10,
      total: 0,
      documents: []
    };
  },
  props: ["document"],
  created() {
    this.clone = _.cloneDeep(this.document);
    this.refreshFavorite();
    this.fetchDocuments();
  },
  watch: {
    document() {
      this.clone = _.cloneDeep(this.document);
      this.refreshFavorite();
      this.fetchDocuments();
    }
  },
  computed: {
    localeDoc() {
      return this.document.get(this.locale);
    },
    i18n_searchFields() {
      return this.localeDoc.search.fields;
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
    ...mapState(["currentDomainId", "locale"])
  },
  methods: {
    refreshFavorite() {
      let { Profile, currentUser } = this.$client;
      Profile.get(
        this.currentDomainId,
        currentUser.id,
        { refresh: true },
        (err, profile) => {
          if (err) return (this.error = err.toString());
          let { domainId, collectionId, id } = this.document;
          this.isFavorite = !!_.find(profile.favorites, f => {
            return (
              f.domainId == domainId &&
              f.collectionId == collectionId &&
              f.id == id
            );
          });
        }
      );
    },
    onFavoriteClick() {
      let { Profile, currentUser } = this.$client,
        { domainId, collectionId, id } = this.document;
      Profile.get(domainId, currentUser.id, (err, profile) => {
        if (err) return (this.error = err.toString());
        let oldFavorites = _.cloneDeep(profile.favorites),
          patch,
          index = _.findIndex(profile.favorites, f => {
            return (
              f.domainId == domainId &&
              f.collectionId == collectionId &&
              f.id == id
            );
          });
        if (index >= 0) {
          patch = [
            {
              op: "remove",
              path: "/favorites/" + index
            }
          ];
        } else {
          patch = [
            profile.favorites
              ? {
                  op: "add",
                  path: "/favorites/-",
                  value: {
                    domainId: domainId,
                    collectionId: collectionId,
                    id: id
                  }
                }
              : {
                  op: "add",
                  path: "/favorites",
                  value: [
                    {
                      domainId: domainId,
                      collectionId: collectionId,
                      id: id
                    }
                  ]
                }
          ];
        }
        profile.patch({ patch: patch }, (err, profile) => {
          if (err) return (this.error = err.toString());
          this.isFavorite = !this.isFavorite;
        });
      });
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
      return column.title || "#";
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
  components: { ColumnSetting, Keywords, ContainsText, NumericRange, DatetimeRange, FullTextSearch, SearchSetting}
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

.search-container {
  .search-item {
    padding-bottom: 5px;
    margin-right: 2px;
  }
  .btn {
    border-color: lightgray;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dataTables_wrapper {
  position: relative;
  //     overflow: auto;

  .view-table {
    .table-active {
      .btn {
        visibility: visible;
      }
    }

    thead {
      .btn {
        border-color: lightgray;
      }
    }

    tbody {
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
}
</style>
