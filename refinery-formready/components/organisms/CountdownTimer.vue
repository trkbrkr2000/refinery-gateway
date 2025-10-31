<template>
  <div class="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 mb-8">
    <div class="flex flex-col md:flex-row items-center justify-between text-white">
      <div class="flex items-center mb-4 md:mb-0">
        <Icon name="heroicons:clock" class="w-8 h-8 mr-3 animate-pulse" />
        <div>
          <h3 class="text-xl font-bold">Your Results Expire Soon</h3>
          <p class="text-amber-100 text-sm">Sign up free to save permanently</p>
        </div>
      </div>

      <!-- Countdown Display -->
      <div class="flex items-center space-x-2">
        <!-- Hours -->
        <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[70px]">
          <div class="text-3xl font-bold">{{ hours }}</div>
          <div class="text-xs text-amber-100 uppercase tracking-wide">Hours</div>
        </div>
        <div class="text-3xl font-bold">:</div>

        <!-- Minutes -->
        <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[70px]">
          <div class="text-3xl font-bold">{{ minutes }}</div>
          <div class="text-xs text-amber-100 uppercase tracking-wide">Minutes</div>
        </div>
        <div class="text-3xl font-bold">:</div>

        <!-- Seconds -->
        <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[70px]">
          <div class="text-3xl font-bold">{{ seconds }}</div>
          <div class="text-xs text-amber-100 uppercase tracking-wide">Seconds</div>
        </div>
      </div>

      <!-- CTA Button -->
      <button
        @click="$emit('show-signup')"
        class="bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-amber-50 transition-all transform hover:scale-105 shadow-lg mt-4 md:mt-0"
      >
        <Icon name="heroicons:bookmark" class="w-4 h-4 inline mr-2" />
        Save Now
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  expiresAt: string // ISO date string
}

const props = defineProps<Props>()

const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')

const updateCountdown = () => {
  const now = new Date().getTime()
  const expiry = new Date(props.expiresAt).getTime()
  const distance = expiry - now

  if (distance < 0) {
    hours.value = '00'
    minutes.value = '00'
    seconds.value = '00'
    return
  }

  const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((distance % (1000 * 60)) / 1000)

  hours.value = h.toString().padStart(2, '0')
  minutes.value = m.toString().padStart(2, '0')
  seconds.value = s.toString().padStart(2, '0')
}

let interval: NodeJS.Timeout | null = null

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

defineEmits<{
  'show-signup': []
}>()
</script>
