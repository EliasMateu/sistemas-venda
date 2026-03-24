<template>
  <div>
    <div class="page-header">
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary btn-sm" @click="$router.back()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>
        <div v-if="customer">
          <h1 class="page-title">{{ customer.name }}</h1>
          <p class="page-subtitle">Histórico completo do cliente</p>
        </div>
      </div>
      <button v-if="customer" class="btn btn-primary" @click="$router.push('/sales')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nova Venda
      </button>
    </div>

    <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:80px">
      <div class="spinner" style="width:32px;height:32px;border-width:3px" />
    </div>

    <div v-else-if="customer">
      <!-- Customer info + stats -->
      <div class="customer-overview">
        <div class="card customer-info-card">
          <div class="customer-avatar-lg">{{ customer.name.charAt(0).toUpperCase() }}</div>
          <h2 class="customer-name">{{ customer.name }}</h2>

          <div class="info-rows">
            <div class="info-row" v-if="customer.phone">
              <span class="info-label">Telefone</span>
              <span class="info-value">{{ customer.phone }}</span>
            </div>
            <div class="info-row" v-if="customer.address">
              <span class="info-label">Endereço</span>
              <span class="info-value">{{ customer.address }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Limite de Crédito</span>
              <span class="info-value">
                <span v-if="customer.creditLimit">{{ fmt(customer.creditLimit) }}</span>
                <span v-else class="text-muted">Sem limite definido</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Cliente desde</span>
              <span class="info-value">{{ fmtDate(customer.createdAt) }}</span>
            </div>
          </div>

          <div v-if="isOverLimit" class="over-limit-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Limite de crédito excedido!
          </div>
        </div>

        <div class="customer-stats">
          <div class="stat-mini">
            <span class="stat-mini-value">{{ totalSales }}</span>
            <span class="stat-mini-label">Vendas totais</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-value text-success">{{ fmt(totalPaid) }}</span>
            <span class="stat-mini-label">Total pago</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-value text-danger">{{ fmt(totalDebt) }}</span>
            <span class="stat-mini-label">Em aberto</span>
          </div>
          <div class="stat-mini" v-if="customer.creditLimit">
            <span class="stat-mini-value" :class="isOverLimit ? 'text-danger' : 'text-success'">
              {{ pctUsed }}%
            </span>
            <span class="stat-mini-label">Limite usado</span>
          </div>
        </div>
      </div>

      <!-- Credit bar -->
      <div v-if="customer.creditLimit" class="card credit-bar-card">
        <div class="flex justify-between items-center" style="margin-bottom:10px">
          <span class="form-label">Utilização do Limite</span>
          <span class="font-mono" style="font-size:.8rem;color:var(--text-secondary)">
            {{ fmt(totalDebt) }} / {{ fmt(customer.creditLimit) }}
          </span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: Math.min(pctUsed, 100) + '%', background: isOverLimit ? 'var(--danger)' : 'var(--success)' }" />
        </div>
        <p v-if="isOverLimit" style="font-size:.8rem;color:var(--danger);margin-top:6px">
          ⚠ Ultrapassado em {{ fmt(totalDebt - customer.creditLimit) }}
        </p>
      </div>

      <!-- Sales table -->
      <div class="card" style="padding:0">
        <div class="table-card-header">
          <h3 style="font-size:1rem;font-weight:700">Vendas do Cliente</h3>
          <div class="flex gap-2">
            <button
              v-if="pendingSales.length"
              class="btn btn-success btn-sm"
              @click="payAll"
              :disabled="payingAll"
            >
              <span v-if="payingAll" class="spinner" style="width:12px;height:12px;border-width:2px"/>
              Quitar todas ({{ pendingSales.length }})
            </button>
          </div>
        </div>

        <div v-if="!sales.length" class="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          <p>Nenhuma venda registrada para este cliente</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sales" :key="s.id">
                <td>
                  <div>
                    <div style="font-weight:600">{{ s.product?.name || '—' }}</div>
                    <div style="font-size:.75rem;color:var(--text-muted)">{{ s.product?.category }}</div>
                  </div>
                </td>
                <td class="font-mono">{{ s.quantity }}x</td>
                <td class="font-mono" :class="s.paid ? '' : 'text-danger'">{{ fmt(s.totalPrice) }}</td>
                <td style="color:var(--text-muted);font-size:.85rem">{{ fmtDate(s.createdAt) }}</td>
                <td>
                  <span v-if="s.paid" class="badge badge-success">✓ Pago</span>
                  <span v-else class="badge badge-warning">Pendente</span>
                </td>
                <td>
                  <button
                    v-if="!s.paid"
                    class="btn btn-success btn-sm"
                    @click="markPaid(s.id)"
                    :disabled="payingId === s.id"
                  >
                    <span v-if="payingId === s.id" class="spinner" style="width:12px;height:12px;border-width:2px"/>
                    <span v-else>Quitar</span>
                  </button>
                  <span v-else style="color:var(--text-muted);font-size:.8rem">{{ fmtDate(s.dischargeDate) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { customersApi, salesApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const route = useRoute()
const toast = useToast()
const customer = ref(null)
const sales = ref([])
const loading = ref(true)
const payingId = ref(null)
const payingAll = ref(false)

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const totalSales = computed(() => sales.value.length)
const totalPaid = computed(() => sales.value.filter(s => s.paid).reduce((sum, s) => sum + Number(s.totalPrice), 0))
const totalDebt = computed(() => sales.value.filter(s => !s.paid).reduce((sum, s) => sum + Number(s.totalPrice), 0))
const pctUsed = computed(() => {
  if (!customer.value?.creditLimit) return 0
  return Math.round((totalDebt.value / Number(customer.value.creditLimit)) * 100)
})
const isOverLimit = computed(() => customer.value?.creditLimit && totalDebt.value > Number(customer.value.creditLimit))
const pendingSales = computed(() => sales.value.filter(s => !s.paid))

async function load() {
  loading.value = true
  try {
    const [cRes, sRes] = await Promise.all([
      customersApi.findOne(route.params.id),
      salesApi.findByCustomer(route.params.id),
    ])
    customer.value = cRes.data
    sales.value = sRes.data
  } finally {
    loading.value = false
  }
}

async function markPaid(id) {
  payingId.value = id
  try {
    await salesApi.markAsPaid(id)
    toast.success('Venda quitada!')
    await load()
  } catch (e) {
    toast.error('Erro ao quitar venda')
  } finally {
    payingId.value = null
  }
}

async function payAll() {
  payingAll.value = true
  try {
    await Promise.all(pendingSales.value.map(s => salesApi.markAsPaid(s.id)))
    toast.success('Todas as vendas quitadas!')
    await load()
  } catch (e) {
    toast.error('Erro ao quitar vendas')
  } finally {
    payingAll.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.customer-overview { display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 20px; }
@media (max-width: 900px) { .customer-overview { grid-template-columns: 1fr; } }

.customer-info-card { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.customer-avatar-lg {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 800; color: #fff;
}
.customer-name { font-size: 1.1rem; font-weight: 700; }

.info-rows { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.info-row { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: .75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.info-value { font-size: .875rem; font-weight: 500; text-align: right; }
.text-muted { color: var(--text-muted); }

.over-limit-banner {
  display: flex; align-items: center; gap: 8px;
  background: var(--danger-dim); border: 1px solid rgba(239,68,68,.3);
  color: var(--danger); border-radius: var(--radius-md);
  padding: 10px 14px; font-size: .85rem; font-weight: 600; width: 100%;
  justify-content: center;
}

.customer-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.stat-mini {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; flex-direction: column; gap: 6px;
}
.stat-mini-value { font-size: 1.4rem; font-weight: 800; font-family: var(--mono); color: var(--text-primary); }
.stat-mini-label { font-size: .75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }

.credit-bar-card { margin-bottom: 20px; }
.progress-track { height: 8px; background: var(--bg-elevated); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width .5s ease; }

.table-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }

.font-mono { font-family: var(--mono); }
.text-danger { color: var(--danger); }
</style>
