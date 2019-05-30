<template>
  <div class="upload-files container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="bgc-white bd bdrs-3 p-20 mB-20">
          <div class="upload-files-header pB-5 mB-15">
            <h4 class="c-grey-900 d-ib">{{$t('uploadFiles')}}</h4>
          </div>
          <!-- The file upload form used as target for the file upload widget -->
          <form class="file-upload" ref="fileUpload" action="/files" method="POST" enctype="multipart/form-data">
            <!-- Redirect browsers with JavaScript disabled to the origin page -->
            <noscript>
              <input
                type="hidden"
                name="redirect"
                value="https://blueimp.github.io/jQuery-File-Upload/"
              >
            </noscript>
            <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
            <div class="row fileupload-buttonbar">
              <div class="col-lg-7">
                <!-- The fileinput-button span is used to style the file input field as button -->
                <span class="btn btn-success fileinput-button">
                  <i class="fa fa-plus"></i>
                  <span>{{$t('addFiles')}}</span>
                  <input type="file" name="files[]" multiple>
                </span>
                <button type="submit" class="btn btn-primary start">
                  <i class="fa fa-upload"></i>
                  <span>{{$t('startUpload')}}</span>
                </button>
                <button type="reset" class="btn btn-warning cancel">
                  <i class="fa fa-ban"></i>
                  <span>{{$t('cancelUpload')}}</span>
                </button>
                <button type="button" class="btn btn-danger delete">
                  <i class="fa fa-trash-o"></i>
                  <span>{{$t('delete')}}</span>
                </button>
                <input type="checkbox" class="toggle">
                <!-- The global file processing state -->
                <span class="fileupload-process"></span>
              </div>
              <!-- The global progress state -->
              <div class="col-lg-5 fileupload-progress fade">
                <!-- The global progress bar -->
                <div
                  class="progress progress-striped active"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div class="progress-bar progress-bar-success" style="width:0%;"></div>
                </div>
                <!-- The extended global progress state -->
                <div class="progress-extended">&nbsp;</div>
              </div>
            </div>
            <!-- The table listing the files available for upload/download -->
            <table role="presentation" class="table table-striped">
              <tbody class="files"></tbody>
            </table>
          </form>
        </div>
      </div>
    </div>
    <!-- The blueimp Gallery widget -->
    <div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls" data-filter=":even">
      <div class="slides"></div>
      <h3 class="title"></h3>
      <a class="prev">‹</a>
      <a class="next">›</a>
      <a class="close">×</a>
      <a class="play-pause"></a>
      <ol class="indicator"></ol>
    </div>
    <!-- The template to display files available for upload -->
    <script id="template-upload" type="text/x-tmpl">
  {% for (var i=0, file; file=o.files[i]; i++) { %}
      <tr class="template-upload">
          <td>
              <span class="preview"></span>
          </td>
          <td>
              <p class="name">{%=file.name%}</p>
              <strong class="error text-danger"></strong>
          </td>
          <td>
              <p class="size">Processing...</p>
              <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div>
          </td>
          <td>
              {% if (!i && !o.options.autoUpload) { %}
                  <button class="btn btn-primary start" disabled>
                      <i class="fa fa-upload"></i>
                      <span>Start</span>
                  </button>
              {% } %}
              {% if (!i) { %}
                  <button class="btn btn-warning cancel">
                      <i class="fa fa-ban"></i>
                      <span>Cancel</span>
                  </button>
              {% } %}
          </td>
      </tr>
  {% } %}
    </script>
    <!-- The template to display files available for download -->
    <script id="template-download" type="text/x-tmpl">
  {% for (var i=0, file; file=o.files[i]; i++) { %}
      <tr class="template-download">
          <td>
              <span class="preview">
                  {% if (file.thumbnailUrl) { %}
                      <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" data-gallery><img src="{%=file.thumbnailUrl%}"></a>
                  {% } %}
              </span>
          </td>
          <td>
              <p class="name">
                  {% if (file.url) { %}
                      <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" {%=file.thumbnailUrl?'data-gallery':''%}>{%=file.name%}</a>
                  {% } else { %}
                      <span>{%=file.name%}</span>
                  {% } %}
              </p>
              {% if (file.error) { %}
                  <div><span class="label label-danger">Error</span> {%=file.error%}</div>
              {% } %}
          </td>
          <td>
              <span class="size">{%=o.formatFileSize(file.size)%}</span>
          </td>
          <td>
              {% if (file.deleteUrl) { %}
                  <button class="btn btn-danger delete" data-type="{%=file.deleteType%}" data-url="{%=file.deleteUrl%}"{% if (file.deleteWithCredentials) { %} data-xhr-fields='{"withCredentials":true}'{% } %}>
                      <i class="fa fa-trash-o"></i>
                      <span>Delete</span>
                  </button>
                  <input type="checkbox" name="delete" value="1" class="toggle">
              {% } else { %}
                  <button class="btn btn-warning cancel">
                      <i class="fa fa-ban"></i>
                      <span>Cancel</span>
                  </button>
              {% } %}
          </td>
      </tr>
  {% } %}
    </script>
  </div>
</template>

<script>
import { mapState } from "vuex";

import 'blueimp-gallery/css/blueimp-gallery.css';
import 'blueimp-file-upload/css/jquery.fileupload.css';
import 'blueimp-file-upload/css/jquery.fileupload-ui.css';

import tmpl from 'blueimp-tmpl';
import dataURLtoBlob from 'blueimp-canvas-to-blob';
import loadImage from 'blueimp-load-image';
import Gallery from 'blueimp-gallery';

import 'blueimp-file-upload/js/jquery.iframe-transport.js';
import 'blueimp-file-upload/js/jquery.fileupload.js';
import 'blueimp-file-upload/js/jquery.fileupload-process.js';
import 'blueimp-file-upload/js/jquery.fileupload-image.js';
import 'blueimp-file-upload/js/jquery.fileupload-audio.js';
import 'blueimp-file-upload/js/jquery.fileupload-video.js';
import 'blueimp-file-upload/js/jquery.fileupload-validate.js';
import 'blueimp-file-upload/js/jquery.fileupload-ui.js';

export default {
  name: "UploadFiles",
  data() {
    return {
      error: null
    };
  },
  props: {
    name: String,
    title: String,
    forceIframeTransport: {
      type: Boolean,
      default: false
    }
  },
  i18n: {
    messages: {
      en: {
        uploadFiles: "Upload Files",
        addFiles: "Add files...",
        startUpload: "Start upload",
        cancelUpload: "Cancel upload",
        delete: "Delete"
      },
      cn: {
        uploadFiles: "上传文件",
        addFiles: "添加文件...",
        startUpload: "开始上传",
        cancelUpload: "取消上传",
        delete: "删除"
      }
    }
  },
  mounted() {
    // Initialize the jQuery File Upload widget:
    this.$fileupload.fileupload({
      // Uncomment the following to send cross-domain cookies:
      xhrFields: {withCredentials: true},
      url: `${this.url}/${this.currentDomainId}/.files`,
      forceIframeTransport: this.forceIframeTransport
    });
    // Enable iframe cross-domain access via redirect option:
    this.$fileupload.fileupload('option', 'redirect', window.location.href.replace(/\/[^\/]*$/, '/cors/result.html?%s'));
  },
  computed: {
    url(){
      return _.at(this.document,'upload.url')||'localhost:3000'
    },
    $fileupload(){
      return $(this.$refs.fileupload)
    },
    ...mapState(["currentDomainId", "locale"])
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
.fade.in {
  opacity: 1;
}

.upload-files-header {
  border-bottom: 1px solid lightgray;

  .btn {
    border-color: lightgray;
    border-radius: 0.2rem;
  }
}

.table {
  a:hover {
    text-decoration: underline;
  }
  img {
    max-width: 64px;
  }
}

.progress {
  height: 5px;
}
</style>
