<template>
  <div class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-center relative">
      <div class="absolute top-4 right-4">
        <div class="bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-full">
          COMING SOON
        </div>
      </div>
      <h2 class="text-3xl font-bold text-white mb-2">
        Premium Features On The Horizon
      </h2>
      <p class="text-blue-100 text-lg">
        Sign up for free to be first in line when premium features launch
      </p>
    </div>

    <!-- Comparison Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-0 border-b">
      <!-- Feature Column Header -->
      <div class="bg-slate-50 p-6 border-r border-b md:border-b-0">
        <h3 class="text-lg font-semibold text-slate-900">Features</h3>
      </div>

      <!-- Free Column Header -->
      <div class="bg-slate-50 p-6 border-r border-b md:border-b-0 text-center">
        <div class="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-200 text-slate-700 font-semibold">
          <Icon name="heroicons:clock" class="w-4 h-4 mr-2" />
          Quick Analysis (You)
        </div>
        <p class="text-sm text-slate-600 mt-2">24-hour access</p>
      </div>

      <!-- Paid Column Header -->
      <div class="bg-gradient-to-br from-blue-50 to-amber-50 p-6 border-b md:border-b-0 text-center">
        <div class="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold">
          <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
          Full Account (Free)
        </div>
        <p class="text-sm text-blue-600 mt-2 font-medium">Unlimited access</p>
      </div>
    </div>

    <!-- Feature Rows -->
    <div v-for="(feature, index) in features" :key="index"
         class="grid grid-cols-1 md:grid-cols-3 gap-0 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
      <!-- Feature Name -->
      <div class="p-6 border-r">
        <div class="flex items-start">
          <Icon :name="feature.icon" class="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h4 class="font-semibold text-slate-900">{{ feature.name }}</h4>
            <p class="text-sm text-slate-600 mt-1">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- Free Status -->
      <div class="p-6 border-r text-center flex items-center justify-center">
        <Icon v-if="feature.free" name="heroicons:check-circle" class="w-6 h-6 text-green-500" />
        <Icon v-else name="heroicons:x-circle" class="w-6 h-6 text-slate-300" />
      </div>

      <!-- Paid Status -->
      <div class="p-6 bg-gradient-to-br from-blue-50/30 to-amber-50/30 text-center flex items-center justify-center">
        <Icon name="heroicons:check-circle" class="w-6 h-6 text-blue-600" />
      </div>
    </div>

    <!-- CTA Footer -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-center">
      <button
        @click="$emit('show-signup')"
        class="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
      >
        <Icon name="heroicons:bell" class="w-5 h-5 mr-2" />
        Sign Up Free - Be First to Know
      </button>
      <p class="text-blue-100 text-sm mt-3">
        Free account • Get notified when premium features launch • Save your results now
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  name: string
  description: string
  icon: string
  free: boolean
}

const features: Feature[] = [
  {
    name: 'Combined Rating & Payment',
    description: 'See your total disability rating and monthly payment amount',
    icon: 'heroicons:calculator',
    free: true
  },
  {
    name: 'Condition Status Overview',
    description: 'View all granted, denied, and deferred conditions at a glance',
    icon: 'heroicons:list-bullet',
    free: true
  },
  {
    name: 'Basic Denial Reasons',
    description: 'Understand why claims were denied in plain English',
    icon: 'heroicons:document-text',
    free: true
  },
  {
    name: 'Detailed Next Steps',
    description: 'Personalized action plan for appeals and new claims',
    icon: 'heroicons:map',
    free: false
  },
  {
    name: 'Evidence Recommendations',
    description: 'Specific medical evidence needed to strengthen your case',
    icon: 'heroicons:clipboard-document-check',
    free: false
  },
  {
    name: 'Timeline & Deadlines',
    description: 'Track appeal deadlines and important dates',
    icon: 'heroicons:calendar',
    free: false
  },
  {
    name: 'Save & Track Progress',
    description: 'Store all analyses and track your claims over time',
    icon: 'heroicons:folder-open',
    free: false
  },
  {
    name: 'Multiple Document Analysis',
    description: 'Analyze unlimited decision letters and compare results',
    icon: 'heroicons:document-duplicate',
    free: false
  },
  {
    name: 'Export to PDF',
    description: 'Download complete reports for your VSO or attorney',
    icon: 'heroicons:arrow-down-tray',
    free: false
  },
  {
    name: 'Email Support',
    description: 'Get help from our veteran support team',
    icon: 'heroicons:envelope',
    free: false
  }
]

defineEmits<{
  'show-signup': []
}>()
</script>
