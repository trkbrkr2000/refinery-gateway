<template>
  <div class="bg-white border border-slate-200 rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center">
        <Icon name="calendar" class="w-5 h-5 mr-2" color="slate-600" />
        <h4 class="font-medium text-slate-900">{{ option }}</h4>
      </div>
      <Badge 
        :variant="urgencyVariant"
        :text="urgencyText"
        class="w-4 h-4"
      />
    </div>
    
    <div class="space-y-3">
      <div v-if="deadline">
        <p class="text-sm text-slate-600 mb-1">Deadline</p>
        <p class="font-medium text-slate-900">{{ formatDate(deadline) }}</p>
      </div>
      
      <div v-if="daysRemaining !== null">
        <ProgressBar 
          :percentage="progressPercentage"
          :color="progressColor"
          :label="`${Math.abs(daysRemaining)} days ${daysRemaining < 0 ? 'overdue' : 'remaining'}`"
          :description="progressDescription"
        />
      </div>
      
      <div v-if="bestFor" class="text-sm text-slate-600">
        <strong>Best for:</strong> {{ bestFor }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '../atoms/Badge.vue'
import ProgressBar from '../atoms/ProgressBar.vue'

interface Props {
  option: string
  deadline?: string
  daysRemaining?: number | null
  bestFor?: string
}

const props = defineProps<Props>()

const urgencyVariant = computed(() => {
  if (props.daysRemaining === null) return 'default'
  
  if (props.daysRemaining < 0) return 'danger'
  if (props.daysRemaining <= 30) return 'deferred'
  return 'default'
})

const urgencyText = computed(() => {
  if (props.daysRemaining === null) return 'No deadline'
  
  if (props.daysRemaining < 0) return 'Overdue'
  if (props.daysRemaining <= 30) return 'Urgent'
  if (props.daysRemaining <= 90) return 'Soon'
  return 'Plenty of time'
})

const progressPercentage = computed(() => {
  if (props.daysRemaining === null) return 0
  
  // Calculate progress based on a 365-day window
  const totalDays = 365
  const remaining = Math.max(0, Math.min(props.daysRemaining, totalDays))
  return Math.round((remaining / totalDays) * 100)
})

const progressColor = computed(() => {
  if (props.daysRemaining === null) return 'slate'
  
  if (props.daysRemaining < 0) return 'red'
  if (props.daysRemaining <= 30) return 'amber'
  if (props.daysRemaining <= 90) return 'blue'
  return 'green'
})

const progressDescription = computed(() => {
  if (props.daysRemaining === null) return 'No specific deadline'
  
  if (props.daysRemaining < 0) return 'This deadline has passed'
  if (props.daysRemaining <= 30) return 'Action needed soon'
  if (props.daysRemaining <= 90) return 'Plan ahead'
  return 'No rush'
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}
</script>
