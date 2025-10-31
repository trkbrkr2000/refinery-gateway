<template>
  <div class="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-xl overflow-hidden mb-8 border-2 border-blue-200">
    <!-- Header with Coming Soon Badge -->
    <div class="relative bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
      <div class="absolute top-4 right-4">
        <div class="bg-amber-400 text-slate-900 font-bold text-xs px-4 py-2 rounded-full">
          COMING SOON
        </div>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">
        🎯 Your Personalized Action Plan
      </h2>
      <p class="text-blue-100">
        Premium features launching soon — sign up to be notified
      </p>
    </div>

    <!-- Blurred Preview Content -->
    <div class="relative">
      <!-- Actual Content (Blurred) -->
      <div class="p-8 space-y-6 blur-sm select-none pointer-events-none">
        <!-- Appeal Recommendation -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <div class="flex items-start mb-4">
            <div class="bg-blue-100 rounded-lg p-3 mr-4">
              <Icon name="heroicons:scale" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-slate-900 mb-2">
                Appeal Strategy: Higher-Level Review
              </h3>
              <p class="text-slate-600 mb-4">
                Based on your denial reasons, a Higher-Level Review has the highest success rate for your case.
              </p>
            </div>
          </div>

          <!-- Timeline -->
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-slate-900 mb-3 flex items-center">
              <Icon name="heroicons:calendar" class="w-5 h-5 mr-2 text-blue-600" />
              Your Timeline
            </h4>
            <div class="space-y-2">
              <div class="flex items-center text-sm">
                <div class="w-24 font-medium text-slate-600">Day 1-7:</div>
                <div class="flex-1 text-slate-900">Gather medical evidence from VA records</div>
              </div>
              <div class="flex items-center text-sm">
                <div class="w-24 font-medium text-slate-600">Day 8-14:</div>
                <div class="flex-1 text-slate-900">Request DBQ from private provider</div>
              </div>
              <div class="flex items-center text-sm">
                <div class="w-24 font-medium text-slate-600">Day 15-30:</div>
                <div class="flex-1 text-slate-900">Submit HLR with new evidence</div>
              </div>
            </div>
          </div>

          <!-- Evidence Checklist -->
          <div class="bg-amber-50 rounded-lg p-4">
            <h4 class="font-semibold text-slate-900 mb-3 flex items-center">
              <Icon name="heroicons:clipboard-document-check" class="w-5 h-5 mr-2 text-amber-600" />
              Evidence You Need
            </h4>
            <ul class="space-y-2">
              <li class="flex items-start text-sm">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span class="text-slate-900">Sleep study results showing AHI score</span>
              </li>
              <li class="flex items-start text-sm">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span class="text-slate-900">Nexus letter linking condition to service</span>
              </li>
              <li class="flex items-start text-sm">
                <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span class="text-slate-900">Buddy statements from service members</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Additional Denied Conditions -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
          <div class="flex items-start mb-4">
            <div class="bg-red-100 rounded-lg p-3 mr-4">
              <Icon name="heroicons:document-text" class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">
                Next Steps for PTSD Denial
              </h3>
              <p class="text-slate-600">
                Your PTSD claim was denied due to insufficient evidence of a stressor event...
              </p>
            </div>
          </div>
        </div>

        <!-- Increase Rating Opportunities -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
          <div class="flex items-start mb-4">
            <div class="bg-green-100 rounded-lg p-3 mr-4">
              <Icon name="heroicons:arrow-trending-up" class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">
                Potential Rating Increases
              </h3>
              <p class="text-slate-600">
                Your current conditions may qualify for higher ratings. We identified 2 opportunities...
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay with CTA -->
      <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-slate-900/70 via-slate-900/50 to-transparent">
        <div class="text-center px-6 mt-24">
          <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto transform hover:scale-105 transition-transform">
            <div class="bg-gradient-to-br from-blue-100 to-amber-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Icon name="heroicons:rocket-launch" class="w-10 h-10 text-blue-600" />
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-3">
              Premium Features Coming Soon
            </h3>
            <p class="text-slate-600 mb-6">
              Sign up for free to be notified when these features launch:
            </p>
            <ul class="text-left space-y-2 mb-6">
              <li class="flex items-center text-sm text-slate-700">
                <Icon name="heroicons:clock" class="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                <span>Step-by-step appeal timelines</span>
              </li>
              <li class="flex items-center text-sm text-slate-700">
                <Icon name="heroicons:clock" class="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                <span>Specific evidence recommendations</span>
              </li>
              <li class="flex items-center text-sm text-slate-700">
                <Icon name="heroicons:clock" class="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                <span>Rating increase opportunities</span>
              </li>
              <li class="flex items-center text-sm text-slate-700">
                <Icon name="heroicons:clock" class="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                <span>Deadline tracking & reminders</span>
              </li>
            </ul>
            <button
              @click="$emit('show-signup')"
              class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg transform hover:scale-105"
            >
              <Icon name="heroicons:bell" class="w-5 h-5 inline mr-2" />
              Get Notified When Features Launch
            </button>
            <p class="text-xs text-slate-500 mt-3">
              Free account • No credit card required • Save your results now
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'show-signup': []
}>()
</script>
