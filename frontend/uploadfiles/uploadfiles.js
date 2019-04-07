import 'font-awesome/scss/font-awesome.scss';

import * as $ from 'jquery';
import 'jquery-ui/ui/widget';
import 'jquery-ui/ui/data';

import 'bootstrap';
import _ from 'lodash';
import moment from 'moment';

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

import './uploadfiles.scss';
import uploadFilesHtml from './uploadfiles.html';

$.widget("nm.uploadfiles", {
  options:{
    forceIframeTransport: false
  },

  _create: function() {
    var o = this.options, doc = o.document;
   
    this.$uploadFiles = $(uploadFilesHtml);
    this.$uploadFilesHeader = $('.upload-files-header', this.$uploadFiles);
    this.$uploadForm = $('form.file-upload', this.$uploadFiles)
    this.$uploadFiles.appendTo(this.element.empty());

    // Initialize the jQuery File Upload widget:
    this.$uploadForm.fileupload({
      // Uncomment the following to send cross-domain cookies:
      xhrFields: {withCredentials: true},
      url: 'http://localhost:3000/'+doc.domainId + '/.files',
      forceIframeTransport: o.forceIframeTransport
    });

    // Enable iframe cross-domain access via redirect option:
    this.$uploadForm.fileupload('option', 'redirect', window.location.href.replace(/\/[^\/]*$/, '/cors/result.html?%s'));
  }

});