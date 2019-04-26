// __webpack_public_path__ = myRuntimePublicPath;

import './index.scss';
import 'font-awesome/scss/font-awesome.scss';

import 'core/runtime';
<<<<<<< HEAD
=======
import 'workbench/workbench';
import 'view/view';
import 'dashboard/dashboard';
import 'calendar/calendar';
import 'chat/chat';
import 'email/email';
import 'signup/signup';
import 'forgit-password/forgit-password';
import 'login/login';
import 'form/form';
import 'uploadfiles/uploadfiles.js';
>>>>>>> 0858c84ef17de8d07bcf87e1fedda5f0bc53b7a8

const moment = require('moment');
window.moment = moment;

var jsonPatch = require("fast-json-patch");
window.jsonPatch = jsonPatch;

// var elasticsearch = require('elasticsearch-browser');
// window.esc = new elasticsearch.Client({
//   host: 'localhost:9200',
//   log: 'trace'
// });

var domain = document.domain, currentDomain = '.root', index;
index = domain.indexOf('.notesmore.com');
if(index >= 0){
  currentDomain = domain.slice(0,index);
}

index = domain.indexOf('.notesmore.cn');
if(index >= 0){
  currentDomain = domain.slice(0,index);
}

if(currentDomain == 'www') currentDomain = '.root';

$('body').runtime({
  client: {
    //   host:'47.100.213.55', 
    host:'localhost',
    port:'3000'
  },
  currentDomain: currentDomain
});
