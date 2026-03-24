import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'customers', name: 'Customers', component: () => import('@/views/CustomersView.vue') },
      { path: 'customers/:id', name: 'CustomerDetail', component: () => import('@/views/CustomerDetailView.vue') },
      { path: 'products', name: 'Products', component: () => import('@/views/ProductsView.vue') },
      { path: 'sales', name: 'Sales', component: () => import('@/views/SalesView.vue') },
      { path: 'users', name: 'Users', component: () => import('@/views/UsersView.vue'), meta: { role: 'admin' } },
      { path: 'import-export', name: 'ImportExport', component: () => import('@/views/ImportExportView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) return '/login'
  if (to.meta.public && auth.isAuthenticated) return '/'
  if (to.meta.role === 'admin' && !auth.isAdmin) return '/'
})

export default router
