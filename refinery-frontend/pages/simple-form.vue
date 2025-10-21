<template>
  <div class="container mx-auto p-8">
    <h1 class="text-3xl font-bold mb-6">VA Health Benefits Form (Simple)</h1>

    <div v-if="loading" class="text-center">
      <p>Loading form...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Personal Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Personal Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              v-model="formData.full_name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Last, First, Middle"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Social Security Number *
            </label>
            <input
              v-model="formData.ssn"
              type="text"
              required
              pattern="^\d{3}-\d{2}-\d{4}$"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XXX-XX-XXXX"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              v-model="formData.date_of_birth"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              v-model="formData.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@example.com"
            />
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Address Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              v-model="formData.mailing_street"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              v-model="formData.mailing_city"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Anytown"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              v-model="formData.mailing_state"
              type="text"
              required
              maxlength="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <input
              v-model="formData.mailing_zip"
              type="text"
              required
              pattern="^\d{5}(-\d{4})?$"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="90210"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-center">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
        >
          {{ isSubmitting ? 'Generating PDF...' : 'Generate PDF' }}
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="pdfGenerated" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ PDF generated successfully! Check your downloads.
      </div>
    </form>
  </div>
</template>

<script setup>
const loading = ref(false)
const error = ref('')
const isSubmitting = ref(false)
const pdfGenerated = ref(false)

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

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = ''
    pdfGenerated.value = false

    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

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

    // Download the PDF
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'va-form-filled.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    pdfGenerated.value = true

  } catch (err) {
    console.error('Form submission failed:', err)
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>