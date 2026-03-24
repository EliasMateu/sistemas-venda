<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <span v-if="!sidebarCollapsed" class="brand-name">VendaSys</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item" :class="{ active: isActive(item.to) }">
          <span class="nav-icon" v-html="item.icon" />
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" @click="sidebarCollapsed = !sidebarCollapsed">
          <span class="nav-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </span>
          <span v-if="!sidebarCollapsed" class="nav-label">Recolher</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="main-area">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="topbar-title">{{ currentTitle }}</h2>
        </div>
        <div class="topbar-right">
          <div class="user-chip">
            <div class="user-avatar">{{ userInitial }}</div>
            <div v-if="!isMobile" class="user-info">
              <span class="user-name">{{ auth.user?.name }}</span>
              <span class="user-role">{{ auth.user?.role }}</span>
            </div>
            <button class="btn-icon btn-ghost btn-sm" @click="auth.logout(); $router.push('/login')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const sidebarCollapsed = ref(false)
const isMobile = ref(window.innerWidth < 768)

const userInitial = computed(() => auth.user?.name?.charAt(0).toUpperCase() || 'U')

const navItems = computed(() => {
  const items = [
    {
      to: '/', label: 'Dashboard',
      icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
    },
    {
      to: '/customers', label: 'Clientes',
      icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`
    },
    {
      to: '/products', label: 'Produtos',
      icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`
    },
    {
      to: '/sales', label: 'Vendas / Fiados',
      icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`
    },
    {
      to: '/import-export', label: 'Importar / Exportar',
      icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
    },
  ]
  if (auth.isAdmin) {
    items.push({
      to: '/users', label: 'Usuários',
      icon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    })
  }
  return items
})

const routeTitles = {
  '/': 'Dashboard',
  '/customers': 'Clientes',
  '/products': 'Produtos',
  '/sales': 'Vendas & Fiados',
  '/users': 'Usuários',
  '/import-export': 'Importar / Exportar',
}

const currentTitle = computed(() => {
  if (route.name === 'CustomerDetail') return 'Detalhes do Cliente'
  return routeTitles[route.path] || 'Sistema de Vendas'
})

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition);
  flex-shrink: 0;
  overflow: hidden;
}
.sidebar.collapsed { width: 62px; }

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px;
  border-bottom: 1px solid var(--border);
  min-height: var(--topbar-h);
}
.brand-icon {
  width: 36px;
  height: 36px;
  background: var(--brand);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.brand-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 10px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition);
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  white-space: nowrap;
}
.nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
.nav-item.active { background: var(--brand-glow); color: var(--brand); }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; width: 20px; }
.nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.nav-badge {
  background: var(--danger);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  margin-left: auto;
}

.sidebar-footer {
  padding: 8px 8px 16px;
  border-top: 1px solid var(--border);
}

/* ── Main ─────────────────────────────────────────────────────────────── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.topbar {
  height: var(--topbar-h);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.topbar-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); }

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 34px;
  height: 34px;
  background: var(--brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.85rem; font-weight: 600; line-height: 1.2; }
.user-role { font-size: 0.7rem; color: var(--text-muted); text-transform: capitalize; }

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 28px;
}

@media (max-width: 768px) {
  .sidebar { width: 62px; }
  .page-content { padding: 16px; }
}
</style>
