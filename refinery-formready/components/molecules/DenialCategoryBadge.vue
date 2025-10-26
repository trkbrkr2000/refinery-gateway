<template>
  <div class="relative group">
    <Badge 
      :variant="categoryVariant"
      :text="categoryText"
      class="w-4 h-4"
      class="cursor-help"
    />
    
    <!-- Tooltip -->
    <div 
      v-if="explanation"
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs"
    >
      <div class="text-center">
        <p class="font-medium">{{ categoryText }}</p>
        <p class="text-slate-300 text-xs mt-1">{{ explanation }}</p>
      </div>
      <!-- Tooltip arrow -->
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '../atoms/Badge.vue'

interface Props {
  category?: string
  explanation?: string
}

const props = defineProps<Props>()

const categoryVariant = computed(() => {
  if (!props.category) return 'default'
  
  const categoryLower = props.category.toLowerCase()
  
  if (categoryLower.includes('service connection') || categoryLower.includes('nexus')) {
    return 'denied'
  } else if (categoryLower.includes('evidence') || categoryLower.includes('insufficient')) {
    return 'deferred'
  } else if (categoryLower.includes('rating') || categoryLower.includes('severity')) {
    return 'approved'
  }
  
  return 'default'
})

const categoryText = computed(() => {
  if (!props.category) return 'Unknown'
  
  // Convert category to readable format
  return props.category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})
</script>
