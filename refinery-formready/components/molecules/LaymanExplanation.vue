<template>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div class="flex items-start mb-3">
      <Icon name="info" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" color="blue-600" />
      <h4 class="text-lg font-semibold text-blue-900">In Plain English</h4>
    </div>
    
    <div class="space-y-4">
      <div v-if="laymanReason" class="text-blue-800">
        <p class="leading-relaxed">{{ laymanReason }}</p>
      </div>
      
      <div v-if="nextSteps" class="bg-blue-100 border border-blue-300 rounded-md p-3">
        <div class="flex items-start">
          <Icon name="lightning-bolt" class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" color="blue-600" />
          <div>
            <h5 class="font-medium text-blue-900 mb-1">Recommended Next Steps</h5>
            <p class="text-blue-800 text-sm leading-relaxed">{{ nextSteps }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="!laymanReason && !nextSteps" class="text-center py-4">
        <Icon name="exclamation" class="w-5 h-5 mx-auto mb-2" color="blue-400" />
        <p class="text-blue-600 text-sm">Plain English explanation not available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Props {
  laymanReason?: string
  nextSteps?: string
}

const props = defineProps<Props>()
</script>
