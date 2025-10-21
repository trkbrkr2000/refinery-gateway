<template>
  <div class="create-form">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div class="breadcrumb">
          <NuxtLink to="/forms" class="breadcrumb-link">Forms</NuxtLink>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Create New Form</span>
        </div>
        <h1 class="page-title">Create New Form</h1>
        <p class="page-subtitle">
          Upload a PDF form template and we'll automatically create an intelligent web form
        </p>
      </div>

      <!-- Creation Flow -->
      <div class="creation-flow">
        <!-- Step Indicator -->
        <div class="steps-indicator">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">Upload PDF</div>
          </div>
          <div class="step-connector" :class="{ completed: currentStep > 1 }"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">Field Discovery</div>
          </div>
          <div class="step-connector" :class="{ completed: currentStep > 2 }"></div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-number">3</div>
            <div class="step-label">Configuration</div>
          </div>
          <div class="step-connector" :class="{ completed: currentStep > 3 }"></div>
          <div class="step" :class="{ active: currentStep >= 4 }">
            <div class="step-number">4</div>
            <div class="step-label">Complete</div>
          </div>
        </div>

        <!-- Step 1: Upload PDF -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="upload-section">
            <div class="upload-header">
              <h2>Upload PDF Template</h2>
              <p>Select a PDF form that contains fillable fields. We'll analyze it and create a web form automatically.</p>
            </div>

            <div class="upload-area" :class="{ 'drag-over': dragOver, 'has-file': selectedFile }">
              <input
                ref="fileInput"
                type="file"
                accept=".pdf"
                @change="handleFileSelect"
                style="display: none"
              >

              <div v-if="!selectedFile" class="upload-prompt" @click="$refs.fileInput.click()">
                <div class="upload-icon">📄</div>
                <h3>Drop your PDF here or click to browse</h3>
                <p>Supports PDF files up to 10MB with fillable form fields</p>
                <button class="btn btn-secondary">Choose PDF File</button>
              </div>

              <div v-else class="file-preview">
                <div class="file-info">
                  <div class="file-icon">📄</div>
                  <div class="file-details">
                    <div class="file-name">{{ selectedFile.name }}</div>
                    <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <button class="remove-file" @click="removeFile">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-metadata">
              <div class="form-group">
                <label class="form-label">Form ID</label>
                <input
                  v-model="formId"
                  type="text"
                  class="form-input"
                  placeholder="e.g., employee-info-form"
                  :class="{ error: errors.formId }"
                >
                <p v-if="errors.formId" class="error-message">{{ errors.formId }}</p>
                <p class="help-text">A unique identifier for your form (lowercase, hyphens allowed)</p>
              </div>

              <div class="form-group">
                <label class="form-label">Form Title</label>
                <input
                  v-model="formTitle"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Employee Information Form"
                  :class="{ error: errors.formTitle }"
                >
                <p v-if="errors.formTitle" class="error-message">{{ errors.formTitle }}</p>
              </div>

              <div class="form-group">
                <label class="form-label">Description (Optional)</label>
                <textarea
                  v-model="formDescription"
                  class="form-textarea"
                  rows="3"
                  placeholder="Brief description of what this form is used for..."
                ></textarea>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-primary" @click="uploadPDF" :disabled="!canProceed || uploading">
                <div v-if="uploading" class="loading-spinner"></div>
                {{ uploading ? 'Uploading...' : 'Upload & Analyze PDF' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Field Discovery -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="discovery-section">
            <div class="discovery-header">
              <h2>Field Discovery Complete</h2>
              <p>We found {{ discoveredFields.length }} form fields in your PDF. Review and customize them below.</p>
            </div>

            <div class="fields-preview">
              <div class="fields-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ discoveredFields.length }}</span>
                  <span class="stat-label">Total Fields</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ requiredFields }}</span>
                  <span class="stat-label">Required</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ uniqueFieldTypes }}</span>
                  <span class="stat-label">Field Types</span>
                </div>
              </div>

              <div class="fields-list">
                <div
                  v-for="(field, index) in discoveredFields"
                  :key="index"
                  class="field-item"
                >
                  <div class="field-info">
                    <div class="field-name">{{ field.name }}</div>
                    <div class="field-type">{{ field.suggestedFormType }}</div>
                  </div>
                  <div class="field-actions">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="field.required">
                      Required
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-outline" @click="currentStep = 1">
                Back
              </button>
              <button class="btn btn-primary" @click="buildSchema" :disabled="building">
                <div v-if="building" class="loading-spinner"></div>
                {{ building ? 'Building Schema...' : 'Build Form Schema' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Configuration -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="config-section">
            <div class="config-header">
              <h2>Form Configuration</h2>
              <p>Customize your form settings and appearance before going live.</p>
            </div>

            <div class="config-form">
              <div class="config-group">
                <h3>Form Settings</h3>
                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="config.allowDrafts">
                    Allow users to save drafts
                  </label>
                  <p class="setting-description">Users can save their progress and return later</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="config.requireAuth">
                    Require authentication
                  </label>
                  <p class="setting-description">Only logged-in users can submit forms</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">
                    <input type="checkbox" v-model="config.generatePDF">
                    Generate filled PDF after submission
                  </label>
                  <p class="setting-description">Automatically create PDF with user data</p>
                </div>
              </div>

              <div class="config-group">
                <h3>Notifications</h3>
                <div class="form-group">
                  <label class="form-label">Notification Email</label>
                  <input
                    v-model="config.notificationEmail"
                    type="email"
                    class="form-input"
                    placeholder="admin@company.com"
                  >
                  <p class="help-text">Email to notify when forms are submitted</p>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn btn-outline" @click="currentStep = 2">
                Back
              </button>
              <button class="btn btn-primary" @click="completeForm">
                Create Form
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Complete -->
        <div v-if="currentStep === 4" class="step-content">
          <div class="complete-section">
            <div class="success-icon">✅</div>
            <h2>Form Created Successfully!</h2>
            <p>Your form is now live and ready to receive submissions.</p>

            <div class="form-summary">
              <div class="summary-item">
                <strong>Form ID:</strong> {{ formId }}
              </div>
              <div class="summary-item">
                <strong>Title:</strong> {{ formTitle }}
              </div>
              <div class="summary-item">
                <strong>Fields:</strong> {{ discoveredFields.length }} fields discovered
              </div>
              <div class="summary-item">
                <strong>Status:</strong> Active
              </div>
            </div>

            <div class="next-steps">
              <h3>Next Steps</h3>
              <ul>
                <li>Share your form URL with users</li>
                <li>Monitor submissions in the dashboard</li>
                <li>Download filled PDFs as needed</li>
                <li>Customize styling and branding</li>
              </ul>
            </div>

            <div class="step-actions">
              <NuxtLink :to="`/forms/${formId}`" class="btn btn-primary">
                View Form Details
              </NuxtLink>
              <NuxtLink to="/forms" class="btn btn-outline">
                Back to Forms
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Create New Form - FormReady',
  description: 'Upload a PDF template and create an intelligent web form'
})

// Reactive data
const currentStep = ref(1)
const selectedFile = ref<File | null>(null)
const formId = ref('')
const formTitle = ref('')
const formDescription = ref('')
const dragOver = ref(false)
const uploading = ref(false)
const building = ref(false)
const errors = ref<Record<string, string>>({})

const discoveredFields = ref([
  { name: 'firstName', type: 'text', suggestedFormType: 'text', required: true },
  { name: 'lastName', type: 'text', suggestedFormType: 'text', required: true },
  { name: 'email', type: 'text', suggestedFormType: 'email', required: true },
  { name: 'phoneNumber', type: 'text', suggestedFormType: 'tel', required: false }
])

const config = ref({
  allowDrafts: true,
  requireAuth: false,
  generatePDF: true,
  notificationEmail: ''
})

// Computed properties
const canProceed = computed(() => {
  return selectedFile.value && formId.value && formTitle.value && !hasErrors.value
})

const hasErrors = computed(() => {
  return Object.keys(errors.value).length > 0
})

const requiredFields = computed(() => {
  return discoveredFields.value.filter(field => field.required).length
})

const uniqueFieldTypes = computed(() => {
  const types = new Set(discoveredFields.value.map(field => field.suggestedFormType))
  return types.size
})

// Methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    validateFile()
  }
}

const removeFile = () => {
  selectedFile.value = null
  errors.value = {}
}

const validateFile = () => {
  errors.value = {}

  if (selectedFile.value) {
    if (selectedFile.value.type !== 'application/pdf') {
      errors.value.file = 'Please select a PDF file'
    }

    if (selectedFile.value.size > 10 * 1024 * 1024) { // 10MB
      errors.value.file = 'File size must be less than 10MB'
    }
  }
}

const validateForm = () => {
  errors.value = {}

  if (!formId.value) {
    errors.value.formId = 'Form ID is required'
  } else if (!/^[a-z0-9-]+$/.test(formId.value)) {
    errors.value.formId = 'Form ID must contain only lowercase letters, numbers, and hyphens'
  }

  if (!formTitle.value) {
    errors.value.formTitle = 'Form title is required'
  }
}

const uploadPDF = async () => {
  validateForm()

  if (!canProceed.value) return

  uploading.value = true

  try {
    // Simulate upload and field discovery
    await new Promise(resolve => setTimeout(resolve, 2000))

    // TODO: Implement actual API call
    // const formData = new FormData()
    // formData.append('pdf', selectedFile.value)
    // formData.append('formId', formId.value)
    // const response = await $fetch('/api/v1/forms/templates/upload', {
    //   method: 'POST',
    //   body: formData
    // })

    currentStep.value = 2
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    uploading.value = false
  }
}

const buildSchema = async () => {
  building.value = true

  try {
    // Simulate schema building
    await new Promise(resolve => setTimeout(resolve, 1500))

    // TODO: Implement actual API call
    // await $fetch(`/api/v1/forms/${formId.value}/build-schema`, {
    //   method: 'POST'
    // })

    currentStep.value = 3
  } catch (error) {
    console.error('Schema building failed:', error)
  } finally {
    building.value = false
  }
}

const completeForm = () => {
  currentStep.value = 4
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Auto-generate form ID from title
watch(formTitle, (newTitle) => {
  if (newTitle && !formId.value) {
    formId.value = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
})
</script>

<style scoped>
.create-form {
  min-height: 100vh;
  background: #f8faff;
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.breadcrumb {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb-separator {
  color: #6b7280;
}

.breadcrumb-current {
  color: #374151;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  transition: all 0.2s ease;
}

.step.active .step-number,
.step.completed .step-number {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.step.active .step-label,
.step.completed .step-label {
  color: #111827;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin: 0 1rem;
  transition: background 0.2s ease;
}

.step-connector.completed {
  background: #667eea;
}

/* Step Content */
.step-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-header,
.discovery-header,
.config-header {
  text-align: center;
  margin-bottom: 2rem;
}

.upload-header h2,
.discovery-header h2,
.config-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

/* Upload Area */
.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8faff;
}

.upload-area.drag-over {
  border-color: #667eea;
  background: #f0f9ff;
}

.upload-area.has-file {
  border-style: solid;
  border-color: #10b981;
  background: #f0fdf4;
  cursor: default;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-prompt h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-icon {
  font-size: 2rem;
}

.file-name {
  font-weight: 500;
  color: #111827;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.remove-file {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
}

/* Form Groups */
.form-metadata {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #111827;
}

.form-input,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #ef4444;
}

.help-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.error-message {
  font-size: 0.875rem;
  color: #ef4444;
}

/* Fields Preview */
.fields-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  display: block;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.field-name {
  font-weight: 500;
  color: #111827;
}

.field-type {
  font-size: 0.875rem;
  color: #6b7280;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

/* Configuration */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.config-group h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.setting-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.setting-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 1.5rem;
}

/* Complete Section */
.complete-section {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.complete-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.form-summary {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
  text-align: left;
}

.summary-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.summary-item:last-child {
  border-bottom: none;
}

.next-steps {
  text-align: left;
  margin: 2rem 0;
}

.next-steps h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.next-steps ul {
  list-style: none;
  padding: 0;
}

.next-steps li {
  padding: 0.5rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.next-steps li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

/* Step Actions */
.step-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .steps-indicator {
    padding: 1rem;
  }

  .step {
    min-width: 60px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .step-connector {
    margin: 0 0.5rem;
  }

  .step-content {
    padding: 1.5rem;
  }

  .fields-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .step-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>