<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const sidebarOpen = ref(true)

const navigation = computed(() => {
  const items = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Cari Lowongan', path: '/jobs', icon: 'search' },
    { name: 'Lamaran Saya', path: '/applications', icon: 'applications' },
    { name: 'Bookmark', path: '/bookmarks', icon: 'bookmark' },
    { name: 'Profil', path: '/profile', icon: 'profile' },
    { name: 'Notifikasi', path: '/notifications', icon: 'notification' },
  ]

  if (auth.isAdmin) {
    items.push(
      { name: 'Admin Panel', path: '/admin', icon: 'admin' },
      { name: 'Sumber Lowongan', path: '/admin/sources', icon: 'sources' },
      { name: 'Crawl Logs', path: '/admin/crawl-logs', icon: 'logs' },
    )
  }

  return items
})

const icons: Record<string, string> = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  applications: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  bookmark: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  notification: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  admin: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  sources: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  logs: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
}

function handleLogout() {
  auth.logout()
  window.location.href = '/login'
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col h-full border-r border-dark-700/50 bg-dark-900/80 backdrop-blur-xl transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-dark-700/50">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <span class="text-white font-bold text-lg">J</span>
        </div>
        <div v-if="sidebarOpen" class="animate-fade-in">
          <h1 class="font-bold text-white text-sm">Job Assistant</h1>
          <p class="text-xs text-dark-400">Indonesia</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :class="['sidebar-link', route.path === item.path && 'active']"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="icons[item.icon]" />
          </svg>
          <span v-if="sidebarOpen" class="text-sm animate-fade-in">{{ item.name }}</span>
        </RouterLink>
      </nav>

      <!-- User Section -->
      <div class="px-3 py-4 border-t border-dark-700/50">
        <div class="flex items-center gap-3 px-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center flex-shrink-0">
            <span class="text-white text-xs font-bold">{{ auth.user?.email?.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0 animate-fade-in">
            <p class="text-xs text-dark-200 truncate">{{ auth.user?.email }}</p>
            <p class="text-xs text-dark-400 capitalize">{{ auth.user?.role }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="mt-3 w-full sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="sidebarOpen" class="text-sm">Keluar</span>
        </button>
      </div>

      <!-- Toggle -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="absolute top-5 -right-3 w-6 h-6 bg-dark-700 border border-dark-600 rounded-full flex items-center justify-center hover:bg-dark-600 transition-colors z-10"
        style="left: auto"
      >
        <svg class="w-3 h-3 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
        </svg>
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-dark-950">
      <div class="p-6 lg:p-8 max-w-7xl mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>
