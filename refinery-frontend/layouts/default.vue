<template>
  <div class="min-h-screen bg-white">
    <!-- Browser Compatibility Notice -->
    <div v-if="!browserCompatibility.isSupported && !warningDismissed" class="browser-warning">
      <div class="warning-content">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <h3>Browser Compatibility Issue</h3>
          <p>Your browser may not support all features. For the best experience, please use a modern browser.</p>
          <ul>
            <li v-for="issue in browserCompatibility.compatibilityIssues" :key="issue">{{ issue }}</li>
          </ul>
        </div>
        <button @click="dismissWarning" class="dismiss-btn">×</button>
      </div>
    </div>

    <!-- FormReady Header -->
    <header class="formready-header">
      <div class="header-container">
        <!-- Logo and Brand -->
        <div class="brand-section">
          <NuxtLink to="/" class="brand-link">
            <div class="brand-logo">
              <div class="logo-icon">📋</div>
              <span class="brand-name">FormReady</span>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="main-navigation">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.id"
            :to="item.route"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith(item.route) && item.route !== '/' }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- User Actions -->
        <div class="user-section">
          <button v-if="user" class="user-menu-button" @click="toggleUserMenu">
            <div class="user-avatar">{{ getUserInitials(user.name) }}</div>
            <span class="user-name">{{ user.name }}</span>
            <svg class="dropdown-icon" :class="{ 'rotate-180': userMenuOpen }" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>

          <!-- User Dropdown Menu -->
          <div v-if="userMenuOpen" class="user-dropdown" @click="userMenuOpen = false">
            <div class="dropdown-section">
              <div class="user-info">
                <div class="user-name-full">{{ user?.name }}</div>
                <div class="user-email">{{ user?.email }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section">
              <NuxtLink to="/settings" class="dropdown-item">
                <span class="dropdown-icon">⚙️</span>
                Settings
              </NuxtLink>
              <button class="dropdown-item" @click="handleLogout">
                <span class="dropdown-icon">🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Click outside to close user menu -->
    <div v-if="userMenuOpen" class="menu-overlay" @click="userMenuOpen = false"></div>
    
    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">

interface NavigationItem {
  id: string
  label: string
  icon: string
  route: string
}

interface UserInfo {
  id: string
  email: string
  name: string
}

// Reactive state
const userMenuOpen = ref(false)
const authStore = useAuthStore()
const browserCompatibility = useBrowserCompatibility()
const warningDismissed = ref(false)

// Get user from auth store
const user = computed<UserInfo | null>(() => {
  if (!authStore.user) return null

  return {
    id: authStore.user.id,
    email: authStore.user.email,
    name: authStore.fullName || authStore.user.email
  }
})

// FormReady navigation items
const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: '🏠',
    route: '/'
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: '📋',
    route: '/forms'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    route: '/analytics'
  }
]

// Methods
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleLogout = async () => {
  userMenuOpen.value = false
  await authStore.logout()
}

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-section')) {
    userMenuOpen.value = false
  }
}

// Browser compatibility initialization
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Initialize browser compatibility checks
  browserCompatibility.initialize()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Dismiss browser warning
const dismissWarning = () => {
  warningDismissed.value = true
}
</script>

<style scoped>
/* Browser Warning Styles */
.browser-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-bottom: 2px solid #f59e0b;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.warning-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-text {
  flex: 1;
}

.warning-text h3 {
  margin: 0 0 0.5rem 0;
  color: #92400e;
  font-size: 1.125rem;
  font-weight: 600;
}

.warning-text p {
  margin: 0 0 0.5rem 0;
  color: #92400e;
  font-size: 0.875rem;
}

.warning-text ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #92400e;
  font-size: 0.875rem;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #92400e;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.dismiss-btn:hover {
  color: #78350f;
}

/* FormReady Header Styles */
.formready-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

/* Brand Section */
.brand-section {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.5rem;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Navigation */
.main-navigation {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #374151;
  background: #f9fafb;
}

.nav-link-active {
  color: #667eea;
  background: #f0f9ff;
}

.nav-icon {
  font-size: 1rem;
}

.nav-label {
  font-size: 0.875rem;
}

/* User Section */
.user-section {
  position: relative;
  flex-shrink: 0;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.user-menu-button:hover {
  background: #f9fafb;
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.dropdown-icon.rotate-180 {
  transform: rotate(180deg);
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 60;
}

.dropdown-section {
  padding: 0.75rem;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0;
}

.user-info {
  text-align: left;
}

.user-name-full {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.user-email {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: none;
  color: #374151;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: #f9fafb;
  color: #111827;
}

.dropdown-icon {
  font-size: 1rem;
}

/* Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
}

/* Main Content */
.main-content {
  min-height: calc(100vh - 4rem);
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }

  .main-navigation {
    gap: 1rem;
  }

  .nav-label {
    display: none;
  }

  .user-name {
    display: none;
  }

  .brand-name {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .main-navigation {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem;
  }

  .brand-logo {
    gap: 0.5rem;
  }

  .logo-icon {
    font-size: 1.25rem;
  }
}
</style>