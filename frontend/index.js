
// __webpack_public_path__ = myRuntimePublicPath;

// require('core-js/features/object/define-property');
// require('core-js/features/object/create');
// require('core-js/features/object/assign');
// require('core-js/features/array/for-each');
// require('core-js/features/array/index-of');
// require('core-js/features/function/bind');
// require('core-js/features/promise');

import './index.scss';
import 'core/runtime';

import "font-awesome/scss/font-awesome.scss";

let domain = document.domain, currentDomain, index, url;
index = domain.indexOf('.notesmore.com');
if(index >= 0){
  currentDomain = domain.slice(0,index);
}

index = domain.indexOf('.notesmore.cn');
if(index >= 0){
  currentDomain = domain.slice(0,index);
}

if(!currentDomain || currentDomain == 'www'){
  currentDomain = localStorage.getItem("currentDomain") || '.root';
} 

if(localStorage.getItem("environment") == "development") {
  url = 'localhost:3000/domains';

  import(/* webpackChunkName: "moment" */ 'moment').then(({default: moment}) => {
    window.moment = moment;
  });

  import(/* webpackChunkName: "jsonPatch" */ 'fast-json-patch').then(({default: jsonPatch}) => {
    window.jsonPatch = jsonPatch;
  });

  import(/* webpackChunkName: "elasticsearch" */ 'elasticsearch-browser').then(({default: elasticsearch}) => {
    window.esc = new elasticsearch.Client({
      host: 'localhost:9200',
      log: 'trace'
    });
  });
} else {
  url = 'https://notesmore.com/domains';
}

window.runtime = $('body').runtime({
  client: { url: url },
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


