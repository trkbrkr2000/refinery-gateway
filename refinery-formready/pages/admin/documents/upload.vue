<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <Button 
              @click="navigateTo('/admin/dashboard')"
              variant="secondary"
              class="w-4 h-4"
            >
              <Icon name="arrow-left" class="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Icon name="cloud-arrow-up" class="w-6 h-6 mr-3" color="blue-600" />
            <div>
              <h1 class="text-xl font-bold text-slate-900">Upload Documents</h1>
              <p class="text-sm text-slate-500">Add new VA references to the knowledge base</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Upload Form -->
      <div class="bg-white rounded-xl shadow-sm p-8 border border-slate-200 mb-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6">Upload New Document</h2>
        
        <form @submit.prevent="handleUpload" class="space-y-6">
          <!-- Document Type Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-3">
              Document Type
            </label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div 
                v-for="type in documentTypes" 
                :key="type.value"
                @click="selectedType = type.value"
                :class="[
                  'p-4 border-2 rounded-lg cursor-pointer transition-all',
                  selectedType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center">
                  <Icon :name="type.icon" class="w-5 h-5 mr-3" :color="selectedType === type.value ? 'blue-600' : 'slate-500'" />
                  <div>
                    <div class="font-medium text-slate-900">{{ type.name }}</div>
                    <div class="text-sm text-slate-500">{{ type.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- File Upload Area -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-3">
              Document File
            </label>
            <div 
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
              ]"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".pdf"
                @change="handleFileSelect"
                class="hidden"
              />
              
              <div v-if="!selectedFile" class="space-y-4">
                <Icon name="cloud-arrow-up" class="w-8 h-8" color="slate-400" />
                <div>
                  <p class="text-lg font-medium text-slate-900">Drop your PDF here</p>
                  <p class="text-slate-500">or click to browse</p>
                </div>
                <Button 
                  type="button"
                  @click="$refs.fileInput.click()"
                  variant="secondary"
                >
                  <Icon name="folder-open" class="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>

              <div v-else class="space-y-4">
                <Icon name="document-text" class="w-8 h-8" color="green-600" />
                <div>
                  <p class="text-lg font-medium text-slate-900">{{ selectedFile.name }}</p>
                  <p class="text-slate-500">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <Button 
                  type="button"
                  @click="selectedFile = null"
                  variant="secondary"
                >
                  <Icon name="x-mark" class="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <!-- Metadata Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="title" class="block text-sm font-medium text-slate-700 mb-2">
                Document Title
              </label>
              <input
                id="title"
                v-model="metadata.title"
                type="text"
                class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label for="citation" class="block text-sm font-medium text-slate-700 mb-2">
                Citation
              </label>
              <input
                id="citation"
                v-model="metadata.citation"
                type="text"
                class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 38 CFR 3.303"
              />
            </div>

            <div>
              <label for="date" class="block text-sm font-medium text-slate-700 mb-2">
                Publication Date
              </label>
              <input
                id="date"
                v-model="metadata.date"
                type="date"
                class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label for="url" class="block text-sm font-medium text-slate-700 mb-2">
                Source URL (Optional)
              </label>
              <input
                id="url"
                v-model="metadata.url"
                type="url"
                class="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Tags
            </label>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in availableTags" 
                :key="tag"
                @click="toggleTag(tag)"
                :class="[
                  'px-3 py-1 rounded-full text-sm cursor-pointer transition-colors',
                  selectedTags.includes(tag) 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                ]"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="exclamation-triangle" class="w-4 h-4 mr-2 mt-0.5" color="red-600" />
              <div class="text-sm text-red-800">{{ error }}</div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="check-circle" class="w-4 h-4 mr-2 mt-0.5" color="green-600" />
              <div class="text-sm text-green-800">{{ success }}</div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4">
            <Button 
              type="button"
              @click="resetForm"
              variant="secondary"
              :disabled="uploading"
            >
              Reset
            </Button>
            <Button 
              type="submit"
              variant="primary"
              :disabled="!selectedFile || !selectedType || uploading"
            >
              <Spinner v-if="uploading" class="w-4 h-4 mr-2" color="white" />
              <Icon v-else name="cloud-arrow-up" class="w-4 h-4 mr-2" />
              {{ uploading ? 'Uploading...' : 'Upload Document' }}
            </Button>
          </div>
        </form>
      </div>

      <!-- Upload History -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Recent Uploads</h3>
        <div class="space-y-3">
          <div 
            v-for="upload in recentUploads" 
            :key="upload.id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div class="flex items-center">
              <Icon name="document-text" class="w-4 h-4 mr-3" color="slate-500" />
              <div>
                <p class="text-sm font-medium text-slate-900">{{ upload.title }}</p>
                <p class="text-xs text-slate-500">{{ upload.type }} • {{ upload.timestamp }}</p>
              </div>
            </div>
            <Badge :variant="upload.status" class="w-4 h-4">
              {{ upload.status }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '~/components/atoms/Button.vue'
import Badge from '~/components/atoms/Badge.vue'
import Spinner from '~/components/atoms/Spinner.vue'

// Head
useHead({
  title: 'Upload Documents - Admin - FormReady',
  meta: [
    { name: 'description', content: 'Upload new VA documents to the knowledge base' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const router = useRouter()

// Form state
const selectedType = ref('')
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const metadata = reactive({
  title: '',
  citation: '',
  date: '',
  url: ''
})

const selectedTags = ref<string[]>([])

// Document types
const documentTypes = [
  {
    value: 'CFR38',
    name: 'CFR 38',
    description: 'Code of Federal Regulations',
    icon: 'document-text'
  },
  {
    value: 'DSM5',
    name: 'DSM-5',
    description: 'Diagnostic criteria',
    icon: 'heart'
  },
  {
    value: 'BVA',
    name: 'BVA Cases',
    description: 'Board of Veterans Appeals',
    icon: 'scale'
  },
  {
    value: 'CAVC',
    name: 'CAVC Cases',
    description: 'Court of Appeals',
    icon: 'building-library'
  },
  {
    value: 'VHA',
    name: 'VHA Handbooks',
    description: 'Treatment guidelines',
    icon: 'medical-symbol'
  },
  {
    value: 'USC38',
    name: 'USC 38',
    description: 'United States Code',
    icon: 'book-open'
  }
]

// Available tags
const availableTags = [
  'Mental Health', 'Physical Health', 'Service Connection', 'Appeals', 
  'Rating Criteria', 'Evidence', 'Timeline', 'Benefits'
]

// Recent uploads
const recentUploads = ref([
  {
    id: 1,
    title: 'DSM-5 PTSD Criteria',
    type: 'DSM5',
    timestamp: '2 hours ago',
    status: 'success'
  },
  {
    id: 2,
    title: 'BVA Case 2023-12345',
    type: 'BVA',
    timestamp: '4 hours ago',
    status: 'success'
  }
])

// Check admin session
onMounted(() => {
  const session = localStorage.getItem('admin_session')
  if (!session) {
    router.push('/admin/login')
    return
  }
})

// File handling
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

// Tag handling
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// Upload handler
const handleUpload = async () => {
  if (!selectedFile.value || !selectedType.value) {
    error.value = 'Please select a file and document type'
    return
  }

  uploading.value = true
  error.value = null
  success.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('sourceType', selectedType.value)
    
    if (metadata.title) formData.append('title', metadata.title)
    if (metadata.citation) formData.append('citation', metadata.citation)
    if (metadata.date) formData.append('date', metadata.date)
    if (metadata.url) formData.append('url', metadata.url)
    if (selectedTags.value.length > 0) formData.append('tags', selectedTags.value.join(','))

    const response = await fetch('/api/v1/va-knowledge/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (result.success) {
      success.value = `Document uploaded successfully! ${result.message}`
      resetForm()
    } else {
      error.value = result.error || 'Upload failed'
    }
  } catch (err: any) {
    error.value = 'Upload failed. Please try again.'
    console.error('Upload error:', err)
  } finally {
    uploading.value = false
  }
}

// Reset form
const resetForm = () => {
  selectedFile.value = null
  selectedType.value = ''
  metadata.title = ''
  metadata.citation = ''
  metadata.date = ''
  metadata.url = ''
  selectedTags.value = []
  error.value = null
  success.value = null
}

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
