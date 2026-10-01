<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const dashboard = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/dashboard/admin')
    dashboard.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white">Admin Panel</h1>
      <p class="text-dark-400 mt-1">Monitoring dan pengelolaan sistem</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="glass-card animate-pulse"><div class="h-8 bg-dark-700 rounded w-1/3"></div></div>
    </div>

    <div v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card">
          <p class="text-sm text-dark-400">Total Lowongan</p>
          <p class="text-3xl font-bold text-white">{{ dashboard?.totalJobs?.toLocaleString() || 0 }}</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-dark-400">Lowongan Aktif</p>
          <p class="text-3xl font-bold text-accent-400">{{ dashboard?.activeJobs?.toLocaleString() || 0 }}</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-dark-400">Total Lamaran</p>
          <p class="text-3xl font-bold text-primary-400">{{ dashboard?.totalApplications?.toLocaleString() || 0 }}</p>
        </div>
        <div class="stat-card">
          <p class="text-sm text-dark-400">Total Pengguna</p>
          <p class="text-3xl font-bold text-sky-400">{{ dashboard?.totalUsers?.toLocaleString() || 0 }}</p>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <RouterLink to="/admin/sources" class="glass-card hover:border-primary-500/30 transition-all group">
          <h3 class="text-lg font-semibold text-white group-hover:text-primary-300">📡 Kelola Sumber Lowongan</h3>
          <p class="text-sm text-dark-400 mt-1">Tambah, edit, atau nonaktifkan sumber crawling</p>
        </RouterLink>
        <RouterLink to="/admin/crawl-logs" class="glass-card hover:border-primary-500/30 transition-all group">
          <h3 class="text-lg font-semibold text-white group-hover:text-primary-300">📊 Crawl Logs</h3>
          <p class="text-sm text-dark-400 mt-1">Monitor status crawling dan error logs</p>
        </RouterLink>
      </div>

      <!-- Recent Crawls -->
      <div v-if="dashboard?.recentCrawls?.length" class="glass-card">
        <h2 class="text-lg font-semibold text-white mb-4">Crawl Terbaru</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-dark-400 border-b border-dark-700">
                <th class="text-left py-3 px-2">Sumber</th>
                <th class="text-left py-3 px-2">Status</th>
                <th class="text-right py-3 px-2">Ditemukan</th>
                <th class="text-right py-3 px-2">Baru</th>
                <th class="text-right py-3 px-2">Durasi</th>
                <th class="text-right py-3 px-2">Waktu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in dashboard.recentCrawls" :key="log.id" class="border-b border-dark-800 hover:bg-dark-800/50">
                <td class="py-3 px-2 text-white">{{ log.source?.name || '-' }}</td>
                <td class="py-3 px-2">
                  <span :class="['badge', log.status === 'completed' ? 'badge-accent' : log.status === 'failed' ? 'badge-danger' : 'badge-warning']">
                    {{ log.status }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right text-dark-300">{{ log.jobsFound }}</td>
                <td class="py-3 px-2 text-right text-accent-400">{{ log.jobsNew }}</td>
                <td class="py-3 px-2 text-right text-dark-300">{{ log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '-' }}</td>
                <td class="py-3 px-2 text-right text-dark-400">{{ new Date(log.createdAt).toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
