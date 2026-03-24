<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Usuários</h1>
        <p class="page-subtitle">Gestão de acesso ao sistema</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Usuário
      </button>
    </div>

    <div class="card" style="padding:0">
      <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:60px">
        <div class="spinner" />
      </div>
      <div v-else-if="!users.length" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <p>Nenhum usuário cadastrado</p>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Tipo</th>
              <th>Criado em</th>
              <th style="width:80px">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="flex items-center gap-2">
                  <div class="avatar-sm" :style="{ background: roleColor(u.role) }">{{ u.name.charAt(0).toUpperCase() }}</div>
                  <span style="font-weight:600">{{ u.name }}</span>
                </div>
              </td>
              <td style="color:var(--text-muted);font-family:var(--mono);font-size:.85rem">{{ u.email }}</td>
              <td>
                <span class="badge" :class="roleBadge(u.role)">{{ u.role }}</span>
              </td>
              <td>
                <span class="badge badge-gray">{{ u.type }}</span>
              </td>
              <td style="color:var(--text-muted);font-size:.85rem">{{ fmtDate(u.createdAt) }}</td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-icon btn-ghost btn-sm" @click="openEdit(u)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn btn-icon btn-ghost btn-sm" @click="confirmDelete(u)" :disabled="u.id === currentUserId">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingId ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
              <button class="btn btn-icon btn-ghost btn-sm" @click="showModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div style="display:flex;flex-direction:column;gap:14px">
                <div class="form-group">
                  <label class="form-label">Nome (único) *</label>
                  <input v-model="form.name" class="form-control" placeholder="Nome de usuário" />
                </div>
                <div class="form-group">
                  <label class="form-label">E-mail *</label>
                  <input v-model="form.email" type="email" class="form-control" placeholder="usuario@email.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Senha {{ editingId ? '(deixar vazio para manter)' : '*' }}</label>
                  <input v-model="form.password" type="password" class="form-control" placeholder="••••••••" :required="!editingId" />
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                  <div class="form-group">
                    <label class="form-label">Perfil</label>
                    <select v-model="form.role" class="form-control">
                      <option value="user">user</option>
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Tipo</label>
                    <select v-model="form.type" class="form-control">
                      <option value="Vendedor">Vendedor</option>
                      <option value="Não Vendedor">Não Vendedor</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
              <button class="btn btn-primary" :disabled="saving || !form.name || !form.email" @click="save">
                <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px"/>
                {{ saving ? 'Salvando...' : 'Salvar' }}
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
            <div class="modal-header"><h3 class="modal-title">Inativar usuário</h3></div>
            <div class="modal-body">
              <p style="color:var(--text-secondary);font-size:.9rem">O usuário <strong>{{ deleteTarget?.name }}</strong> será marcado como inativo (soft delete) e não poderá mais acessar o sistema.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="deleteTarget = null">Cancelar</button>
              <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
                <span v-if="deleting" class="spinner" style="width:14px;height:14px;border-width:2px"/>
                Inativar
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
import { usersApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const toast = useToast()
const auth = useAuthStore()
const users = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const form = ref({ name: '', email: '', password: '', role: 'user', type: 'Não Vendedor' })

const currentUserId = computed(() => auth.user?.id)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
const roleColor = (r) => ({ admin: '#ef4444', manager: '#f59e0b', user: '#3b82f6' }[r] || '#64748b')
const roleBadge = (r) => ({ admin: 'badge-danger', manager: 'badge-warning', user: 'badge-info' }[r] || 'badge-gray')

async function load() {
  loading.value = true
  try {
    const res = await usersApi.findAll()
    users.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', email: '', password: '', role: 'user', type: 'Não Vendedor' }
  showModal.value = true
}

function openEdit(u) {
  editingId.value = u.id
  form.value = { name: u.name, email: u.email, password: '', role: u.role, type: u.type }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (editingId.value && !payload.password) delete payload.password
    if (editingId.value) {
      await usersApi.update(editingId.value, payload)
      toast.success('Usuário atualizado!')
    } else {
      await usersApi.create(payload)
      toast.success('Usuário criado!')
    }
    showModal.value = false
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao salvar')
  } finally {
    saving.value = false
  }
}

function confirmDelete(u) { deleteTarget.value = u }

async function doDelete() {
  deleting.value = true
  try {
    await usersApi.remove(deleteTarget.value.id)
    toast.success('Usuário inativado!')
    deleteTarget.value = null
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro')
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.avatar-sm {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .78rem; font-weight: 700; flex-shrink: 0; color: #fff;
}
</style>
