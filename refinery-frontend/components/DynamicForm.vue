<template>
  <div class="max-w-3xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">
        {{ schema?.name || 'Loading...' }}
      </h1>
      <p v-if="schema?.description" class="text-lg text-gray-600">
        {{ schema.description }}
      </p>
    </div>

    <!-- Auth Notice -->
    <div v-if="!authStore.isAuthenticated" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-blue-800">
            <NuxtLink to="/auth/register" class="font-medium underline">Create an account</NuxtLink>
            or
            <NuxtLink to="/auth/login" class="font-medium underline">sign in</NuxtLink>
            to save drafts and track your submissions.
          </p>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="schema" class="mb-8">
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>Section {{ currentSection + 1 }} of {{ schema.sections.length }}</span>
        <span>{{ Math.round(progress) }}% Complete</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="bg-blue-600 h-3 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Draft Notice -->
    <div v-if="draftLoaded" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800">Draft loaded! Your previous progress has been restored.</p>
        </div>
      </div>
    </div>

    <!-- Current Section -->
    <div v-if="currentSectionData" class="bg-white rounded-xl shadow-lg p-8 mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ currentSectionData.name }}
      </h2>
      <p v-if="currentSectionData.description" class="text-gray-600 mb-6">
        {{ currentSectionData.description }}
      </p>

      <!-- Fields -->
      <div class="space-y-6">
        <div v-for="field in currentSectionData.fields" :key="field.id" class="field-container">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>

          <!-- Text Input -->
          <input
            v-if="field.type === 'text'"
            v-model="formData[field.id]"
            :required="field.required"
            :pattern="field.pattern"
            @input="validateField(field); autoSaveDraft()"
            @blur="validateField(field)"
            :class="getFieldClasses(field)"
            :placeholder="field.help"
          />

          <!-- Date Input -->
          <input
            v-else-if="field.type === 'date'"
            v-model="formData[field.id]"
            type="date"
            :required="field.required"
            @input="validateField(field); autoSaveDraft()"
            @blur="validateField(field)"
            :class="getFieldClasses(field)"
          />

          <!-- Checkbox -->
          <div v-else-if="field.type === 'checkbox'" class="flex items-center space-x-3">
            <input
              v-model="formData[field.id]"
              type="checkbox"
              :required="field.required"
              @change="validateField(field); autoSaveDraft()"
              :class="getCheckboxClasses(field)"
            />
            <label class="text-sm text-gray-700">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>
          </div>

          <!-- Select Dropdown -->
          <select
            v-else-if="field.type === 'select'"
            v-model="formData[field.id]"
            :required="field.required"
            @change="validateField(field); autoSaveDraft()"
            @blur="validateField(field)"
            :class="getFieldClasses(field)"
          >
            <option value="">Select...</option>
            <option
              v-for="option in field.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <!-- Field Error Message -->
          <div v-if="fieldErrors[field.id]" class="mt-1 text-sm text-red-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ fieldErrors[field.id] }}
          </div>

          <!-- Help Text -->
          <p v-if="field.help && !fieldErrors[field.id]" class="text-sm text-gray-500 mt-1">
            {{ field.help }}
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between items-center">
      <button
        v-if="currentSection > 0"
        @click="previousSection"
        class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
      >
        ← Back
      </button>

      <div class="flex-1 flex justify-center">
        <button
          v-if="authStore.isAuthenticated && !isLastSection"
          @click="saveDraft"
          :disabled="isSavingDraft"
          class="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium transition disabled:opacity-50"
        >
          {{ isSavingDraft ? 'Saving...' : 'Save Draft' }}
        </button>
      </div>

      <button
        v-if="!isLastSection"
        @click="nextSection"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
      >
        Next →
      </button>

      <button
        v-else
        @click="generatePDF"
        :disabled="isGenerating"
        class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isGenerating ? 'Generating PDF...' : 'Generate PDF ✓' }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-800">{{ errorMessage }}</p>
    </div>

    <!-- Draft Auto-save indicator -->
    <div v-if="(authStore.isAuthenticated || guestAuth.isGuestSession.value) && lastSaved" class="mt-4 text-center text-sm text-gray-500">
      Draft last saved: {{ formatTime(lastSaved) }}
    </div>
    
    <!-- Guest Auth Migration Component -->
    <GuestAuthMigration />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { debounce } from 'lodash-es'
import type { FormSchema, FormSection } from '~/types/form'

const props = defineProps<{
  formId: string
}>()

const authStore = useAuthStore()
const config = useRuntimeConfig()
const guestAuth = useGuestAuthMigration()
const toast = useToast()

const schema = ref<FormSchema | null>(null)
const formData = ref<Record<string, any>>({})
const currentSection = ref(0)
const isGenerating = ref(false)
const isSavingDraft = ref(false)
const errorMessage = ref('')
const draftLoaded = ref(false)
const lastSaved = ref<Date | null>(null)
const fieldErrors = ref<Record<string, string>>({})

const currentSectionData = computed((): FormSection | undefined => {
  return schema.value?.sections[currentSection.value]
})

const isLastSection = computed((): boolean => {
  if (!schema.value) return false
  return currentSection.value === schema.value.sections.length - 1
})

const progress = computed((): number => {
  if (!schema.value) return 0
  return ((currentSection.value + 1) / schema.value.sections.length) * 100
})

// Auto-save draft with debounce
const autoSaveDraft = debounce(() => {
  if (authStore.isAuthenticated) {
    saveDraft()
  } else if (guestAuth.isGuestSession.value) {
    // Save to guest session
    guestAuth.autoSaveGuestData(props.formId, formData.value)
  }
}, 2000)

// Validation functions
function validateField(field: any) {
  const value = formData.value[field.id]
  let error = ''

  // Required field validation
  if (field.required && (!value || value === '')) {
    error = `${field.label} is required`
  }
  // Pattern validation for text fields
  else if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
    if (field.id === 'ssn') {
      error = 'Please enter SSN in format XXX-XX-XXXX'
    } else if (field.id === 'phone_number') {
      error = 'Please enter phone number in format XXX-XXX-XXXX'
    } else if (field.id === 'zip_code') {
      error = 'Please enter ZIP code in format XXXXX or XXXXX-XXXX'
    } else if (field.id === 'email') {
      error = 'Please enter a valid email address'
    } else {
      error = 'Please enter a valid format'
    }
  }
  // Date validation
  else if (field.type === 'date' && value) {
    const date = new Date(value)
    const today = new Date()
    if (date > today) {
      error = 'Date cannot be in the future'
    }
  }

  // Update field errors
  if (error) {
    fieldErrors.value[field.id] = error
  } else {
    delete fieldErrors.value[field.id]
  }
}

function getFieldClasses(field: any) {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition'
  const hasError = fieldErrors.value[field.id]
  
  if (hasError) {
    return `${baseClasses} border-red-300 focus:ring-red-500 bg-red-50`
  } else {
    return `${baseClasses} border-gray-300 focus:ring-blue-500`
  }
}

function getCheckboxClasses(field: any) {
  const baseClasses = 'w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
  const hasError = fieldErrors.value[field.id]
  
  if (hasError) {
    return `${baseClasses} border-red-300`
  } else {
    return baseClasses
  }
}

function validateCurrentSection() {
  if (!currentSectionData.value) return false
  
  let hasErrors = false
  for (const field of currentSectionData.value.fields) {
    validateField(field)
    if (fieldErrors.value[field.id]) {
      hasErrors = true
    }
  }
  
  return !hasErrors
}

async function loadSchema() {
  try {
    const response = await $fetch(`${config.public.apiUrl}/api/v1/forms/${props.formId}/schema`, {
      headers: authStore.getAuthHeaders()
    })
    schema.value = response
  } catch (error) {
    console.error('Failed to load schema:', error)
    errorMessage.value = 'Failed to load form. Please refresh the page.'
  }
}

async function loadDraft() {
  if (authStore.isAuthenticated) {
    try {
      const draft = await $fetch(`${config.public.apiUrl}/api/v1/forms/${props.formId}/drafts`, {
        headers: authStore.getAuthHeaders()
      })

      if (draft && draft.data) {
        formData.value = { ...draft.data }
        draftLoaded.value = true
        lastSaved.value = new Date(draft.updatedAt)

        // Hide draft notice after 5 seconds
        setTimeout(() => {
          draftLoaded.value = false
        }, 5000)
      }
    } catch (error) {
      // No draft found or error loading - not a problem
      console.log('No draft found or error loading draft:', error)
    }
  } else if (guestAuth.isGuestSession.value) {
    // Load guest data
    const guestData = guestAuth.getGuestData(props.formId)
    if (guestData) {
      formData.value = { ...guestData }
      draftLoaded.value = true
      lastSaved.value = new Date()

      // Hide draft notice after 5 seconds
      setTimeout(() => {
        draftLoaded.value = false
      }, 5000)
    }
  }
}

async function saveDraft() {
  if (!authStore.isAuthenticated || isSavingDraft.value) return

  isSavingDraft.value = true

  try {
    await $fetch(`${config.public.apiUrl}/api/v1/forms/${props.formId}/drafts`, {
      method: 'POST',
      headers: authStore.getAuthHeaders(),
      body: {
        data: formData.value,
        version: schema.value?.version || '1.0.0'
      }
    })

    lastSaved.value = new Date()
    toast.success('Draft Saved', 'Your progress has been saved.')
  } catch (error) {
    console.error('Failed to save draft:', error)
    toast.error('Save Failed', 'Could not save your draft. Please try again.')
  } finally {
    isSavingDraft.value = false
  }
}

function nextSection() {
  if (!isLastSection.value) {
    // Validate current section before proceeding
    if (!validateCurrentSection()) {
      // Scroll to first error field
      const firstErrorField = document.querySelector('.field-container .border-red-300')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    currentSection.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Auto-save when moving to next section
    if (authStore.isAuthenticated) {
      autoSaveDraft()
    }
  }
}

function previousSection() {
  if (currentSection.value > 0) {
    currentSection.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function generatePDF() {
  // Validate final section before generating PDF
  if (!validateCurrentSection()) {
    const firstErrorField = document.querySelector('.field-container .border-red-300')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  isGenerating.value = true
  errorMessage.value = ''

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add auth headers if user is authenticated
    if (authStore.isAuthenticated) {
      Object.assign(headers, authStore.getAuthHeaders())
    } else {
      // Use API key for guests
      headers['X-API-Key'] = 'test-api-key-dev-123'
    }

    const response = await fetch(`${config.public.apiUrl}/api/v1/forms/${props.formId}/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      throw new Error('PDF generation failed')
    }

    // Download PDF
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.formId}-filled.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    // Clear draft after successful submission if user is authenticated
    if (authStore.isAuthenticated) {
      try {
        await $fetch(`${config.public.apiUrl}/api/v1/forms/${props.formId}/drafts`, {
          method: 'DELETE',
          headers: authStore.getAuthHeaders()
        })
      } catch (error) {
        console.log('No draft to clear or error clearing draft')
      }
    }

    // Show success toast and redirect
    toast.success('PDF Generated!', 'Your form has been successfully processed.')
    
    // Redirect to success page
    await navigateTo(`/forms/${props.formId}/success`)

  } catch (error) {
    console.error('Failed to generate PDF:', error)
    toast.error('PDF Generation Failed', 'Please check your inputs and try again.')
  } finally {
    isGenerating.value = false
  }
}

function formatTime(date: Date): string {
  return date.toLocaleString()
}

onMounted(async () => {
  await loadSchema()
  await loadDraft()
})

// Watch for auth changes to load drafts
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadDraft()
  }
}, { immediate: false })
</script>