<template>
  <div 
    :class="cardClasses"
    class="p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
  >
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-semibold text-slate-900 flex-1 mr-4">
        {{ condition }}
      </h3>
      <Badge 
        :variant="decision" 
        :text="decision.toUpperCase()"
        size="sm"
      />
    </div>
    
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <Icon 
          :name="decisionIcon" 
          :size="size" 
          :color="iconColor"
          class="mr-2"
        />
        <span class="text-2xl font-bold" :class="textColor">
          {{ ratingPercentage }}%
        </span>
      </div>
      
      <div v-if="showDetails" class="text-right">
        <p class="text-sm text-slate-500">
          {{ decisionDescription }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '../atoms/Badge.vue'

interface Props {
  condition: string
  decision: 'granted' | 'denied' | 'deferred'
  ratingPercentage: number
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false
})

const { colors } = useDesignTokens()

const cardClasses = computed(() => {
  switch (props.decision) {
    case 'granted':
      return colors.approved.bg + ' ' + colors.approved.border
    case 'denied':
      return colors.denied.bg + ' ' + colors.denied.border
    case 'deferred':
      return colors.deferred.bg + ' ' + colors.deferred.border
    default:
      return 'bg-white border-slate-200'
  }
})

const textColor = computed(() => {
  switch (props.decision) {
    case 'granted':
      return colors.approved.text
    case 'denied':
      return colors.denied.text
    case 'deferred':
      return colors.deferred.text
    default:
      return 'text-slate-700'
  }
})

const iconColor = computed(() => {
  switch (props.decision) {
    case 'granted':
      return 'blue-600'
    case 'denied':
      return 'slate-600'
    case 'deferred':
      return 'amber-600'
    default:
      return 'slate-600'
  }
})

const decisionIcon = computed(() => {
  switch (props.decision) {
    case 'granted':
      return 'checkmark'
    case 'denied':
      return 'x-mark'
    case 'deferred':
      return 'clock'
    default:
      return 'info'
  }
})

const decisionDescription = computed(() => {
  switch (props.decision) {
    case 'granted':
      return 'Service connected'
    case 'denied':
      return 'Not service connected'
    case 'deferred':
      return 'Additional evidence needed'
    default:
      return ''
  }
})

const size = computed(() => 'md')
</script>
