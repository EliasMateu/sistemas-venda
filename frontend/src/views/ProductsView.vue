<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Produtos</h1>
        <p class="page-subtitle">{{ products.length }} produto(s) cadastrado(s)</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Produto
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <div class="search-bar" style="flex:1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="search-input" placeholder="Buscar produto..." />
      </div>
      <select v-model="filterCategory" class="form-control" style="width:200px">
        <option value="">Todas as categorias</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" style="display:flex;align-items:center;justify-content:center;padding:80px">
      <div class="spinner" style="width:28px;height:28px;border-width:3px" />
    </div>

    <div v-else-if="!filtered.length" class="empty-state" style="padding:80px">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
      <p>Nenhum produto encontrado</p>
      <button class="btn btn-primary btn-sm" @click="openCreate">Cadastrar primeiro produto</button>
    </div>

    <div v-else class="products-grid">
      <div v-for="p in filtered" :key="p.id" class="product-card">
        <div class="product-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        </div>
        <div class="product-body">
          <div class="product-name">{{ p.name }}</div>
          <div class="product-category">
            <span class="badge badge-info">{{ p.category }}</span>
          </div>
          <div class="product-price">{{ fmt(p.price) }}</div>
        </div>
        <div class="product-actions">
          <button class="btn btn-icon btn-ghost btn-sm" @click="openEdit(p)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-icon btn-ghost btn-sm" @click="confirmDelete(p)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">{{ editingId ? 'Editar Produto' : 'Novo Produto' }}</h3>
              <button class="btn btn-icon btn-ghost btn-sm" @click="showModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div style="display:flex;flex-direction:column;gap:14px">
                <div class="form-group">
                  <label class="form-label">Nome do Produto *</label>
                  <input v-model="form.name" class="form-control" placeholder="Ex: Arroz 5kg" />
                </div>
                <div class="form-group">
                  <label class="form-label">Preço (R$) *</label>
                  <input v-model.number="form.price" type="number" min="0" step="0.01" class="form-control" placeholder="0,00" />
                </div>
                <div class="form-group">
                  <label class="form-label">Categoria *</label>
                  <select v-model="form.category" class="form-control">
                    <option value="">Selecione uma categoria</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
              <button class="btn btn-primary" :disabled="saving || !form.name || !form.category" @click="save">
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
            <div class="modal-header"><h3 class="modal-title">Confirmar exclusão</h3></div>
            <div class="modal-body">
              <p style="color:var(--text-secondary);font-size:.9rem">Excluir o produto <strong>{{ deleteTarget?.name }}</strong>?</p>
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
import { productsApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const products = ref([])
const loading = ref(true)
const search = ref('')
const filterCategory = ref('')
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const form = ref({ name: '', price: 0, category: '' })

const categories = ['Eletrônicos','Alimentos','Vestuário','Móveis','Beleza','Esporte','Saúde','Livros','Brinquedos','Outros']

const filtered = computed(() => {
  return products.value.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.value.toLowerCase())
    const matchCat = !filterCategory.value || p.category === filterCategory.value
    return matchSearch && matchCat
  })
})

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

async function load() {
  loading.value = true
  try {
    const res = await productsApi.findAll()
    products.value = res.data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', price: 0, category: '' }
  showModal.value = true
}

function openEdit(p) {
  editingId.value = p.id
  form.value = { name: p.name, price: p.price, category: p.category }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await productsApi.update(editingId.value, form.value)
      toast.success('Produto atualizado!')
    } else {
      await productsApi.create(form.value)
      toast.success('Produto cadastrado!')
    }
    showModal.value = false
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao salvar')
  } finally {
    saving.value = false
  }
}

function confirmDelete(p) { deleteTarget.value = p }

async function doDelete() {
  deleting.value = true
  try {
    await productsApi.remove(deleteTarget.value.id)
    toast.success('Produto excluído!')
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
.search-input::placeholder { color: var(--text-muted); }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.product-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  transition: border-color var(--transition), transform var(--transition);
}
.product-card:hover { border-color: rgba(59,130,246,.3); transform: translateY(-2px); }

.product-icon {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  background: rgba(59,130,246,.1); color: var(--brand);
  display: flex; align-items: center; justify-content: center;
}
.product-body { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.product-name { font-size: .95rem; font-weight: 700; }
.product-price { font-family: var(--mono); font-size: 1.1rem; font-weight: 700; color: var(--success); }
.product-actions { display: flex; gap: 6px; }
</style>
