import './index.scss';
import 'font-awesome/scss/font-awesome.scss';

import 'core/runtime';
import 'workbench/workbench';
import 'view/view';
import 'form/form';
import 'dashboard/dashboard';
import 'calendar/calendar';
import 'chat/chat';
import 'email/email';


var jsonPatch = require("fast-json-patch");
var elasticsearch = require('elasticsearch-browser');
window.esc = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
window.jsonPatch = jsonPatch;

$('body').runtime({
  forceLogin:true,
  uriAnchor: {col:'.pages', doc:'.workbench'},
  currentDomain:'.root',
  userName: 'administrator',
  password: '!QAZ)OKM'
});