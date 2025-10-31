<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading form...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Form</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink to="/" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Home
        </NuxtLink>
      </div>

      <!-- Form Content -->
      <div v-else-if="schema">
        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <NuxtLink to="/" class="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Forms
          </NuxtLink>

          <h1 class="text-4xl font-bold text-gray-900 mb-2 mt-4">
            {{ schema.name }}
          </h1>
          <p class="text-lg text-gray-600">
            {{ schema.description }}
          </p>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white rounded-xl shadow p-6 mb-6">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {{ currentStep + 1 }} of {{ schema.sections.length }}</span>
            <span>{{ Math.round(progress) }}% Complete</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-blue-600 h-3 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Current Section -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">
            {{ currentSection.name }}
          </h2>
          <p v-if="currentSection.description" class="text-gray-600 mb-8">
            {{ currentSection.description }}
          </p>

          <!-- Fields -->
          <div class="space-y-6">
            <div v-for="field in currentSection.fields" :key="field.id" class="form-field">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>

              <!-- Text Input -->
              <input
                v-if="field.type === 'text'"
                v-model="formData[field.id]"
                type="text"
                :required="field.required"
                :pattern="field.pattern"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :placeholder="field.help"
              />

              <!-- Date Input -->
              <input
                v-else-if="field.type === 'date'"
                v-model="formData[field.id]"
                type="date"
                :required="field.required"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <!-- Checkbox -->
              <div v-else-if="field.type === 'checkbox'" class="flex items-center">
                <input
                  v-model="formData[field.id]"
                  type="checkbox"
                  :required="field.required"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-3 text-gray-700">{{ field.help }}</span>
              </div>

              <!-- Help Text -->
              <p v-if="field.help && field.type !== 'checkbox'" class="text-sm text-gray-500 mt-1">
                {{ field.help }}
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center">
          <button
            v-if="currentStep > 0"
            @click="previousStep"
            class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            ← Previous
          </button>

          <div class="flex-1"></div>

          <button
            v-if="currentStep < schema.sections.length - 1"
            @click="nextStep"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Next →
          </button>

          <button
            v-else
            @click="generatePDF"
            :disabled="isGenerating"
            class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg v-if="!isGenerating" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span v-if="isGenerating">Generating...</span>
            <span v-else>Generate PDF</span>
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 flex items-center">
          <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-green-800">{{ successMessage }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-6 bg-red-50 border border-red-200 rounded-xl p-6 flex items-center">
          <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-red-800">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const config = useRuntimeConfig()

const formId = route.params.id
const schema = ref(null)
const formData = ref({})
const currentStep = ref(0)
const loading = ref(true)
const error = ref(null)
const isGenerating = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const currentSection = computed(() => {
  return schema.value?.sections[currentStep.value]
})

const progress = computed(() => {
  if (!schema.value) return 0
  return ((currentStep.value + 1) / schema.value.sections.length) * 100
})

// Load form schema
onMounted(async () => {
  try {
    const apiUrl = config.public.apiUrl
    const response = await fetch(`${apiUrl}/api/forms/${formId}/schema`)

    if (!response.ok) {
      throw new Error(`Failed to load form: ${response.statusText}`)
    }

    schema.value = await response.json()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

function nextStep() {
  if (currentStep.value < schema.value.sections.length - 1) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function generatePDF() {
  isGenerating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const apiUrl = config.public.apiUrl
    const response = await fetch(`${apiUrl}/api/forms/${formId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    })

    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    // Download the PDF
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formId}-filled.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    successMessage.value = 'PDF downloaded successfully! Check your downloads folder.'
  } catch (err) {
    errorMessage.value = err.message || 'Failed to generate PDF. Please try again.'
  } finally {
    isGenerating.value = false
  }
}

useHead({
  title: () => schema.value ? `${schema.value.name} - FormReady` : 'Form - FormReady',
  meta: [
    { name: 'description', content: 'Fill out your form online and download a perfectly filled PDF' }
  ]
})
</script>
