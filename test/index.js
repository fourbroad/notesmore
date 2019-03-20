
const assert = require('assert');
window.assert = assert;

var client = require('../lib/client')();
window.client = client;
window.User = client.User;
window.Collection = client.Collection;
window.Document = client.Document;
window.Domain = client.Domain;
window.Form = client.Form;
window.Group = client.Group;
window.Meta = client.Meta;
window.Page = client.Page;
window.Profile = client.Profile;
window.Role = client.Role;
window.View = client.View;



var _ = require('lodash');
var faker = require("faker");
var jsonPatch = require("fast-json-patch");
var elasticsearch = require('elasticsearch-browser');

window.esc = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
window.jsonPatch = jsonPatch;
window._ = _;
window.faker = faker;

const context = require.context(
  ".",       // Root directory
  true,           // Recursive
  /.+\.test\.js$/ // Test pattern
);

// Require each within build
context.keys().forEach(context);

module.export = context;