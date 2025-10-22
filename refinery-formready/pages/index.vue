<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-6xl mx-auto px-4 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">
          FormReady
        </h1>
        <p class="text-2xl text-gray-600 mb-8">
          Fill PDF forms the easy way
        </p>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">
          Answer simple questions in a guided web form, then download your perfectly filled PDF.
          No more printing, writing by hand, or dealing with confusing PDFs.
        </p>
      </div>

      <!-- Available Tools -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-3xl font-semibold text-gray-900 mb-6">
          Available Tools
        </h2>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Decision Analysis Card -->
          <NuxtLink
            to="/analyze-decision"
            class="group block p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600">
                  📄 Decision Letter Analysis
                </h3>
                <p class="text-gray-600 mb-4">
                  Upload your VA decision letter and get instant analysis
                </p>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~1 minute
                </div>
              </div>
              <div class="text-purple-600 group-hover:translate-x-1 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>
          <!-- VA Form Card -->
          <NuxtLink
            to="/forms/va-21-526ez-minimal"
            class="group block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                  VA Form 21-526EZ
                </h3>
                <p class="text-gray-600 mb-4">
                  Application for Disability Compensation
                </p>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~5 minutes
                </div>
              </div>
              <div class="text-blue-600 group-hover:translate-x-1 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>

          <!-- Coming Soon Card -->
          <div class="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h3 class="text-xl font-bold text-gray-400 mb-2">
              More Forms Coming Soon
            </h3>
            <p class="text-gray-500 mb-4">
              We're adding more forms every week
            </p>
            <div class="flex items-center text-sm text-gray-400">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Stay tuned
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="mt-16 grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">1. Choose Your Form</h3>
          <p class="text-gray-600">Select from our library of supported forms</p>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">2. Fill It Out</h3>
          <p class="text-gray-600">Answer simple questions in a guided interface</p>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">3. Download PDF</h3>
          <p class="text-gray-600">Get your perfectly filled PDF ready to submit</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'FormReady - Fill PDF Forms the Easy Way',
  meta: [
    { name: 'description', content: 'Fill PDF forms online with our guided web interface. Download perfectly filled PDFs in minutes.' }
  ]
})
</script>
