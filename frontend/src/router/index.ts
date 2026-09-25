import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'jobs',
          name: 'jobs',
          component: () => import('@/views/JobsView.vue'),
        },
        {
          path: 'jobs/:id',
          name: 'job-detail',
          component: () => import('@/views/JobDetailView.vue'),
        },
        {
          path: 'applications',
          name: 'applications',
          component: () => import('@/views/ApplicationsView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
        },
        {
          path: 'bookmarks',
          name: 'bookmarks',
          component: () => import('@/views/BookmarksView.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/NotificationsView.vue'),
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/AdminView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/sources',
          name: 'admin-sources',
          component: () => import('@/views/AdminSourcesView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'admin/crawl-logs',
          name: 'admin-crawl-logs',
          component: () => import('@/views/AdminCrawlLogsView.vue'),
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.guest && token) {
    next('/')
  } else if (to.meta.requiresAdmin && user.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

export default router
