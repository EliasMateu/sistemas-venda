<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <div class="brand-mark">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <h1>VendaSys</h1>
        <p>Sistema de Gestão de Vendas</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="seu@email.com"
            required
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <div class="pass-wrap">
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="form-control"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button type="button" class="pass-toggle" @click="showPass = !showPass">
              <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary w-full login-btn" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:16px;height:16px;border-width:2px" />
          <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
        </button>
      </form>

      <p class="login-hint">Admin padrão: admin@sistema.com / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPass = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.value.email, form.value.password)
    toast.success('Bem-vindo!')
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Credenciais inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  pointer-events: none;
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-lg), 0 0 60px rgba(59,130,246,0.08);
}

.login-brand {
  text-align: center;
  margin-bottom: 32px;
}
.brand-mark {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 12px;
  box-shadow: 0 0 24px rgba(59,130,246,0.4);
}
.login-brand h1 {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
}
.login-brand p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pass-wrap { position: relative; }
.pass-wrap .form-control { padding-right: 44px; }
.pass-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 4px;
}
.pass-toggle:hover { color: var(--text-primary); }

.login-btn { height: 44px; font-size: 0.95rem; justify-content: center; gap: 8px; }

.login-error {
  background: var(--danger-dim);
  border: 1px solid rgba(239,68,68,0.25);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  text-align: center;
}

.login-hint {
  margin-top: 20px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--mono);
}
</style>
