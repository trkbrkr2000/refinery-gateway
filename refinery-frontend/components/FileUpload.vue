<template>
  <div class="file-upload-component">
    <!-- File Drop Zone -->
    <div
      class="drop-zone"
      :class="{
        'drag-over': isDragOver,
        'has-file': selectedFile,
        'loading': state === 'loading',
        'success': state === 'success',
        'error': state === 'error'
      }"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @dragenter.prevent
      @click="triggerFileInput"
    >
      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        accept=".pdf"
        @change="handleFileSelect"
        style="display: none"
      />

      <!-- Loading State -->
      <div v-if="state === 'loading'" class="upload-state loading-state">
        <div class="spinner"></div>
        <h3>Uploading PDF...</h3>
        <p>{{ loadingMessage }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="state === 'success'" class="upload-state success-state">
        <div class="success-icon">✓</div>
        <h3>Upload Successful!</h3>
        <p>{{ successMessage }}</p>
        <div class="upload-details" v-if="uploadResult">
          <p><strong>Form ID:</strong> {{ uploadResult.formId }}</p>
          <p><strong>Fields Found:</strong> {{ uploadResult.fieldsDiscovered }}</p>
          <p><strong>File Size:</strong> {{ formatFileSize(uploadResult.fileSize) }}</p>
        </div>
        <button @click="reset" class="btn btn-secondary">Upload Another</button>
      </div>

      <!-- Error State -->
      <div v-else-if="state === 'error'" class="upload-state error-state">
        <div class="error-icon">✗</div>
        <h3>Upload Failed</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <div class="error-actions">
          <button @click="retry" class="btn btn-primary">Try Again</button>
          <button @click="reset" class="btn btn-secondary">Cancel</button>
        </div>
      </div>

      <!-- Default State -->
      <div v-else class="upload-state default-state">
        <div class="upload-icon">📁</div>
        <h3 v-if="!selectedFile">Drop PDF here or click to browse</h3>
        <h3 v-else>{{ selectedFile.name }}</h3>
        <p v-if="!selectedFile">Supports PDF files up to 10MB</p>
        <p v-else class="file-info">
          {{ formatFileSize(selectedFile.size) }} • Ready to upload
        </p>

        <!-- Form ID Input -->
        <div class="form-id-section" v-if="selectedFile">
          <label for="formId">Form ID:</label>
          <input
            id="formId"
            v-model="formId"
            type="text"
            placeholder="e.g., va-form-21p-527ez"
            class="form-id-input"
            @click.stop
          />
        </div>

        <!-- Upload Button -->
        <button
          v-if="selectedFile && formId"
          @click.stop="uploadFile"
          class="btn btn-primary upload-btn"
        >
          Upload PDF
        </button>
      </div>
    </div>

    <!-- File Validation Messages -->
    <div v-if="validationError" class="validation-error">
      {{ validationError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'

// Props
interface Props {
  apiKey?: string
  apiBaseUrl?: string
  maxFileSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  apiKey: 'test-api-key-dev-123',
  apiBaseUrl: 'http://localhost:3001/api/v1',
  maxFileSize: 10 * 1024 * 1024 // 10MB
})

// Emits
const emit = defineEmits<{
  'upload-success': [data: { formId: string; result: any; file: File }]
  'upload-error': [data: { error: Error; file: File; formId: string }]
  'file-selected': [data: { file: File; formId: string }]
}>()

// Reactive data
const selectedFile = ref<File | null>(null)
const formId = ref('')
const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const isDragOver = ref(false)
const progress = ref(0)
const loadingMessage = ref('Uploading PDF template...')
const successMessage = ref('PDF template uploaded and analyzed successfully!')
const errorMessage = ref('')
const validationError = ref('')
const uploadResult = ref<any>(null)

// Template refs
const fileInput = ref<HTMLInputElement>()

// Methods
const triggerFileInput = () => {
  if (state.value === 'loading') return
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  selectFile(file)
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (state.value === 'loading') return

  const file = event.dataTransfer?.files[0]
  selectFile(file)
}

const selectFile = (file?: File) => {
  validationError.value = ''
  state.value = 'idle'

  if (!file) return

  // Validate file type
  if (file.type !== 'application/pdf') {
    validationError.value = 'Please select a PDF file.'
    return
  }

  // Validate file size
  if (file.size > props.maxFileSize) {
    validationError.value = `File size must be less than ${formatFileSize(props.maxFileSize)}.`
    return
  }

  selectedFile.value = file
  formId.value = generateFormId(file.name)

  emit('file-selected', {
    file: file,
    formId: formId.value
  })
}

const generateFormId = (fileName: string): string => {
  // Generate a reasonable form ID from filename
  return fileName
    .replace('.pdf', '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const uploadFile = async () => {
  if (!selectedFile.value || !formId.value) return

  state.value = 'loading'
  progress.value = 0
  loadingMessage.value = 'Uploading PDF template...'

  try {
    const formData = new FormData()
    formData.append('pdf', selectedFile.value)
    formData.append('formId', formId.value)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 20
      }
    }, 200)

    const response = await $fetch(`${props.apiBaseUrl}/forms/templates/upload`, {
      method: 'POST',
      headers: {
        'X-API-Key': props.apiKey
      },
      body: formData
    })

    clearInterval(progressInterval)
    progress.value = 100

    uploadResult.value = response
    state.value = 'success'
    successMessage.value = (response as any).message || 'PDF template uploaded and analyzed successfully!'

    emit('upload-success', {
      formId: formId.value,
      result: response,
      file: selectedFile.value
    })

  } catch (error: any) {
    console.error('Upload failed:', error)
    state.value = 'error'
    errorMessage.value = error?.data?.message || error?.message || 'An unexpected error occurred during upload.'

    emit('upload-error', {
      error: error,
      file: selectedFile.value,
      formId: formId.value
    })
  }
}

const retry = () => {
  state.value = 'idle'
  progress.value = 0
  errorMessage.value = ''
}

const reset = () => {
  selectedFile.value = null
  formId.value = ''
  state.value = 'idle'
  progress.value = 0
  isDragOver.value = false
  errorMessage.value = ''
  validationError.value = ''
  uploadResult.value = null

  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Expose methods for parent components
defineExpose({
  reset,
  retry
})
</script>

<style scoped>
.file-upload-component {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: #6366f1;
  background: #f8faff;
}

.drop-zone.drag-over {
  border-color: #6366f1;
  background: #f0f4ff;
  transform: scale(1.02);
}

.drop-zone.loading {
  border-color: #3b82f6;
  background: #eff6ff;
  cursor: not-allowed;
}

.drop-zone.success {
  border-color: #10b981;
  background: #f0fdf4;
}

.drop-zone.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.upload-state {
  width: 100%;
}

.upload-state h3 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
}

.upload-state p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Loading State */
.loading-state {
  color: #3b82f6;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* Success State */
.success-state {
  color: #10b981;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem auto;
}

.upload-details {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
}

.upload-details p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
}

/* Error State */
.error-state {
  color: #ef4444;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem auto;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

/* Default State */
.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.file-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.form-id-section {
  margin: 1.5rem 0;
  text-align: left;
}

.form-id-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-id-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;
}

.form-id-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #5856eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #5b6471;
}

.upload-btn {
  margin-top: 1rem;
}

/* Validation Error */
.validation-error {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
}

/* Responsive */
@media (max-width: 640px) {
  .drop-zone {
    padding: 1.5rem;
    min-height: 180px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
}
</style>