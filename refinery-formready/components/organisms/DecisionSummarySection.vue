<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <Icon name="heroicons:shield-check" class="w-6 h-6 mr-3" color="indigo-600" />
        <h2 class="text-2xl font-bold text-slate-900">Rating Decisions</h2>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-right">
          <p class="text-sm text-slate-500">Combined Rating</p>
          <p class="text-2xl font-bold text-indigo-600">{{ combinedRating }}%</p>
        </div>
        <div v-if="monthlyPayment > 0" class="text-right">
          <p class="text-sm text-slate-500">Monthly Payment</p>
          <p class="text-2xl font-bold text-green-600">${{ monthlyPayment.toLocaleString() }}</p>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div class="flex items-center">
          <Icon name="checkmark" class="w-5 h-5 mr-2" color="green-600" />
          <div>
            <p class="text-sm text-green-600">Approved</p>
            <p class="text-2xl font-bold text-green-700">{{ approvedCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <Icon name="x-mark" class="w-5 h-5 mr-2" color="red-600" />
          <div>
            <p class="text-sm text-red-600">Denied</p>
            <p class="text-2xl font-bold text-red-700">{{ deniedCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-center">
          <Icon name="clock" class="w-5 h-5 mr-2" color="amber-600" />
          <div>
            <p class="text-sm text-amber-600">Deferred</p>
            <p class="text-2xl font-bold text-amber-700">{{ deferredCount }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Filter and Sort Controls -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <select 
          v-model="selectedFilter"
          class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Conditions</option>
          <option value="granted">Approved Only</option>
          <option value="denied">Denied Only</option>
          <option value="deferred">Deferred Only</option>
        </select>
        
        <select 
          v-model="sortBy"
          class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="condition">Sort by Condition</option>
          <option value="rating">Sort by Rating</option>
          <option value="decision">Sort by Decision</option>
        </select>
      </div>
      
      <div class="text-sm text-slate-500">
        {{ filteredConditions.length }} of {{ conditions.length }} conditions
      </div>
    </div>
    
    <!-- Conditions Grid -->
    <div class="grid gap-4">
      <DecisionCard
        v-for="condition in filteredConditions"
        :key="condition.condition"
        :condition="condition.condition"
        :decision="condition.decision"
        :rating-percentage="condition.ratingPercentage"
        :show-details="true"
      />
    </div>
    
    <!-- Empty State -->
    <div v-if="filteredConditions.length === 0" class="text-center py-8">
      <Icon name="info" class="w-6 h-6 mx-auto mb-2" color="slate-400" />
      <p class="text-slate-500">No conditions match the selected filter</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import DecisionCard from '../molecules/DecisionCard.vue'

interface Condition {
  condition: string
  decision: 'granted' | 'denied' | 'deferred'
  ratingPercentage: number
}

interface Props {
  conditions: Condition[]
  combinedRating: number
  monthlyPayment: number
}

const props = defineProps<Props>()

const selectedFilter = ref<'all' | 'granted' | 'denied' | 'deferred'>('all')
const sortBy = ref<'condition' | 'rating' | 'decision'>('condition')

const approvedCount = computed(() => 
  props.conditions.filter(c => c.decision === 'granted').length
)

const deniedCount = computed(() => 
  props.conditions.filter(c => c.decision === 'denied').length
)

const deferredCount = computed(() => 
  props.conditions.filter(c => c.decision === 'deferred').length
)

const filteredConditions = computed(() => {
  let filtered = [...props.conditions]
  
  // Apply filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(c => c.decision === selectedFilter.value)
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'condition':
        return a.condition.localeCompare(b.condition)
      case 'rating':
        return b.ratingPercentage - a.ratingPercentage
      case 'decision':
        return a.decision.localeCompare(b.decision)
      default:
        return 0
    }
  })
  
  return filtered
})
</script>
