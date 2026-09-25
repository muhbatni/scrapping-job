<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApplicationsStore } from '@/stores/applications'

const appsStore = useApplicationsStore()
const statusFilter = ref('')
const loading = ref(true)

const statuses = [
  { value: '', label: 'Semua' },
  { value: 'saved', label: 'Tersimpan', color: 'bg-dark-500/20 text-dark-300' },
  { value: 'viewed', label: 'Dilihat', color: 'bg-sky-500/20 text-sky-300' },
  { value: 'applied', label: 'Melamar', color: 'bg-primary-500/20 text-primary-300' },
  { value: 'interview', label: 'Interview', color: 'bg-amber-500/20 text-amber-300' },
  { value: 'technical_test', label: 'Technical Test', color: 'bg-violet-500/20 text-violet-300' },
  { value: 'hr_interview', label: 'HR Interview', color: 'bg-cyan-500/20 text-cyan-300' },
  { value: 'user_interview', label: 'User Interview', color: 'bg-teal-500/20 text-teal-300' },
  { value: 'offering', label: 'Offering', color: 'bg-emerald-500/20 text-emerald-300' },
  { value: 'accepted', label: 'Diterima', color: 'bg-green-500/20 text-green-300' },
  { value: 'rejected', label: 'Ditolak', color: 'bg-red-500/20 text-red-300' },
]

onMounted(async () => {
  await fetchData()
  loading.value = false
})

async function fetchData() {
  const params: any = {}
  if (statusFilter.value) params.status = statusFilter.value
  await appsStore.fetchApplications(params)
}

async function updateStatus(id: string, newStatus: string) {
  await appsStore.updateStatus(id, newStatus)
  await fetchData()
}

async function deleteApp(id: string) {
  if (confirm('Yakin ingin menghapus lamaran ini?')) {
    await appsStore.deleteApplication(id)
    await fetchData()
  }
}

function getStatusStyle(status: string) {
  return statuses.find(s => s.value === status)?.color || 'bg-dark-500/20 text-dark-300'
}

function getStatusLabel(status: string) {
  return statuses.find(s => s.value === status)?.label || status
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white">Lamaran Saya</h1>
      <p class="text-dark-400 mt-1">Kelola dan lacak progres lamaran kerja Anda</p>
    </div>

    <!-- Status Filter -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="status in statuses"
        :key="status.value"
        @click="statusFilter = status.value; fetchData()"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
          statusFilter === status.value
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
            : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
        ]"
      >
        {{ status.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="glass-card animate-pulse">
        <div class="h-5 bg-dark-700 rounded w-1/3 mb-3"></div>
        <div class="h-4 bg-dark-700 rounded w-1/4"></div>
      </div>
    </div>

    <!-- Applications List -->
    <div v-else class="space-y-3">
      <div
        v-for="(app, index) in appsStore.applications"
        :key="app.id"
        class="glass-card animate-slide-up"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-4 flex-1">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-primary-400 font-bold">{{ app.job?.company?.charAt(0) || '?' }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <RouterLink :to="`/jobs/${app.job?.id}`" class="text-base font-semibold text-white hover:text-primary-300 transition-colors">
                {{ app.job?.title || 'Job tidak tersedia' }}
              </RouterLink>
              <p class="text-sm text-dark-400 mt-0.5">{{ app.job?.company }} · {{ app.job?.location }}</p>
              <div class="flex items-center gap-3 mt-2">
                <span :class="['badge', getStatusStyle(app.status)]">{{ getStatusLabel(app.status) }}</span>
                <span v-if="app.appliedAt" class="text-xs text-dark-400">
                  Applied: {{ new Date(app.appliedAt).toLocaleDateString('id-ID') }}
                </span>
              </div>
              <p v-if="app.notes" class="text-xs text-dark-400 mt-2">📝 {{ app.notes }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <select
              @change="updateStatus(app.id, ($event.target as HTMLSelectElement).value)"
              class="select-field text-xs py-2 px-3"
              :value="app.status"
            >
              <option v-for="s in statuses.filter(s => s.value)" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <button @click="deleteApp(app.id)" class="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-if="appsStore.applications.length === 0" class="glass-card text-center py-12">
        <p class="text-dark-400 text-lg">Belum ada lamaran</p>
        <p class="text-dark-500 text-sm mt-2">Mulai cari lowongan dan buat lamaran pertama Anda</p>
        <RouterLink to="/jobs" class="btn-primary inline-block mt-4">Cari Lowongan</RouterLink>
      </div>
    </div>
  </div>
</template>
