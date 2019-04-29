
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

window.runtime = $('body').runtime({
  client: {
    url:'https://notesmore.com/domains'
//     url: 'localhost:3000/domains'
  },
  locale: localStorage.getItem('language') || navigator.language,
  currentDomain: currentDomain
}).runtime('instance');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}