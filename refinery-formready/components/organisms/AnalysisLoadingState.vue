<template>
  <div class="bg-white rounded-2xl shadow-xl p-12 text-center">
    <div class="max-w-md mx-auto">
      <!-- Main Heading -->
      <h3 class="text-2xl font-semibold text-slate-900 mb-2">
        {{ stageTitle }}
      </h3>
      
      <!-- Description -->
      <p class="text-slate-600 mb-6">
        {{ stageDescription }}
      </p>
      
      <!-- Progress Bar -->
      <div class="mb-6">
        <ProgressBar 
          :percentage="progressPercentage"
          color="blue"
          :showLabel="true"
          :label="`Step ${currentStep + 1} of ${steps.length}`"
          :description="steps[currentStep]?.title"
        />
      </div>
      
      <!-- Progress Steps -->
      <div class="bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-6 border border-blue-200">
        <div class="flex items-center mb-4">
          <div class="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center mr-3">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h4 class="text-lg font-bold text-blue-900">Analysis Progress</h4>
        </div>
        <div class="space-y-4">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center"
          :class="stepClasses(index)"
        >
          <div class="flex-shrink-0 mr-3">
            <div 
              v-if="index < currentStep"
              class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-green-400"
            >
              <Icon name="checkmark" class="w-4 h-4" color="white" />
            </div>
            <div 
              v-else-if="index === currentStep"
              class="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-900 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-600 relative"
            >
              <Spinner class="w-4 h-4" color="white" variant="pulse" />
              <!-- Patriotic ring effect -->
              <div class="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-30"></div>
            </div>
            <div 
              v-else
              class="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full border-2 border-gray-200 shadow-sm"
            ></div>
          </div>
          
          <div class="flex-1">
            <p 
              class="text-sm font-semibold"
              :class="index <= currentStep ? 'text-blue-900' : 'text-gray-500'"
            >
              {{ step.title }}
            </p>
            <p 
              v-if="step.description"
              class="text-xs"
              :class="index <= currentStep ? 'text-blue-700' : 'text-gray-400'"
            >
              {{ step.description }}
            </p>
          </div>
        </div>
        </div>
      </div>
      
      <!-- Estimated Time -->
      <div class="mt-6 p-4 bg-gradient-to-r from-amber-50 to-red-50 rounded-lg border border-amber-200">
        <div class="flex items-center justify-center">
          <div class="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mr-3">
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold text-amber-800">
            Estimated time remaining: {{ estimatedTime }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Spinner from '../atoms/Spinner.vue'
import ProgressBar from '../atoms/ProgressBar.vue'

interface Step {
  title: string
  description?: string
}

interface Props {
  stage: 'uploading' | 'analyzing' | 'processing'
}

const props = defineProps<Props>()

const steps: Step[] = [
  {
    title: 'Uploading PDF',
    description: 'Securely uploading your decision letter'
  },
  {
    title: 'Extracting Text',
    description: 'Converting PDF to readable text'
  },
  {
    title: 'Analyzing Content',
    description: 'Identifying conditions and decisions'
  },
  {
    title: 'Enhancing with VA Knowledge',
    description: 'Adding regulations and next steps'
  },
  {
    title: 'Generating Report',
    description: 'Creating your personalized analysis'
  }
]

const currentStep = computed(() => {
  switch (props.stage) {
    case 'uploading':
      return 0
    case 'analyzing':
      return 2
    case 'processing':
      return 4
    default:
      return 0
  }
})

const animatedProgress = ref(0)

const animateProgress = (from: number, to: number, duration: number) => {
  const startTime = Date.now()
  const difference = to - from
  
  const updateProgress = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Use ease-out easing for smooth animation
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    animatedProgress.value = from + (difference * easedProgress)
    
    if (progress < 1) {
      requestAnimationFrame(updateProgress)
    } else {
      animatedProgress.value = to
    }
  }
  
  requestAnimationFrame(updateProgress)
}

const progressPercentage = computed(() => {
  return Math.round(animatedProgress.value)
})

// Animate progress based on stage
watch(() => props.stage, (newStage) => {
  let targetProgress = 0
  let duration = 2000 // 2 seconds per stage
  
  switch (newStage) {
    case 'uploading':
      targetProgress = 20
      duration = 2000
      break
    case 'analyzing':
      targetProgress = 80
      duration = 3000
      break
    case 'processing':
      targetProgress = 100
      duration = 2000
      break
    default:
      targetProgress = 0
  }
  
  // Only animate if we're moving forward, not backward
  if (targetProgress > animatedProgress.value) {
    animateProgress(animatedProgress.value, targetProgress, duration)
  }
}, { immediate: true })

const stageTitle = computed(() => {
  switch (props.stage) {
    case 'uploading':
      return 'Uploading Your Decision Letter'
    case 'analyzing':
      return 'Analyzing Your Decision Letter'
    case 'processing':
      return 'Processing Your Analysis'
    default:
      return 'Processing...'
  }
})

const stageDescription = computed(() => {
  switch (props.stage) {
    case 'uploading':
      return 'Please wait while we securely upload your file...'
    case 'analyzing':
      return 'This may take 30-60 seconds while we analyze your decision...'
    case 'processing':
      return 'Almost done! We\'re generating your personalized report...'
    default:
      return 'Please wait...'
  }
})

const estimatedTime = computed(() => {
  switch (props.stage) {
    case 'uploading':
      return '10-30 seconds'
    case 'analyzing':
      return '30-60 seconds'
    case 'processing':
      return '5-15 seconds'
    default:
      return '1-2 minutes'
  }
})

const stepClasses = (index: number) => {
  if (index < currentStep.value) {
    return 'opacity-100'
  } else if (index === currentStep.value) {
    return 'opacity-100'
  } else {
    return 'opacity-60'
  }
}
</script>
