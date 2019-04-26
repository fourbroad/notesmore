// __webpack_public_path__ = myRuntimePublicPath;

import './index.scss';
import 'font-awesome/scss/font-awesome.scss';

import 'core/runtime';

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
    host:'notesmore.com', 
    port:'3000'
  },
  currentDomain: currentDomain
});
