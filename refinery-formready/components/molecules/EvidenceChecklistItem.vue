<template>
  <div class="flex items-start p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
    <!-- Checkbox -->
    <div class="flex items-center mr-4">
      <button
        @click="toggleCompleted"
        :class="checkboxClasses"
        class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <Icon v-if="item.completed" name="check" class="w-4 h-4" color="white" />
      </button>
    </div>
    
    <!-- Content -->
    <div class="flex-1">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center mb-2">
            <h4 class="text-base font-medium text-slate-900 mr-3">{{ item.title }}</h4>
            <Badge 
              :variant="getPriorityVariant(item.priority)"
              class="w-3 h-3"
            >
              {{ getPriorityText(item.priority) }}
            </Badge>
            <Badge 
              v-if="item.difficulty"
              :variant="getDifficultyVariant(item.difficulty)"
              class="w-3 h-3"
            >
              {{ getDifficultyText(item.difficulty) }}
            </Badge>
          </div>
          
          <p class="text-sm text-slate-600 mb-3">{{ item.description }}</p>
          
          <!-- Tips -->
          <div v-if="item.tips && item.tips.length > 0" class="mb-3">
            <button 
              @click="showTips = !showTips"
              class="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Icon name="light-bulb" class="w-4 h-4 mr-1" color="blue-600" />
              <span>{{ showTips ? 'Hide' : 'Show' }} Tips</span>
              <Icon 
                :name="showTips ? 'chevron-up' : 'chevron-down'" 
                class="w-4 h-4" 
                color="blue-600" 
              />
            </button>
            
            <div v-if="showTips" class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <ul class="space-y-1">
                <li v-for="tip in item.tips" :key="tip" class="flex items-start text-sm text-blue-800">
                  <Icon name="check" class="w-4 h-4 mr-2 mt-0.5" color="blue-600" />
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Metadata -->
          <div class="flex items-center space-x-4 text-xs text-slate-500">
            <div v-if="item.estimatedTime" class="flex items-center">
              <Icon name="clock" class="w-4 h-4 mr-1" color="slate-500" />
              <span>{{ item.estimatedTime }}</span>
            </div>
            <div class="flex items-center">
              <Icon name="document-text" class="w-4 h-4 mr-1" color="slate-500" />
              <span>{{ getDocumentType(item.title) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Status indicator -->
        <div class="ml-4">
          <div v-if="item.completed" class="flex items-center text-green-600">
            <Icon name="check-circle" class="w-5 h-5" color="green-600" />
          </div>
          <div v-else class="flex items-center text-slate-400">
            <Icon name="circle" class="w-5 h-5" color="slate-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Badge from '~/components/atoms/Badge.vue'

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

interface Props {
  item: EvidenceItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [itemId: string, completed: boolean]
}>()

const showTips = ref(false)

const checkboxClasses = computed(() => {
  if (props.item.completed) {
    return 'bg-green-500 border-green-500 text-white'
  } else {
    return 'bg-white border-slate-300 hover:border-green-400'
  }
})

function toggleCompleted() {
  const newCompleted = !props.item.completed
  emit('toggle', props.item.id, newCompleted)
}

function getPriorityVariant(priority: string): string {
  switch (priority) {
    case 'required':
      return 'danger'
    case 'helpful':
      return 'secondary'
    case 'optional':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function getPriorityText(priority: string): string {
  switch (priority) {
    case 'required':
      return 'Required'
    case 'helpful':
      return 'Helpful'
    case 'optional':
      return 'Optional'
    default:
      return 'Unknown'
  }
}

function getDifficultyVariant(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'secondary'
    case 'hard':
      return 'danger'
    default:
      return 'neutral'
  }
}

function getDifficultyText(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy'
    case 'medium':
      return 'Medium'
    case 'hard':
      return 'Hard'
    default:
      return 'Unknown'
  }
}

function getDocumentType(title: string): string {
  if (title.toLowerCase().includes('dd-214')) {
    return 'Military Record'
  } else if (title.toLowerCase().includes('medical')) {
    return 'Medical Record'
  } else if (title.toLowerCase().includes('statement')) {
    return 'Personal Statement'
  } else if (title.toLowerCase().includes('nexus')) {
    return 'Medical Opinion'
  } else {
    return 'Document'
  }
}
</script>
