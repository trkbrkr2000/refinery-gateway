<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <Button 
            @click="navigateTo('/')"
            variant="secondary"
          >
            <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div class="text-center">
            <h1 class="text-xl font-bold text-slate-900">Choose Your Plan</h1>
            <p class="text-sm text-slate-500">Made for veterans by veterans</p>
          </div>
          
          <div class="w-32"></div> <!-- Spacer to center the title -->
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-slate-900 mb-4">
          Free Analysis + Premium Features
        </h2>
        <p class="text-xl text-slate-600 max-w-3xl mx-auto">
          Get comprehensive VA decision letter analysis for free, with premium features for advanced claim tracking and analytics.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <!-- Free Plan -->
        <div class="bg-white rounded-2xl shadow-lg p-8 border-2 border-slate-200 flex flex-col">
          <div class="text-center mb-8">
            <div class="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <Icon name="heroicons:check-circle" class="w-4 h-4 mr-2" />
              Always Free
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-2">Free Analysis</h3>
            <p class="text-slate-600">Perfect for analyzing individual decision letters</p>
          </div>

          <div class="flex-1 flex flex-col">
            <div class="text-center mb-6">
              <span class="text-4xl font-bold text-slate-900">$0</span>
              <span class="text-slate-500">/month</span>
            </div>

            <div class="space-y-4 mb-8">
              <div class="flex items-center">
                <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                <span class="text-slate-700">Decision letter analysis</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                <span class="text-slate-700">Denial reason explanations</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                <span class="text-slate-700">Evidence checklists</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                <span class="text-slate-700">Timeline guidance</span>
              </div>
              <div class="flex items-center">
                <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                <span class="text-slate-700">Basic next steps</span>
              </div>
            </div>

            <div class="mt-auto text-center">
              <Button 
                @click="navigateTo('/analyze-decision')"
                variant="secondary"
              >
                Start Free Analysis
              </Button>
              <div class="text-center mt-3">
                <p class="text-sm text-slate-500">
                  Always free, no credit card required
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Plan -->
        <div class="bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl shadow-xl p-8 border-2 border-blue-300 relative flex flex-col">
          <!-- Popular Badge -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div class="bg-gradient-to-r from-blue-600 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-medium">
              <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
              Most Popular
            </div>
          </div>

          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-2">Premium Tracking</h3>
            <p class="text-slate-600">Advanced claim tracking and analytics</p>
          </div>

          <div class="flex-1 flex flex-col">
            <div class="text-center mb-6">
              <span class="text-4xl font-bold text-slate-900">$19</span>
              <span class="text-slate-500">/month</span>
              <div class="text-sm text-slate-500 mt-1">Cancel anytime</div>
            </div>

            <div class="space-y-4 mb-8">
              <!-- Free features -->
              <div class="space-y-3">
                <div class="text-sm font-medium text-slate-500 uppercase tracking-wide">Everything in Free</div>
                <div class="flex items-center">
                  <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                  <span class="text-slate-700">Decision letter analysis</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                  <span class="text-slate-700">Denial reason explanations</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:check" class="w-4 h-4 mr-3" color="green-600" />
                  <span class="text-slate-700">Evidence checklists</span>
                </div>
              </div>

              <!-- Premium features -->
              <div class="space-y-3">
                <div class="text-sm font-medium text-slate-500 uppercase tracking-wide">Premium Features</div>
                <div class="flex items-center">
                  <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-3" color="blue-600" />
                  <span class="text-slate-700 font-medium">Multi-claim tracking</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:puzzle-piece" class="w-4 h-4 mr-3" color="blue-600" />
                  <span class="text-slate-700 font-medium">Chrome extension for VA.gov sync</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:shield-check" class="w-4 h-4 mr-3" color="blue-600" />
                  <span class="text-slate-700 font-medium">Advanced analytics & predictions</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:users" class="w-4 h-4 mr-3" color="blue-600" />
                  <span class="text-slate-700 font-medium">Personalized VSO recommendations</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:document-text" class="w-4 h-4 mr-3" color="blue-600" />
                  <span class="text-slate-700 font-medium">Nexus statement templates</span>
                </div>
                <div class="flex items-center">
                  <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-3" color="blue-600" />
                  <span class="text-slate-700 font-medium">Success rate predictions</span>
                </div>
              </div>
            </div>

            <div class="mt-auto text-center">
              <Button 
                @click="handleUpgrade"
                variant="primary"
              >
                <Icon name="heroicons:star" class="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>

              <div class="text-center mt-3">
                <p class="text-sm text-slate-500">
                  <Icon name="heroicons:shield-check" class="w-4 h-4 mr-1" />
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Comparison -->
      <div class="mt-20">
        <h3 class="text-2xl font-bold text-slate-900 text-center mb-12">
          Feature Comparison
        </h3>
        
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-medium text-slate-900">Features</th>
                <th class="px-6 py-4 text-center text-sm font-medium text-slate-900">Free</th>
                <th class="px-6 py-4 text-center text-sm font-medium text-slate-900">Premium</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">Decision Letter Analysis</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">Denial Reason Explanations</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">Evidence Checklists</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">Multi-Claim Tracking</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" color="red-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">Chrome Extension</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" color="red-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">Advanced Analytics</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" color="red-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-slate-900">VSO Recommendations</td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" color="red-600" />
                </td>
                <td class="px-6 py-4 text-center">
                  <Icon name="heroicons:check" class="w-4 h-4" color="green-600" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-20">
        <h3 class="text-2xl font-bold text-slate-900 text-center mb-12">
          Frequently Asked Questions
        </h3>
        
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="font-semibold text-slate-900 mb-2">Is the basic analysis really free?</h4>
            <p class="text-slate-600">Yes! We believe every veteran should have access to clear explanations of their VA decisions. The basic analysis is completely free and always will be.</p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="font-semibold text-slate-900 mb-2">What does the Chrome extension do?</h4>
            <p class="text-slate-600">The Chrome extension automatically syncs your VA.gov profile data with FormReady, giving you real-time claim tracking and advanced analytics without manual data entry.</p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="font-semibold text-slate-900 mb-2">Can I cancel my premium subscription anytime?</h4>
            <p class="text-slate-600">Absolutely! You can cancel your premium subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h4 class="font-semibold text-slate-900 mb-2">Is my data secure?</h4>
            <p class="text-slate-600">Yes, we take data security seriously. All data is encrypted and stored securely. We never share your personal information with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '~/components/atoms/Button.vue'

// Head
useHead({
  title: 'Pricing - ClaimReady',
  meta: [
    { name: 'description', content: 'Choose your ClaimReady plan - free VA decision analysis with premium claim tracking features' }
  ]
})

const router = useRouter()

// Handle upgrade
const handleUpgrade = () => {
  // Check if user is logged in
  const session = localStorage.getItem('user_session')
  if (!session) {
    router.push('/auth/signup')
    return
  }

  // Redirect to Stripe checkout
  window.location.href = '/api/billing/checkout'
}
</script>
