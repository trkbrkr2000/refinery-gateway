<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center mb-6">
      <Icon name="clock" class="w-6 h-6 mr-3" color="blue-600" />
      <h2 class="text-2xl font-bold text-slate-900">Your Claim Journey</h2>
    </div>
    
    <div class="relative">
      <!-- Timeline line -->
      <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-amber-200 to-red-200"></div>
      
      <!-- Timeline nodes -->
      <div v-for="(node, index) in timelineNodes" :key="index" class="relative flex items-start mb-8">
        <!-- Node circle -->
        <div 
          :class="getNodeClasses(node.status)"
          class="relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 border-white shadow-lg"
        >
          <Icon :name="node.icon" class="w-6 h-6" :color="getNodeIconColor(node.status)" />
          
          <!-- Patriotic ring effect for current/upcoming -->
          <div 
            v-if="node.status === 'current' || node.status === 'upcoming'"
            class="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-30"
          ></div>
        </div>
        
        <!-- Content -->
        <div class="ml-6 flex-1">
          <div class="flex items-center justify-between">
            <h3 :class="getTitleClasses(node.status)" class="text-lg font-semibold">
              {{ node.title }}
            </h3>
            <Badge 
              :variant="getBadgeVariant(node.status)" 
              :size="'sm'"
            >
              {{ getStatusText(node.status) }}
            </Badge>
          </div>
          
          <p class="text-slate-600 mt-1">{{ node.description }}</p>
          
          <!-- Date and deadline info -->
          <div v-if="node.date || node.deadline" class="mt-3 flex items-center space-x-4 text-sm">
            <div v-if="node.date" class="flex items-center text-slate-500">
              <Icon name="calendar" class="w-4 h-4 mr-1" color="slate-500" />
              <span>{{ formatDate(node.date) }}</span>
            </div>
            <div v-if="node.deadline" class="flex items-center" :class="getDeadlineClasses(node.deadline)">
              <Icon name="exclamation-triangle" class="w-4 h-4 mr-1" />
              <span>{{ getDeadlineText(node.deadline) }}</span>
            </div>
          </div>
          
          <!-- Action items for current/upcoming -->
          <div v-if="node.actionItems && (node.status === 'current' || node.status === 'upcoming')" class="mt-4">
            <h4 class="text-sm font-medium text-slate-700 mb-2">Next Steps:</h4>
            <ul class="space-y-1">
              <li v-for="action in node.actionItems" :key="action" class="flex items-center text-sm text-slate-600">
                <Icon name="check" class="w-4 h-4 mr-2" color="red-600" />
                <span>{{ action }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary stats -->
    <div class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg border border-blue-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Icon name="chart-bar" class="w-5 h-5 mr-2" color="blue-600" />
          <span class="text-sm font-medium text-slate-700">Timeline Summary</span>
        </div>
        <div class="text-sm text-slate-600">
          <span class="font-medium">{{ completedCount }}</span> completed, 
          <span class="font-medium">{{ remainingCount }}</span> remaining
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignTokens } from '~/composables/useDesignTokens'
import Badge from '~/components/atoms/Badge.vue'

interface TimelineNode {
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming' | 'overdue'
  date?: Date
  deadline?: Date
  icon: string
  actionItems?: string[]
}

interface Props {
  decisionDate?: Date
  effectiveDate?: Date
  appealDeadline?: Date
  currentStep?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentStep: 'decision_received'
})

const { colors } = useDesignTokens()

const timelineNodes = computed((): TimelineNode[] => {
  const nodes: TimelineNode[] = [
    {
      title: 'Claim Filed',
      description: 'Your initial claim was submitted to the VA',
      status: 'completed',
      icon: 'document-text',
      date: new Date('2023-06-01') // This would come from props in real implementation
    },
    {
      title: 'Evidence Gathering',
      description: 'VA reviewed your medical records and evidence',
      status: 'completed',
      icon: 'folder-open',
      date: new Date('2023-08-15')
    },
    {
      title: 'C&P Exam',
      description: 'Compensation & Pension examination completed',
      status: 'completed',
      icon: 'user-group',
      date: new Date('2023-09-20')
    },
    {
      title: 'Decision Received',
      description: 'VA issued rating decision letter',
      status: 'current',
      icon: 'document-check',
      date: props.decisionDate,
      actionItems: [
        'Review decision letter carefully',
        'Check effective dates',
        'Verify rating calculations',
        'Plan next steps if denied'
      ]
    }
  ]

  // Add appeal options if there are denied conditions
  if (props.appealDeadline) {
    nodes.push({
      title: 'Appeal Deadline',
      description: 'You have 1 year to file an appeal for denied conditions',
      status: 'upcoming',
      icon: 'exclamation-triangle',
      deadline: props.appealDeadline,
      actionItems: [
        'Gather new evidence',
        'Get nexus letters',
        'Contact VSO for help',
        'Choose appeal type (Supplemental, HLR, or Board)'
      ]
    })
  }

  return nodes
})

const completedCount = computed(() => 
  timelineNodes.value.filter(node => node.status === 'completed').length
)

const remainingCount = computed(() => 
  timelineNodes.value.filter(node => node.status !== 'completed').length
)

function getNodeClasses(status: string): string {
  const baseClasses = 'transition-all duration-300'
  
  switch (status) {
    case 'completed':
      return `${baseClasses} bg-green-500 text-white`
    case 'current':
      return `${baseClasses} bg-blue-600 text-white`
    case 'upcoming':
      return `${baseClasses} bg-amber-500 text-white`
    case 'overdue':
      return `${baseClasses} bg-red-500 text-white`
    default:
      return `${baseClasses} bg-gray-400 text-white`
  }
}

function getTitleClasses(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-700'
    case 'current':
      return 'text-blue-700'
    case 'upcoming':
      return 'text-amber-700'
    case 'overdue':
      return 'text-red-700'
    default:
      return 'text-slate-700'
  }
}

function getBadgeVariant(status: string): string {
  switch (status) {
    case 'completed':
      return 'success'
    case 'current':
      return 'primary'
    case 'upcoming':
      return 'secondary'
    case 'overdue':
      return 'danger'
    default:
      return 'neutral'
  }
}

function getNodeIconColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'white'
    case 'current':
      return 'white'
    case 'upcoming':
      return 'white'
    case 'overdue':
      return 'white'
    default:
      return 'white'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'Done'
    case 'current':
      return 'Now'
    case 'upcoming':
      return 'Next'
    case 'overdue':
      return 'Overdue'
    default:
      return 'Pending'
  }
}

function getDeadlineClasses(deadline: Date): string {
  const now = new Date()
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDeadline < 0) {
    return 'text-red-600'
  } else if (daysUntilDeadline < 30) {
    return 'text-amber-600'
  } else {
    return 'text-slate-500'
  }
}

function getDeadlineText(deadline: Date): string {
  const now = new Date()
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDeadline < 0) {
    return `Overdue by ${Math.abs(daysUntilDeadline)} days`
  } else if (daysUntilDeadline === 0) {
    return 'Due today'
  } else if (daysUntilDeadline === 1) {
    return 'Due tomorrow'
  } else if (daysUntilDeadline < 30) {
    return `Due in ${daysUntilDeadline} days`
  } else {
    return `Due ${formatDate(deadline)}`
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
