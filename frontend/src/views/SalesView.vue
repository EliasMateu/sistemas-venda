<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Vendas & Fiados</h1>
        <p class="page-subtitle">{{ sales.length }} registro(s) — {{ pending.length }} em aberto</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Registrar Venda
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="search-bar" style="flex:1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search-input" placeholder="Buscar por cliente ou produto..." />
      </div>
      <select v-model="filterStatus" class="form-control" style="width:160px">
        <option value="">Todos</option>
        <option value="pending">Em aberto</option>
        <option value="paid">Pagos</option>
      </select>
    </div>

    <!-- Summary strip -->
    <div class="summary-strip">
      <div class="strip-item">
        <span class="strip-label">Total em aberto</span>
        <span class="strip-value text-danger">{{ fmt(totalDebt) }}</span>
      </div>
      <div class="strip-sep" />
      <div class="strip-item">
        <span class="strip-label">Total baixado</span>
        <span class="strip-value text-success">{{ fmt(totalPaid) }}</span>
      </div>
      <div class="strip-sep" />
      <div class="strip-item">
        <span class="strip-label">Registros filtrados</span>
        <span class="strip-value">{{ filtered.length }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding:0">
      <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:60px">
        <div class="spinner" />
      </div>
      <div v-else-if="!filtered.length" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        <p>Nenhuma venda encontrada</p>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Valor</th>
              <th>Vendedor</th>
              <th>Data</th>
              <th>Status</th>
              <th style="width:120px">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filtered" :key="s.id">
              <td>
                <RouterLink :to="`/customers/${s.idCustomer}`" class="customer-link">
                  {{ s.customer?.name || '—' }}
                </RouterLink>
              </td>
              <td>
                <div>
                  <div style="font-weight:600">{{ s.product?.name || '—' }}</div>
                  <div style="font-size:.75rem;color:var(--text-muted)">{{ s.product?.category }}</div>
                </div>
              </td>
              <td class="font-mono">{{ s.quantity }}x</td>
              <td class="font-mono" :class="s.paid ? 'text-success' : 'text-danger'">{{ fmt(s.totalPrice) }}</td>
              <td style="color:var(--text-muted);font-size:.85rem">{{ s.user?.name || '—' }}</td>
              <td style="color:var(--text-muted);font-size:.85rem">{{ fmtDate(s.createdAt) }}</td>
              <td>
                <span v-if="s.paid" class="badge badge-success">✓ Pago</span>
                <span v-else class="badge badge-warning">Pendente</span>
              </td>
              <td>
                <div class="flex gap-2 items-center">
                  <button
                    v-if="!s.paid"
                    class="btn btn-success btn-sm"
                    title="Marcar como pago"
                    @click="markPaid(s.id)"
                    :disabled="payingId === s.id"
                  >
                    <span v-if="payingId === s.id" class="spinner" style="width:12px;height:12px;border-width:2px"/>
                    <span v-else>Quitar</span>
                  </button>
                  <button class="btn btn-icon btn-ghost btn-sm" title="Excluir" @click="confirmDelete(s)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">Registrar Venda / Fiado</h3>
              <button class="btn btn-icon btn-ghost btn-sm" @click="showModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div style="display:flex;flex-direction:column;gap:14px">
                <div class="form-group">
                  <label class="form-label">Cliente *</label>
                  <select v-model="form.idCustomer" class="form-control">
                    <option value="">Selecione o cliente</option>
                    <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <!-- Credit warning -->
                  <div v-if="selectedCustomer && selectedCustomer.isOverLimit" class="credit-warn">
                    ⚠ Cliente com limite excedido (Dívida: {{ fmt(selectedCustomer.totalDebt) }})
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Produto *</label>
                  <select v-model="form.idProduct" class="form-control" @change="autoPrice">
                    <option value="">Selecione o produto</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} — {{ fmt(p.price) }}</option>
                  </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label">Quantidade *</label>
                    <input v-model.number="form.quantity" type="number" min="1" class="form-control" @input="calcTotal" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Valor Total (R$) *</label>
                    <input v-model.number="form.totalPrice" type="number" min="0" step="0.01" class="form-control" />
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label">Data de Baixa</label>
                    <input v-model="form.dischargeDate" type="date" class="form-control" />
                  </div>
                  <div class="form-group" style="justify-content:flex-end;padding-top:22px">
                    <label class="toggle-label">
                      <input type="checkbox" v-model="form.paid" class="toggle-input" />
                      <span class="toggle-track"><span class="toggle-thumb" /></span>
                      <span style="font-size:.875rem;font-weight:600">Já foi pago</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
              <button class="btn btn-primary" :disabled="saving || !canSave" @click="save">
                <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px"/>
                {{ saving ? 'Salvando...' : 'Registrar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirm -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal" style="max-width:380px">
            <div class="modal-header"><h3 class="modal-title">Confirmar exclusão</h3></div>
            <div class="modal-body">
              <p style="color:var(--text-secondary);font-size:.9rem">Excluir esta venda de <strong>{{ deleteTarget?.customer?.name }}</strong>?</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="deleteTarget = null">Cancelar</button>
              <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
                <span v-if="deleting" class="spinner" style="width:14px;height:14px;border-width:2px"/>
                Excluir
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { salesApi, customersApi, productsApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const sales = ref([])
const customers = ref([])
const products = ref([])
const loading = ref(true)
const search = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const saving = ref(false)
const deleting = ref(false)
const payingId = ref(null)
const deleteTarget = ref(null)
const form = ref({ idCustomer: '', idProduct: '', quantity: 1, totalPrice: 0, paid: false, dischargeDate: '' })

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

const pending = computed(() => sales.value.filter(s => !s.paid))
const totalDebt = computed(() => pending.value.reduce((s, v) => s + Number(v.totalPrice), 0))
const totalPaid = computed(() => sales.value.filter(s => s.paid).reduce((s, v) => s + Number(v.totalPrice), 0))

const filtered = computed(() => {
  return sales.value.filter(s => {
    const q = search.value.toLowerCase()
    const matchSearch = !q ||
      (s.customer?.name || '').toLowerCase().includes(q) ||
      (s.product?.name || '').toLowerCase().includes(q)
    const matchStatus = !filterStatus.value ||
      (filterStatus.value === 'paid' && s.paid) ||
      (filterStatus.value === 'pending' && !s.paid)
    return matchSearch && matchStatus
  })
})

const selectedCustomer = computed(() =>
  customers.value.find(c => c.id === form.value.idCustomer)
)

const canSave = computed(() =>
  form.value.idCustomer && form.value.idProduct && form.value.quantity >= 1 && form.value.totalPrice >= 0
)

function autoPrice() {
  const p = products.value.find(p => p.id === form.value.idProduct)
  if (p) form.value.totalPrice = +(p.price * form.value.quantity).toFixed(2)
}

function calcTotal() {
  const p = products.value.find(p => p.id === form.value.idProduct)
  if (p) form.value.totalPrice = +(p.price * form.value.quantity).toFixed(2)
}

async function load() {
  loading.value = true
  try {
    const [sRes, cRes, pRes] = await Promise.all([
      salesApi.findAll(),
      customersApi.findWithDebt(),
      productsApi.findAll(),
    ])
    sales.value = sRes.data
    customers.value = cRes.data
    products.value = pRes.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { idCustomer: '', idProduct: '', quantity: 1, totalPrice: 0, paid: false, dischargeDate: '' }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    await salesApi.create(form.value)
    toast.success('Venda registrada!')
    showModal.value = false
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao registrar venda')
  } finally {
    saving.value = false
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

function confirmDelete(s) { deleteTarget.value = s }

async function doDelete() {
  deleting.value = true
  try {
    await salesApi.remove(deleteTarget.value.id)
    toast.success('Venda excluída!')
    deleteTarget.value = null
    await load()
  } catch (e) {
    toast.error('Erro ao excluir')
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.filters-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.search-bar {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 0 14px; color: var(--text-muted);
}
.search-input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text-primary); font-family: var(--font); font-size: .9rem; padding: 11px 0;
}

.summary-strip {
  display: flex; align-items: center; gap: 0;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 14px 20px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.strip-item { display: flex; flex-direction: column; gap: 2px; padding: 0 24px; }
.strip-item:first-child { padding-left: 0; }
.strip-sep { width: 1px; height: 36px; background: var(--border); }
.strip-label { font-size: .72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.strip-value { font-family: var(--mono); font-size: 1.05rem; font-weight: 700; }
.text-danger { color: var(--danger); }
.text-success { color: var(--success); }
.font-mono { font-family: var(--mono); }

.customer-link { color: var(--brand); font-weight: 600; }
.customer-link:hover { text-decoration: underline; }

.credit-warn {
  background: var(--danger-dim); border: 1px solid rgba(239,68,68,.3);
  color: var(--danger); border-radius: var(--radius-sm);
  padding: 8px 12px; font-size: .8rem; font-weight: 600; margin-top: 6px;
}

/* Toggle switch */
.toggle-label { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.toggle-input { display: none; }
.toggle-track {
  width: 42px; height: 24px; border-radius: 99px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  position: relative; transition: background var(--transition);
  flex-shrink: 0;
}
.toggle-input:checked + .toggle-track { background: var(--success); border-color: var(--success); }
.toggle-thumb {
  position: absolute; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; top: 2px; left: 2px;
  transition: transform var(--transition);
  box-shadow: 0 1px 4px rgba(0,0,0,.4);
}
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }
</style>
