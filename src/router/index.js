import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  }

]

export const asyncRoutes = [
  {
    path: '/book',
    component: Layout,
    redirect: '/book/list',
    meta: {
      title: '图书管理',
      icon: 'documentation'
    },
    children: [
      {
        path: '/book/list',
        component: () => import('@/views/book/list'),
        name: 'bookList',
        meta: {
          title: '图书列表',
          icon: 'list'
        }
      },
      {
        path: '/book/create',
        component: () => import('@/views/book/create'),
        name: 'bookCreate',
        meta: {
          title: '新增图书',
          icon: 'edit'
        }
      },
      {
        path: '/book/edit/:fileName',
        component: () => import('@/views/book/edit'),
        name: 'bookEdit',
        hidden: true,
        meta: {
          title: '编辑',
          icon: 'edit',
          activeMenu: '/book/list'
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
