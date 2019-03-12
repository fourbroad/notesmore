import 'font-awesome/scss/font-awesome.scss';

import * as $ from 'jquery';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import 'bootstrap';
import _ from 'lodash';
import moment from 'moment';
import Cookies from 'js-cookie';

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

import './upload-files.scss';
import uploadFilesHtml from './upload-files.html';

$.widget("nm.uploadfiles", {
  options:{
    url: "upload-files/",
    forceIframeTransport: false
  },

  _create: function() {
    var o = this.options;

    if(o.token){
      $.ajaxSetup({headers:{token: o.token}});
      Cookies.set('token', o.token);
    }
    
    this.$uploadFiles = $(uploadFilesHtml);
    this.$uploadFilesHeader = $('.upload-files-header', this.$uploadFiles);
    this.$uploadForm = $('form.file-upload', this.$uploadFiles)
    this.$uploadFiles.appendTo(this.element.empty());

    // Initialize the jQuery File Upload widget:
    this.$uploadForm.fileupload({
      // Uncomment the following to send cross-domain cookies:
      //xhrFields: {withCredentials: true},
      url: o.url,
      forceIframeTransport: o.forceIframeTransport
    });

    // Enable iframe cross-domain access via redirect option:
    this.$uploadForm.fileupload('option', 'redirect', window.location.href.replace(/\/[^\/]*$/, '/cors/result.html?%s'));
  }

});