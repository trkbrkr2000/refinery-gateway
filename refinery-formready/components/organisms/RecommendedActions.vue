<template>
  <div class="bg-white rounded-2xl shadow-xl p-8">
    <div class="flex items-center mb-6">
      <Icon name="heroicons:light-bulb" class="w-6 h-6 mr-3" color="amber-600" />
      <h2 class="text-2xl font-bold text-slate-900">Recommended Actions</h2>
    </div>
    
    <div class="space-y-4">
      <div v-for="(action, index) in actions" :key="index" 
           class="flex items-start p-6 rounded-xl border-2 transition-all hover:shadow-md"
           :class="action.priority === 'high' 
             ? 'bg-red-50 border-red-200' 
             : action.priority === 'medium'
             ? 'bg-amber-50 border-amber-200'
             : 'bg-blue-50 border-blue-200'">
        
        <!-- Action Icon -->
        <div class="flex-shrink-0 mr-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center"
               :class="action.priority === 'high' 
                 ? 'bg-red-100' 
                 : action.priority === 'medium'
                 ? 'bg-amber-100'
                 : 'bg-blue-100'">
            <Icon :name="action.icon" class="w-6 h-6" 
                  :color="action.priority === 'high' 
                    ? 'red-600' 
                    : action.priority === 'medium'
                    ? 'amber-600'
                    : 'blue-600'" />
          </div>
        </div>
        
        <!-- Action Content -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ action.title }}</h3>
              <p class="text-slate-700 leading-relaxed">{{ action.description }}</p>
            </div>
            <Badge 
              :text="action.priority === 'high' ? 'High Priority' : 
                     action.priority === 'medium' ? 'Medium Priority' : 'Low Priority'"
              :variant="action.priority === 'high' ? 'error' : 
                        action.priority === 'medium' ? 'warning' : 'info'"
              class="ml-4"
            />
          </div>
          
          <!-- Action Details -->
          <div v-if="action.details" class="mb-4">
            <div class="bg-white rounded-lg p-4 border">
              <h4 class="font-medium text-slate-900 mb-2">What you need to do:</h4>
              <ul class="text-sm text-slate-700 space-y-1">
                <li v-for="detail in action.details" :key="detail" class="flex items-start">
                  <Icon name="heroicons:check" class="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                  {{ detail }}
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Timeline -->
          <div v-if="action.timeline" class="mb-4">
            <div class="flex items-center text-sm text-slate-600">
              <Icon name="heroicons:clock" class="w-4 h-4 mr-2" />
              <span class="font-medium">Timeline:</span>
              <span class="ml-1">{{ action.timeline }}</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <Button 
              :variant="action.primary ? 'primary' : 'secondary'"
              @click="handleAction(action)"
              class="flex items-center"
            >
              <Icon :name="action.buttonIcon || 'heroicons:arrow-right'" class="w-4 h-4 mr-2" />
              {{ action.buttonText }}
            </Button>
            
            <Button 
              v-if="action.secondaryButton"
              variant="outline"
              @click="handleSecondaryAction(action)"
              class="flex items-center"
            >
              <Icon :name="action.secondaryButton.icon" class="w-4 h-4 mr-2" />
              {{ action.secondaryButton.text }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Actions -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="flex flex-wrap gap-3">
        <Button 
          variant="primary"
          @click="$emit('generate-all-forms')"
          class="flex items-center"
        >
          <Icon name="heroicons:document-text" class="w-4 h-4 mr-2" />
          Generate All Forms
        </Button>
        
        <Button 
          variant="secondary"
          @click="$emit('schedule-consultation')"
          class="flex items-center"
        >
          <Icon name="heroicons:phone" class="w-4 h-4 mr-2" />
          Schedule VSO Consultation
        </Button>
        
        <Button 
          variant="outline"
          @click="$emit('view-resources')"
          class="flex items-center"
        >
          <Icon name="heroicons:book-open" class="w-4 h-4 mr-2" />
          View Resources
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Action {
  id: string
  title: string
  description: string
  icon: string
  priority: 'high' | 'medium' | 'low'
  buttonText: string
  buttonIcon?: string
  primary?: boolean
  details?: string[]
  timeline?: string
  secondaryButton?: {
    text: string
    icon: string
  }
}

interface Props {
  actions: Action[]
}

interface Emits {
  (e: 'action-clicked', action: Action): void
  (e: 'generate-all-forms'): void
  (e: 'schedule-consultation'): void
  (e: 'view-resources'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleAction = (action: Action) => {
  emit('action-clicked', action)
}

const handleSecondaryAction = (action: Action) => {
  if (action.secondaryButton) {
    // Handle secondary action logic
    console.log('Secondary action clicked:', action.secondaryButton.text)
  }
}
</script>
