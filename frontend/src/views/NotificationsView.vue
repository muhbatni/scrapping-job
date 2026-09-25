<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const notifications = ref<any[]>([])
const unreadCount = ref(0)
const loading = ref(true)

onMounted(async () => {
  await loadNotifications()
  loading.value = false
})

async function loadNotifications() {
  const [notifsRes, countRes] = await Promise.all([
    api.get('/notifications'),
    api.get('/notifications/unread-count'),
  ])
  notifications.value = notifsRes.data.data
  unreadCount.value = countRes.data
}

async function markAsRead(id: string) {
  await api.put(`/notifications/${id}/read`)
  await loadNotifications()
}

async function markAllAsRead() {
  await api.put('/notifications/read-all')
  await loadNotifications()
}

async function deleteNotif(id: string) {
  await api.delete(`/notifications/${id}`)
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const typeIcons: Record<string, string> = {
  new_job: '💼',
  favorite_company: '⭐',
  status_change: '📋',
}
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-white">Notifikasi</h1>
        <p class="text-dark-400 mt-1">{{ unreadCount }} belum dibaca</p>
      </div>
      <button v-if="unreadCount > 0" @click="markAllAsRead" class="btn-secondary text-sm">Tandai semua dibaca</button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="glass-card animate-pulse"><div class="h-4 bg-dark-700 rounded w-1/2"></div></div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :class="['glass-card flex items-start gap-4 transition-all cursor-pointer', !notif.isRead && 'border-primary-500/30 bg-primary-500/5']"
        @click="markAsRead(notif.id)"
      >
        <span class="text-2xl">{{ typeIcons[notif.type] || '🔔' }}</span>
        <div class="flex-1 min-w-0">
          <h3 :class="['text-sm font-medium', notif.isRead ? 'text-dark-300' : 'text-white']">{{ notif.title }}</h3>
          <p class="text-xs text-dark-400 mt-1">{{ notif.message }}</p>
          <p class="text-xs text-dark-500 mt-1">{{ new Date(notif.createdAt).toLocaleString('id-ID') }}</p>
        </div>
        <button @click.stop="deleteNotif(notif.id)" class="p-1 text-dark-400 hover:text-red-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div v-if="notifications.length === 0" class="glass-card text-center py-12">
        <p class="text-dark-400">Tidak ada notifikasi</p>
      </div>
    </div>
  </div>
</template>
