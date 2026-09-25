<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const profile = ref<any>({})
const skills = ref<any[]>([])
const education = ref<any[]>([])
const experiences = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const newSkill = ref({ name: '', level: 3 })
const activeTab = ref('profile')

onMounted(async () => {
  await loadData()
  loading.value = false
})

async function loadData() {
  const [p, s, e, exp] = await Promise.all([
    api.get('/profiles/me'),
    api.get('/profiles/skills'),
    api.get('/profiles/education'),
    api.get('/profiles/experiences'),
  ])
  profile.value = p.data
  skills.value = s.data
  education.value = e.data
  experiences.value = exp.data
}

async function saveProfile() {
  saving.value = true
  try {
    await api.put('/profiles/me', profile.value)
    alert('Profil berhasil disimpan!')
  } finally {
    saving.value = false
  }
}

async function addSkill() {
  if (!newSkill.value.name) return
  await api.post('/profiles/skills', newSkill.value)
  newSkill.value = { name: '', level: 3 }
  const { data } = await api.get('/profiles/skills')
  skills.value = data
}

async function removeSkill(id: string) {
  await api.delete(`/profiles/skills/${id}`)
  skills.value = skills.value.filter(s => s.id !== id)
}

async function uploadCV(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const formData = new FormData()
  formData.append('file', input.files[0])
  const { data } = await api.post('/upload/cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  profile.value.cvFilePath = data.path
  await api.put('/profiles/me', { cvFilePath: data.path })
}

const tabs = [
  { key: 'profile', label: 'Profil' },
  { key: 'skills', label: 'Skills' },
  { key: 'education', label: 'Pendidikan' },
  { key: 'experience', label: 'Pengalaman' },
]
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-white">Profil Saya</h1>
      <p class="text-dark-400 mt-1">Kelola informasi profil dan CV Anda</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-dark-800/50 rounded-xl p-1 mb-6 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          activeTab === tab.key ? 'bg-primary-600 text-white shadow-lg' : 'text-dark-400 hover:text-white'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="glass-card animate-pulse">
      <div class="h-4 bg-dark-700 rounded w-1/3 mb-4"></div>
      <div class="h-10 bg-dark-700 rounded mb-3"></div>
      <div class="h-10 bg-dark-700 rounded mb-3"></div>
    </div>

    <!-- Profile Tab -->
    <div v-else-if="activeTab === 'profile'" class="glass-card">
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">Nama Lengkap</label>
            <input v-model="profile.fullName" class="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">Telepon</label>
            <input v-model="profile.phone" class="input-field" placeholder="+62 812 3456 7890" />
          </div>
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">LinkedIn</label>
            <input v-model="profile.linkedinUrl" class="input-field" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">GitHub</label>
            <input v-model="profile.githubUrl" class="input-field" placeholder="https://github.com/..." />
          </div>
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">Portfolio</label>
            <input v-model="profile.portfolioUrl" class="input-field" placeholder="https://myportfolio.com" />
          </div>
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">Kota</label>
            <input v-model="profile.city" class="input-field" placeholder="Jakarta" />
          </div>
        </div>

        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Alamat</label>
          <textarea v-model="profile.address" class="input-field" rows="2" placeholder="Alamat lengkap..."></textarea>
        </div>

        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Ringkasan Profil</label>
          <textarea v-model="profile.summary" class="input-field" rows="4" placeholder="Ceritakan tentang diri Anda..."></textarea>
        </div>

        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Cover Letter Template</label>
          <textarea v-model="profile.coverLetterTemplate" class="input-field" rows="6" placeholder="Template cover letter default..."></textarea>
        </div>

        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Upload CV (PDF)</label>
          <input type="file" accept=".pdf" @change="uploadCV" class="input-field" />
          <p v-if="profile.cvFilePath" class="text-xs text-accent-400 mt-1">✅ CV tersimpan: {{ profile.cvFilePath }}</p>
        </div>

        <button type="submit" :disabled="saving" class="btn-primary">
          {{ saving ? 'Menyimpan...' : 'Simpan Profil' }}
        </button>
      </form>
    </div>

    <!-- Skills Tab -->
    <div v-else-if="activeTab === 'skills'" class="glass-card">
      <div class="flex gap-3 mb-6">
        <input v-model="newSkill.name" class="input-field flex-1" placeholder="Nama skill, mis: React, Python..." @keyup.enter="addSkill" />
        <select v-model="newSkill.level" class="select-field w-24">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
          <option :value="5">5</option>
        </select>
        <button @click="addSkill" class="btn-primary">Tambah</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="skill in skills" :key="skill.id" class="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl">
          <div>
            <span class="text-sm text-white font-medium">{{ skill.name }}</span>
            <div class="flex gap-1 mt-1">
              <div v-for="i in 5" :key="i" :class="['w-4 h-1 rounded-full', i <= skill.level ? 'bg-primary-500' : 'bg-dark-600']"></div>
            </div>
          </div>
          <button @click="removeSkill(skill.id)" class="p-1 text-dark-400 hover:text-red-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <p v-if="skills.length === 0" class="text-dark-400 text-center py-8">Belum ada skill. Tambahkan skill Anda di atas.</p>
    </div>

    <!-- Education Tab -->
    <div v-else-if="activeTab === 'education'" class="glass-card">
      <div class="space-y-4">
        <div v-for="edu in education" :key="edu.id" class="p-4 bg-dark-800/50 rounded-xl">
          <h3 class="font-medium text-white">{{ edu.institution }}</h3>
          <p class="text-sm text-dark-300">{{ edu.degree }} - {{ edu.fieldOfStudy }}</p>
          <p v-if="edu.gpa" class="text-xs text-dark-400 mt-1">IPK: {{ edu.gpa }}</p>
        </div>
        <p v-if="education.length === 0" class="text-dark-400 text-center py-8">Belum ada data pendidikan.</p>
      </div>
    </div>

    <!-- Experience Tab -->
    <div v-else-if="activeTab === 'experience'" class="glass-card">
      <div class="space-y-4">
        <div v-for="exp in experiences" :key="exp.id" class="p-4 bg-dark-800/50 rounded-xl">
          <h3 class="font-medium text-white">{{ exp.position }}</h3>
          <p class="text-sm text-dark-300">{{ exp.company }} · {{ exp.location }}</p>
          <p class="text-xs text-dark-400 mt-1">{{ exp.isCurrent ? 'Saat ini' : '' }}</p>
          <p v-if="exp.description" class="text-sm text-dark-400 mt-2">{{ exp.description }}</p>
        </div>
        <p v-if="experiences.length === 0" class="text-dark-400 text-center py-8">Belum ada pengalaman kerja.</p>
      </div>
    </div>
  </div>
</template>
