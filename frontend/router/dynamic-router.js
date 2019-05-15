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

export default dynamicRoutes