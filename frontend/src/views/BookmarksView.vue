<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useJobsStore } from '@/stores/jobs'

const jobsStore = useJobsStore()
const bookmarks = ref<any>({ data: [], meta: {} })
const loading = ref(true)

onMounted(async () => {
  const data = await jobsStore.getBookmarks()
  bookmarks.value = data
  loading.value = false
})

async function removeBookmark(jobId: string) {
  await jobsStore.toggleBookmark(jobId)
  const data = await jobsStore.getBookmarks()
  bookmarks.value = data
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white">Bookmark</h1>
      <p class="text-dark-400 mt-1">Lowongan yang Anda simpan</p>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="glass-card animate-pulse"><div class="h-5 bg-dark-700 rounded w-1/3 mb-3"></div><div class="h-4 bg-dark-700 rounded w-1/4"></div></div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="job in bookmarks.data" :key="job.id" class="glass-card hover:border-primary-500/30 transition-all">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
            <span class="text-primary-400 font-bold">{{ job.company?.charAt(0) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <RouterLink :to="`/jobs/${job.id}`" class="text-base font-semibold text-white hover:text-primary-300">{{ job.title }}</RouterLink>
            <p class="text-sm text-dark-400">{{ job.company }} · {{ job.location }}</p>
          </div>
          <button @click="removeBookmark(job.id)" class="p-2 text-amber-400 hover:text-red-400 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
          </button>
        </div>
      </div>

      <div v-if="bookmarks.data.length === 0" class="glass-card text-center py-12">
        <p class="text-dark-400 text-lg">Belum ada bookmark</p>
        <RouterLink to="/jobs" class="btn-primary inline-block mt-4">Cari Lowongan</RouterLink>
      </div>
    </div>
  </div>
</template>
