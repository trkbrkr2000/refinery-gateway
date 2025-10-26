<template>
  <div class="border border-slate-200 rounded-lg overflow-hidden">
    <button
      @click="toggleExpanded"
      class="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 flex items-center justify-between text-left"
    >
      <div class="flex items-center">
        <Icon name="document" class="w-4 h-4 mr-2" color="red-600" />
        <div>
          <h4 class="font-medium text-slate-900">{{ citation }}</h4>
          <p class="text-sm text-slate-600">{{ title }}</p>
        </div>
      </div>
      <Icon 
        :name="expanded ? 'chevron-down' : 'chevron-right'" 
        class="w-4 h-4" 
        color="slate-500"
        :class="{ 'rotate-180': expanded }"
      />
    </button>
    
    <div v-if="expanded" class="px-4 py-3 bg-white border-t border-slate-200">
      <div class="space-y-3">
        <div class="text-sm text-slate-700 leading-relaxed">
          {{ snippet }}
        </div>
        
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button 
            variant="ghost" 
            class="w-4 h-4"
            icon="copy"
            @click="copyCitation"
          >
            Copy Citation
          </Button>
          
          <Button 
            variant="ghost" 
            class="w-4 h-4"
            icon="external-link"
            @click="openFullRegulation"
          >
            Read Full Regulation
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '../atoms/Badge.vue'
import Button from '../atoms/Button.vue'

interface Props {
  citation: string
  title: string
  snippet: string
  fullUrl?: string
}

const props = defineProps<Props>()

const expanded = ref(false)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const copyCitation = async () => {
  try {
    await navigator.clipboard.writeText(props.citation)
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy citation:', err)
  }
}

const openFullRegulation = () => {
  if (props.fullUrl) {
    window.open(props.fullUrl, '_blank', 'noopener,noreferrer')
  } else {
    // Fallback to eCFR search
    const searchUrl = `https://www.ecfr.gov/current/title-38/chapter-I/part-3#${props.citation.replace(/[^\d.]/g, '')}`
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>
