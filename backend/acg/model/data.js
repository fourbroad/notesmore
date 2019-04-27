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
  , DEFAULT_SEARCH_FULLTEXT = {
  fields: ["id.keyword", "title.keyword", "_meta.author.keyword"]
}
  , DEFAULT_SORT = [{
  "_meta.updated": {
    order: "desc"
  }
}, {
  "_meta.created": {
    order: "desc"
  }
}]
  , DEFAULT_COLUMNS = [{
  sortable: false
}, {
  title: "Id",
  name: "id",
  type: "keyword",
  defaultLink: true
}, {
  title: "Title",
  name: "title",
  type: "keyword",
  sortable: false,
  defaultLink: true
}, {
  title: "Author",
  name: "_meta.author",
  type: "keyword"
}, {
  title: "Version",
  name: "_meta.version",
  type: "integer"
}, {
  title: "Created",
  name: "_meta.created",
  type: "date"
}, {
  title: "Updated",
  name: "_meta.updated",
  type: "date"
}, {
  sortable: false
}]
  , DEFAULT_I18N_COLUMNS = [{}, {
  title: "唯一标识"
}, {
  title: "标题"
}, {
  title: "作者"
}, {
  title: "版本"
}, {
  title: "创建日期"
}, {
  title: "更新日期"
}, {}]
  , DEFAULT_SEARCH_FIELDS = [{
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
  , DEFAULT_I18N_SEARCH_FIELDS = [{
  title: "唯一标识"
}, {
  title: "标题"
}, {
  title: "作者"
}, {
  title: "版本"
}, {
  title: "创建日期"
}, {
  title: "更新日期"
}]
  , COLLECTIONS = [{
  id: ".collections",
  title: "Data Warehouse",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "数据仓库",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-harddrives"
  }
}, {
  id: ".metas",
  title: "Metas",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "元文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".pages",
  title: "Pages",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "页面文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".views",
  title: "Views",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "视图文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".forms",
  title: "Forms",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "表单文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".actions",
  title: "Actions",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "行动文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".files",
  title: "Files",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "文件文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder",
    actions: ['uploadFiles', 'edit']
  }
}, {
  id: ".roles",
  title: "Roles",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "角色文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".groups",
  title: "Groups",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "组文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".profiles",
  title: "Profiles",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "画像文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}]
  , ROOT_COLLECTIONS = [{
  id: ".users",
  title: "Users",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "用户文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}, {
  id: ".domains",
  title: "Domains",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "域文档集合",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
  _meta: {
    metaId: '.meta-collection',
    iconClass: "ti-folder"
  }
}]
  , VIEWS = [{
  id: ".searchDocuments",
  title: "Search Documents",
  columns: DEFAULT_COLUMNS,
  search: {
    fields: DEFAULT_SEARCH_FIELDS,
    fulltext: DEFAULT_SEARCH_FULLTEXT,
    sort: DEFAULT_SORT,
  },
  _i18n: {
    "zh-CN": {
      title: "搜索文档",
      columns: DEFAULT_I18N_COLUMNS,
      search: {
        fields: DEFAULT_I18N_SEARCH_FIELDS
      }
    }
  },
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
  _i18n: {
    "zh-CN": {
      title: "新建"
    }
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
  _i18n: {
    "zh-CN": {
      title: "编辑"
    }
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
  _i18n: {
    "zh-CN": {
      title: "表格"
    }
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
  _i18n: {
    "zh-CN": {
      title: "登录"
    }
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
  _i18n: {
    "zh-CN": {
      title: "注册"
    }
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
  _i18n: {
    "zh-CN": {
      title: "工作台"
    }
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
  _i18n: {
    "zh-CN": {
      title: "仪表盘"
    }
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
  _i18n: {
    "zh-CN": {
      title: "日历"
    }
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: 'im',
  title: "Instant message",
  plugin: {
    name: "@notesabc/im",
    mode: 'offline',
    js: "@notesabc/im/im.bundle.js",
    css: "@notesabc/im/im.bundle.css"
  },
  _i18n: {
    "zh-CN": {
      title: "即时消息"
    }
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
  _i18n: {
    "zh-CN": {
      title: "电子邮箱"
    }
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
  _i18n: {
    "zh-CN": {
      title: "上传文件"
    }
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}]
  , METAS = [{
  id: ".meta",
  title: "Meta",
  defaultValue: {
    title: "New Meta",
    _i18n: {
      "zh-CN": {
        title: "新元文档"
      }
    }
  },
  container: {
    id: '.metas',
    title: 'Metas'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元文档"
    }
  },
  _meta: {
    iconClass: "ti-wand"
  }
}, {
  id: ".meta-collection",
  title: "Meta-Collection",
  container: {
    id: '.collections',
    title: 'Collections'
  },
  defaultValue: {
    title: "New Collection",
    columns: DEFAULT_COLUMNS,
    search: {
      fields: DEFAULT_SEARCH_FIELDS,
      fulltext: DEFAULT_SEARCH_FULLTEXT,
      sort: DEFAULT_SORT,
    },
    _i18n: {
      "zh-CN": {
        title: "新文档集合",
        search: {
          fields: DEFAULT_I18N_SEARCH_FIELDS
        }
      }
    },
    _meta: {
      metaId: ".meta-collection",
      iconClass: "ti-folder"
    }
  },
  defaultAction: 'gridView',
  actions: ['gridView', 'edit'],
  _i18n: {
    "zh-CN": {
      title: "元文档集合"
    }
  },
  _meta: {
    iconClass: "ti-folder"
  }
}, {
  id: ".meta-page",
  title: "Meta-page",
  defaultValue: {
    title: "New Page",
    _i18n: {
      "zh-CN": {
        title: "新页面"
      }
    },
    _meta: {
      metaId: ".meta-page",
      iconClass: "ti-layout-width-default"
    }
  },
  container: {
    id: '.pages',
    title: 'Pages'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元页面"
    }
  },
  _meta: {
    iconClass: "ti-layout-width-default"
  }
}, {
  id: ".meta-view",
  title: "Meta-view",
  container: {
    id: '.views',
    title: 'Views'
  },
  defaultValue: {
    title: "New View",
    collections: [],
    columns: DEFAULT_COLUMNS,
    search: {
      fields: DEFAULT_SEARCH_FIELDS,
      fulltext: DEFAULT_SEARCH_FULLTEXT,
      sort: DEFAULT_SORT,
    },
    _i18n: {
      "zh-CN": {
        title: "新视图",
        search: {
          fields: DEFAULT_I18N_SEARCH_FIELDS
        }
      }
    },
    _meta: {
      metaId: '.meta-view',
      iconClass: "ti-view-list-alt"
    }
  },
  defaultAction: "gridView",
  actions: ['gridView', 'edit'],
  _i18n: {
    "zh-CN": {
      title: "元视图"
    }
  },
  _meta: {
    iconClass: "ti-view-list-alt"
  }
}, {
  id: ".meta-form",
  title: "Meta-form",
  defaultValue: {
    title: "New Form",
    _i18n: {
      "zh-CN": {
        title: "新表单"
      }
    },
    _meta: {
      metaId: '.meta-form',
      iconClass: "ti-layout-cta-btn-right"
    }
  },
  container: {
    id: '.forms',
    title: 'Forms'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元表单"
    }
  },
  _meta: {
    iconClass: "ti-layout-cta-btn-right"
  }
}, {
  id: ".meta-action",
  title: "Meta-action",
  defaultValue: {
    title: "New Action",
    _i18n: {
      "zh-CN": {
        title: "新行动"
      }
    },
    _meta: {
      metaId: '.meta-action',
      iconClass: "ti-control-play"
    }
  },
  container: {
    id: '.actions',
    title: 'Actions'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元行动"
    }
  },
  _meta: {
    iconClass: "ti-control-play"
  }
}, {
  id: ".meta-file",
  title: "Meta-file",
  defaultValue: {
    title: "New File",
    _i18n: {
      "zh-CN": {
        title: "新文件"
      }
    },
    _meta: {
      metaId: '.meta-file',
      iconClass: "ti-file"
    }
  },
  container: {
    id: '.files',
    title: 'Files'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元文件"
    }
  },
  _meta: {
    iconClass: "ti-file"
  }
}, {
  id: ".meta-role",
  title: "Meta-role",
  defaultValue: {
    title: "New Role",
    _i18n: {
      "zh-CN": {
        title: "新角色"
      }
    },
    _meta: {
      metaId: '.meta-role',
      iconClass: "ti-id-badge"
    }
  },
  container: {
    id: '.roles',
    title: 'Roles'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元角色"
    }
  },
  _meta: {
    iconClass: "ti-id-badge"
  }
}, {
  id: ".meta-group",
  title: "Meta-group",
  defaultValue: {
    title: "New Group",
    _i18n: {
      "zh-CN": {
        title: "新组"
      }
    },
    _meta: {
      metaId: '.meta-group',
      iconClass: "ti-view-grid"
    }
  },
  container: {
    id: '.groups',
    title: 'Groups'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元组"
    }
  },
  _meta: {
    iconClass: "ti-view-grid"
  }
}, {
  id: ".meta-profile",
  title: "Meta-profile",
  defaultValue: {
    title: "New Profile",
    _i18n: {
      "zh-CN": {
        title: "新画像"
      }
    },
    _meta: {
      metaId: '.meta-profile',
      iconClass: "ti-id-badge"
    }
  },
  container: {
    id: '.profiles',
    title: 'Profiles'
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元画像"
    }
  },
  _meta: {
    iconClass: "ti-id-badge"
  }
}]
  , ROOT_METAS = [{
  id: ".meta-user",
  title: "Meta-user",
  container: {
    id: '.users',
    title: 'Users'
  },
  defaultValue: {
    id: 'newuser',
    password: 'password',
    title: "New User",
    _i18n: {
      "zh-CN": {
        title: "新用户"
      }
    },
    _meta: {
      metaId: '.meta-user',
      iconClass: "ti-user"
    }
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元用户"
    }
  },
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: ".meta-domain",
  title: "Meta-domain",
  container: {
    id: '.domains',
    title: 'Domains'
  },
  defaultValue: {
    title: "New Domain",
    _i18n: {
      "zh-CN": {
        title: "新域"
      }
    },
    _meta: {
      metaId: '.meta-domain',
      iconClass: "ti-layout-width-full"
    }
  },
  actions: ['edit'],
  _i18n: {
    "zh-CN": {
      title: "元域"
    }
  },
  _meta: {
    iconClass: "ti-layout-width-full"
  }
}, ]
  , PAGES = [{
  id: ".login",
  title: "Login",
  _i18n: {
    "zh-CN": {
      title: "登录"
    }
  },
  _meta: {
    iconClass: "ti-layout-width-default",
    actions: ['login']
  }
}, {
  id: ".signup",
  title: "Signup",
  _i18n: {
    "zh-CN": {
      title: "注册"
    }
  },
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
    id: ".im",
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
  _i18n: {
    "zh-CN": {
      title: "工作台",
      favorites: {
        title: "我的收藏"
      }
    }
  },
  _meta: {
    iconClass: "ti-blackboard",
    actions: ['workbench']
  }
}, {
  id: ".dashboard",
  title: "Dashboard",
  _i18n: {
    "zh-CN": {
      title: "仪表盘"
    }
  },
  _meta: {
    iconClass: "ti-dashboard",
    actions: ['dashboard']
  }
}, {
  id: ".calendar",
  title: "Calendar",
  _i18n: {
    "zh-CN": {
      title: "日历"
    }
  },
  _meta: {
    iconClass: "ti-calendar",
    actions: ['calendar']
  }
}, {
  id: ".im",
  title: "Instant message",
  _i18n: {
    "zh-CN": {
      title: "即时消息"
    }
  },
  _meta: {
    iconClass: "ti-comments",
    actions: ['im']
  }
}, {
  id: ".emails",
  title: "Emails",
  _i18n: {
    "zh-CN": {
      title: "电子邮箱"
    }
  },
  _meta: {
    iconClass: "ti-email",
    actions: ['email']
  }
}]
  , ROLES = [{
  id: "administrator",
  title: "Administrator Role",
  _i18n: {
    "zh-CN": {
      title: "管理员"
    }
  },
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: "developer",
  title: "Developer",
  _i18n: {
    "zh-CN": {
      title: "开发人员"
    }
  },
  _meta: {
    iconClass: "ti-user"
  }
}, {
  id: "anonymous",
  title: "Anonymous Role",
  _i18n: {
    "zh-CN": {
      title: "匿名用色"
    }
  },
  _meta: {
    iconClass: "ti-user"
  }
}]
  , ADMINISTRATOR = {
  id: "administrator",
  title: "Administrator",
  password: "3c3f601a1960b8d7b347d376d52b6e59",
  _i18n: {
    "zh-CN": {
      title: "管理员"
    }
  },
  _meta: {
    iconClass: "ti-user",
  }
}
  , ANONYMOUS = {
  id: "anonymous",
  title: "Anonymous",
  password: "a29b1ee7caefc17a3a73d6d137c8169b",
  _i18n: {
    "zh-CN": {
      title: "匿名用户"
    }
  },
  _meta: {
    iconClass: "ti-user"
  }
};

module.exports = {
  DEFAULT_ACL: DEFAULT_ACL,
  DEVELOPER_ACL: DEVELOPER_ACL,
  DEFAULT_COLUMNS: DEFAULT_COLUMNS,
  DEFAULT_SEARCH_FIELDS: DEFAULT_SEARCH_FIELDS,
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
