const DEFAULT_ACL = {
  patch: {
    roles: ["administrator"]
  },
  delete: {},
  getMeta: {
    roles: ["administrator"]
  },
  patchMeta: {
    roles: ["administrator"]
  },
  clearAclSubject: {
    roles: ["administrator"]
  }
}
  , DEVELOPER_ACL = {
  patch: {
    roles: ["developer"]
  },
  delete: {},
  getMeta: {
    roles: ["developer"]
  },
  patchMeta: {
    roles: ["developer"]
  },
  clearAclSubject: {
    roles: ["developer"]
  }
}
  , DEFAULT_COLUMNS = [{
  sortable: false
}, {
  title: "Id",
  name: "id",
  data: "id",
  defaultLink: true
}, {
  title: "Title",
  name: "title",
  data: "title",
  sortable: false,
  defaultLink: true
}, {
  title: "Author",
  name: "_meta.author",
  data: "_meta.author"
}, {
  title: "Version",
  name: "_meta.version",
  data: "_meta.version"
}, {
  title: "Created",
  name: "_meta.created",
  data: "_meta.created",
  className: "datetime"
}, {
  title: "Updated",
  name: "_meta.updated",
  data: "_meta.updated",
  className: "datetime"
}, {
  sortable: false
}]
  , DEFAULT_SEARCH_COLUMNS = [{
  title: "Id",
  name: "id",
  type: "keywords"
}, {
  title: "Title",
  name: "title",
  type: "containsText"
}, {
  title: "Author",
  name: "_meta.author",
  type: "keywords"
}, {
  title: "Version",
  name: "_meta.version",
  type: "numericRange"
}, {
  title: "Created",
  name: "_meta.created",
  type: "datetimeRange"
}, {
  title: "Updated",
  name: "_meta.updated",
  type: "datetimeRange"
}]
  , COLLECTIONS = [{
  id: ".collections",
  title: "Data Warehouse",
  _meta: {
    iconClass: "ti-harddrives"
  }
}, {
  id: ".metas",
  title: "Metas",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".pages",
  title: "Pages",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".views",
  title: "Views",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".forms",
  title: "Forms",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".actions",
  title: "Actions",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".files",
  title: "Files",
  _meta: {
    iconClass: "ti-folder",
    actions: ['uploadFiles', 'edit']
  }
}, {
  id: ".roles",
  title: "Roles",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".groups",
  title: "Groups",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".profiles",
  title: "Profiles",
  _meta: {
    iconClass: "ti-folder"
  }
}]
  , ROOT_COLLECTIONS = [{
  id: ".users",
  title: "Users",
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".domains",
  title: "Domains",
  _meta: {
    iconClass: "ti-folder"
  }
}]
  , VIEWS = [{
  id: ".searchDocuments",
  title: "Search Documents",
  _meta: {
    metaId: '.meta-view',
    iconClass: "ti-search"
  }
}]
  , ACTIONS = [{
  id: "new",
  title: "New",
  plugin: {
    name: "@notesabc/form",
    mode: 'offline',
    js: "@notesabc/form/form.bundle.js",
    css: "@notesabc/form/form.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: "edit",
  title: "Edit(Json)",
  plugin: {
    name: "@notesabc/form",
    mode: 'offline',
    js: "@notesabc/form/form.bundle.js",
    css: "@notesabc/form/form.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: "gridView",
  title: "Grid View",
  plugin: {
    name: "@notesabc/view",
    mode: 'offline',
    js: "@notesabc/view/view.bundle.js",
    css: "@notesabc/view/view.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'login',
  title: 'Login',
  plugin: {
    name: "@notesabc/login",
    mode: 'offline',
    js: "@notesabc/login/login.bundle.js",
    css: "@notesabc/login/login.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'signup',
  title: 'Signup',
  plugin: {
    name: "@notesabc/signup",
    mode: 'offline',
    js: "@notesabc/signup/signup.bundle.js",
    css: "@notesabc/signup/signup.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'workbench',
  title: "Workbench",
  plugin: {
    name: "@notesabc/workbench",
    mode: 'offline',
    js: "@notesabc/workbench/workbench.bundle.js",
    css: "@notesabc/workbench/workbench.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'dashboard',
  title: 'Dashboard',
  plugin: {
    name: "@notesabc/dashboard",
    mode: 'offline',
    js: "@notesabc/dashboard/dashboard.bundle.js",
    css: "@notesabc/dashboard/dashboard.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'calendar',
  title: "Calendar",
  plugin: {
    name: "@notesabc/calendar",
    mode: 'offline',
    js: "@notesabc/calendar/calendar.bundle.js",
    css: "@notesabc/calendar/calendar.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'chat',
  title: "Chat",
  plugin: {
    name: "@notesabc/chat",
    mode: 'offline',
    js: "@notesabc/chat/chat.bundle.js",
    css: "@notesabc/chat/chat.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'email',
  title: "Email",
  plugin: {
    name: "@notesabc/email",
    mode: 'offline',
    js: "@notesabc/email/email.bundle.js",
    css: "@notesabc/email/email.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: "uploadFiles",
  title: "Upload Files",
  plugin: {
    name: "@notesabc/uploadfiles",
    mode: 'offline',
    js: "@notesabc/upload-files/upload-files.bundle.js",
    css: "@notesabc/upload-files/upload-files.bundle.css"
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}]
  , METAS = [{
  id: ".meta",
  title: "Meta",
  defaultValue: {
    title: "New Meta"
  },
  container: {
    id: '.metas',
    title: 'Metas'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-wand"
  }
}, {
  id: ".meta-collection",
  title: "Collection",
  container: {
    id: '.collections',
    title: 'Collections'
  },
  defaultValue: {
    title: "New Collection",
    columns: DEFAULT_COLUMNS,
    searchColumns: DEFAULT_SEARCH_COLUMNS,
    search: {
      names: ["id.keyword", "title.keyword", "_meta.author.keyword"]
    },
    order: "[[6,\"desc\"],[5,\"desc\"]]"
  },
  defaultAction: 'gridView',
  actions: ['gridView', 'edit'],
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".meta-page",
  title: "Page",
  defaultValue: {
    title: "New Page"
  },
  container: {
    id: '.pages',
    title: 'Pages'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-layout-width-default"
  }
}, {
  id: ".meta-view",
  title: "View",
  container: {
    id: '.views',
    title: 'Views'
  },
  defaultValue: {
    title: "New View",
    collections: [],
    columns: DEFAULT_COLUMNS,
    searchColumns: DEFAULT_SEARCH_COLUMNS,
    search: {
      names: ["id.keyword", "title.keyword", "_meta.author.keyword"]
    },
    order: "[[6,\"desc\"],[5,\"desc\"]]",
    _meta: {
      metaId: '.meta-view'
    }
  },
  defaultAction: "gridView",
  actions: ['gridView', 'edit'],
  _meta: {
    iconClass: "ti-view-list-alt"
  }
}, {
  id: ".meta-form",
  title: "Form",
  defaultValue: {
    title: "New Form"
  },
  container: {
    id: '.forms',
    title: 'Forms'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-layout-cta-btn-right"
  }
}, {
  id: ".meta-action",
  title: "Action",
  defaultValue: {
    title: "New Action"
  },
  container: {
    id: '.actions',
    title: 'Actions'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: ".meta-file",
  title: "File",
  defaultValue: {
    title: "New File"
  },
  container: {
    id: '.files',
    title: 'Files'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-file"
  }
}, {
  id: ".meta-role",
  title: "Role",
  defaultValue: {
    title: "New Role"
  },
  container: {
    id: '.roles',
    title: 'Roles'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-id-badge"
  }
}, {
  id: ".meta-group",
  title: "Group",
  defaultValue: {
    title: "New Group"
  },
  container: {
    id: '.groups',
    title: 'Groups'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-view-grid"
  }
}, {
  id: ".meta-profile",
  title: "Profile",
  defaultValue: {
    title: "New Profile"
  },
  container: {
    id: '.profiles',
    title: 'Profiles'
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-id-badge"
  }
}]
  , ROOT_METAS = [{
  id: ".meta-user",
  title: "User",
  container: {
    id: '.users',
    title: 'Users'
  },
  defaultValue: {
    id: 'newuser',
    password: 'password',
    title: "New User"
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: ".meta-domain",
  title: "Domain",
  container: {
    id: '.domains',
    title: 'Domains'
  },
  defaultValue: {
    title: "New Domain"
  },
  actions: ['edit'],
  _meta: {
    iconClass: "ti-layout-width-full"
  }
}, ]
  , PAGES = [{
  id: ".login",
  title: "Login",
  _meta: {
    iconClass: "ti-layout-width-default",
    actions: ['login']
  }
}, {
  id: ".signup",
  title: "Signup",
  _meta: {
    iconClass: "ti-layout-width-default",
    actions: ['signup']
  }
}, {
  id: ".workbench",
  title: "Workbench",
  sidebarItems: [{
    collectionId: ".pages",
    id: ".dashboard",
    iconColor: "c-blue-500"
  }, {
    collectionId: ".pages",
    id: ".calendar",
    iconColor: "c-deep-orange-500"
  }, {
    collectionId: ".pages",
    id: ".chat",
    iconColor: "c-deep-purple-500"
  }, {
    collectionId: ".pages",
    id: ".emails",
    iconColor: "c-brown-500"
  }, {
    collectionId: ".collections",
    id: ".collections",
    label: "All Documents",
    iconColor: "c-deep-purple-500"
  }],
  tips: [{
    collectionId: ".collections",
    id: ".notifications",
    iconClass: "ti-bell"
  }, {
    collectionId: ".collections",
    id: ".emails",
    iconClass: "ti-email"
  }],
  _meta: {
    iconClass: "ti-blackboard",
    actions: ['workbench']
  }
}, {
  id: ".dashboard",
  title: "Dashboard",
  _meta: {
    iconClass: "ti-dashboard",
    actions: ['dashboard']
  }
}, {
  id: ".calendar",
  title: "Calendar",
  _meta: {
    iconClass: "ti-calendar",
    actions: ['calendar']
  }
}, {
  id: ".chat",
  title: "Chat",
  _meta: {
    iconClass: "ti-comments",
    actions: ['chat']
  }
}, {
  id: ".emails",
  title: "Emails",
  _meta: {
    iconClass: "ti-email",
    actions: ['email']
  }
}]
  , ROLES = [{
  id: "administrator",
  title: "Administrator",
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: "developer",
  title: "Developer",
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: "anonymous",
  title: "Anonymous",
  _meta: {
    iconClass: "ti-user"
  }
}]
  , ADMINISTRATOR = {
  id: "administrator",
  title: "Administrator",
  password: "3c3f601a1960b8d7b347d376d52b6e59",
  _meta: {
    iconClass: "ti-user",
  }
}
  , ANONYMOUS = {
  id: "anonymous",
  title: "Anonymous",
  password: "a29b1ee7caefc17a3a73d6d137c8169b",
  _meta: {
    iconClass: "ti-user"
  }
};

module.exports = {
  DEFAULT_ACL: DEFAULT_ACL,
  DEVELOPER_ACL: DEVELOPER_ACL,
  DEFAULT_COLUMNS: DEFAULT_COLUMNS,
  DEFAULT_SEARCH_COLUMNS: DEFAULT_SEARCH_COLUMNS,
  COLLECTIONS: COLLECTIONS,
  VIEWS: VIEWS,
  ROOT_COLLECTIONS: ROOT_COLLECTIONS,
  ACTIONS: ACTIONS,
  METAS: METAS,
  ROOT_METAS: ROOT_METAS,
  PAGES: PAGES,
  ROLES: ROLES,
  ADMINISTRATOR: ADMINISTRATOR,
  ANONYMOUS: ANONYMOUS
}
