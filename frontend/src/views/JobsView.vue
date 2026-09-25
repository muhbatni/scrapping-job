<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'

const router = useRouter()
const jobsStore = useJobsStore()

const filters = ref({
  keyword: '',
  location: '',
  workType: '',
  jobType: '',
  experienceLevel: '',
  salaryMin: '',
  sortBy: 'posted_at',
  sortOrder: 'DESC',
  page: 1,
  limit: 20,
})

const workTypes = [
  { value: '', label: 'Semua Tipe' },
  { value: 'remote', label: '🏠 Remote' },
  { value: 'hybrid', label: '🔄 Hybrid' },
  { value: 'onsite', label: '🏢 Onsite' },
]

const jobTypes = [
  { value: '', label: 'Semua Jenis' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
]

const experienceLevels = [
  { value: '', label: 'Semua Level' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
]

onMounted(() => {
  search()
})

function search() {
  const params: any = {}
  Object.entries(filters.value).forEach(([key, val]) => {
    if (val) params[key] = val
  })
  jobsStore.searchJobs(params)
}

function goToPage(page: number) {
  filters.value.page = page
  search()
}

async function handleBookmark(jobId: string, event: Event) {
  event.stopPropagation()
  event.preventDefault()
  await jobsStore.toggleBookmark(jobId)
  search()
}

function formatSalary(min?: number, max?: number, currency = 'IDR') {
  if (!min && !max) return 'Tidak dicantumkan'
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `Mulai ${fmt(min)}`
  return `Hingga ${fmt(max!)}`
}

function timeAgo(date?: string) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white">Cari Lowongan</h1>
      <p class="text-dark-400 mt-1">Temukan pekerjaan impian Anda di Indonesia</p>
    </div>

    <!-- Search Filters -->
    <div class="glass-card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div class="lg:col-span-2">
          <input
            v-model="filters.keyword"
            type="text"
            class="input-field"
            placeholder="🔍 Cari posisi, perusahaan, atau skill..."
            @keyup.enter="search"
          />
        </div>
        <input
          v-model="filters.location"
          type="text"
          class="input-field"
          placeholder="📍 Lokasi"
          @keyup.enter="search"
        />
        <input
          v-model="filters.salaryMin"
          type="number"
          class="input-field"
          placeholder="💰 Gaji minimum"
          @keyup.enter="search"
        />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <select v-model="filters.workType" class="select-field">
          <option v-for="wt in workTypes" :key="wt.value" :value="wt.value">{{ wt.label }}</option>
        </select>
        <select v-model="filters.jobType" class="select-field">
          <option v-for="jt in jobTypes" :key="jt.value" :value="jt.value">{{ jt.label }}</option>
        </select>
        <select v-model="filters.experienceLevel" class="select-field">
          <option v-for="el in experienceLevels" :key="el.value" :value="el.value">{{ el.label }}</option>
        </select>
        <select v-model="filters.sortBy" class="select-field">
          <option value="posted_at">Terbaru</option>
          <option value="salary_max">Gaji Tertinggi</option>
          <option value="title">Judul A-Z</option>
        </select>
      </div>

      <button @click="search" class="btn-primary">Cari Lowongan</button>
    </div>

    <!-- Results Info -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-dark-400 text-sm">
        <span v-if="jobsStore.meta.total">{{ jobsStore.meta.total.toLocaleString() }} lowongan ditemukan</span>
        <span v-else>Memuat...</span>
      </p>
    </div>

    <!-- Loading -->
    <div v-if="jobsStore.loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="glass-card animate-pulse">
        <div class="h-5 bg-dark-700 rounded w-1/3 mb-3"></div>
        <div class="h-4 bg-dark-700 rounded w-1/4 mb-2"></div>
        <div class="h-3 bg-dark-700 rounded w-full"></div>
      </div>
    </div>

    <!-- Job List -->
    <div v-else class="space-y-3">
      <RouterLink
        v-for="(job, index) in jobsStore.jobs"
        :key="job.id"
        :to="`/jobs/${job.id}`"
        class="block glass-card hover:border-primary-500/30 transition-all duration-300 group animate-slide-up"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
            <span class="text-primary-400 font-bold text-lg">{{ job.company?.charAt(0) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-base font-semibold text-white group-hover:text-primary-300 transition-colors">{{ job.title }}</h3>
                <p class="text-sm text-dark-300 mt-0.5">{{ job.company }}</p>
              </div>
              <button
                @click="handleBookmark(job.id, $event)"
                class="p-2 rounded-lg hover:bg-dark-700 transition-colors flex-shrink-0"
              >
                <svg class="w-5 h-5 text-dark-400 hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2 mt-3">
              <span v-if="job.location" class="badge-info">📍 {{ job.location }}</span>
              <span v-if="job.workType" class="badge-primary">{{ job.workType === 'remote' ? '🏠 Remote' : job.workType === 'hybrid' ? '🔄 Hybrid' : '🏢 Onsite' }}</span>
              <span v-if="job.jobType" class="badge-accent">{{ job.jobType?.replace('_', ' ') }}</span>
              <span v-if="job.experienceLevel" class="badge-warning">{{ job.experienceLevel }}</span>
              <span v-if="job.salaryMin || job.salaryMax" class="badge bg-emerald-500/20 text-emerald-300">
                {{ formatSalary(job.salaryMin, job.salaryMax) }}
              </span>
            </div>

            <div class="flex items-center gap-4 mt-3 text-xs text-dark-400">
              <span v-if="job.source">{{ job.source.name }}</span>
              <span v-if="job.postedAt">{{ timeAgo(job.postedAt) }}</span>
            </div>
          </div>
        </div>
      </RouterLink>

      <!-- Empty State -->
      <div v-if="jobsStore.jobs.length === 0" class="glass-card text-center py-12">
        <p class="text-dark-400 text-lg">Tidak ada lowongan ditemukan</p>
        <p class="text-dark-500 text-sm mt-2">Coba ubah filter pencarian Anda</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="jobsStore.meta.totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button
        v-for="page in Math.min(jobsStore.meta.totalPages, 10)"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200',
          filters.page === page
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
            : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>
