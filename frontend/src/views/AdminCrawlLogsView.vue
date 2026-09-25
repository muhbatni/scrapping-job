<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const logs = ref<any>({ data: [], meta: {} })
const stats = ref<any[]>([])
const loading = ref(true)
const page = ref(1)

onMounted(async () => {
  await loadData()
  loading.value = false
})

async function loadData() {
  const [logsRes, statsRes] = await Promise.all([
    api.get('/crawl-logs', { params: { page: page.value, limit: 20 } }),
    api.get('/crawl-logs/stats'),
  ])
  logs.value = logsRes.data
  stats.value = statsRes.data
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white">Crawl Logs</h1>
      <p class="text-dark-400 mt-1">Monitor aktivitas crawling</p>
    </div>

    <!-- Stats -->
    <div v-if="stats.length" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div v-for="stat in stats" :key="stat.status" class="stat-card">
        <p class="text-sm text-dark-400 capitalize">{{ stat.status }}</p>
        <p class="text-2xl font-bold text-white">{{ parseInt(stat.count).toLocaleString() }}</p>
        <p class="text-xs text-dark-500">Jobs: {{ parseInt(stat.totaljobsfound || 0).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="glass-card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-dark-400 border-b border-dark-700">
            <th class="text-left py-3 px-3">Sumber</th>
            <th class="text-left py-3 px-3">Status</th>
            <th class="text-right py-3 px-3">Ditemukan</th>
            <th class="text-right py-3 px-3">Baru</th>
            <th class="text-right py-3 px-3">Updated</th>
            <th class="text-right py-3 px-3">Skipped</th>
            <th class="text-right py-3 px-3">Durasi</th>
            <th class="text-left py-3 px-3">Error</th>
            <th class="text-right py-3 px-3">Waktu</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs.data" :key="log.id" class="border-b border-dark-800 hover:bg-dark-800/50">
            <td class="py-3 px-3 text-white">{{ log.source?.name || '-' }}</td>
            <td class="py-3 px-3">
              <span :class="['badge', log.status === 'completed' ? 'badge-accent' : log.status === 'failed' ? 'badge-danger' : log.status === 'running' ? 'badge-warning' : 'badge-info']">
                {{ log.status }}
              </span>
            </td>
            <td class="py-3 px-3 text-right text-dark-300">{{ log.jobsFound }}</td>
            <td class="py-3 px-3 text-right text-accent-400 font-medium">{{ log.jobsNew }}</td>
            <td class="py-3 px-3 text-right text-primary-400">{{ log.jobsUpdated }}</td>
            <td class="py-3 px-3 text-right text-dark-400">{{ log.jobsSkipped }}</td>
            <td class="py-3 px-3 text-right text-dark-300">{{ log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : '-' }}</td>
            <td class="py-3 px-3 text-red-400 text-xs max-w-xs truncate">{{ log.errorMessage || '-' }}</td>
            <td class="py-3 px-3 text-right text-dark-400 text-xs">{{ new Date(log.createdAt).toLocaleString('id-ID') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
