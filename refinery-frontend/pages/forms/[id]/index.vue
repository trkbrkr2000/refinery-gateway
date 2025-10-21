<template>
  <div class="p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <nav class="text-sm breadcrumbs mb-4">
          <NuxtLink to="/forms" class="text-blue-600 hover:text-blue-800">← Back to Forms</NuxtLink>
        </nav>

        <div class="bg-white rounded-lg shadow p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ formTitle }}
          </h1>
          <p class="text-gray-600 mb-6">
            Form ID: <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ formId }}</code>
          </p>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <NuxtLink
              :to="`/forms/${formId}/live`"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              🚀 Fill Out Form
            </NuxtLink>

            <button
              @click="previewForm"
              class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              👁️ Preview Form
            </button>
          </div>
        </div>
      </div>

      <!-- Form Info -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Info -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Form Information</h2>

            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="font-medium">Status:</span>
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
              </div>

              <div class="flex justify-between">
                <span class="font-medium">Created:</span>
                <span>{{ formatDate(new Date()) }}</span>
              </div>

              <div class="flex justify-between">
                <span class="font-medium">Version:</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Description</h2>
            <p class="text-gray-700">
              This is the {{ formTitle }} form. Fill it out to generate a completed PDF document
              that can be submitted to the appropriate agency.
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Quick Stats</h3>

            <div class="space-y-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ submissions }}</div>
                <div class="text-sm text-gray-600">Total Submissions</div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ completionRate }}%</div>
                <div class="text-sm text-gray-600">Completion Rate</div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ avgTime }}m</div>
                <div class="text-sm text-gray-600">Avg. Fill Time</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Form Fields</h3>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-700">10</div>
              <div class="text-sm text-gray-600">Total Fields</div>
            </div>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Required:</span>
                <span class="font-medium">7</span>
              </div>
              <div class="flex justify-between">
                <span>Optional:</span>
                <span class="font-medium">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Get form ID from route
const route = useRoute()
const formId = route.params.id

// Computed title and form details
const formTitle = computed(() => {
  const formTitles = {
    'va-form-10-10ez-simple': 'VA Health Benefits Application (10-10EZ)',
    'test-form': 'Test Form',
    'va-21-526ez-minimal': 'VA Disability Claim (21-526EZ)'
  }
  return formTitles[formId] || 'Form Details'
})

// Mock stats (would come from API in real app)
const submissions = ref(156)
const completionRate = ref(87)
const avgTime = ref(4.2)

// Methods
function previewForm() {
  window.open(`/forms/${formId}/live`, '_blank')
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

// Page meta
definePageMeta({
  title: 'Form Details - FormReady'
})
</script>