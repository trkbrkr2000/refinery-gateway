<template>
  <div class="space-y-8">
    <!-- Granted Conditions -->
    <div v-if="grantedConditions.length > 0" class="bg-white rounded-xl shadow-lg p-8">
      <div class="flex items-center mb-6">
        <Icon name="heroicons:check-circle" class="w-8 h-8 text-green-600 mr-3" />
        <h2 class="text-2xl font-bold text-slate-900">
          Granted Conditions ({{ grantedConditions.length }})
        </h2>
      </div>
      <div class="space-y-4">
        <div
          v-for="condition in grantedConditions"
          :key="condition.condition"
          class="flex items-center justify-between p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:shadow-md transition-all"
        >
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <Icon name="heroicons:check-circle-solid" class="w-5 h-5 text-green-600 mr-2" />
              <h3 class="text-lg font-semibold text-slate-900">{{ condition.condition }}</h3>
            </div>
            <p class="text-sm text-slate-600 capitalize">{{ condition.decision }}</p>
            <p v-if="condition.effectiveDate" class="text-xs text-slate-500 mt-1">
              Effective: {{ formatDate(condition.effectiveDate) }}
            </p>
          </div>
          <div class="text-right ml-6">
            <div class="text-4xl font-bold text-green-600">
              {{ condition.ratingPercentage }}<span class="text-2xl">%</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">Rating</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Denied Conditions -->
    <div v-if="deniedConditions.length > 0" class="bg-white rounded-xl shadow-lg p-8">
      <div class="flex items-center mb-6">
        <Icon name="heroicons:x-circle" class="w-8 h-8 text-red-600 mr-3" />
        <h2 class="text-2xl font-bold text-slate-900">
          Denied Conditions ({{ deniedConditions.length }})
        </h2>
      </div>
      <div class="space-y-4">
        <div
          v-for="condition in deniedConditions"
          :key="condition.condition"
          class="p-6 bg-red-50 border-2 border-red-200 rounded-xl hover:shadow-md transition-all"
        >
          <div class="flex items-start">
            <Icon name="heroicons:x-circle-solid" class="w-5 h-5 text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ condition.condition }}</h3>
              <div v-if="condition.reason" class="mb-3">
                <p class="text-sm text-slate-700">{{ condition.reason }}</p>
              </div>
              <div v-if="condition.laymanReason" class="bg-white bg-opacity-50 rounded-lg p-4 mb-3">
                <div class="flex items-start">
                  <Icon name="heroicons:light-bulb" class="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div class="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">
                      In Plain English
                    </div>
                    <p class="text-sm text-slate-700">{{ condition.laymanReason }}</p>
                  </div>
                </div>
              </div>
              <div v-if="condition.category" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Icon name="heroicons:tag" class="w-3 h-3 mr-1" />
                {{ formatCategory(condition.category) }}
              </div>
            </div>
          </div>
          <!-- Teaser for next steps (only for anonymous users) -->
          <div v-if="!isAuthenticated" class="mt-4 border-t border-red-200 pt-4">
            <button
              @click="$emit('show-signup')"
              class="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Icon name="heroicons:lock-closed" class="w-4 h-4 mr-2" />
              Unlock detailed next steps to appeal this denial
              <Icon name="heroicons:arrow-right" class="w-4 h-4 ml-2" />
            </button>
          </div>
          <!-- Coming soon message for authenticated users -->
          <div v-else class="mt-4 border-t border-red-200 pt-4">
            <div class="flex items-center text-sm text-slate-600">
              <Icon name="heroicons:clock" class="w-4 h-4 mr-2 text-amber-500" />
              <span>Personalized next steps coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Deferred Conditions -->
    <div v-if="deferredConditions.length > 0" class="bg-white rounded-xl shadow-lg p-8">
      <div class="flex items-center mb-6">
        <Icon name="heroicons:clock" class="w-8 h-8 text-amber-600 mr-3" />
        <h2 class="text-2xl font-bold text-slate-900">
          Deferred Conditions ({{ deferredConditions.length }})
        </h2>
      </div>
      <div class="space-y-4">
        <div
          v-for="condition in deferredConditions"
          :key="condition.condition"
          class="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl hover:shadow-md transition-all"
        >
          <div class="flex items-start">
            <Icon name="heroicons:clock-solid" class="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ condition.condition }}</h3>
              <p class="text-sm text-slate-700">{{ condition.reason || 'Decision pending - additional evidence required' }}</p>
              <div v-if="condition.laymanReason" class="mt-3 bg-white bg-opacity-50 rounded-lg p-3">
                <div class="flex items-start">
                  <Icon name="heroicons:light-bulb" class="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
                  <p class="text-sm text-slate-700">{{ condition.laymanReason }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Condition {
  condition: string
  decision: string
  ratingPercentage?: number
  effectiveDate?: string
  reason?: string
  laymanReason?: string
  category?: string
}

const props = defineProps<{
  conditions: Condition[]
  denialReasons?: Array<{
    condition: string
    reason: string
    laymanReason?: string
    category?: string
  }>
  deferredReasons?: Array<{
    condition: string
    reason: string
    laymanReason?: string
  }>
  isAuthenticated?: boolean
}>()

defineEmits<{
  (e: 'show-signup'): void
}>()

const isAuthenticated = computed(() => props.isAuthenticated || false)

// Separate conditions by status
const grantedConditions = computed(() =>
  props.conditions.filter(c => c.decision === 'granted')
)

const deniedConditions = computed(() => {
  const denied = props.conditions.filter(c => c.decision === 'denied')
  // Enrich with denial reasons if available
  return denied.map(condition => {
    const denialInfo = props.denialReasons?.find(d => d.condition === condition.condition)
    return {
      ...condition,
      reason: denialInfo?.reason || condition.reason,
      laymanReason: denialInfo?.laymanReason,
      category: denialInfo?.category
    }
  })
})

const deferredConditions = computed(() => {
  const deferred = props.conditions.filter(c => c.decision === 'deferred')
  // Enrich with deferred reasons if available
  return deferred.map(condition => {
    const deferredInfo = props.deferredReasons?.find(d => d.condition === condition.condition)
    return {
      ...condition,
      reason: deferredInfo?.reason || condition.reason,
      laymanReason: deferredInfo?.laymanReason
    }
  })
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatCategory = (category: string) => {
  if (!category) return ''
  return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
</script>
