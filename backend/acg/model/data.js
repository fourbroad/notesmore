const DEFAULT_ACL = {
    get: {
        roles: ['administrator']
    },
    patch: {
        roles: ['administrator']
    },
    delete: {},
    getMeta: {
        roles: ['administrator']
    },
    patchMeta: {
        roles: ['administrator']
    },
    clearAclSubject: {
        roles: ['administrator']
    }
}
    , DEVELOPER_ACL = {
        patch: {
            roles: ['developer']
        },
        delete: {},
        getMeta: {
            roles: ['developer']
        },
        patchMeta: {
            roles: ['developer']
        },
        clearAclSubject: {
            roles: ['developer']
        }
    }
    , DEFAULT_SEARCH_FULLTEXT = {
        fields: [
            'id.keyword',
            'title.keyword',
            '_meta.author.keyword',
            '_i18n.*.id.keyword',
            '_i18n.*.title.keyword',
            '_i18n.*._meta.author.keyword'
        ]
    }
    , DEFAULT_SORT = [{
        '_meta.updated': {
            order: 'desc'
        }
    }, {
        '_meta.created': {
            order: 'desc'
        }
    }]
    , DEFAULT_EXPORT = {
        size: 2000
    }
    , DEFAULT_I18N_EXPORT = {
        prompt: {
            completed: "已完成",
            export: "导出",
            hasBeenExported: "导出完成!",
            startExporting: "开始导出"
        }
    }
    , DEFAULT_COLUMNS = [{
        title: 'Id',
        name: 'id',
        type: 'keyword',
        defaultLink: true
    }, {
        title: 'Title',
        name: 'title',
        type: 'keyword',
        sortable: false,
        defaultLink: true
    }, {
        title: 'Author',
        name: '_meta.author',
        type: 'keyword'
    }, {
        title: 'Version',
        name: '_meta.version',
        type: 'integer'
    }, {
        title: 'Created',
        name: '_meta.created',
        type: 'date'
    }, {
        title: 'Updated',
        name: '_meta.updated',
        type: 'date'
    }]
    , DEFAULT_I18N_COLUMNS = [{
        title: '唯一标识'
    }, {
        title: '标题'
    }, {
        title: '作者'
    }, {
        title: '版本'
    }, {
        title: '创建日期'
    }, {
        title: '更新日期'
    }]
    , DEFAULT_SEARCH_FIELDS = [{
        title: 'Id',
        name: 'id',
        type: 'keywords'
    }, {
        title: 'Title',
        name: 'title',
        type: 'containsText'
    }, {
        title: 'Author',
        name: '_meta.author',
        type: 'keywords'
    }, {
        title: 'Version',
        name: '_meta.version',
        type: 'numericRange'
    }, {
        title: 'Created',
        name: '_meta.created',
        type: 'datetimeRange'
    }, {
        title: 'Updated',
        name: '_meta.updated',
        type: 'datetimeRange'
    }]
    , DEFAULT_I18N_SEARCH_FIELDS = [{
        title: '唯一标识'
    }, {
        title: '标题'
    }, {
        title: '作者'
    }, {
        title: '版本'
    }, {
        title: '创建日期'
    }, {
        title: '更新日期'
    }]
    , DEFAULT_I18N_TOOLBOX = {
        save: '保存',
        cancel: '取消',
        delete: '删除',
        wait: '请稍等...',
        saveAs: '另存为...',
        saveAsView: '另存为视图...',
        exportAllCSV: '导出为CSV文件(所有字段)',
        exportCurrentCSV: '导出为CSV文件(当前字段)'
    }

    , DEFAULT_I18N_CONTEXTMENU = {
        delete: '删除'
    }
    , COLLECTIONS = [{
        id: '.collections',
        title: 'Data Warehouse',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '数据仓库',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-university',
            acl: {
                get: {
                    roles: ['member']
                },
                bulk: {}
            }
        }
    }, {
        id: '.metas',
        title: 'Templates',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '模板集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.pages',
        title: 'Pages',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '页面集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.views',
        title: 'Views',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '视图集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                get: {
                    roles: ['member', "administrator"]
                },
                bulk: {}
            }
        }
    }, {
        id: '.forms',
        title: 'Forms',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '表单集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.actions',
        title: 'Actions',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '操作',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.files',
        title: 'Files',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        upload: {
            url: 'http://localhost:3000'
        },
        _i18n: {
            cn: {
                title: '文件集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            actions: ['gridView', 'uploadFiles', 'edit'],
            bulk: {}
        }
    }, {
        id: '.roles',
        title: 'Roles',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '角色集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.groups',
        title: 'Groups',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '组集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.profiles',
        title: 'Profiles',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '身份集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }]
    , ROOT_COLLECTIONS = [{
        id: '.users',
        title: 'Users',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '用户集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }, {
        id: '.domains',
        title: 'Domains',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '域集合',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-collection',
            iconClass: 'fa fa-folder-o',
            acl: {
                bulk: {}
            }
        }
    }]
    , VIEWS = [{
        id: '.searchDocuments',
        title: 'Search Documents',
        columns: DEFAULT_COLUMNS,
        search: {
            fields: DEFAULT_SEARCH_FIELDS,
            fulltext: DEFAULT_SEARCH_FULLTEXT,
            sort: DEFAULT_SORT,
        },
        export: DEFAULT_EXPORT,
        _i18n: {
            cn: {
                title: '搜索文档',
                columns: DEFAULT_I18N_COLUMNS,
                search: {
                    fields: DEFAULT_I18N_SEARCH_FIELDS
                },
                export: DEFAULT_I18N_EXPORT,
                toolbox: DEFAULT_I18N_TOOLBOX,
                contextMenu: DEFAULT_I18N_CONTEXTMENU
            }
        },
        _meta: {
            metaId: '.meta-view',
            iconClass: 'fa fa-search',
            acl: {
                get: {
                    roles: ['administrator', 'member']
                }
            }
        }
    }]
    , ACTIONS = [{
        id: 'new',
        title: 'New',
        plugin: {
            name: '@notesabc/form',
            mode: 'offline',
            js: '@notesabc/form/form.bundle.js',
            css: '@notesabc/form/form.bundle.css'
        },
        _i18n: {
            cn: {
                title: '新建'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: 'edit',
        title: 'Edit(Json)',
        plugin: {
            name: '@notesabc/form',
            mode: 'offline',
            js: '@notesabc/form/form.bundle.js',
            css: '@notesabc/form/form.bundle.css'
        },
        _i18n: {
            cn: {
                title: '编辑(Json)'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: 'gridView',
        title: 'Grid View',
        plugin: {
            name: '@notesabc/view',
            mode: 'offline',
            js: '@notesabc/view/view.bundle.js',
            css: '@notesabc/view/view.bundle.css'
        },
        _i18n: {
            cn: {
                title: '表格'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: 'login',
        title: 'Login',
        plugin: {
            name: '@notesabc/login',
            mode: 'offline',
            js: '@notesabc/login/login.bundle.js',
            css: '@notesabc/login/login.bundle.css'
        },
        _i18n: {
            cn: {
                title: '登录'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks',
            acl: {
                get: {
                    roles: ['anonymous']
                }
            }
        }
    }, {
        id: 'forbidden',
        title: 'Forbidden',
        plugin: {},
        _i18n: {
            cn: {
                title: '禁止访问'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'notFound',
        title: 'Not Found',
        plugin: {},
        _i18n: {
            cn: {
                title: '访问页面不存在'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'signup',
        title: 'Signup',
        plugin: {
            name: '@notesabc/signup',
            mode: 'offline',
            js: '@notesabc/signup/signup.bundle.js',
            css: '@notesabc/signup/signup.bundle.css'
        },
        _i18n: {
            cn: {
                title: '注册'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'workbench',
        title: 'Workbench',
        plugin: {
            name: '@notesabc/workbench',
            mode: 'offline',
            js: '@notesabc/workbench/workbench.bundle.js',
            css: '@notesabc/workbench/workbench.bundle.css'
        },
        _i18n: {
            cn: {
                title: '工作台'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: 'dashboard',
        title: 'Dashboard',
        plugin: {
            name: '@notesabc/dashboard',
            mode: 'offline',
            js: '@notesabc/dashboard/dashboard.bundle.js',
            css: '@notesabc/dashboard/dashboard.bundle.css'
        },
        _i18n: {
            cn: {
                title: '仪表盘'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'calendar',
        title: 'Calendar',
        plugin: {
            name: '@notesabc/calendar',
            mode: 'offline',
            js: '@notesabc/calendar/calendar.bundle.js',
            css: '@notesabc/calendar/calendar.bundle.css'
        },
        _i18n: {
            cn: {
                title: '日历'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'im',
        title: 'Instant message',
        plugin: {
            name: '@notesabc/im',
            mode: 'offline',
            js: '@notesabc/im/im.bundle.js',
            css: '@notesabc/im/im.bundle.css'
        },
        _i18n: {
            cn: {
                title: '即时消息'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'email',
        title: 'Email',
        plugin: {
            name: '@notesabc/email',
            mode: 'offline',
            js: '@notesabc/email/email.bundle.js',
            css: '@notesabc/email/email.bundle.css'
        },
        _i18n: {
            cn: {
                title: '电子邮箱'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }, {
        id: 'uploadFiles',
        title: 'Upload Files',
        plugin: {
            name: '@notesabc/uploadfiles',
            mode: 'offline',
            js: '@notesabc/upload-files/upload-files.bundle.js',
            css: '@notesabc/upload-files/upload-files.bundle.css'
        },
        _i18n: {
            cn: {
                title: '上传文件'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks'
        }
    }]
    , METAS = [{
        id: '.meta',
        title: 'Template',
        defaultValue: {
            id: 'new-meta',
            title: 'New Meta',
            _i18n: {
                cn: {
                    title: '新模板'
                }
            },
            _meta: {
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.metas',
            title: 'Metas'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '模板'
            }
        },
        acl: {
            get: {
                roles: ['administrator']
            }
        },
        _meta: {
            iconClass: 'fa fa-magic',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: '.meta-collection',
        title: 'Collection',
        container: {
            id: '.collections',
            title: 'Collections'
        },
        defaultValue: {
            id: 'new-collection',
            title: 'New Collection',
            columns: DEFAULT_COLUMNS,
            search: {
                fields: DEFAULT_SEARCH_FIELDS,
                fulltext: DEFAULT_SEARCH_FULLTEXT,
                sort: DEFAULT_SORT,
            },
            export: DEFAULT_EXPORT,
            _i18n: {
                cn: {
                    title: '新文档集合',
                    columns: DEFAULT_I18N_COLUMNS,
                    search: {
                        fields: DEFAULT_I18N_SEARCH_FIELDS
                    },
                    export: DEFAULT_I18N_EXPORT,
                    toolbox: DEFAULT_I18N_TOOLBOX,
                    contextMenu: DEFAULT_I18N_CONTEXTMENU
                }
            },
            _meta: {
                metaId: '.meta-collection',
                iconClass: 'fa fa-folder-o',
                acl: {
                    get: {
                        roles: ['member']
                    },
                    patchMeta: {
                        roles: ['administrator']
                    },
                    bulk: {}
                }
            }
        },
        defaultAction: 'gridView',
        actions: ['gridView', 'edit'],
        _i18n: {
            cn: {
                title: '集合'
            }
        },
        _meta: {
            iconClass: 'fa fa-folder-o',
            acl: {
                get: {
                    roles: ["member"]
                }
            }
        }
    }, {
        id: '.meta-page',
        title: 'Page',
        defaultValue: {
            id: 'new-page',
            title: 'New Page',
            _i18n: {
                cn: {
                    title: '新页面'
                }
            },
            _meta: {
                metaId: '.meta-page',
                iconClass: 'fa fa-columns',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.pages',
            title: 'Pages'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '页面'
            }
        },
        _meta: {
            iconClass: 'fa fa-columns',
            acl: {
                get: {
                    roles: ['anonymous', 'member']
                }
            }
        }
    }, {
        id: '.meta-view',
        title: 'View',
        container: {
            id: '.views',
            title: 'Views'
        },
        defaultValue: {
            id: 'new-view',
            title: 'New View',
            collections: [],
            columns: DEFAULT_COLUMNS,
            search: {
                fields: DEFAULT_SEARCH_FIELDS,
                fulltext: DEFAULT_SEARCH_FULLTEXT,
                sort: DEFAULT_SORT,
            },
            export: DEFAULT_EXPORT,
            _i18n: {
                cn: {
                    title: '新视图',
                    columns: DEFAULT_I18N_COLUMNS,
                    search: {
                        fields: DEFAULT_I18N_SEARCH_FIELDS
                    },
                    export: DEFAULT_I18N_EXPORT,
                    toolbox: DEFAULT_I18N_TOOLBOX,
                    contextMenu: DEFAULT_I18N_CONTEXTMENU
                }
            },
            _meta: {
                metaId: '.meta-view',
                iconClass: 'fa fa-windows',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    },
                    bulk: {}
                }
            }
        },
        defaultAction: 'gridView',
        actions: ['gridView', 'edit'],
        acl: {
            create: {
                roles: ['member']
            }
        },
        _i18n: {
            cn: {
                title: '视图'
            }
        },
        _meta: {
            iconClass: 'fa fa-windows',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: '.meta-form',
        title: 'Form',
        defaultValue: {
            id: 'new-form',
            title: 'New Form',
            _i18n: {
                cn: {
                    title: '新表单'
                }
            },
            _meta: {
                metaId: '.meta-form',
                iconClass: 'fa fa-list-alt',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.forms',
            title: 'Forms'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '表单'
            }
        },
        _meta: {
            iconClass: 'fa fa-list-alt'
        }
    }, {
        id: '.meta-action',
        title: 'Action',
        defaultValue: {
            id: 'new-action',
            title: 'New Action',
            _i18n: {
                cn: {
                    title: '新操作'
                }
            },
            _meta: {
                metaId: '.meta-action',
                iconClass: 'fa fa-tasks',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.actions',
            title: 'Actions'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '操作'
            }
        },
        _meta: {
            iconClass: 'fa fa-tasks',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: '.meta-file',
        title: 'File',
        defaultValue: {
            id: 'new-file',
            title: 'New File',
            _i18n: {
                cn: {
                    title: '新文件'
                }
            },
            _meta: {
                metaId: '.meta-file',
                iconClass: 'fa fa-file-text-o',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.files',
            title: 'Files'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '文件'
            }
        },
        _meta: {
            iconClass: 'fa fa-file-text-o'
        }
    }, {
        id: '.meta-role',
        title: 'Role',
        defaultValue: {
            id: 'new-role',
            title: 'New Role',
            _i18n: {
                cn: {
                    title: '新角色'
                }
            },
            _meta: {
                metaId: '.meta-role',
                iconClass: 'fa fa-user-circle',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.roles',
            title: 'Roles'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '角色'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-circle'
        }
    }, {
        id: '.meta-group',
        title: 'Group',
        defaultValue: {
            id: 'new-group',
            title: 'New Group',
            _i18n: {
                cn: {
                    title: '新组'
                }
            },
            _meta: {
                metaId: '.meta-group',
                iconClass: 'fa fa-users',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.groups',
            title: 'Groups'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '组'
            }
        },
        _meta: {
            iconClass: 'fa fa-users'
        }
    }, {
        id: '.meta-profile',
        title: 'Profile',
        defaultValue: {
            id: "new-profile",
            title: 'New Profile',
            roles: ['member'],
            _i18n: {
                cn: {
                    title: '新身份'
                }
            },
            _meta: {
                metaId: '.meta-profile',
                iconClass: 'fa fa-user-circle-o',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        container: {
            id: '.profiles',
            title: 'Profiles'
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '身份'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-circle-o'
        }
    }]
    , ROOT_METAS = [{
        id: '.meta-user',
        title: 'User',
        container: {
            id: '.users',
            title: 'Users'
        },
        defaultValue: {
            id: 'new-user',
            password: 'password',
            title: 'New User',
            _i18n: {
                cn: {
                    title: '新用户'
                }
            },
            _meta: {
                metaId: '.meta-user',
                iconClass: 'fa fa-user-o',
                acl: {
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '用户'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-o',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: '.meta-domain',
        title: 'Domain',
        container: {
            id: '.domains',
            title: 'Domains'
        },
        defaultValue: {
            id: 'new-domain',
            title: 'New Domain',
            _i18n: {
                cn: {
                    title: '新域'
                }
            },
            _meta: {
                metaId: '.meta-domain',
                iconClass: 'fa fa-flag-o',
                acl: {
                    get: {
                        roles: ['anonymous', 'member']
                    },
                    patchMeta: {
                        roles: ['administrator']
                    }
                }
            }
        },
        actions: ['edit'],
        _i18n: {
            cn: {
                title: '域'
            }
        },
        _meta: {
            iconClass: 'fa fa-flag-o',
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    },]
    , PAGES = [{
        id: '.login',
        title: 'Login',
        _i18n: {
            cn: {
                title: '登录'
            }
        },
        _meta: {
            iconClass: 'fa fa-columns',
            actions: ['login'],
            acl: {
                get: {
                    roles: ['anonymous']
                }
            }
        }
    }, {
        id: '.403',
        title: 'Forbidden',
        _i18n: {
            cn: {
                title: '禁止访问'
            }
        },
        _meta: {
            iconClass: 'fa fa-columns',
            actions: ['forbidden']
        }
    }, {
        id: '.notFound',
        title: 'Not Found',
        _i18n: {
            cn: {
                title: '访问页面不存在'
            }
        },
        _meta: {
            iconClass: 'fa fa-columns',
            actions: ['notFound']
        }
    }, {
        id: '.signup',
        title: 'Signup',
        _i18n: {
            cn: {
                title: '注册'
            }
        },
        _meta: {
            iconClass: 'fa fa-columns',
            actions: ['signup']
        }
    }, {
        id: '.workbench',
        title: 'Workbench',
        slogan: 'Work is easy due to collaboration!',
        sidebarItems: [{
            collectionId: '.pages',
            id: '.dashboard'
        }, {
            collectionId: '.pages',
            id: '.calendar'
        }, {
            collectionId: '.pages',
            id: '.im'
        }, {
            collectionId: '.pages',
            id: '.emails'
        }, {
            collectionId: '.collections',
            id: '.collections'
        }],
        _i18n: {
            cn: {
                title: '工作台',
                slogan: '工作因协同而轻松!',
                favorites: {
                    title: '我的收藏'
                }
            }
        },
        _meta: {
            iconClass: 'fa fa-desktop',
            actions: ['workbench'],
            acl: {
                get: {
                    roles: ['member']
                }
            }
        }
    }, {
        id: '.dashboard',
        title: 'Dashboard',
        _i18n: {
            cn: {
                title: '仪表盘'
            }
        },
        _meta: {
            iconClass: 'fa fa-tachometer',
            actions: ['dashboard']
        }
    }, {
        id: '.calendar',
        title: 'Calendar',
        _i18n: {
            cn: {
                title: '日历'
            }
        },
        _meta: {
            iconClass: 'fa fa-calendar',
            actions: ['calendar']
        }
    }, {
        id: '.im',
        title: 'Instant message',
        _i18n: {
            cn: {
                title: '即时消息'
            }
        },
        _meta: {
            iconClass: 'fa fa-comments-o',
            actions: ['im']
        }
    }, {
        id: '.emails',
        title: 'Emails',
        _i18n: {
            cn: {
                title: '电子邮箱'
            }
        },
        _meta: {
            iconClass: 'fa fa-envelope-o',
            actions: ['email']
        }
    }]
    , ROLES = [{
        id: 'administrator',
        title: 'Administrator Role',
        _i18n: {
            cn: {
                title: '管理员'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-circle'
        }
    }, {
        id: 'member',
        title: 'Member Role',
        _i18n: {
            cn: {
                title: '成员'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-circle'
        }
    }, {
        id: 'developer',
        title: 'Developer',
        _i18n: {
            cn: {
                title: '开发人员'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-circle'
        }
    }, {
        id: 'anonymous',
        title: 'Anonymous Role',
        _i18n: {
            cn: {
                title: '匿名角色'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-circle'
        }
    }]
    , ADMINISTRATOR = {
        id: 'administrator',
        title: 'Administrator',
        password: '3c3f601a1960b8d7b347d376d52b6e59',
        _i18n: {
            cn: {
                title: '管理员'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-o'
        }
    }
    , ANONYMOUS = {
        id: 'anonymous',
        title: 'Anonymous',
        password: 'a29b1ee7caefc17a3a73d6d137c8169b',
        _i18n: {
            cn: {
                title: '匿名用户'
            }
        },
        _meta: {
            iconClass: 'fa fa-user-secret',
            acl: {
                get: {
                    users: ['anonymous']
                }
            }
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
