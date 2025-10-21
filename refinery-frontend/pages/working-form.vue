<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Working VA Form Test</h1>

    <div v-if="loading" class="text-center p-4">
      Loading form schema...
    </div>

    <div v-else-if="error" class="bg-red-100 p-4 rounded text-red-800">
      Error: {{ error }}
    </div>

    <div v-else-if="success" class="bg-green-100 p-4 rounded text-green-800">
      ✅ PDF generated and downloaded successfully!
    </div>

    <form v-else @submit.prevent="submitForm" class="space-y-4">
      <div class="bg-white p-6 rounded shadow">
        <h2 class="text-xl mb-4">{{ schema?.name || 'VA Health Benefits Form' }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block font-medium mb-1">Full Name *</label>
            <input v-model="data.full_name" type="text" required class="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label class="block font-medium mb-1">SSN *</label>
            <input v-model="data.ssn" type="text" required pattern="^\d{3}-\d{2}-\d{4}$" placeholder="XXX-XX-XXXX" class="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label class="block font-medium mb-1">Date of Birth *</label>
            <input v-model="data.date_of_birth" type="date" required class="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label class="block font-medium mb-1">Email</label>
            <input v-model="data.email" type="email" class="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label class="block font-medium mb-1">Street Address *</label>
            <input v-model="data.mailing_street" type="text" required class="w-full border rounded px-3 py-2" />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block font-medium mb-1">City *</label>
              <input v-model="data.mailing_city" type="text" required class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block font-medium mb-1">State *</label>
              <input v-model="data.mailing_state" type="text" required maxlength="2" class="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label class="block font-medium mb-1">ZIP *</label>
              <input v-model="data.mailing_zip" type="text" required class="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {{ submitting ? 'Generating PDF...' : 'Generate PDF' }}
        </button>
      </div>
    </form>

    <div class="mt-4 p-4 bg-gray-100 rounded text-sm">
      <strong>Debug:</strong>
      <br>Loading: {{ loading }}
      <br>Schema loaded: {{ !!schema }}
      <br>Error: {{ error || 'None' }}
    </div>
  </div>
</template>

<script setup>
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
  mailing_street: '',
  mailing_city: '',
  mailing_state: '',
  mailing_zip: ''
})

// Load schema on mount
onMounted(async () => {
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiUrl}/forms/va-form-10-10ez-simple/schema`, {
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

async function submitForm() {
  try {
    submitting.value = true
    error.value = ''

    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiUrl}/forms/va-form-10-10ez-simple/generate`, {
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
    a.download = 'va-form-filled.pdf'
    a.click()
    URL.revokeObjectURL(url)

    success.value = true

  } catch (err) {
    error.value = `Submit failed: ${err.message}`
  } finally {
    submitting.value = false
  }
}
</script>