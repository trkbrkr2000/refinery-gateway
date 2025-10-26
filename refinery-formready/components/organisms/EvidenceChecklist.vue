<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <Icon name="clipboard-document-check" class="w-6 h-6 mr-3" color="blue-600" />
        <h2 class="text-2xl font-bold text-slate-900">Evidence Checklist</h2>
      </div>
      <div class="text-right">
        <div class="text-sm text-slate-500">Progress</div>
        <div class="text-2xl font-bold text-blue-600">{{ completedCount }}/{{ totalCount }}</div>
      </div>
    </div>
    
    <!-- Progress bar -->
    <div class="mb-6">
      <ProgressBar 
        :percentage="progressPercentage"
        color="blue"
        :showLabel="true"
        :label="`${completedCount} of ${totalCount} items completed`"
      />
    </div>
    
    <!-- Evidence categories -->
    <div class="space-y-6">
      <div v-for="category in evidenceCategories" :key="category.name" class="border border-slate-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <Icon :name="category.icon" class="w-5 h-5 mr-3" :color="category.color" />
            <h3 class="text-lg font-semibold text-slate-900">{{ category.name }}</h3>
          </div>
          <Badge 
            :variant="getCategoryBadgeVariant(category.completed, category.total)"
            class="w-4 h-4"
          >
            {{ category.completed }}/{{ category.total }}
          </Badge>
        </div>
        
        <p class="text-slate-600 mb-4">{{ category.description }}</p>
        
        <!-- Evidence items -->
        <div class="space-y-3">
          <EvidenceChecklistItem
            v-for="item in category.items"
            :key="item.id"
            :item="item"
            @toggle="handleItemToggle"
          />
        </div>
      </div>
    </div>
    
    <!-- Tips section -->
    <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg border border-blue-200">
      <div class="flex items-start">
        <Icon name="light-bulb" class="w-5 h-5 mr-3 mt-1" color="amber-600" />
        <div>
          <h4 class="text-lg font-semibold text-slate-900 mb-2">Pro Tips</h4>
          <ul class="space-y-2 text-sm text-slate-700">
            <li class="flex items-start">
              <Icon name="check" class="w-4 h-4 mr-2 mt-0.5" color="green-500" />
              <span>Start with the easiest items first to build momentum</span>
            </li>
            <li class="flex items-start">
              <Icon name="check" class="w-4 h-4 mr-2 mt-0.5" color="green-500" />
              <span>Request your C-file to see what evidence VA already has</span>
            </li>
            <li class="flex items-start">
              <Icon name="check" class="w-4 h-4 mr-2 mt-0.5" color="green-500" />
              <span>Get nexus letters from doctors who understand VA requirements</span>
            </li>
            <li class="flex items-start">
              <Icon name="check" class="w-4 h-4 mr-2 mt-0.5" color="green-500" />
              <span>Keep copies of everything and submit through VA.gov</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignTokens } from '~/composables/useDesignTokens'
import Badge from '~/components/atoms/Badge.vue'
import ProgressBar from '~/components/atoms/ProgressBar.vue'
import EvidenceChecklistItem from '~/components/molecules/EvidenceChecklistItem.vue'

interface EvidenceItem {
  id: string
  title: string
  description: string
  priority: 'required' | 'helpful' | 'optional'
  completed: boolean
  tips?: string[]
  estimatedTime?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface EvidenceCategory {
  name: string
  description: string
  icon: string
  color: string
  items: EvidenceItem[]
  completed: number
  total: number
}

interface Props {
  conditions?: string[]
  claimType?: 'initial' | 'increase' | 'appeal'
}

const props = withDefaults(defineProps<Props>(), {
  conditions: () => ['PTSD'],
  claimType: 'initial'
})

const { colors } = useDesignTokens()

// Sample evidence data - in real implementation, this would come from the MCP tools
const evidenceCategories = ref<EvidenceCategory[]>([
  {
    name: 'Medical Evidence',
    description: 'Current medical records and diagnoses',
    icon: 'heart',
    color: 'red-600',
    completed: 1,
    total: 4,
    items: [
      {
        id: 'current-diagnosis',
        title: 'Current Medical Diagnosis',
        description: 'Get a formal diagnosis from a qualified healthcare provider',
        priority: 'required',
        completed: false,
        tips: ['Ask your doctor to write a clear diagnosis', 'Include ICD-10 codes if possible'],
        estimatedTime: '1-2 weeks',
        difficulty: 'easy'
      },
      {
        id: 'medical-records',
        title: 'Medical Records (Last 2 Years)',
        description: 'Complete medical records showing ongoing treatment',
        priority: 'required',
        completed: true,
        tips: ['Request records from all healthcare providers', 'Include treatment notes and test results'],
        estimatedTime: '2-4 weeks',
        difficulty: 'medium'
      },
      {
        id: 'nexus-letter',
        title: 'Nexus Letter (IMO)',
        description: 'Doctor statement linking condition to military service',
        priority: 'required',
        completed: false,
        tips: ['Use "at least as likely as not" language', 'Include medical rationale', 'Get from specialist if possible'],
        estimatedTime: '3-6 weeks',
        difficulty: 'hard'
      },
      {
        id: 'treatment-summary',
        title: 'Treatment Summary',
        description: 'Summary of all treatments and their effectiveness',
        priority: 'helpful',
        completed: false,
        tips: ['Include medication history', 'Note side effects and effectiveness'],
        estimatedTime: '1 week',
        difficulty: 'easy'
      }
    ]
  },
  {
    name: 'Service Records',
    description: 'Military service documentation',
    icon: 'shield-check',
    color: 'blue-600',
    completed: 0,
    total: 3,
    items: [
      {
        id: 'dd214',
        title: 'DD-214 (Discharge Papers)',
        description: 'Official military discharge document',
        priority: 'required',
        completed: false,
        tips: ['Request from National Archives if needed', 'Ensure it shows character of discharge'],
        estimatedTime: '2-6 weeks',
        difficulty: 'easy'
      },
      {
        id: 'service-medical',
        title: 'Service Medical Records',
        description: 'Medical records from your time in service',
        priority: 'required',
        completed: false,
        tips: ['Request from National Personnel Records Center', 'Include all medical visits and treatments'],
        estimatedTime: '4-8 weeks',
        difficulty: 'medium'
      },
      {
        id: 'personnel-records',
        title: 'Personnel Records',
        description: 'Awards, deployments, and duty assignments',
        priority: 'helpful',
        completed: false,
        tips: ['Include deployment orders', 'Awards and decorations', 'Duty station assignments'],
        estimatedTime: '2-4 weeks',
        difficulty: 'easy'
      }
    ]
  },
  {
    name: 'Lay Evidence',
    description: 'Personal statements and witness accounts',
    icon: 'user-group',
    color: 'green-600',
    completed: 0,
    total: 2,
    items: [
      {
        id: 'personal-statement',
        title: 'Personal Statement (VA Form 21-4138)',
        description: 'Your detailed account of how the condition affects you',
        priority: 'required',
        completed: false,
        tips: ['Be specific about symptoms', 'Include impact on daily life', 'Mention when symptoms started'],
        estimatedTime: '1-2 days',
        difficulty: 'easy'
      },
      {
        id: 'buddy-statements',
        title: 'Buddy Statements',
        description: 'Statements from fellow service members who witnessed events',
        priority: 'helpful',
        completed: false,
        tips: ['Include contact information', 'Have them describe what they saw', 'Get notarized if possible'],
        estimatedTime: '1-2 weeks',
        difficulty: 'medium'
      }
    ]
  }
])

const completedCount = computed(() => 
  evidenceCategories.value.reduce((total, category) => total + category.completed, 0)
)

const totalCount = computed(() => 
  evidenceCategories.value.reduce((total, category) => total + category.total, 0)
)

const progressPercentage = computed(() => 
  totalCount.value > 0 ? Math.round((completedCount.value / totalCount.value) * 100) : 0
)

function handleItemToggle(itemId: string, completed: boolean) {
  // Find and update the item
  for (const category of evidenceCategories.value) {
    const item = category.items.find(item => item.id === itemId)
    if (item) {
      item.completed = completed
      // Update category counts
      category.completed = category.items.filter(item => item.completed).length
      category.total = category.items.length
      break
    }
  }
}

function getCategoryBadgeVariant(completed: number, total: number): string {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  
  if (percentage === 100) {
    return 'success'
  } else if (percentage >= 50) {
    return 'primary'
  } else if (percentage > 0) {
    return 'secondary'
  } else {
    return 'neutral'
  }
}
</script>
