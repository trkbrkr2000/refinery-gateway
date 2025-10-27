<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-slate-900 mb-2">Upload Your Decision Letter</h2>
      <p class="text-slate-600">
        Upload your VA decision letter PDF (typically starts with "We made a decision on your VA benefits")
      </p>
    </div>

    <!-- File Upload Area -->
    <div
      @drop.prevent="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      :class="uploadAreaClasses"
      @click="$refs.fileInput.click()"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf"
        @change="handleFileSelect"
        class="hidden"
      />

      <div v-if="!selectedFile">
        <Icon name="heroicons:document" class="w-8 h-8 mx-auto mb-4" color="slate-400" />
        <p class="text-lg text-slate-700 mb-2">Drop your decision letter here or click to browse</p>
        <p class="text-sm text-slate-500">PDF files only</p>
      </div>

      <div v-else class="flex items-center justify-center">
        <Icon name="checkmark" class="w-6 h-6 mr-3" color="green-500" />
        <div class="text-left">
          <p class="text-lg font-semibold text-slate-900">{{ selectedFile.name }}</p>
          <p class="text-sm text-slate-500">{{ formatFileSize(selectedFile.size) }}</p>
        </div>
      </div>
    </div>

    <!-- Analyze Button -->
    <Button
      v-if="selectedFile"
      @click="handleAnalyze"
      :disabled="uploading"
      variant="primary"
      class="w-full mt-6"
    >
      <Icon v-if="uploading" name="clock" class="w-4 h-4 mr-2" />
      {{ uploading ? 'Uploading...' : 'Analyze Decision Letter' }}
    </Button>

    <!-- Error Message -->
    <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <Icon name="exclamation" class="w-4 h-4 mr-2" color="red-600" />
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '../atoms/Button.vue'

interface Props {
  uploading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  uploading: false,
  error: null
})

const emit = defineEmits<{
  fileSelect: [file: File]
  analyze: []
}>()

const selectedFile = ref<File | null>(null)
const dragover = ref(false)

const uploadAreaClasses = computed(() => {
  const baseClasses = 'border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer'
  const dragoverClasses = dragover.value ? 'border-indigo-500 bg-indigo-50' : ''
  return `${baseClasses} ${dragoverClasses}`
})

const handleDrop = (e: DragEvent) => {
  dragover.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0].type === 'application/pdf') {
    selectedFile.value = files[0]
    emit('fileSelect', files[0])
  } else {
    emit('fileSelect', null as any) // This will trigger error handling in parent
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    emit('fileSelect', files[0])
  }
}

const handleAnalyze = () => {
  if (selectedFile.value) {
    emit('analyze')
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Handle drag events
const handleDragEnter = () => {
  dragover.value = true
}

const handleDragLeave = () => {
  dragover.value = false
}

// Add drag event listeners
onMounted(() => {
  const uploadArea = document.querySelector('[data-upload-area]')
  if (uploadArea) {
    uploadArea.addEventListener('dragenter', handleDragEnter)
    uploadArea.addEventListener('dragleave', handleDragLeave)
  }
})
</script>
