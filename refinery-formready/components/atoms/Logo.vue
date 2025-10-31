<template>
  <NuxtLink :to="to" class="flex items-center group">
    <!-- Logo Mark: Shield with checkmark and star -->
    <svg
      :class="[
        'flex-shrink-0 transition-transform group-hover:scale-105',
        sizeClasses[size].icon
      ]"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Shield -->
      <path
        d="M512 85.3L170.7 170.7V512C170.7 725.3 512 938.7 512 938.7C512 938.7 853.3 725.3 853.3 512V170.7L512 85.3Z"
        :fill="variant === 'white' ? 'white' : '#2563EB'"
        :stroke="variant === 'white' ? 'white' : '#1E40AF'"
        stroke-width="40"
      />

      <!-- Checkmark -->
      <path
        d="M341.3 512L426.7 597.3L682.7 341.3"
        :stroke="variant === 'white' ? '#2563EB' : 'white'"
        stroke-width="80"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Star -->
      <path
        d="M512 640L472 725L380 738L446 802L430 894L512 852L594 894L578 802L644 738L552 725Z"
        :fill="variant === 'white' ? '#FCD34D' : '#F59E0B'"
      />
    </svg>

    <!-- Logo Text -->
    <div
      v-if="showText"
      class="ml-3 flex flex-col"
    >
      <span
        :class="[
          'font-bold leading-tight tracking-tight',
          sizeClasses[size].text,
          variant === 'white' ? 'text-white' : 'text-blue-900'
        ]"
      >
        ClaimReady
      </span>
      <span
        v-if="showTagline && size !== 'sm'"
        :class="[
          'text-xs font-medium leading-tight',
          variant === 'white' ? 'text-blue-100' : 'text-blue-600'
        ]"
      >
        {{ tagline }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white'
  showText?: boolean
  showTagline?: boolean
  tagline?: string
}

const props = withDefaults(defineProps<Props>(), {
  to: '/',
  size: 'md',
  variant: 'default',
  showText: true,
  showTagline: false,
  tagline: 'Veteran-Built, AI-Powered'
})

const sizeClasses = {
  sm: {
    icon: 'w-8 h-8',
    text: 'text-lg'
  },
  md: {
    icon: 'w-10 h-10',
    text: 'text-xl'
  },
  lg: {
    icon: 'w-14 h-14',
    text: 'text-3xl'
  },
  xl: {
    icon: 'w-20 h-20',
    text: 'text-5xl'
  }
}
</script>
