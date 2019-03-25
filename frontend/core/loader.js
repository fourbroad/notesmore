const _ = require('lodash');

var identity, loadPlugin, createDocument, _doLoadDocument, _armWidget, loadDocument, armActions;

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

_armWidget = function(element, pluginName, opts) {
  var plugin = element.data('plugin');
  function arm() {
    element[pluginName](opts);
    element.data('plugin', element[pluginName]('instance'))
  }

  if (!plugin) {
    arm();
  } else {
    if (plugin.widgetName != pluginName) {
      plugin.destroy();
      arm();
    } else {
      element[pluginName](opts);
    }
  }
}

_doLoadDocument = function(client, element, domId, metaId, doc, actId, opts, callback) {
  const {Meta, Action} = client;
  Meta.get(domId, metaId, function(err, meta) {
    var actions, defaultAction, plugin, pluginName;

    if (err)
      return callback && callback(err);

    actions = _.union(doc._meta.actions, meta.actions);
    defaultAction = doc._meta.defaultAction || meta.defaultAction;

    actId = actId || defaultAction || actions[0];

    Action.get(domId, actId, function(err, action) {
      if (err) return callback && callback(err);
      plugin = action.plugin;
      pluginName = plugin.name.split('/')[1];

      if (!element[pluginName]) {
        loadPlugin(plugin, function() {
          _armWidget(element, pluginName, opts);
          callback && callback(null, doc);
        });
      } else {
        _armWidget(element, pluginName, opts);
        callback && callback(null, doc);
      }
    });
  });
}

loadDocument = function(client, element, domId, colId, docId, actId, opts, callback) {
  var metaId, {Meta, Domain, View, Page, Form, Role, Group, User, Document, Action} = client;

  function prepareMetaId(doc, opts) {
    metaId = _.at(doc, '_meta.metaId')[0];
    if (!metaId) {
      metaId = '.meta'
    }
    opts.document = doc;
    return metaId;
  }

  switch (colId) {
  case '.metas':
    Meta.get(domId, docId, function(err, meta) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        meta: meta
      }, opts);
      metaId = prepareMetaId(meta, opts);
      _doLoadDocument(client, element, domId, metaId, meta, actId, opts, callback);
    });
    break;
  case '.domains':
    Domain.get(docId, function(err, domain) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        domain: domain
      }, opts);
      metaId = prepareMetaId(domain, opts);
      _doLoadDocument(client, element, domId, metaId, domain, actId, opts, callback);
    })
    break;
  case '.collections':
    Collection.get(domId, docId, function(err, col) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        view: col
      }, opts);
      metaId = prepareMetaId(col, opts);
      _doLoadDocument(client, element, domId, metaId, col, actId, opts, callback);
    });
    break;
  case '.views':
    View.get(domId, docId, function(err, view) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        view: view
      }, opts);
      metaId = prepareMetaId(view, opts);
      _doLoadDocument(client, element, domId, metaId, view, actId, opts, callback);
    });
    break;
  case '.pages':
    Page.get(domId, docId, function(err, page) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        page: page
      }, opts);
      metaId = prepareMetaId(page, opts);
      _doLoadDocument(client, element, domId, metaId, page, actId, opts, callback);
    });
    break;
  case '.forms':
    Form.get(domId, docId, function(err, form) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        form: form
      }, opts);
      metaId = prepareMetaId(form, opts);
      _doLoadDocument(client, element, domId, metaId, form, actId, opts, callback);
    });
    break;
  case '.roles':
    Role.get(domId, docId, function(err, role) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        role: role
      }, opts);
      metaId = prepareMetaId(role, opts);
      _doLoadDocument(client, element, domId, metaId, role, actId, opts, callback);
    });
    break;
  case '.groups':
    Group.get(domId, docId, function(err, group) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        group: group
      }, opts);
      metaId = prepareMetaId(group, opts);
      _doLoadDocument(client, element, domId, metaId, group, actId, opts, callback);
    });
    break;
  case '.users':
    User.get(docId, function(err, user) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        user: user
      }, opts);
      metaId = prepareMetaId(user, opts);
      _doLoadDocument(client, element, domId, metaId, user, actId, opts, callback);
    });
    break;
  case '.actions':
    Action.get(docId, function(err, action) {
      if (err)
        return callback && callback(err);
      opts = $.extend(true, {
        action: action
      }, opts);
      metaId = prepareMetaId(action, opts);
      _doLoadDocument(client, element, domId, metaId, action, actId, opts, callback);
    });
    break;
  default:
    Document.get(domId, colId, docId, function(err, doc) {
      if (err)
        return callback && callback(err);
      metaId = (doc._meta && doc._meta.id) || '.meta';
      _doLoadDocument(client, element, domId, metaId, doc, actId, $.extend(true, {
        document: doc
      }, opts), callback);
    });
  }
}

createDocument = function(element, meta, docData, callback){
  var collectionId = meta.container.id, { Action } = meta.getClient(),
      doc, plugin, pluginName, opts = {};
  
  _.merge(docData, {_meta: {metaId: meta.id}}, _.cloneDeep(meta.defaultValue));

  switch(collectionId){
    case '.metas':
      doc = new Meta(meta.domainId, docData);
      opts.meta = doc;
      break;
    case '.domains':
      doc = new Domain(docData);
      opts.domain = doc;
      break;
    case '.collections':
      doc = new Collection(meta.domainId, docData);
      opts.collection = doc;
      break;
    case '.views':
      doc = new View(meta.domainId, docData);
      opts.view = doc;
      break;
    case '.pages':
      doc = new Page(meta.domainId, docData);
      opts.page = doc;
      break;
    case '.forms':
      doc = new Form(meta.domainId, docData);
      opts.form = doc;
      break;
    case '.roles':
      doc = new Role(meta.domainId, docData);
      opts.role = doc;
      break;
    case '.groups':
      doc = new Group(meta.domainId, docData);
      opts.group = doc;
      break;
    case '.users':
      doc = new User(docData);
      opts.user = doc;
      break;
    case '.actions':
      doc = new Action(meta.domainId, docData);
      opts.action = doc;
      break;
    default:
      doc = new Document(meta.domainId, collectionId, docData);
  }
  _.forOwn(doc.old,function(v,k){delete doc.old[k]});
  opts.document = doc;

  Action.get(meta.domainId, meta.defaultAction || meta.actions[0], function(err, action) {
    if (err) return callback && callback(err);

    plugin = action.plugin;
    pluginName = plugin.name.split('/')[1];

    if (!element[pluginName]) {
      loadPlugin(plugin, function() {
        _armWidget(element, pluginName, opts);
        callback && callback(null, doc);
      });
    } else {
      _armWidget(element, pluginName, opts);
      callback && callback(null, doc);
    }
  });
}

armActions = function(client, doc, container) {
  const { Action } = client;
  function armItems(domainId, actIds) {
    Action.mget(doc.domainId, actIds, function(err, result) {
      if (err)
        return console.log(err);
      $.each(result.actions, function(i, action) {
        var $li = $('<li class="dropdown-item"></li>').html(action.title).appendTo(container).data('action', action)
          , mode = action.plugin.mode || 'inline';
        $li.on('click', function() {
          if ('offline' == mode) {
            $li.trigger('actionclick', {
              dom: doc.domainId,
              col: doc.collectionId,
              doc: doc.id,
              act: action.id
            });
          } else if ('inline' == mode) {
            (function() {
              eval(action.plugin.js);
              action(doc);
            }
            )();
          }
        });
      });
    });
  }

  if (doc._meta.actions) {
    armItems(doc.domainId, doc._meta.actions);
  } else {
    Meta.get(doc.domainId, doc._meta.metaId || '.meta', function(err, meta) {
      if (err)
        return console.log(err);
      armItems(doc.domainId, meta.actions);
    });
  }
}

module.exports = {
  loadPlugin: loadPlugin,
  createDocument: createDocument,
  loadDocument: loadDocument,
  armActions: armActions
}
