import loader from 'components/loader'

function buildRoute(routeData) {
    let c = routeData.component,
        route = {
            name: routeData.id,
            path: routeData.path,
            component: loader
        };

    if (routeData.redirect) route.redirect = routeData.redirect;
    if (routeData.meta) route.meta = routeData.meta;

    if (routeData.id == 'workbench') {
        route.component = () => import('components/workbench');
    }

    return route;
}

function recursion(routeData, allRouteData) {
    let routes = [];
    _.each(routeData, (pd) => {
        let parent = buildRoute(pd),
            children = _.filter(allRouteData, function (cd) {
                return cd.parent == pd.id;
            });

        if (children.length > 0) {
            parent.children = recursion(children, _.differenceWith(allRouteData, children, _.isEqual));
        }

        routes.push(parent);
    });

    return routes;
}

function buildRoutes(routeData) {
    let rootData = _.filter(routeData, function (r) {
        return !r.parent;
    });
    return recursion(rootData, _.differenceWith(routeData, rootData, _.isEqual));
}

const routes = buildRoutes([
    {
        id: 'workbench',
        path: '',
        title: 'Workbench',
        redirect: '.pages/.dashboard',
        meta: {
            collectionId: '.pages',
            documentId: '.workbench'
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
        path: 'welcome',
        title: 'Welcome',
        parent: 'workbench',
        meta: {
            collectionId: '.pages',
            documentId: '.welcome'
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
        path: 'dashboard',
        title: 'Dashboard',
        parent: 'workbench',
        meta: {
            collectionId: '.pages',
            documentId: '.dashboard'
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
        parent: 'workbench',
        meta: {
            collectionId: '.pages',
            documentId: '.calendar'
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
        parent: 'workbench',
        meta: {
            collectionId: '.pages',
            documentId: '.im'
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
        id: 'emails',
        path: '/emails',
        title: 'Emails',
        parent: 'workbench',
        meta: {
            collectionId: '.pages',
            documentId: '.emails'
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
        id: 'loader',
        path: '/:collectionId/:documentId/:actionId?',
        title: 'Loader',
        parent: 'workbench',
        _meta: {
            iconClass: 'fa fa-tasks'
        },
        _i18n: {
            'zh-CN': {
                title: '加载器'
            }
        }
    }, {
        id: '403',
        path: '/403',
        title: '403',
        meta: {
            collectionId: '.pages',
            documentId: '.403',
            actionId: 'forbidden'
        },
        _i18n: {
            'zh-CN': {
                title: '禁止访问'
            }
        }
    }, {
        id: 'all',
        path: '*',
        title: 'All',
        meta: {
            collectionId: '.pages',
            documentId: '.notFound',
            actionId: 'notFound'
        },
        _i18n: {
            'zh-CN': {
                title: '访问页面不存在'
            }
        }
    }]
);

export default routes;