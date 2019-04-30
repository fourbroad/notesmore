
// __webpack_public_path__ = myRuntimePublicPath;

// require('core-js/features/object/define-property');
// require('core-js/features/object/create');
// require('core-js/features/object/assign');
// require('core-js/features/array/for-each');
// require('core-js/features/array/index-of');
// require('core-js/features/function/bind');
// require('core-js/features/promise');

import './index.scss';
import 'font-awesome/scss/font-awesome.scss';
import 'core/runtime';
import moment from 'moment';
import jsonPatch from"fast-json-patch";

window.moment = moment;
window.jsonPatch = jsonPatch;

// var elasticsearch from'elasticsearch-browser');
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