<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Visão geral do sistema — {{ today }}</p>
      </div>
      <button class="btn btn-secondary" @click="load" :disabled="loading">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Atualizar
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="stats-grid" v-if="!loading">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total Baixado (Pago)</span>
          <span class="stat-value">{{ fmt(data.totalDischarge) }}</span>
          <span class="stat-sub">Valor total recebido</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--red">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total em Aberto</span>
          <span class="stat-value danger">{{ fmt(data.totalDebt) }}</span>
          <span class="stat-sub">Clientes devendo</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Total de Vendas</span>
          <span class="stat-value">{{ data.totalSales }}</span>
          <span class="stat-sub">Registros no sistema</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--cyan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-label">Clientes com Dívida</span>
          <span class="stat-value">{{ data.topDebtors?.length || 0 }}</span>
          <span class="stat-sub">Com saldo em aberto</span>
        </div>
      </div>
    </div>

    <!-- Skeleton loading -->
    <div class="stats-grid" v-else>
      <div class="stat-card skeleton" v-for="i in 4" :key="i" style="height:100px" />
    </div>

    <div class="dashboard-grid">
      <!-- Monthly Chart -->
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">Movimentação Mensal</h3>
          <span class="badge badge-info">Últimos 12 meses</span>
        </div>
        <div class="chart-wrap" v-if="!loading && chartData">
          <canvas ref="chartRef" />
        </div>
        <div class="empty-state" v-else-if="!loading">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <p>Sem dados de vendas</p>
        </div>
        <div style="height:200px;display:flex;align-items:center;justify-content:center" v-else>
          <div class="spinner" />
        </div>
      </div>

      <!-- Top Debtors -->
      <div class="card debtors-card">
        <div class="card-header">
          <h3 class="card-title">Top Devedores</h3>
          <RouterLink to="/customers" class="btn btn-ghost btn-sm">Ver todos</RouterLink>
        </div>

        <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:40px">
          <div class="spinner" />
        </div>

        <div v-else-if="!data.topDebtors?.length" class="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>Nenhum cliente com dívida</p>
        </div>

        <div v-else class="debtors-list">
          <div
            v-for="(debtor, i) in data.topDebtors"
            :key="debtor.id"
            class="debtor-item"
            @click="$router.push(`/customers/${debtor.id}`)"
          >
            <div class="debtor-rank">{{ i + 1 }}</div>
            <div class="debtor-avatar">{{ debtor.name.charAt(0).toUpperCase() }}</div>
            <div class="debtor-info">
              <div class="debtor-name">
                {{ debtor.name }}
                <span v-if="debtor.isOverLimit" class="badge badge-danger" style="font-size:0.65rem">
                  Limite excedido
                </span>
              </div>
              <div class="debtor-meta">{{ debtor.salesCount }} venda(s) em aberto</div>
            </div>
            <div class="debtor-value danger">{{ fmt(debtor.totalDebt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { dashboardApi } from '@/services/api'

Chart.register(...registerables)

const data = ref({ totalDischarge: 0, totalDebt: 0, totalSales: 0, topDebtors: [], monthlySales: [] })
const loading = ref(true)
const chartRef = ref(null)
let chartInstance = null

const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

const chartData = computed(() => data.value.monthlySales?.length > 0)

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

async function load() {
  loading.value = true
  try {
    const res = await dashboardApi.getSummary()
    data.value = res.data
    await nextTick()
    renderChart()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (!chartRef.value || !data.value.monthlySales?.length) return
  if (chartInstance) chartInstance.destroy()

  const labels = data.value.monthlySales.map(m => {
    const [y, mo] = m.month.split('-')
    return new Date(+y, +mo - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  })
  const totals = data.value.monthlySales.map(m => m.total)
  const paids = data.value.monthlySales.map(m => m.paid)

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Vendido',
          data: totals,
          backgroundColor: 'rgba(59,130,246,0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1.5,
          borderRadius: 6,
        },
        {
          label: 'Recebido',
          data: paids,
          backgroundColor: 'rgba(16,185,129,0.6)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { family: 'Sora', size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: '#475569' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: { color: '#475569', callback: (v) => `R$ ${(v/1000).toFixed(0)}k` },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
      },
    },
  })
}

onMounted(load)
</script>

<style scoped>
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: border-color var(--transition);
}
.stat-card:hover { border-color: rgba(59,130,246,0.3); }
.stat-card.skeleton { background: var(--bg-elevated); animation: pulse 1.4s ease infinite; }
@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }

.stat-icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-icon--blue  { background: rgba(59,130,246,0.15); color: #3b82f6; }
.stat-icon--red   { background: rgba(239,68,68,0.15);  color: #ef4444; }
.stat-icon--green { background: rgba(16,185,129,0.15); color: #10b981; }
.stat-icon--cyan  { background: rgba(6,182,212,0.15);  color: #06b6d4; }

.stat-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.stat-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; }
.stat-value { font-size: 1.45rem; font-weight: 800; color: var(--text-primary); font-family: var(--mono); }
.stat-value.danger { color: var(--danger); }
.stat-sub { font-size: 0.75rem; color: var(--text-muted); }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
}
@media (max-width: 1100px) { .dashboard-grid { grid-template-columns: 1fr; } }

.card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.card-title { font-size: 1rem; font-weight: 700; }

.chart-card { }
.chart-wrap { height: 260px; position: relative; }

/* Debtors */
.debtors-list { display: flex; flex-direction: column; gap: 2px; }
.debtor-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition);
}
.debtor-item:hover { background: var(--bg-elevated); }
.debtor-rank {
  width: 22px; text-align: center;
  font-size: 0.75rem; font-weight: 700; color: var(--text-muted);
}
.debtor-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700; flex-shrink: 0;
}
.debtor-info { flex: 1; min-width: 0; }
.debtor-name { font-size: 0.875rem; font-weight: 600; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.debtor-meta { font-size: 0.75rem; color: var(--text-muted); }
.debtor-value { font-family: var(--mono); font-size: 0.9rem; font-weight: 700; white-space: nowrap; }
.debtor-value.danger { color: var(--danger); }
</style>
