<template>
  <div class="p-8 min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ schema?.name || 'VA Health Benefits Application' }}
        </h1>
        <p class="text-lg text-gray-600">
          {{ schema?.description || 'Complete your VA health benefits application online' }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-2xl mx-auto text-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading form...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="success" class="max-w-2xl mx-auto text-center">
      <div class="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold mb-2">PDF Generated Successfully!</h2>
        <p class="mb-4">Your filled VA form has been downloaded to your computer.</p>
        <button @click="resetForm" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Fill Another Form
        </button>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="submitForm" class="max-w-2xl mx-auto space-y-6">
      <!-- Personal Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name (Last, First, Middle) *
            </label>
            <input
              v-model="data.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe, John, Michael"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Social Security Number *
            </label>
            <input
              v-model="data.ssn"
              type="text"
              required
              pattern="^\d{3}-\d{2}-\d{4}$"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XXX-XX-XXXX"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                v-model="data.date_of_birth"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                v-model="data.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Home Phone
              </label>
              <input
                v-model="data.home_phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Mobile Phone
              </label>
              <input
                v-model="data.mobile_phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 987-6543"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">Mailing Address</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              v-model="data.mailing_street"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main Street"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                v-model="data.mailing_city"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anytown"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                v-model="data.mailing_state"
                type="text"
                required
                maxlength="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CA"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                v-model="data.mailing_zip"
                type="text"
                required
                pattern="^\d{5}(-\d{4})?$"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="90210"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="text-center">
        <button
          type="submit"
          :disabled="submitting"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 text-lg"
        >
          {{ submitting ? 'Generating PDF...' : 'Generate Filled PDF' }}
        </button>
      </div>
    </form>

    <!-- Footer -->
    <div class="max-w-2xl mx-auto mt-12 text-center text-sm text-gray-500">
      <p>Powered by <span class="font-semibold text-blue-600">FormReady</span> • Secure & Encrypted</p>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Live Form - FormReady',
  description: 'Fill out and submit form',
  layout: false
})

// Route parameters
const route = useRoute()
const formId = route.params.id

// Reactive data
const loading = ref(true)
const error = ref('')
const success = ref(false)
const submitting = ref(false)
const schema = ref(null)

const data = ref({
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

// Load schema on mount
onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiUrl}/forms/${formId}/schema`, {
      headers: { 'X-API-Key': 'test-api-key-dev-123' }
    })

    if (response.ok) {
      schema.value = await response.json()
    } else {
      error.value = `Failed to load schema: ${response.status}`
    }
  } catch (err) {
    error.value = `Network error: ${err.message}`
  } finally {
    loading.value = false
  }
})

// Submit form
async function submitForm() {
  try {
    submitting.value = true
    error.value = ''

    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiUrl}/forms/${formId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key-dev-123'
      },
      body: JSON.stringify(data.value)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    // Download PDF
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formId}-filled.pdf`
    a.click()
    URL.revokeObjectURL(url)

    success.value = true

  } catch (err) {
    error.value = `Submit failed: ${err.message}`
  } finally {
    submitting.value = false
  }
}

// Reset form
function resetForm() {
  success.value = false
  data.value = {
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