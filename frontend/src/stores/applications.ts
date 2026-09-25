import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useApplicationsStore = defineStore('applications', () => {
  const applications = ref<any[]>([])
  const meta = ref<any>({})
  const stats = ref<any>({})
  const loading = ref(false)

  async function fetchApplications(params: any = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/applications', { params })
      applications.value = data.data
      meta.value = data.meta
    } finally {
      loading.value = false
    }
  }

  async function createApplication(jobId: string, notes?: string) {
    const { data } = await api.post('/applications', { jobId, notes })
    return data
  }

  async function updateStatus(id: string, status: string, notes?: string) {
    const { data } = await api.put(`/applications/${id}/status`, { status, notes })
    return data
  }

  async function getStats() {
    const { data } = await api.get('/applications/stats')
    stats.value = data
    return data
  }

  async function deleteApplication(id: string) {
    await api.delete(`/applications/${id}`)
  }

  return { applications, meta, stats, loading, fetchApplications, createApplication, updateStatus, getStats, deleteApplication }
})
