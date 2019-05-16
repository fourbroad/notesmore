
const dashboard = () => import('dashboard/dashboard.vue')
const calendar = () => import('calendar/calendar.vue')
const im = () => import('im/im.vue')
const email = () => import('email/email.vue')

const dynamicRoutes = [{
  path: '/dashboard',
  component: dashboard,
  name: 'dashboard',
  meta: {
    name: '仪表盘',
    icon: 'icon-email'
  }
}, {
  path: '/calendar',
  component: calendar,
  name: 'calendar',
  meta: {
    name: '日历',
    icon: 'icon-email'
  }
}, {
  path: '/im',
  component: im,
  name: 'im',
  meta: {
    name: '即时通讯',
    icon: 'icon-email'
  }
}, {
  path: '/email',
  component: email,
  name: 'email',
  meta: {
    name: '电子邮箱',
    icon: 'icon-email'
  }
  // }, {
  //   path: '/:collection',
  //   component: view,
  //   name: 'form',
  //   meta: {
  //     name: '视图',
  //     icon: 'icon-email'
  //   },
  //   children: [{
  //     path: ':document',
  //     name: 'document',
  //     component: form,
  //     meta: {
  //       name: '表单',
  //       icon: 'icon-quit'
  //     }
  //   }]
}]

const routes = [{
  id: 'workbench',
  path: '',
  title: 'Workbench',
  redirect: 'welcome',
  plugin: {
    name: '@notesmore/workbench',
    js: '@notesabc/workbench/workbench.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'workbench'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '工作台'
    }
  }
}, {
  id: 'welcome',
  path: '/',
  title: 'Welcome',
  plugin: {
    name: '@notesmore/welcome',
    js: '@notesabc/welcome/welcome.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'welcome'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '欢迎'
    }
  }
}, {
  id: 'dashboard',
  path: '/dashboard',
  title: 'Dashboard',
  plugin: {
    name: '@notesmore/dashboard',
    js: '@notesabc/dashboard/dashboard.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'dashboard'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '仪表盘'
    }
  }
}, {
  id: 'calendar',
  path: '/calendar',
  title: 'Calendar',
  plugin: {
    name: '@notesmore/calendar',
    js: '@notesabc/calendar/calendar.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'calendar'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '日历'
    }
  }
}, {
  id: 'im',
  path: '/im',
  title: 'IM',
  plugin: {
    name: '@notesmore/im',
    js: '@notesabc/im/im.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'im'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '日历'
    }
  }
}, {
  id: 'email',
  path: '/email',
  title: 'Email',
  plugin: {
    name: '@notesmore/email',
    js: '@notesabc/email/email.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'email'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '电子邮箱'
    }
  }
}, {
  id: 'collection',
  path: '/.collections/:collectionId',
  title: 'Collection',
  plugin: {
    name: '@notesmore/collection',
    js: '@notesabc/collection/collection.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'collection'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '文档集合'
    }
  }
}, {
  id: 'view',
  path: '/.views/:viewId',
  title: 'View',
  plugin: {
    name: '@notesmore/view',
    js: '@notesabc/view/view.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'view'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '视图'
    }
  }
}, {
  id: 'page',
  path: '/.pages/:pageId',
  title: 'Page',
  plugin: {
    name: '@notesmore/page',
    js: '@notesabc/page/page.bundle.js',
    options: {
      collectionId: '.pages',
      documentId: 'view'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '页面'
    }
  }
}, {
  id: 'form',
  path: '/.forms/:formId',
  title: 'Form',
  plugin: {
    name: '@notesmore/form',
    js: '@notesabc/form/form.bundle.js',
    options: {
      collectionId: '.form',
      documentId: 'form'
    }
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '表单'
    }
  }
}, {
  id: 'loader',
  path: '/:collectionId/:documentId(/:_op)?',
  title: 'Loader',
  component: {
    name: 'loader',
    loadMode: 'inline' // inline, webpack, customize
  },
  _meta: {
    iconClass: 'fa fa-tasks'
  },
  _i18n: {
    'zh-CN': {
      title: '加载器'
    }
  }
}]

export default dynamicRoutes