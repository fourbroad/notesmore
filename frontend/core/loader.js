var identity, loadPlugin, _doLoadDocument, _armWidget, loadDocument;

identity = function(name) {
  return '_' + name.replace(/[\.,@,/,-]/g, '_');
}

loadPlugin = function(plugin, callback) {
  const _identity = identity(plugin.name);

  if (plugin.css) {
    $("<link>").attr({
      type: "text/css",
      rel: "stylesheet",
      href: plugin.css
    }).appendTo("head");
  }

  $.getScript(plugin.js).done(function() {
    callback && callback(window[_identity]);
    delete window[_identity];
  });
}

_armWidget = function(element, pluginName, opts){
  var plugin = element.data('plugin');

  function arm(){
    element[pluginName](opts);
    element.data('plugin', element[pluginName]('instance'))
  }

  if(!plugin){
    arm();
  }else{
    if(plugin.widgetName != pluginName){
      plugin.destroy();
      arm();
    } else {
      element[pluginName](opts);
    }
  }
}

_doLoadDocument = function(client, element, domId, metaId, doc, actId, opts, callback) {
  client.Meta.get(domId, metaId, function(err, meta) {
    var actions, action, defaultAction, plugin, pluginName;

    if (err)
      return console.log(err); callback && callback(err);
    
    actions = _.unionBy(doc._meta.actions, meta.actions, 'id');
    defaultAction = doc._meta.defaultAction || meta.defaultAction;
    action = _.filter(actions, function(action){ return action.id==actId;})[0];
    if(!action){
      action = _.filter(actions, function(action){ return action.id == defaultAction;})[0];
    }

    action = action || actions[0];
    plugin = action.plugin;
    pluginName = plugin.name.split('/')[1];

    if (!element[pluginName]) {
      loadPlugin(plugin, function(){
        _armWidget(element, pluginName,opts);
        callback && callback(null, doc);
      });
    } else {
      _armWidget(element, pluginName,opts);
      callback && callback(null, doc);
    }
  });
}

loadDocument = function(client, element, domId, colId, docId, actId, opts, callback) {
  var metaId, {Meta, Domain, View, Page, Form, Role, Group, User, Document} = client;

  function prepareMetaId(doc, opts){
    metaId = doc._meta && doc._meta.metaId;
    if(!metaId){
      metaId = '.meta'
      opts.document = doc;
    }
    return metaId;
  }

  switch (colId) {
  case '.metas':
    Meta.get(domId, docId, function(err, meta) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {meta:meta}, opts);
      metaId = prepareMetaId(meta, opts);
      _doLoadDocument(client, element, domId, metaId, meta, actId, opts, callback);
    });
    break;
  case '.domains':
    Domain.get(docId, function(err, domain) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {domain:domain}, opts);
      metaId = prepareMetaId(domain, opts);
      _doLoadDocument(client, element, domId, metaId, domain, actId, opts, callback);
    })
    break;
  case '.views':
    View.get(domId, docId, function(err, view) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {view:view, document:view}, opts);
      metaId = prepareMetaId(view, opts);
      _doLoadDocument(client, element, domId, metaId, view, actId, opts, callback);
    });
    break;
  case '.pages':
    Page.get(domId, docId, function(err, page) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {page:page}, opts);
      metaId = prepareMetaId(page, opts);
      _doLoadDocument(client, element, domId, metaId, page, actId, opts, callback);
    });
    break;
  case '.forms':
    Form.get(domId, docId, function(err, form) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {form:form}, opts);
      metaId = prepareMetaId(form, opts);
      _doLoadDocument(client, element, domId, metaId, form, actId, opts, callback);
    });
    break;
  case '.roles':
    Role.get(domId, docId, function(err, role) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {role:role}, opts);
      metaId = prepareMetaId(role, opts);
      _doLoadDocument(client, element, domId, metaId, role, actId, opts, callback);
    });
    break;
  case '.groups':
    Group.get(domId, docId, function(err, group) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {group:group}, opts);
      metaId = prepareMetaId(group, opts);
      _doLoadDocument(client, element, domId, metaId, group, actId, opts, callback);
    });
    break;
  case '.users':
    User.get(docId, function(err, user) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {user:user}, opts);
      metaId = prepareMetaId(user, opts);
      _doLoadDocument(client, element, domId, metaId, user, actId, opts, callback);
    });
    break;
  default:
    Document.get(domId, colId, docId, function(err, doc) {
      if (err)
        return callback && callback(err);
      metaId = (doc._meta && doc._meta.id)||'.meta';
      _doLoadDocument(client, element, domId, metaId, doc, actId, $.extend(true,{document:doc},opts), callback);
    });
  }
}

module.exports = {
  loadPlugin: loadPlugin,
  loadDocument: loadDocument
}
