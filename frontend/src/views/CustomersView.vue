<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Clientes</h1>
        <p class="page-subtitle">{{ customers.length }} cliente(s) cadastrado(s)</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="showLimitModal = true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Limite Global
        </button>
        <button class="btn btn-primary" @click="openCreate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Cliente
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="search" class="search-input" placeholder="Buscar por nome, telefone..." />
    </div>

    <!-- Table -->
    <div class="card" style="padding:0">
      <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:60px">
        <div class="spinner" />
      </div>

      <div v-else-if="!filtered.length" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p>Nenhum cliente encontrado</p>
        <button class="btn btn-primary btn-sm" @click="openCreate">Cadastrar primeiro cliente</button>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Limite de Crédito</th>
              <th>Dívida Atual</th>
              <th>Status</th>
              <th style="width:100px">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.id" class="clickable-row" @click="$router.push(`/customers/${c.id}`)">
              <td>
                <div class="flex items-center gap-2">
                  <div class="avatar-sm">{{ c.name.charAt(0).toUpperCase() }}</div>
                  <span class="font-medium">{{ c.name }}</span>
                </div>
              </td>
              <td class="text-muted">{{ c.phone || '—' }}</td>
              <td class="text-muted truncate" style="max-width:180px">{{ c.address || '—' }}</td>
              <td class="font-mono">
                <span v-if="c.creditLimit">{{ fmt(c.creditLimit) }}</span>
                <span v-else class="text-muted">Sem limite</span>
              </td>
              <td class="font-mono" :class="{ 'text-danger': c.totalDebt > 0 }">
                {{ fmt(c.totalDebt || 0) }}
              </td>
              <td>
                <span v-if="c.isOverLimit" class="badge badge-danger">⚠ Limite excedido</span>
                <span v-else-if="(c.totalDebt || 0) > 0" class="badge badge-warning">Com dívida</span>
                <span v-else class="badge badge-success">Em dia</span>
              </td>
              <td @click.stop>
                <div class="flex gap-2">
                  <button class="btn btn-icon btn-ghost btn-sm" title="Editar" @click="openEdit(c)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn btn-icon btn-ghost btn-sm" title="Excluir" @click="confirmDelete(c)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingId ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
              <button class="btn btn-icon btn-ghost btn-sm" @click="showModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-grid">
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Nome *</label>
                  <input v-model="form.name" class="form-control" placeholder="Nome completo do cliente" />
                </div>
                <div class="form-group">
                  <label class="form-label">Telefone</label>
                  <input v-model="form.phone" class="form-control" placeholder="(11) 99999-0000" />
                </div>
                <div class="form-group">
                  <label class="form-label">Limite de Crédito (R$)</label>
                  <input v-model.number="form.creditLimit" type="number" min="0" step="0.01" class="form-control" placeholder="0,00" />
                </div>
                <div class="form-group" style="grid-column:1/-1">
                  <label class="form-label">Endereço</label>
                  <input v-model="form.address" class="form-control" placeholder="Rua, número, bairro..." />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
              <button class="btn btn-primary" :disabled="saving || !form.name" @click="save">
                <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px"/>
                {{ saving ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Global Limit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showLimitModal" class="modal-overlay" @click.self="showLimitModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">Limite Global de Crédito</h3>
              <button class="btn btn-icon btn-ghost btn-sm" @click="showLimitModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <p style="color:var(--text-secondary);font-size:.875rem;margin-bottom:16px">
                Define um limite padrão para todos os clientes <strong>sem limite individual</strong> definido.
              </p>
              <div class="form-group">
                <label class="form-label">Valor do Limite (R$)</label>
                <input v-model.number="globalLimit" type="number" min="0" step="0.01" class="form-control" placeholder="Ex: 500,00" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showLimitModal = false">Cancelar</button>
              <button class="btn btn-primary" :disabled="savingLimit" @click="saveGlobalLimit">
                <span v-if="savingLimit" class="spinner" style="width:14px;height:14px;border-width:2px"/>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal" style="max-width:400px">
            <div class="modal-header">
              <h3 class="modal-title">Confirmar exclusão</h3>
            </div>
            <div class="modal-body">
              <p style="color:var(--text-secondary);font-size:.9rem">
                Deseja excluir o cliente <strong>{{ deleteTarget?.name }}</strong>? Esta ação não pode ser desfeita.
              </p>
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
import { customersApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const customers = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showLimitModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const savingLimit = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const globalLimit = ref(null)

const form = ref({ name: '', phone: '', address: '', creditLimit: null })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return customers.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q) ||
    (c.address || '').toLowerCase().includes(q)
  )
})

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

async function load() {
  loading.value = true
  try {
    const res = await customersApi.findWithDebt()
    customers.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', phone: '', address: '', creditLimit: null }
  showModal.value = true
}

function openEdit(c) {
  editingId.value = c.id
  form.value = { name: c.name, phone: c.phone || '', address: c.address || '', creditLimit: c.creditLimit }
  showModal.value = true
}

async function save() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    if (editingId.value) {
      await customersApi.update(editingId.value, form.value)
      toast.success('Cliente atualizado!')
    } else {
      await customersApi.create(form.value)
      toast.success('Cliente cadastrado!')
    }
    showModal.value = false
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao salvar')
  } finally {
    saving.value = false
  }
}

async function saveGlobalLimit() {
  savingLimit.value = true
  try {
    await customersApi.setGlobalLimit(globalLimit.value)
    toast.success('Limite global aplicado!')
    showLimitModal.value = false
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao aplicar limite')
  } finally {
    savingLimit.value = false
  }
}

function confirmDelete(c) { deleteTarget.value = c }

async function doDelete() {
  deleting.value = true
  try {
    await customersApi.remove(deleteTarget.value.id)
    toast.success('Cliente excluído!')
    deleteTarget.value = null
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao excluir')
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0 14px;
  margin-bottom: 16px;
  color: var(--text-muted);
}
.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font);
  font-size: 0.9rem;
  padding: 11px 0;
}
.search-input::placeholder { color: var(--text-muted); }

.avatar-sm {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
}
.font-medium { font-weight: 600; }
.text-muted { color: var(--text-muted); }
.text-danger { color: var(--danger); }
.clickable-row { cursor: pointer; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 500px) { .form-grid { grid-template-columns: 1fr; } }
</style>
