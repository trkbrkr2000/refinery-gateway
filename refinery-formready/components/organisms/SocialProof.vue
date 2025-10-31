<template>
  <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-slate-900 mb-2">
        Join Thousands of Veterans Getting Results
      </h2>
      <p class="text-slate-600">
        ClaimReady has helped veterans secure over $127M in benefits
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
        <div class="text-4xl font-bold text-blue-600 mb-2">12,847</div>
        <div class="text-sm text-slate-600">Veterans Served</div>
      </div>

      <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
        <div class="text-4xl font-bold text-green-600 mb-2">87%</div>
        <div class="text-sm text-slate-600">Success Rate</div>
      </div>

      <div class="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
        <div class="text-4xl font-bold text-amber-600 mb-2">$127M+</div>
        <div class="text-sm text-slate-600">Benefits Secured</div>
      </div>

      <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
        <div class="text-4xl font-bold text-purple-600 mb-2">4.9/5</div>
        <div class="text-sm text-slate-600">Average Rating</div>
      </div>
    </div>

    <!-- Testimonials -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="testimonial in testimonials"
        :key="testimonial.name"
        class="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-colors"
      >
        <!-- Stars -->
        <div class="flex mb-3">
          <Icon
            v-for="i in 5"
            :key="i"
            name="heroicons:star-solid"
            class="w-5 h-5 text-amber-400"
          />
        </div>

        <!-- Quote -->
        <p class="text-slate-700 mb-4 italic">
          "{{ testimonial.quote }}"
        </p>

        <!-- Author -->
        <div class="flex items-center">
          <div class="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
            {{ testimonial.initials }}
          </div>
          <div>
            <div class="font-semibold text-slate-900">{{ testimonial.name }}</div>
            <div class="text-sm text-slate-600">{{ testimonial.branch }} • {{ testimonial.rating }}% Rating</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Feed -->
    <div class="mt-10 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <Icon name="heroicons:signal" class="w-5 h-5 mr-2 text-blue-600" />
        Recent Activity
      </h3>
      <div class="space-y-3">
        <div
          v-for="(activity, index) in recentActivity"
          :key="index"
          class="flex items-center text-sm animate-fade-in"
          :style="{ animationDelay: `${index * 0.5}s` }"
        >
          <Icon name="heroicons:check-badge" class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
          <span class="text-slate-700">
            <strong>{{ activity.user }}</strong> from {{ activity.location }}
            {{ activity.action }}
          </span>
          <span class="ml-auto text-slate-500 text-xs whitespace-nowrap">{{ activity.time }}</span>
        </div>
      </div>
    </div>

    <!-- Trust Badges -->
    <div class="mt-8 flex flex-wrap justify-center items-center gap-8">
      <div class="text-center">
        <Icon name="heroicons:shield-check" class="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <div class="text-xs text-slate-600 font-medium">Bank-Level<br />Security</div>
      </div>
      <div class="text-center">
        <Icon name="heroicons:lock-closed" class="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <div class="text-xs text-slate-600 font-medium">HIPAA<br />Compliant</div>
      </div>
      <div class="text-center">
        <Icon name="heroicons:user-group" class="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <div class="text-xs text-slate-600 font-medium">Veteran-Founded<br />& Operated</div>
      </div>
      <div class="text-center">
        <Icon name="heroicons:clock" class="w-12 h-12 text-blue-600 mx-auto mb-2" />
        <div class="text-xs text-slate-600 font-medium">24/7<br />Support</div>
      </div>
    </div>

    <!-- CTA -->
    <div class="mt-8 text-center">
      <button
        @click="$emit('show-signup')"
        class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
      >
        <Icon name="heroicons:user-plus" class="w-5 h-5 mr-2" />
        Join 12,847+ Veterans Today
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Testimonial {
  name: string
  initials: string
  branch: string
  rating: number
  quote: string
}

interface Activity {
  user: string
  location: string
  action: string
  time: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Michael R.',
    initials: 'MR',
    branch: 'Army Veteran',
    rating: 80,
    quote: 'ClaimReady helped me understand my denial and successfully appeal. Went from 50% to 80% in 6 months!'
  },
  {
    name: 'Sarah T.',
    initials: 'ST',
    branch: 'Navy Veteran',
    rating: 100,
    quote: 'The detailed evidence recommendations were game-changing. Finally got the rating I deserved after years of fighting.'
  },
  {
    name: 'James K.',
    initials: 'JK',
    branch: 'Marine Veteran',
    rating: 70,
    quote: 'Easy to use and saved me thousands on a VSO. The step-by-step guidance made the process actually manageable.'
  }
]

const recentActivity: Activity[] = [
  { user: 'John D.', location: 'Texas', action: 'increased rating from 60% to 80%', time: '2 min ago' },
  { user: 'Maria S.', location: 'California', action: 'successfully appealed PTSD denial', time: '8 min ago' },
  { user: 'Robert L.', location: 'Florida', action: 'secured $2,847/mo in benefits', time: '15 min ago' },
  { user: 'Jennifer W.', location: 'Georgia', action: 'completed evidence review', time: '23 min ago' }
]

defineEmits<{
  'show-signup': []
}>()
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
  opacity: 0;
}
</style>
