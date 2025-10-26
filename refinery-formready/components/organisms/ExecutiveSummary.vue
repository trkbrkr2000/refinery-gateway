<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center mb-6">
      <Icon name="heroicons:chart-bar" class="w-6 h-6 mr-3" color="blue-600" />
      <h2 class="text-2xl font-bold text-slate-900">Executive Summary</h2>
    </div>
    
    <!-- Key Metrics Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Combined Rating -->
      <div class="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div class="text-4xl font-bold text-blue-600 mb-2">{{ combinedRating }}%</div>
        <div class="text-sm font-medium text-blue-800">Combined Rating</div>
        <div class="text-xs text-blue-600 mt-1">Total disability rating</div>
      </div>
      
      <!-- Monthly Payment -->
      <div class="text-center p-6 bg-green-50 rounded-xl border border-green-200">
        <div class="text-4xl font-bold text-green-600 mb-2">${{ formatCurrency(monthlyPayment) }}</div>
        <div class="text-sm font-medium text-green-800">Monthly Payment</div>
        <div class="text-xs text-green-600 mt-1">Current benefit amount</div>
      </div>
      
      <!-- Conditions Granted -->
      <div class="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-200">
        <div class="text-4xl font-bold text-emerald-600 mb-2">{{ grantedCount }}</div>
        <div class="text-sm font-medium text-emerald-800">Conditions Granted</div>
        <div class="text-xs text-emerald-600 mt-1">Service connected</div>
      </div>
      
      <!-- Conditions Denied -->
      <div class="text-center p-6 bg-red-50 rounded-xl border border-red-200">
        <div class="text-4xl font-bold text-red-600 mb-2">{{ deniedCount }}</div>
        <div class="text-sm font-medium text-red-800">Conditions Denied</div>
        <div class="text-xs text-red-600 mt-1">Need attention</div>
      </div>
    </div>
    
    <!-- Summary Text -->
    <div class="bg-slate-50 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-3">Analysis Overview</h3>
      <p class="text-slate-700 leading-relaxed">
        Your VA decision letter has been analyzed and shows a 
        <span class="font-semibold text-blue-600">{{ combinedRating }}% combined disability rating</span>
        with a monthly payment of 
        <span class="font-semibold text-green-600">${{ formatCurrency(monthlyPayment) }}</span>.
        {{ grantedCount }} conditions were granted service connection, while 
        {{ deniedCount }} conditions were denied and may require additional evidence or appeals.
      </p>
      
      <!-- Action Indicators -->
      <div class="flex flex-wrap gap-3 mt-4">
        <div v-if="deniedCount > 0" class="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 mr-2" />
          {{ deniedCount }} condition{{ deniedCount > 1 ? 's' : '' }} need{{ deniedCount > 1 ? '' : 's' }} attention
        </div>
        <div v-if="deferredCount > 0" class="flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
          <Icon name="heroicons:clock" class="w-4 h-4 mr-2" />
          {{ deferredCount }} condition{{ deferredCount > 1 ? 's' : '' }} deferred
        </div>
        <div v-if="grantedCount > 0" class="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
          {{ grantedCount }} condition{{ grantedCount > 1 ? 's' : '' }} granted
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-3 mt-6">
      <Button 
        v-if="deniedCount > 0"
        variant="primary"
        @click="$emit('generate-forms')"
        class="flex items-center"
      >
        <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
        Generate Appeal Forms
      </Button>
      
      <Button 
        variant="secondary"
        @click="$emit('download-report')"
        class="flex items-center"
      >
        <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
        Download Report
      </Button>
      
      <Button 
        variant="secondary"
        @click="$emit('save-analysis')"
        class="flex items-center"
      >
        <Icon name="heroicons:bookmark" class="w-4 h-4 mr-2" />
        Save Analysis
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  combinedRating: number
  monthlyPayment: number
  grantedCount: number
  deniedCount: number
  deferredCount?: number
}

interface Emits {
  (e: 'generate-forms'): void
  (e: 'download-report'): void
  (e: 'save-analysis'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('$', '')
}
</script>
