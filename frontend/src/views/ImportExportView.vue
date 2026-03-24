<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Importar / Exportar</h1>
        <p class="page-subtitle">Planilhas Excel para popular ou extrair dados do sistema</p>
      </div>
    </div>

    <div class="ie-grid">
      <!-- EXPORT section -->
      <div class="card">
        <div class="section-header">
          <div class="section-icon export-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
          <div>
            <h2 class="section-title">Exportar dados</h2>
            <p class="section-subtitle">Baixe os dados em planilha Excel</p>
          </div>
        </div>

        <div class="export-buttons">
          <button class="export-btn" :disabled="exporting === 'all'" @click="doExport('all')">
            <div class="export-btn-icon all-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </div>
            <div class="export-btn-text">
              <span class="export-btn-label">Todos os dados</span>
              <span class="export-btn-sub">Clientes + Produtos + Vendas</span>
            </div>
            <span v-if="exporting === 'all'" class="spinner" style="width:16px;height:16px;border-width:2px;margin-left:auto" />
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:auto;color:var(--text-muted)"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>

          <button class="export-btn" :disabled="exporting === 'customers'" @click="doExport('customers')">
            <div class="export-btn-icon customer-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div class="export-btn-text">
              <span class="export-btn-label">Clientes</span>
              <span class="export-btn-sub">clientes.xlsx</span>
            </div>
            <span v-if="exporting === 'customers'" class="spinner" style="width:16px;height:16px;border-width:2px;margin-left:auto" />
          </button>

          <button class="export-btn" :disabled="exporting === 'products'" @click="doExport('products')">
            <div class="export-btn-icon product-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            </div>
            <div class="export-btn-text">
              <span class="export-btn-label">Produtos</span>
              <span class="export-btn-sub">produtos.xlsx</span>
            </div>
            <span v-if="exporting === 'products'" class="spinner" style="width:16px;height:16px;border-width:2px;margin-left:auto" />
          </button>

          <button class="export-btn" :disabled="exporting === 'sales'" @click="doExport('sales')">
            <div class="export-btn-icon sale-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <div class="export-btn-text">
              <span class="export-btn-label">Vendas</span>
              <span class="export-btn-sub">vendas.xlsx</span>
            </div>
            <span v-if="exporting === 'sales'" class="spinner" style="width:16px;height:16px;border-width:2px;margin-left:auto" />
          </button>
        </div>
      </div>

      <!-- IMPORT section -->
      <div class="card">
        <div class="section-header">
          <div class="section-icon import-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div>
            <h2 class="section-title">Importar dados</h2>
            <p class="section-subtitle">Envie uma planilha para popular o sistema</p>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:20px">
          <!-- Import customers -->
          <div class="import-block">
            <div class="import-block-header">
              <span class="import-block-title">Clientes</span>
              <button class="btn btn-ghost btn-sm" @click="downloadTemplate('customers')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar template
              </button>
            </div>
            <div
              class="drop-zone"
              :class="{ dragging: dragging === 'customers', 'has-file': fileCustomers }"
              @dragover.prevent="dragging = 'customers'"
              @dragleave="dragging = ''"
              @drop.prevent="onDrop($event, 'customers')"
              @click="$refs.inputCustomers.click()"
            >
              <input ref="inputCustomers" type="file" accept=".xlsx,.xls" style="display:none" @change="onFile($event, 'customers')" />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p v-if="fileCustomers">{{ fileCustomers.name }}</p>
              <p v-else>Arraste ou clique para selecionar</p>
            </div>
            <button
              v-if="fileCustomers"
              class="btn btn-primary w-full"
              :disabled="importing === 'customers'"
              @click="doImport('customers')"
            >
              <span v-if="importing === 'customers'" class="spinner" style="width:15px;height:15px;border-width:2px"/>
              {{ importing === 'customers' ? 'Importando...' : 'Importar Clientes' }}
            </button>
          </div>

          <!-- Import products -->
          <div class="import-block">
            <div class="import-block-header">
              <span class="import-block-title">Produtos</span>
              <button class="btn btn-ghost btn-sm" @click="downloadTemplate('products')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar template
              </button>
            </div>
            <div
              class="drop-zone"
              :class="{ dragging: dragging === 'products', 'has-file': fileProducts }"
              @dragover.prevent="dragging = 'products'"
              @dragleave="dragging = ''"
              @drop.prevent="onDrop($event, 'products')"
              @click="$refs.inputProducts.click()"
            >
              <input ref="inputProducts" type="file" accept=".xlsx,.xls" style="display:none" @change="onFile($event, 'products')" />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p v-if="fileProducts">{{ fileProducts.name }}</p>
              <p v-else>Arraste ou clique para selecionar</p>
            </div>
            <button
              v-if="fileProducts"
              class="btn btn-primary w-full"
              :disabled="importing === 'products'"
              @click="doImport('products')"
            >
              <span v-if="importing === 'products'" class="spinner" style="width:15px;height:15px;border-width:2px"/>
              {{ importing === 'products' ? 'Importando...' : 'Importar Produtos' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Results -->
    <Transition name="fade">
      <div v-if="importResult" class="card result-card">
        <div class="result-header">
          <h3 class="result-title">Resultado da Importação — <em>{{ importResultLabel }}</em></h3>
          <button class="btn btn-ghost btn-sm" @click="importResult = null">Fechar</button>
        </div>

        <!-- Summary -->
        <div class="result-summary">
          <div class="result-stat result-stat--total">
            <span class="result-stat-val">{{ importResult.total }}</span>
            <span class="result-stat-label">Total de linhas</span>
          </div>
          <div class="result-stat result-stat--ok">
            <span class="result-stat-val">{{ importResult.success }}</span>
            <span class="result-stat-label">Importados</span>
          </div>
          <div class="result-stat result-stat--err">
            <span class="result-stat-val">{{ importResult.errors.length }}</span>
            <span class="result-stat-label">Com erro</span>
          </div>
        </div>

        <div v-if="importResult.success === importResult.total" class="result-success-banner">
          ✅ Todos os registros foram importados com sucesso!
        </div>

        <!-- Errors table -->
        <div v-if="importResult.errors.length" class="errors-section">
          <h4 class="errors-title">Erros encontrados ({{ importResult.errors.length }})</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style="width:80px">Linha</th>
                  <th>Mensagem de erro</th>
                  <th>Dados</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="err in importResult.errors" :key="err.row">
                  <td class="font-mono">Linha {{ err.row }}</td>
                  <td style="color:var(--danger)">{{ err.message }}</td>
                  <td style="font-size:.8rem;color:var(--text-muted);font-family:var(--mono)">
                    {{ err.data ? JSON.stringify(err.data) : '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { importExportApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const exporting = ref('')
const importing = ref('')
const dragging = ref('')
const fileCustomers = ref(null)
const fileProducts = ref(null)
const importResult = ref(null)
const importResultLabel = ref('')

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function doExport(type) {
  exporting.value = type
  try {
    const fnMap = {
      all: () => importExportApi.exportAll(),
      customers: () => importExportApi.exportCustomers(),
      products: () => importExportApi.exportProducts(),
      sales: () => importExportApi.exportSales(),
    }
    const fileMap = { all: 'dados-completos.xlsx', customers: 'clientes.xlsx', products: 'produtos.xlsx', sales: 'vendas.xlsx' }
    const res = await fnMap[type]()
    downloadBlob(res.data, fileMap[type])
    toast.success(`${fileMap[type]} exportado com sucesso!`)
  } catch (e) {
    toast.error('Erro ao exportar')
  } finally {
    exporting.value = ''
  }
}

async function downloadTemplate(type) {
  try {
    const fnMap = { customers: () => importExportApi.templateCustomers(), products: () => importExportApi.templateProducts() }
    const fileMap = { customers: 'template-clientes.xlsx', products: 'template-produtos.xlsx' }
    const res = await fnMap[type]()
    downloadBlob(res.data, fileMap[type])
    toast.info('Template baixado!')
  } catch (e) {
    toast.error('Erro ao baixar template')
  }
}

function onFile(e, type) {
  const f = e.target.files[0]
  if (!f) return
  if (type === 'customers') fileCustomers.value = f
  else fileProducts.value = f
}

function onDrop(e, type) {
  dragging.value = ''
  const f = e.dataTransfer.files[0]
  if (!f) return
  if (type === 'customers') fileCustomers.value = f
  else fileProducts.value = f
}

async function doImport(type) {
  importing.value = type
  importResult.value = null
  try {
    const fnMap = {
      customers: () => importExportApi.importCustomers(fileCustomers.value),
      products: () => importExportApi.importProducts(fileProducts.value),
    }
    const res = await fnMap[type]()
    importResult.value = res.data
    importResultLabel.value = type === 'customers' ? 'Clientes' : 'Produtos'
    if (res.data.errors.length === 0) {
      toast.success(`${res.data.success} registros importados!`)
    } else {
      toast.warning(`${res.data.success} importados, ${res.data.errors.length} com erro`)
    }
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao importar')
  } finally {
    importing.value = ''
  }
}
</script>

<style scoped>
.ie-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
@media (max-width: 900px) { .ie-grid { grid-template-columns: 1fr; } }

.section-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.section-icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.export-icon { background: rgba(16,185,129,.15); color: var(--success); }
.import-icon { background: rgba(59,130,246,.15); color: var(--brand); }
.section-title { font-size: 1rem; font-weight: 700; }
.section-subtitle { font-size: .8rem; color: var(--text-muted); }

.export-buttons { display: flex; flex-direction: column; gap: 8px; }
.export-btn {
  display: flex; align-items: center; gap: 12px;
  background: var(--bg-elevated); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 12px 14px;
  cursor: pointer; transition: all var(--transition); width: 100%;
  text-align: left;
}
.export-btn:hover { border-color: rgba(59,130,246,.4); background: var(--bg-card); }
.export-btn:disabled { opacity: .5; pointer-events: none; }
.export-btn-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.all-icon { background: rgba(139,92,246,.15); color: #8b5cf6; }
.customer-icon { background: rgba(6,182,212,.15); color: var(--accent); }
.product-icon { background: rgba(59,130,246,.15); color: var(--brand); }
.sale-icon { background: rgba(245,158,11,.15); color: var(--warning); }
.export-btn-text { display: flex; flex-direction: column; flex: 1; }
.export-btn-label { font-size: .875rem; font-weight: 600; color: var(--text-primary); }
.export-btn-sub { font-size: .75rem; color: var(--text-muted); font-family: var(--mono); }

.import-block { display: flex; flex-direction: column; gap: 10px; }
.import-block-header { display: flex; align-items: center; justify-content: space-between; }
.import-block-title { font-size: .875rem; font-weight: 700; color: var(--text-secondary); }

.drop-zone {
  border: 2px dashed var(--border); border-radius: var(--radius-md);
  padding: 28px 20px; display: flex; flex-direction: column;
  align-items: center; gap: 8px; cursor: pointer; color: var(--text-muted);
  font-size: .875rem; transition: all var(--transition);
  text-align: center;
}
.drop-zone:hover, .drop-zone.dragging { border-color: var(--brand); background: var(--brand-glow); color: var(--brand); }
.drop-zone.has-file { border-color: var(--success); background: rgba(16,185,129,.08); color: var(--success); border-style: solid; }

/* Result */
.result-card { margin-top: 0; }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.result-title { font-size: 1rem; font-weight: 700; }
.result-title em { font-style: normal; color: var(--brand); }
.result-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.result-stat { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; text-align: center; }
.result-stat--ok { border-color: rgba(16,185,129,.3); }
.result-stat--err { border-color: rgba(239,68,68,.3); }
.result-stat-val { display: block; font-size: 1.6rem; font-weight: 800; font-family: var(--mono); }
.result-stat--ok .result-stat-val { color: var(--success); }
.result-stat--err .result-stat-val { color: var(--danger); }
.result-stat-label { font-size: .72rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.result-success-banner {
  background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.3);
  color: var(--success); border-radius: var(--radius-md);
  padding: 12px 16px; font-size: .875rem; font-weight: 600; margin-bottom: 16px;
}
.errors-section { margin-top: 16px; }
.errors-title { font-size: .875rem; font-weight: 700; color: var(--danger); margin-bottom: 10px; }
.font-mono { font-family: var(--mono); }
</style>
