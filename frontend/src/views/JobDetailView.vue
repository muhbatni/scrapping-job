<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useApplicationsStore } from '@/stores/applications'

const route = useRoute()
const router = useRouter()
const jobsStore = useJobsStore()
const appsStore = useApplicationsStore()
const loading = ref(true)
const applying = ref(false)
const applySuccess = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  await jobsStore.getJob(id)
  loading.value = false
})

async function applyJob() {
  if (!jobsStore.currentJob) return
  applying.value = true
  try {
    await appsStore.createApplication(jobsStore.currentJob.id)
    applySuccess.value = true
  } catch (e: any) {
    alert(e.response?.data?.message || 'Gagal membuat lamaran')
  } finally {
    applying.value = false
  }
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return 'Tidak dicantumkan'
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `Mulai ${fmt(min)}`
  return `Hingga ${fmt(max!)}`
}
</script>

<template>
  <div class="animate-fade-in">
    <button @click="router.back()" class="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Kembali
    </button>

    <div v-if="loading" class="glass-card animate-pulse">
      <div class="h-8 bg-dark-700 rounded w-1/2 mb-4"></div>
      <div class="h-4 bg-dark-700 rounded w-1/3 mb-6"></div>
      <div class="space-y-3">
        <div class="h-3 bg-dark-700 rounded"></div>
        <div class="h-3 bg-dark-700 rounded w-5/6"></div>
        <div class="h-3 bg-dark-700 rounded w-4/6"></div>
      </div>
    </div>

    <div v-else-if="jobsStore.currentJob" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <div class="glass-card">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
              <span class="text-primary-400 font-bold text-2xl">{{ jobsStore.currentJob.company?.charAt(0) }}</span>
            </div>
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-white">{{ jobsStore.currentJob.title }}</h1>
              <p class="text-lg text-dark-300 mt-1">{{ jobsStore.currentJob.company }}</p>
              <div class="flex flex-wrap gap-2 mt-3">
                <span v-if="jobsStore.currentJob.location" class="badge-info">📍 {{ jobsStore.currentJob.location }}</span>
                <span v-if="jobsStore.currentJob.workType" class="badge-primary">{{ jobsStore.currentJob.workType }}</span>
                <span v-if="jobsStore.currentJob.jobType" class="badge-accent">{{ jobsStore.currentJob.jobType?.replace('_', ' ') }}</span>
                <span v-if="jobsStore.currentJob.experienceLevel" class="badge-warning">{{ jobsStore.currentJob.experienceLevel }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="jobsStore.currentJob.description" class="glass-card">
          <h2 class="text-lg font-semibold text-white mb-4">Deskripsi Pekerjaan</h2>
          <div class="text-dark-300 leading-relaxed whitespace-pre-wrap">{{ jobsStore.currentJob.description }}</div>
        </div>

        <!-- Requirements -->
        <div v-if="jobsStore.currentJob.requirements" class="glass-card">
          <h2 class="text-lg font-semibold text-white mb-4">Persyaratan</h2>
          <div class="text-dark-300 leading-relaxed whitespace-pre-wrap">{{ jobsStore.currentJob.requirements }}</div>
        </div>

        <!-- Benefits -->
        <div v-if="jobsStore.currentJob.benefits" class="glass-card">
          <h2 class="text-lg font-semibold text-white mb-4">Benefit</h2>
          <div class="text-dark-300 leading-relaxed whitespace-pre-wrap">{{ jobsStore.currentJob.benefits }}</div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Apply Card -->
        <div class="glass-card">
          <div class="space-y-4">
            <div v-if="applySuccess" class="p-4 bg-accent-500/10 border border-accent-500/30 rounded-xl text-accent-400 text-center">
              ✅ Lamaran berhasil disimpan!
            </div>
            <button v-else @click="applyJob" :disabled="applying" class="btn-primary w-full">
              {{ applying ? 'Menyimpan...' : '📝 Simpan Lamaran' }}
            </button>

            <a
              v-if="jobsStore.currentJob.originalUrl"
              :href="jobsStore.currentJob.originalUrl"
              target="_blank"
              class="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Buka Halaman Asli
            </a>
          </div>
        </div>

        <!-- Info Card -->
        <div class="glass-card space-y-4">
          <h3 class="text-sm font-semibold text-dark-300 uppercase tracking-wider">Informasi</h3>

          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-dark-400">Gaji</span>
              <span class="text-white font-medium">{{ formatSalary(jobsStore.currentJob.salaryMin, jobsStore.currentJob.salaryMax) }}</span>
            </div>
            <div v-if="jobsStore.currentJob.source" class="flex justify-between text-sm">
              <span class="text-dark-400">Sumber</span>
              <span class="text-white font-medium">{{ jobsStore.currentJob.source.name }}</span>
            </div>
            <div v-if="jobsStore.currentJob.postedAt" class="flex justify-between text-sm">
              <span class="text-dark-400">Tanggal Posting</span>
              <span class="text-white font-medium">{{ new Date(jobsStore.currentJob.postedAt).toLocaleDateString('id-ID') }}</span>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="jobsStore.currentJob.tags?.length" class="glass-card">
          <h3 class="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in jobsStore.currentJob.tags" :key="tag" class="badge-primary">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
