<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="linkClasses"
    class="block p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
  >
    <div class="flex items-start">
      <Icon 
        :name="resourceIcon" 
        :size="size" 
        :color="iconColor"
        class="mr-3 mt-0.5 flex-shrink-0"
      />
      
      <div class="flex-1">
        <h4 class="font-medium text-slate-900 mb-1">{{ title }}</h4>
        <p class="text-sm text-slate-600 leading-relaxed">{{ description }}</p>
        
        <div class="flex items-center mt-2 text-xs text-slate-500">
          <span>{{ typeLabel }}</span>
          <Icon name="external-link" class="w-3 h-3 ml-1" color="slate-400" />
        </div>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">

interface Props {
  title: string
  description: string
  url: string
  type: 'phone' | 'website' | 'document' | 'form' | 'organization'
}

const props = defineProps<Props>()

const resourceIcon = computed(() => {
  switch (props.type) {
    case 'phone':
      return 'phone'
    case 'website':
      return 'external-link'
    case 'document':
      return 'document'
    case 'form':
      return 'document'
    case 'organization':
      return 'user'
    default:
      return 'external-link'
  }
})

const iconColor = computed(() => {
  switch (props.type) {
    case 'phone':
      return 'green-600'
    case 'website':
      return 'blue-600'
    case 'document':
      return 'slate-600'
    case 'form':
      return 'indigo-600'
    case 'organization':
      return 'purple-600'
    default:
      return 'slate-600'
  }
})

const typeLabel = computed(() => {
  switch (props.type) {
    case 'phone':
      return 'Phone Support'
    case 'website':
      return 'Website'
    case 'document':
      return 'Document'
    case 'form':
      return 'Form'
    case 'organization':
      return 'Organization'
    default:
      return 'Resource'
  }
})

const linkClasses = computed(() => {
  switch (props.type) {
    case 'phone':
      return 'bg-green-50 border-green-200 hover:bg-green-100'
    case 'website':
      return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    case 'document':
      return 'bg-slate-50 border-slate-200 hover:bg-slate-100'
    case 'form':
      return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
    case 'organization':
      return 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    default:
      return 'bg-slate-50 border-slate-200 hover:bg-slate-100'
  }
})

const size = computed(() => 'md')
</script>
