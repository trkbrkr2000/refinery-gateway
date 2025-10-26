<template>
  <div 
    :class="itemClasses"
    class="p-3 rounded-lg border transition-all duration-200"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center mb-2">
          <Icon 
            :name="importanceIcon" 
            :size="size" 
            :color="importanceColor"
            class="mr-2"
          />
          <Badge 
            :variant="importanceVariant"
            :text="importanceText"
            class="w-4 h-4"
          />
          <Badge 
            v-if="timeframe"
            variant="default"
            :text="timeframe"
            class="w-4 h-4"
            class="ml-2"
          />
        </div>
        
        <h4 class="font-medium text-slate-900 mb-1">{{ type }}</h4>
        <p class="text-sm text-slate-600 leading-relaxed">{{ description }}</p>
        
        <div v-if="why" class="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
          <strong>Why this matters:</strong> {{ why }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '../atoms/Badge.vue'

interface Props {
  type: string
  description: string
  importance?: 'critical' | 'helpful' | 'optional'
  timeframe?: string
  why?: string
}

const props = defineProps<Props>()

const importanceVariant = computed(() => {
  switch (props.importance) {
    case 'critical':
      return 'danger'
    case 'helpful':
      return 'primary'
    case 'optional':
      return 'default'
    default:
      return 'default'
  }
})

const importanceText = computed(() => {
  switch (props.importance) {
    case 'critical':
      return 'Critical'
    case 'helpful':
      return 'Helpful'
    case 'optional':
      return 'Optional'
    default:
      return 'Unknown'
  }
})

const importanceIcon = computed(() => {
  switch (props.importance) {
    case 'critical':
      return 'exclamation'
    case 'helpful':
      return 'star'
    case 'optional':
      return 'info'
    default:
      return 'info'
  }
})

const importanceColor = computed(() => {
  switch (props.importance) {
    case 'critical':
      return 'red-600'
    case 'helpful':
      return 'blue-600'
    case 'optional':
      return 'slate-600'
    default:
      return 'slate-600'
  }
})

const itemClasses = computed(() => {
  switch (props.importance) {
    case 'critical':
      return 'bg-red-50 border-red-200'
    case 'helpful':
      return 'bg-blue-50 border-blue-200'
    case 'optional':
      return 'bg-slate-50 border-slate-200'
    default:
      return 'bg-slate-50 border-slate-200'
  }
})

const size = computed(() => 'sm')
</script>
