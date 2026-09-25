<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const sources = ref<any[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({
  name: '',
  type: 'job_board',
  baseUrl: '',
  logoUrl: '',
  isActive: true,
  crawlConfig: {},
})

onMounted(async () => {
  await loadSources()
  loading.value = false
})

async function loadSources() {
  const { data } = await api.get('/job-sources')
  sources.value = data
}

async function saveSource() {
  if (editingId.value) {
    await api.put(`/job-sources/${editingId.value}`, form.value)
  } else {
    await api.post('/job-sources', form.value)
  }
  showForm.value = false
  editingId.value = null
  resetForm()
  await loadSources()
}

async function toggleActive(id: string) {
  await api.put(`/job-sources/${id}/toggle`)
  await loadSources()
}

async function deleteSource(id: string) {
  if (confirm('Yakin ingin menghapus sumber ini?')) {
    await api.delete(`/job-sources/${id}`)
    await loadSources()
  }
}

function editSource(source: any) {
  editingId.value = source.id
  form.value = { ...source }
  showForm.value = true
}

function resetForm() {
  form.value = { name: '', type: 'job_board', baseUrl: '', logoUrl: '', isActive: true, crawlConfig: {} }
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Sumber Lowongan</h1>
        <p class="text-dark-400 mt-1">Kelola job board dan halaman karir perusahaan</p>
      </div>
      <button @click="showForm = true; editingId = null; resetForm()" class="btn-primary">+ Tambah Sumber</button>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showForm" class="glass-card mb-6 animate-slide-up">
      <h3 class="text-lg font-semibold text-white mb-4">{{ editingId ? 'Edit' : 'Tambah' }} Sumber</h3>
      <form @submit.prevent="saveSource" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="form.name" class="input-field" placeholder="Nama (mis: Gojek Careers)" required />
          <select v-model="form.type" class="select-field">
            <option value="job_board">Job Board</option>
            <option value="company_career">Company Career</option>
          </select>
          <input v-model="form.baseUrl" class="input-field md:col-span-2" placeholder="URL (mis: https://careers.gojek.com)" required />
        </div>
        <div class="flex gap-3">
          <button type="submit" class="btn-primary">{{ editingId ? 'Update' : 'Simpan' }}</button>
          <button type="button" @click="showForm = false" class="btn-secondary">Batal</button>
        </div>
      </form>
    </div>

    <!-- Sources List -->
    <div class="space-y-3">
      <div v-for="source in sources" :key="source.id" class="glass-card">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div :class="['w-3 h-3 rounded-full', source.isActive ? 'bg-accent-500' : 'bg-dark-500']"></div>
            <div>
              <h3 class="font-medium text-white">{{ source.name }}</h3>
              <p class="text-xs text-dark-400">{{ source.baseUrl }}</p>
            </div>
            <span :class="['badge', source.type === 'job_board' ? 'badge-primary' : 'badge-accent']">
              {{ source.type === 'job_board' ? 'Job Board' : 'Company' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="toggleActive(source.id)" :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', source.isActive ? 'bg-accent-500/20 text-accent-300 hover:bg-accent-500/30' : 'bg-dark-600 text-dark-300 hover:bg-dark-500']">
              {{ source.isActive ? 'Aktif' : 'Nonaktif' }}
            </button>
            <button @click="editSource(source)" class="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button @click="deleteSource(source.id)" class="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
