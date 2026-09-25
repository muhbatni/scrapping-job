<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const dashboard = ref<any>(null)
const loading = ref(true)

const statCards = ref([
  { label: 'Total Lowongan', value: 0, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'from-primary-500 to-primary-600' },
  { label: 'Lowongan Tersimpan', value: 0, icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', color: 'from-accent-500 to-accent-600' },
  { label: 'Total Lamaran', value: 0, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-sky-500 to-sky-600' },
  { label: 'Interview', value: 0, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'from-amber-500 to-amber-600' },
  { label: 'Diterima', value: 0, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Ditolak', value: 0, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-red-500 to-red-600' },
])

onMounted(async () => {
  try {
    const { data } = await api.get('/dashboard')
    dashboard.value = data

    statCards.value[0].value = data.totalJobs || 0
    statCards.value[1].value = data.savedJobs || 0
    statCards.value[2].value = data.totalApplications || 0
    statCards.value[3].value = data.totalInterview || 0
    statCards.value[4].value = data.totalAccepted || 0
    statCards.value[5].value = data.totalRejection || 0
  } catch (e) {
    console.error('Failed to load dashboard', e)
  } finally {
    loading.value = false
  }
})

function formatNumber(n: number): string {
  return n.toLocaleString('id-ID')
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white">Dashboard</h1>
      <p class="text-dark-400 mt-1">Ringkasan aktivitas pencarian kerja Anda</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="glass-card animate-pulse">
        <div class="h-4 bg-dark-700 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-dark-700 rounded w-1/3"></div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div
        v-for="(stat, index) in statCards"
        :key="stat.label"
        class="stat-card animate-slide-up"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm text-dark-400">{{ stat.label }}</p>
          <div :class="['w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center', stat.color]">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="stat.icon" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-white mt-2">{{ formatNumber(stat.value) }}</p>
      </div>
    </div>

    <!-- Recent Jobs -->
    <div v-if="dashboard?.recentJobs?.length" class="glass-card">
      <h2 class="text-lg font-semibold text-white mb-4">Lowongan Terbaru</h2>
      <div class="space-y-3">
        <RouterLink
          v-for="job in dashboard.recentJobs"
          :key="job.id"
          :to="`/jobs/${job.id}`"
          class="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 hover:bg-dark-700/50 transition-all duration-200 group"
        >
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
            <span class="text-primary-400 font-bold">{{ job.company?.charAt(0) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-white group-hover:text-primary-300 transition-colors truncate">{{ job.title }}</h3>
            <p class="text-xs text-dark-400 mt-0.5">{{ job.company }} · {{ job.location || 'Indonesia' }}</p>
          </div>
          <span class="badge-info text-xs flex-shrink-0">{{ job.source?.name || 'Unknown' }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- Monthly Stats -->
    <div v-if="dashboard?.monthlyStats?.length" class="glass-card mt-6">
      <h2 class="text-lg font-semibold text-white mb-4">Statistik Bulanan</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div
          v-for="stat in dashboard.monthlyStats"
          :key="stat.month"
          class="p-3 rounded-xl bg-dark-800/50 text-center"
        >
          <p class="text-xs text-dark-400">{{ stat.month }}</p>
          <p class="text-lg font-bold text-primary-400 mt-1">{{ stat.count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
