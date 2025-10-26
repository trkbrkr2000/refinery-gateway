<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Header Navigation -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 class="text-xl font-bold text-blue-800">ClaimReady</h1>
          </div>
          
          <div class="flex items-center space-x-2">
            <Button 
              @click="navigateTo('/pricing')"
              variant="secondary"
            >
              <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
              Pricing
            </Button>
            <Button 
              @click="navigateTo('/auth/login')"
              variant="secondary"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button 
              @click="navigateTo('/auth/signup')"
              variant="primary"
            >
              <Icon name="heroicons:user-plus" class="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-16">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <div class="flex items-center justify-center mb-6">
          <div class="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center mr-4">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 class="text-6xl font-bold text-blue-800 mb-0">
            ClaimReady
          </h1>
        </div>
        <p class="text-2xl text-gray-700 mb-4 font-semibold">
          VA Claims Made Simple
        </p>
        <div class="flex items-center justify-center text-sm text-gray-600 mb-8">
          <svg class="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="font-semibold text-blue-800">Made for Veterans by Veterans</span>
        </div>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">
          Upload your VA decision letter for instant analysis, understand your claim decisions, and get personalized next steps to strengthen your case.
        </p>
      </div>

      <!-- Available Tools -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-3xl font-semibold text-gray-900 mb-6">
          VA Decision Analysis
        </h2>

        <div class="grid gap-6 md:grid-cols-1">
          <!-- Decision Analysis Card -->
          <NuxtLink
            to="/analyze-decision"
            class="group block p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-l-4 border-blue-800"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-3">
                  <div class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center mr-3">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-900 group-hover:text-blue-800">
                    VA Decision Letter Analysis
                  </h3>
                </div>
                <p class="text-gray-600 mb-4 text-lg">
                  Upload your VA decision letter and get comprehensive analysis with personalized next steps
                </p>
                <div class="grid md:grid-cols-3 gap-4 mb-4">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Extract conditions & ratings
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Understand denial reasons
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Get next steps guidance
                  </div>
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~1 minute • Free to use
                </div>
              </div>
              <div class="text-blue-800 group-hover:translate-x-1 transition-transform ml-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Veteran Connection -->
      <div class="mt-16 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-8 text-white">
        <div class="max-w-4xl mx-auto text-center">
          <div class="flex items-center justify-center mb-6">
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 class="text-3xl font-bold">Built by Veterans, For Veterans</h2>
          </div>
          <p class="text-xl text-blue-100 mb-6">
            We understand the challenges you face because we've been there. Our team of veterans created this tool to help fellow service members navigate the VA claims process with confidence.
          </p>
          <div class="grid md:grid-cols-3 gap-6 text-left">
            <div class="bg-white bg-opacity-10 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3 class="font-semibold">Veteran-Led</h3>
              </div>
              <p class="text-sm text-blue-100">Created by veterans who understand the VA system</p>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3 class="font-semibold">Battle-Tested</h3>
              </div>
              <p class="text-sm text-blue-100">Proven to help veterans understand their decisions</p>
            </div>
            <div class="bg-white bg-opacity-10 rounded-lg p-4">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3 class="font-semibold">Always Free</h3>
              </div>
              <p class="text-sm text-blue-100">No cost, no strings attached - just helping fellow veterans</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="mt-16 grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">1. Upload Your Decision Letter</h3>
          <p class="text-gray-600">Simply drag and drop your VA decision letter PDF</p>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">2. Get Instant Analysis</h3>
          <p class="text-gray-600">AI extracts conditions, ratings, and denial reasons</p>
        </div>

        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">3. Take Action</h3>
          <p class="text-gray-600">Get personalized next steps and evidence requirements</p>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="mt-16 text-center">
        <div class="inline-flex items-center text-sm text-gray-600 bg-white rounded-full px-6 py-3 shadow-sm border">
          <svg class="w-4 h-4 mr-2 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="font-medium text-blue-800">Proudly serving our fellow veterans</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/atoms/Button.vue'

useHead({
  title: 'ClaimReady - Made for Veterans by Veterans',
  meta: [
    { name: 'description', content: 'Built by veterans for veterans. Upload your VA decision letter for instant analysis and get personalized next steps to strengthen your case.' }
  ]
})
</script>
