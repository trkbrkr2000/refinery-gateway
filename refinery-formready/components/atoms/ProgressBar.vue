<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <span v-if="showLabel" class="text-sm font-medium text-slate-700">
        {{ label }}
      </span>
      <span class="text-sm text-slate-500">
        {{ Math.round(percentage) }}%
      </span>
    </div>
    
    <div class="w-full bg-gray-200 rounded-full h-3 shadow-inner">
      <div 
        :class="progressClasses"
        :style="{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }"
        class="h-3 rounded-full transition-all duration-500 ease-out shadow-sm relative overflow-hidden"
      >
        <!-- Subtle shine effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
      </div>
    </div>
    
    <div v-if="description" class="mt-1 text-xs text-slate-500">
      {{ description }}
    </div>
  </div>
</template>

 <script setup lang="ts">
interface Props {
  percentage: number
  color?: 'blue' | 'amber' | 'red' | 'green' | 'gray'
  showLabel?: boolean
  label?: string
  description?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  showLabel: true,
  label: 'Progress',
  description: null
})

const progressClasses = computed(() => {
  const colorMap = {
    blue: 'bg-blue-800', // Navy Blue - primary patriotic color
    amber: 'bg-amber-500', // Gold - secondary patriotic color
    red: 'bg-red-600', // Red - accent patriotic color
    green: 'bg-green-600', // For approved/success states
    gray: 'bg-gray-400' // For neutral states
  }
  
  return colorMap[props.color]
})
</script>
