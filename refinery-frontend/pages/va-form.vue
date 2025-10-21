<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          VA Health Benefits Application
        </h1>
        <p class="text-gray-600">
          Complete your VA Form 10-10EZ online and download a filled PDF
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading form...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="text-red-800">
          <strong>Error:</strong> {{ error }}
        </div>
      </div>

      <!-- Success -->
      <div v-else-if="success" class="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div class="text-green-800">
          <div class="text-4xl mb-3">✅</div>
          <h2 class="text-xl font-semibold mb-2">PDF Generated Successfully!</h2>
          <p class="mb-4">Your filled VA form has been downloaded.</p>
          <button
            @click="resetForm"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fill Another Form
          </button>
        </div>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="submitForm" class="space-y-6">
        <!-- Personal Info -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Personal Information</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Full Name (Last, First, Middle) *
              </label>
              <input
                v-model="formData.full_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Doe, John, Michael"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Social Security Number *
                </label>
                <input
                  v-model="formData.ssn"
                  type="text"
                  required
                  pattern="^\d{3}-\d{2}-\d{4}$"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XXX-XX-XXXX"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  v-model="formData.date_of_birth"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">Mailing Address</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                v-model="formData.mailing_street"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main Street"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  v-model="formData.mailing_city"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Anytown"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  v-model="formData.mailing_state"
                  type="text"
                  required
                  maxlength="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CA"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  v-model="formData.mailing_zip"
                  type="text"
                  required
                  pattern="^\d{5}(-\d{4})?$"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90210"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="text-center">
          <button
            type="submit"
            :disabled="submitting"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition text-lg"
          >
            {{ submitting ? 'Generating PDF...' : 'Generate Filled PDF' }}
          </button>
        </div>
      </form>

      <!-- Debug Info -->
      <div class="mt-8 p-4 bg-gray-100 rounded text-sm">
        <strong>Debug Info:</strong><br>
        Loading: {{ loading }}<br>
        Error: {{ error || 'None' }}<br>
        Success: {{ success }}<br>
        API URL: {{ apiUrl }}
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true)
const error = ref('')
const success = ref(false)
const submitting = ref(false)

const formData = ref({
  full_name: '',
  ssn: '',
  date_of_birth: '',
  email: '',
  home_phone: '',
  mobile_phone: '',
  mailing_street: '',
  mailing_city: '',
  mailing_state: '',
  mailing_zip: ''
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl

// Simple initialization
onMounted(() => {
  loading.value = false
})

async function submitForm() {
  try {
    submitting.value = true
    error.value = ''

    const response = await fetch(`${apiUrl}/forms/va-form-10-10ez-simple/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key-dev-123'
      },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.status}`)
    }

    // Download PDF
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'va-form-filled.pdf'
    a.click()
    URL.revokeObjectURL(url)

    success.value = true

  } catch (err) {
    error.value = `Error: ${err.message}`
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  success.value = false
  formData.value = {
    full_name: '',
    ssn: '',
    date_of_birth: '',
    email: '',
    home_phone: '',
    mobile_phone: '',
    mailing_street: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: ''
  }
}
</script>