<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-950 px-4">
    <!-- Background Effects -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1.5s"></div>
    </div>

    <div class="glass-card w-full max-w-md animate-slide-up relative z-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/25">
          <span class="text-white font-bold text-2xl">J</span>
        </div>
        <h1 class="text-2xl font-bold text-white">Job Apply Assistant</h1>
        <p class="text-dark-400 mt-1">Indonesia</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            class="input-field"
            placeholder="email@example.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            class="input-field"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ loading ? 'Masuk...' : 'Masuk' }}
        </button>
      </form>

      <p class="text-center text-dark-400 text-sm mt-6">
        Belum punya akun?
        <RouterLink to="/register" class="text-primary-400 hover:text-primary-300 font-medium">Daftar</RouterLink>
      </p>
    </div>
  </div>
</template>
