<template>
  <Transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="show"
      :class="toastClasses"
      class="fixed top-4 right-4 z-50 max-w-md w-full shadow-lg rounded-lg pointer-events-auto"
    >
      <div class="flex items-start p-4">
        <div class="flex-shrink-0">
          <Icon v-if="type === 'success'" name="heroicons:check-circle" class="h-6 w-6 text-green-400" />
          <Icon v-else-if="type === 'error'" name="heroicons:x-circle" class="h-6 w-6 text-red-400" />
          <Icon v-else-if="type === 'warning'" name="heroicons:exclamation-triangle" class="h-6 w-6 text-yellow-400" />
          <Icon v-else name="heroicons:information-circle" class="h-6 w-6 text-blue-400" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium" :class="titleColorClass">
            {{ title }}
          </p>
          <p v-if="message" class="mt-1 text-sm" :class="messageColorClass">
            {{ message }}
          </p>
          <div v-if="action" class="mt-3 flex space-x-3">
            <button
              @click="handleAction"
              type="button"
              class="text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="actionButtonClass"
            >
              {{ action.label }}
            </button>
            <button
              v-if="action.dismiss"
              @click="close"
              type="button"
              class="text-sm font-medium text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              Dismiss
            </button>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="close"
            class="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="focusRingClass"
          >
            <span class="sr-only">Close</span>
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  action?: {
    label: string
    callback: () => void
    dismiss?: boolean
  }
  duration?: number // Auto-close after duration in ms (0 = no auto-close)
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: '',
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const show = ref(true)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const toastClasses = computed(() => {
  const baseClasses = 'bg-white border-l-4'
  switch (props.type) {
    case 'success':
      return `${baseClasses} border-green-400`
    case 'error':
      return `${baseClasses} border-red-400`
    case 'warning':
      return `${baseClasses} border-yellow-400`
    default:
      return `${baseClasses} border-blue-400`
  }
})

const titleColorClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    default:
      return 'text-blue-800'
  }
})

const messageColorClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-700'
    case 'error':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    default:
      return 'text-blue-700'
  }
})

const actionButtonClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-600 hover:text-green-500 focus:ring-green-500'
    case 'error':
      return 'text-red-600 hover:text-red-500 focus:ring-red-500'
    case 'warning':
      return 'text-yellow-600 hover:text-yellow-500 focus:ring-yellow-500'
    default:
      return 'text-blue-600 hover:text-blue-500 focus:ring-blue-500'
  }
})

const focusRingClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'focus:ring-green-500'
    case 'error':
      return 'focus:ring-red-500'
    case 'warning':
      return 'focus:ring-yellow-500'
    default:
      return 'focus:ring-blue-500'
  }
})

const close = () => {
  show.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  setTimeout(() => emit('close'), 300) // Wait for transition
}

const handleAction = () => {
  if (props.action) {
    props.action.callback()
    if (props.action.dismiss) {
      close()
    }
  }
}

onMounted(() => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>
