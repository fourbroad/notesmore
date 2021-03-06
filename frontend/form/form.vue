<template>
  <div class="form row">
    <div class="col-md-12">
      <div class="bgc-white bd bdrs-3 p-20 mB-20">
        <div class="form-header pB-5">
          <span class="icon mR-5">
            <i :class="document._meta.iconClass || 'fa fa-file-text-o'"></i>
          </span>
          <h4 class="c-grey-900">{{i18n_title}}</h4>
          <span class="favorite mL-10" @click="onFavoriteClick()">
            <i class="fa fa-star-o" :class="{'c-red-500': isFavorite}"></i>
          </span>
          <div class="actions btn-group float-right">
            <button type="button" v-if="isNew||isDirty" @click="onSaveClick" class="save btn btn-primary btn-sm">
              <span v-if="wait" class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true">{{$t('wait')}}</span>
              <span v-if="!wait">{{$t('save')}}</span>
            </button>
            <button type="button" v-if="isNew||isDirty" @click="onCancelClick" class="cancel btn btn-sm">{{$t('cancel')}}</button>
            <button type="button" class="more btn btn-outline-secondary btn-sm btn-light" data-toggle="dropdown">
              <i class="fa fa-ellipsis-h"></i>
              <ul class="dropdown-menu dropdown-menu-right">
                <li class="dropdown-item save-as" @click="onSaveAsClick">{{$t('saveAs')}}</li>
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
        <div class="form-toolbox"></div>
        <div class="form-content" ref="formContent"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import validate from "validate.js";
import jsonPatch from "fast-json-patch";
import uuidv4 from "uuid/v4";
import utils from 'core/utils';

import ace from "brace";
import "brace/mode/json";
import "brace/theme/iplastic";
import "brace/ext/searchbox";

export default {
  data() {
    return {
      error: null,
      clone: _.cloneDeep(this.document),
      saveAsId: '',
      saveAsTitle:'',
      jsonEditor: null,
      wait: false,
      enableChange: true
    };
  },
  props: {
    document: Object,
    isNew : {
      type: Boolean,
      default: false
    }
  },
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
        submit: "Submit"
      },
      cn: {
        id: "唯一标识",
        title: "标题",
        save: "保存",
        saveAs: "另存为...",
        wait: "请稍等...",
        cancel: "取消",
        delete: "删除",
        submit: "提交"
      }
    }
  },
  mounted() {
    let {currentUser} = this.$client;
    this.jsonEditor = ace.edit(this.$refs.formContent);
    this.jsonEditor.$blockScrolling = Infinity
    this.jsonEditor.setTheme('ace/theme/iplastic');
    this.jsonEditor.getSession().setMode('ace/mode/json');
    this.jsonEditor.getSession().setOptions({ tabSize:2 });
    this.jsonEditor.setValue(JSON.stringify(this.document, null, 2), -1);
    this.jsonEditor.clearSelection();
    this.enableChange = true;
    this.jsonEditor.getSession().on('change', (delta) => {
      if(this.enableChange){
        let json;
        try { json =  JSON.parse(this.jsonEditor.getValue()); }catch(e){}
        if(json){
          this.replace(this.document, json);
        }
      }
    });
    this.jsonEditor.focus();
    utils.checkPermission(this.currentDomainId, currentUser.id, 'patch', this.document, (err, result) => {
      if(!result){
        this.jsonEditor.setReadOnly(true);
      }
    });    
  },
  computed: {
    patch() {
      return jsonPatch.compare(this.clone, this.document);
    },
    isDirty() {
      return this.patch.length > 0;
    },
    localeDoc() {
      return this.document.get(this.locale);
    },
    i18n_title() {
      return this.localeDoc.title;
    },
    isFavorite() {
      let { domainId, collectionId, id } = this.document,
        index = _.findIndex(this.profile.favorites, f =>
          _.isEqual(f, {
            domainId: domainId,
            collectionId: collectionId,
            id: id
          })
        );
      return index >= 0;
    },
    $saveAs(){
      return $(this.$refs.saveAs);
    },
    ...mapState(["currentDomainId", "profile", "locale"])
  },
  methods: {
    onFavoriteClick() {
      let { domainId, collectionId, id } = this.document;
      this.$store.dispatch("TOGGLE_FAVORITE", {
        domainId: domainId,
        collectionId: collectionId,
        id: id
      });
    },
    onSaveClick() {
      if(this.isNew){
        let id = this.document.id||uuidv4();
        this.saveAs(id, this.document.title).then(()=>{
          this.$router.replace(`/${this.document.collectionId}/${id}`);
        });
      } else{
        this.document.patch({ patch: this.patch }, (err, document) => {
          if (err) return (this.error = err.toString());
          this.replace(this.clone, document);
          this.replace(this.document, document);
          this.setJsonEditorValue();
        });
      }
    },
    onSaveAsClick(){
      this.saveAsId = uuidv4();
      this.saveAsTitle = '';
      this.$saveAs.modal('show');
    },
    onSaveAsSubmit(){
      this.saveAs(this.saveAsId, this.saveAsTitle).then(()=>{
        this.$saveAs.modal('hide');
        this.$router.replace(`/${this.document.collectionId}/${this.saveAsId}`);
      });
    },
    saveAs(id, title){
      return new Promise((resolve, reject)=>{
        let docInfo = _.cloneDeep(this.document), {domainId, collectionId} = this.document, params = [];
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
        params.push((err, doc)=>{
          if(err) {
            this.error = err;
            return reject(err);
          }
          resolve(doc);
        });
      
        this.document.constructor.create.apply(this.document.constructor, params);
      });
    },
    onCancelClick() {
      if(this.isNew){
        this.$router.go(-1);
      } else{
        this.replace(this.document, this.clone);
        this.setJsonEditorValue();
      }
    },
    setJsonEditorValue(){
      this.enableChange = false;
      this.jsonEditor.setValue(JSON.stringify(this.document, null, 2), -1);
      this.jsonEditor.clearSelection();
      this.jsonEditor.focus();
      this.enableChange = true;
    },
    replace(source, target) {
      Object.keys(source).forEach(key => {
        if (this.isNew || key != "id") {
          source[key] = null;
        }
      });
      Object.entries(_.cloneDeep(target)).forEach(entry => {
        if (this.isNew || entry[0] != "id") {
          this.$set(source, entry[0], entry[1]);
        }
      });
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
@import "~jsoneditor/dist/jsoneditor.css";

.form {
  height: calc(100vh - 250px);

  .form-header {
    border-bottom: 1px solid lightgray;
    margin-bottom: 8px;

    .icon {
      font-size: 24px;
    }

    h4 {
      display: inline-block;
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

    .btn.more {
      z-index: 8;
    }
  }

  .domain {
    display: block;
    border-radius: 0.2rem;
  }

  .collection {
    display: block;
    border-radius: 0.2rem;
  }

  .form-content {
    height: calc(100vh - 265px);
  }
}
</style>
