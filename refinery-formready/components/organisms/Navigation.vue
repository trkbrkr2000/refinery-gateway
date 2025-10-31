<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center mr-3">
              <Icon name="heroicons:document-text" class="w-4 h-4 text-white" />
            </div>
            <h1 class="text-xl font-bold text-blue-800">ClaimReady</h1>
          </NuxtLink>
        </div>
        
        <!-- Navigation Links -->
        <div class="hidden md:flex items-center space-x-6">
          <NuxtLink 
            to="/" 
            class="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            :class="{ 'text-blue-600': $route.path === '/' }"
          >
            Home
          </NuxtLink>
          <NuxtLink 
            to="/analyze-decision" 
            class="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            :class="{ 'text-blue-600': $route.path === '/analyze-decision' }"
          >
            Analyze Decision
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            :class="{ 'text-blue-600': $route.path === '/dashboard' }"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/pricing" 
            class="text-slate-600 hover:text-blue-600 transition-colors font-medium"
            :class="{ 'text-blue-600': $route.path === '/pricing' }"
          >
            Pricing
          </NuxtLink>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center space-x-3">
          <!-- New Analysis Button -->
          <Button
            v-if="isAuthenticated"
            @click="navigateTo('/analyze-decision')"
            variant="primary"
            class="flex items-center"
          >
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            New Analysis
          </Button>

          <!-- Dashboard Button -->
          <Button
            v-if="isAuthenticated"
            @click="navigateTo('/dashboard')"
            variant="secondary"
            class="flex items-center"
          >
            <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <!-- User Menu -->
          <div class="relative" v-if="isAuthenticated">
            <Button
              @click="toggleUserMenu"
              variant="outline"
              class="flex items-center"
            >
              <Icon name="heroicons:user" class="w-4 h-4 mr-2" />
              Account
              <Icon name="heroicons:chevron-down" class="w-4 h-4 ml-2" />
            </Button>

            <!-- Dropdown Menu -->
            <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <NuxtLink
                to="/dashboard"
                class="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                @click="userMenuOpen = false"
              >
                <Icon name="heroicons:chart-bar" class="w-4 h-4 mr-3" />
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/profile"
                class="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                @click="userMenuOpen = false"
              >
                <Icon name="heroicons:user" class="w-4 h-4 mr-3" />
                Profile
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                @click="userMenuOpen = false"
              >
                <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-3" />
                Settings
              </NuxtLink>
              <div class="border-t border-gray-200 my-2"></div>
              <button
                @click="handleLogout"
                class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>

          <!-- Auth Buttons -->
          <div v-else class="flex items-center space-x-2">
            <Button 
              @click="navigateTo('/auth/login')"
              variant="secondary"
              class="flex items-center"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button 
              @click="navigateTo('/auth/signup')"
              variant="primary"
              class="flex items-center"
            >
              <Icon name="heroicons:user-plus" class="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
        
        <!-- Mobile Menu Button -->
        <Button 
          @click="toggleMobileMenu"
          variant="outline"
          class="md:hidden flex items-center"
        >
          <Icon name="heroicons:bars-3" class="w-4 h-4" />
        </Button>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden mt-4 pt-4 border-t border-gray-200">
        <div class="space-y-2">
          <NuxtLink 
            to="/" 
            class="block px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            Home
          </NuxtLink>
          <NuxtLink 
            to="/analyze-decision" 
            class="block px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            Analyze Decision
          </NuxtLink>
          <NuxtLink
            v-if="isAuthenticated"
            to="/dashboard"
            class="block px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/pricing" 
            class="block px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            @click="mobileMenuOpen = false"
          >
            Pricing
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import Button from "~/components/atoms/Button.vue";

interface Props {
  showNewAnalysis?: boolean
  showDashboard?: boolean
  showUserMenu?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNewAnalysis: false,
  showDashboard: false,
  showUserMenu: false
})

const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const isAuthenticated = ref(false)
const route = useRoute()

// Check authentication status
const checkAuth = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    isAuthenticated.value = !!token
  }
}

// Watch for route changes and re-check auth
watch(() => route.path, () => {
  checkAuth()
})

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  mobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  userMenuOpen.value = false
}

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  isAuthenticated.value = false
  userMenuOpen.value = false
  navigateTo('/auth/login')
}

// Close menus when clicking outside
onMounted(() => {
  checkAuth()

  const handleClickOutside = (event: MouseEvent) => {
    if (userMenuOpen.value || mobileMenuOpen.value) {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        userMenuOpen.value = false
        mobileMenuOpen.value = false
      }
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
