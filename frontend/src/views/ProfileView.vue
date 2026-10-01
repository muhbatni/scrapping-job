<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const profile = ref<any>({})
const skills = ref<any[]>([])
const education = ref<any[]>([])
const experiences = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const newSkill = ref({ name: '', level: 3 })

const showEduForm = ref(false)
const newEdu = ref({
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  gpa: undefined as number | undefined,
  description: '',
})

const showExpForm = ref(false)
const newExp = ref({
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
})

const activeTab = ref('profile')

function notify(message: string, type: 'success' | 'error' = 'success') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

onMounted(async () => {
  await loadData()
  loading.value = false
})

async function loadData() {
  try {
    const [p, s, e, exp] = await Promise.all([
      api.get('/profiles/me'),
      api.get('/profiles/skills'),
      api.get('/profiles/education'),
      api.get('/profiles/experiences'),
    ])
    profile.value = p.data || {}
    skills.value = s.data || []
    education.value = e.data || []
    experiences.value = exp.data || []
  } catch (err: any) {
    notify('Gagal memuat profil: ' + (err.response?.data?.message || err.message), 'error')
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const payload = {
      fullName: profile.value.fullName || undefined,
      phone: profile.value.phone || undefined,
      linkedinUrl: profile.value.linkedinUrl || undefined,
      githubUrl: profile.value.githubUrl || undefined,
      portfolioUrl: profile.value.portfolioUrl || undefined,
      address: profile.value.address || undefined,
      city: profile.value.city || undefined,
      province: profile.value.province || undefined,
      summary: profile.value.summary || undefined,
      cvFilePath: profile.value.cvFilePath || undefined,
      coverLetterTemplate: profile.value.coverLetterTemplate || undefined,
    }
    const { data } = await api.put('/profiles/me', payload)
    profile.value = { ...profile.value, ...data }
    notify('Profil berhasil disimpan!')
  } catch (err: any) {
    notify('Gagal menyimpan profil: ' + (err.response?.data?.message || err.message), 'error')
  } finally {
    saving.value = false
  }
}

async function addSkill() {
  if (!newSkill.value.name) return
  try {
    await api.post('/profiles/skills', newSkill.value)
    newSkill.value = { name: '', level: 3 }
    const { data } = await api.get('/profiles/skills')
    skills.value = data
    notify('Skill berhasil ditambahkan!')
  } catch (err: any) {
    notify('Gagal menambahkan skill', 'error')
  }
}

async function removeSkill(id: string) {
  try {
    await api.delete(`/profiles/skills/${id}`)
    skills.value = skills.value.filter(s => s.id !== id)
    notify('Skill berhasil dihapus')
  } catch (err: any) {
    notify('Gagal menghapus skill', 'error')
  }
}

async function uploadCV(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  if (file.type !== 'application/pdf') {
    notify('File harus berupa PDF!', 'error')
    return
  }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const { data } = await api.post('/upload/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    profile.value.cvFilePath = data.path
    await api.put('/profiles/me', { cvFilePath: data.path })
    notify('CV berhasil diunggah!')
  } catch (err: any) {
    notify('Gagal mengunggah CV: ' + (err.response?.data?.message || err.message), 'error')
  }
}

async function addEducation() {
  if (!newEdu.value.institution) return
  try {
    const payload: any = {
      institution: newEdu.value.institution,
      degree: newEdu.value.degree || undefined,
      fieldOfStudy: newEdu.value.fieldOfStudy || undefined,
      description: newEdu.value.description || undefined,
    }
    if (newEdu.value.startDate) payload.startDate = new Date(newEdu.value.startDate)
    if (newEdu.value.endDate) payload.endDate = new Date(newEdu.value.endDate)
    if (newEdu.value.gpa) payload.gpa = Number(newEdu.value.gpa)

    await api.post('/profiles/education', payload)
    newEdu.value = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: undefined, description: '' }
    showEduForm.value = false
    const { data } = await api.get('/profiles/education')
    education.value = data
    notify('Riwayat pendidikan berhasil ditambahkan!')
  } catch (err: any) {
    notify('Gagal menambah pendidikan: ' + (err.response?.data?.message || err.message), 'error')
  }
}

async function removeEducation(id: string) {
  try {
    await api.delete(`/profiles/education/${id}`)
    education.value = education.value.filter(e => e.id !== id)
    notify('Pendidikan dihapus')
  } catch (err: any) {
    notify('Gagal menghapus pendidikan', 'error')
  }
}

async function addExperience() {
  if (!newExp.value.company || !newExp.value.position) return
  try {
    const payload: any = {
      company: newExp.value.company,
      position: newExp.value.position,
      location: newExp.value.location || undefined,
      isCurrent: newExp.value.isCurrent,
      description: newExp.value.description || undefined,
    }
    if (newExp.value.startDate) payload.startDate = new Date(newExp.value.startDate)
    if (newExp.value.endDate && !newExp.value.isCurrent) payload.endDate = new Date(newExp.value.endDate)

    await api.post('/profiles/experiences', payload)
    newExp.value = { company: '', position: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' }
    showExpForm.value = false
    const { data } = await api.get('/profiles/experiences')
    experiences.value = data
    notify('Pengalaman kerja berhasil ditambahkan!')
  } catch (err: any) {
    notify('Gagal menambah pengalaman: ' + (err.response?.data?.message || err.message), 'error')
  }
}

async function removeExperience(id: string) {
  try {
    await api.delete(`/profiles/experiences/${id}`)
    experiences.value = experiences.value.filter(e => e.id !== id)
    notify('Pengalaman kerja dihapus')
  } catch (err: any) {
    notify('Gagal menghapus pengalaman', 'error')
  }
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
      <p class="text-dark-400 mt-1">Kelola informasi profil, keahlian, dan CV Anda</p>
    </div>

    <!-- Feedback Notification -->
    <div
      v-if="notification"
      :class="[
        'mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between transition-all animate-slide-up',
        notification.type === 'success'
          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          : 'bg-red-500/10 border border-red-500/30 text-red-400'
      ]"
    >
      <span>{{ notification.message }}</span>
      <button @click="notification = null" class="text-xs opacity-70 hover:opacity-100">&times;</button>
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
          <div>
            <label class="block text-sm text-dark-300 mb-1.5">Provinsi</label>
            <input v-model="profile.province" class="input-field" placeholder="DKI Jakarta" />
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
          <textarea v-model="profile.coverLetterTemplate" class="input-field" rows="5" placeholder="Template cover letter default..."></textarea>
        </div>

        <div>
          <label class="block text-sm text-dark-300 mb-1.5">Upload CV (PDF, maks 10MB)</label>
          <input type="file" accept=".pdf" @change="uploadCV" class="input-field" />
          <div v-if="profile.cvFilePath" class="flex items-center gap-2 mt-2">
            <span class="text-xs text-accent-400">✅ CV tersimpan: {{ profile.cvFilePath }}</span>
            <a :href="profile.cvFilePath" target="_blank" class="text-xs text-primary-400 underline hover:text-primary-300">Lihat CV</a>
          </div>
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
        <select v-model="newSkill.level" class="select-field w-28">
          <option :value="1">Level 1</option>
          <option :value="2">Level 2</option>
          <option :value="3">Level 3</option>
          <option :value="4">Level 4</option>
          <option :value="5">Level 5</option>
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
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-white">Riwayat Pendidikan</h3>
        <button @click="showEduForm = !showEduForm" class="btn-primary text-sm">
          {{ showEduForm ? 'Tutup Form' : '+ Tambah Pendidikan' }}
        </button>
      </div>

      <!-- Add Education Form -->
      <div v-if="showEduForm" class="p-4 bg-dark-800/70 border border-dark-700 rounded-xl mb-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="newEdu.institution" class="input-field" placeholder="Nama Institusi / Universitas *" required />
          <input v-model="newEdu.degree" class="input-field" placeholder="Gelar / Jenjang (mis: S1, D3, SMA)" />
          <input v-model="newEdu.fieldOfStudy" class="input-field" placeholder="Jurusan / Program Studi" />
          <input v-model="newEdu.gpa" type="number" step="0.01" class="input-field" placeholder="IPK / Nilai (mis: 3.75)" />
          <div>
            <label class="block text-xs text-dark-400 mb-1">Mulai</label>
            <input v-model="newEdu.startDate" type="date" class="input-field" />
          </div>
          <div>
            <label class="block text-xs text-dark-400 mb-1">Selesai</label>
            <input v-model="newEdu.endDate" type="date" class="input-field" />
          </div>
        </div>
        <textarea v-model="newEdu.description" class="input-field" rows="2" placeholder="Keterangan / Prestasi (opsional)"></textarea>
        <div class="flex gap-2">
          <button @click="addEducation" class="btn-primary text-sm">Simpan Pendidikan</button>
          <button @click="showEduForm = false" class="btn-secondary text-sm">Batal</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="edu in education" :key="edu.id" class="p-4 bg-dark-800/50 rounded-xl flex items-start justify-between">
          <div>
            <h3 class="font-medium text-white">{{ edu.institution }}</h3>
            <p class="text-sm text-dark-300">{{ edu.degree }} {{ edu.fieldOfStudy ? '· ' + edu.fieldOfStudy : '' }}</p>
            <p v-if="edu.gpa" class="text-xs text-accent-400 mt-1">IPK: {{ edu.gpa }}</p>
            <p v-if="edu.description" class="text-xs text-dark-400 mt-1">{{ edu.description }}</p>
          </div>
          <button @click="removeEducation(edu.id)" class="p-1.5 text-dark-400 hover:text-red-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p v-if="education.length === 0 && !showEduForm" class="text-dark-400 text-center py-8">Belum ada data pendidikan.</p>
      </div>
    </div>

    <!-- Experience Tab -->
    <div v-else-if="activeTab === 'experience'" class="glass-card">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-white">Pengalaman Kerja</h3>
        <button @click="showExpForm = !showExpForm" class="btn-primary text-sm">
          {{ showExpForm ? 'Tutup Form' : '+ Tambah Pengalaman' }}
        </button>
      </div>

      <!-- Add Experience Form -->
      <div v-if="showExpForm" class="p-4 bg-dark-800/70 border border-dark-700 rounded-xl mb-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="newExp.company" class="input-field" placeholder="Nama Perusahaan *" required />
          <input v-model="newExp.position" class="input-field" placeholder="Jabatan / Posisi *" required />
          <input v-model="newExp.location" class="input-field" placeholder="Lokasi (mis: Jakarta, Remote)" />
          <div class="flex items-center gap-2 pt-3">
            <input type="checkbox" id="isCurrent" v-model="newExp.isCurrent" class="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <label for="isCurrent" class="text-sm text-dark-300">Masih bekerja di sini</label>
          </div>
          <div>
            <label class="block text-xs text-dark-400 mb-1">Mulai</label>
            <input v-model="newExp.startDate" type="date" class="input-field" />
          </div>
          <div v-if="!newExp.isCurrent">
            <label class="block text-xs text-dark-400 mb-1">Selesai</label>
            <input v-model="newExp.endDate" type="date" class="input-field" />
          </div>
        </div>
        <textarea v-model="newExp.description" class="input-field" rows="3" placeholder="Deskripsi tugas dan tanggung jawab..."></textarea>
        <div class="flex gap-2">
          <button @click="addExperience" class="btn-primary text-sm">Simpan Pengalaman</button>
          <button @click="showExpForm = false" class="btn-secondary text-sm">Batal</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="exp in experiences" :key="exp.id" class="p-4 bg-dark-800/50 rounded-xl flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-medium text-white">{{ exp.position }}</h3>
            <p class="text-sm text-dark-300">{{ exp.company }} {{ exp.location ? '· ' + exp.location : '' }}</p>
            <span v-if="exp.isCurrent" class="badge-primary text-xs mt-1 inline-block">Saat ini</span>
            <p v-if="exp.description" class="text-sm text-dark-400 mt-2">{{ exp.description }}</p>
          </div>
          <button @click="removeExperience(exp.id)" class="p-1.5 text-dark-400 hover:text-red-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p v-if="experiences.length === 0 && !showExpForm" class="text-dark-400 text-center py-8">Belum ada pengalaman kerja.</p>
      </div>
    </div>
  </div>
</template>
