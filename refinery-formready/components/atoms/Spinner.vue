<template>
  <div :class="spinnerClasses">
    <!-- Dots variant -->
    <div v-if="props.variant === 'dots'" :class="spinnerDotsClasses">
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
    </div>
    
    <!-- Pulse variant -->
    <div v-else-if="props.variant === 'pulse'" :class="spinnerPulseClasses">
      <div class="spinner-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'indigo-600' | 'blue-600' | 'slate-600' | 'white'
  variant?: 'dots' | 'pulse'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'indigo-600',
  variant: 'dots'
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }
  
  return sizeClasses[props.size]
})

const spinnerDotsClasses = computed(() => {
  const colorClasses = {
    'indigo-600': 'text-indigo-600',
    'blue-600': 'text-blue-600',
    'slate-600': 'text-slate-600',
    'white': 'text-white'
  }
  
  return `spinner-dots ${colorClasses[props.color]}`
})

const spinnerPulseClasses = computed(() => {
  const colorClasses = {
    'indigo-600': 'text-indigo-600',
    'blue-600': 'text-blue-600',
    'slate-600': 'text-slate-600',
    'white': 'text-white'
  }
  
  return `spinner-pulse-container ${colorClasses[props.color]}`
})
</script>

<style scoped>
.spinner-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.spinner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  animation: spinner-bounce 1.4s ease-in-out infinite both;
}

.spinner-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.spinner-dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes spinner-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.spinner-pulse-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.spinner-pulse {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: currentColor;
  animation: spinner-pulse 2s ease-in-out infinite;
}

@keyframes spinner-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
