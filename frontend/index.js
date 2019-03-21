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
import 'signup/signup';

const client = require('../lib/client')({
//   host:'47.100.213.55', 
  host:'localhost',
  port:'3000'
});

window.client = client;
window.User = client.User;
window.Collection = client.Collection;
window.Document = client.Document;
window.Domain = client.Domain;
window.Form = client.Form;
window.Group = client.Group;
window.Meta = client.Meta;
window.Page = client.Page;
window.Action = client.Action;
window.Profile = client.Profile;
window.Role = client.Role;
window.View = client.View;

var jsonPatch = require("fast-json-patch");
var elasticsearch = require('elasticsearch-browser');
window.esc = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
window.jsonPatch = jsonPatch;

var domain = document.domain, currentDomain = '.root', index;
index = domain.indexOf('.notesmore.com');
if(index >= 0){
  currentDomain = domain.slice(0,index);
}
index = domain.indexOf('.notesmore.cn');
if(index >= 0){
  currentDomain = domain.slice(0,index);
}

$('body').runtime({
  currentDomain:currentDomain,
  uriAnchor: {col:'.pages', doc:'.workbench'}
});
