import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref<any[]>([])
  const currentJob = ref<any>(null)
  const meta = ref<any>({})
  const loading = ref(false)

  async function searchJobs(params: any = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/jobs', { params })
      jobs.value = data.data
      meta.value = data.meta
    } finally {
      loading.value = false
    }
  }

  async function getJob(id: string) {
    loading.value = true
    try {
      const { data } = await api.get(`/jobs/${id}`)
      currentJob.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function toggleBookmark(jobId: string) {
    const { data } = await api.post(`/jobs/${jobId}/bookmark`)
    return data
  }

  async function getBookmarks(page = 1) {
    loading.value = true
    try {
      const { data } = await api.get('/jobs/bookmarks', { params: { page } })
      return data
    } finally {
      loading.value = false
    }
  }

  return { jobs, currentJob, meta, loading, searchJobs, getJob, toggleBookmark, getBookmarks }
})
