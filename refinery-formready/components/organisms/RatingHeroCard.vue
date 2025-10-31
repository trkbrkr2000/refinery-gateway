<template>
  <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 text-white mb-8">
    <div class="text-center mb-6">
      <h2 class="text-3xl font-bold mb-2">🎯 Your VA Rating Results</h2>
      <p class="text-blue-100">Complete analysis of your decision letter</p>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Combined Rating -->
      <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
        <div class="text-6xl font-bold mb-2">
          {{ combinedRating }}<span class="text-3xl">%</span>
        </div>
        <div class="text-blue-100 text-sm uppercase tracking-wide">Combined Rating</div>
        <div class="mt-2 text-xs text-blue-200">Total Disability</div>
      </div>

      <!-- Monthly Payment -->
      <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
        <div v-if="monthlyPayment !== null && monthlyPayment > 0" class="text-6xl font-bold mb-2">
          ${{ monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
        </div>
        <div v-else class="text-3xl font-semibold mb-2 text-blue-200">
          Not Available
        </div>
        <div class="text-blue-100 text-sm uppercase tracking-wide">Monthly Payment</div>
        <div class="mt-2 text-xs text-blue-200">
          {{ monthlyPayment !== null && monthlyPayment > 0 ? 'Compensation Amount' : 'Check your decision letter' }}
        </div>
      </div>

      <!-- Claims Stats -->
      <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
        <div class="text-6xl font-bold mb-2">
          {{ grantedCount }}<span class="text-3xl">/{{ totalCount }}</span>
        </div>
        <div class="text-blue-100 text-sm uppercase tracking-wide">Claims Granted</div>
        <div class="mt-2 text-xs text-blue-200">Success Rate: {{ successRate }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  combinedRating: number
  monthlyPayment: number
  grantedCount: number
  deniedCount: number
  deferredCount: number
}>()

const totalCount = computed(() => props.grantedCount + props.deniedCount + props.deferredCount)
const successRate = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((props.grantedCount / totalCount.value) * 100)
})
</script>
