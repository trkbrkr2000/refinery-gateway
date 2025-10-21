import { defineStore } from 'pinia'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  emailVerified?: boolean
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    fullName: (state): string => {
      if (!state.user) return ''
      return [state.user.firstName, state.user.lastName]
        .filter(Boolean)
        .join(' ') || state.user.email
    }
  },

  actions: {
    // Initialize auth state from localStorage
    initAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth.token')
        const userStr = localStorage.getItem('auth.user')

        if (token && userStr) {
          try {
            this.token = token
            this.user = JSON.parse(userStr)
          } catch (error) {
            console.error('Failed to parse stored user data:', error)
            this.clearAuth()
          }
        }
      }
    },

    // Register new user
    async register(userData: { email: string; password: string; firstName?: string; lastName?: string }) {
      this.isLoading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<{
          user: User
          token: string
        }>(`${config.public.apiUrl}/auth/register`, {
          method: 'POST',
          body: userData
        })

        this.user = response.user
        this.token = response.token
        this.saveToStorage()

        return { success: true }
      } catch (error: any) {
        const errorMessage = error.data?.message || error.message || 'Registration failed'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    // Login user
    async login(email: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<{
          user: User
          token: string
        }>(`${config.public.apiUrl}/auth/login`, {
          method: 'POST',
          body: {
            email,
            password
          }
        })

        this.user = response.user
        this.token = response.token
        this.saveToStorage()

        return { success: true }
      } catch (error: any) {
        const errorMessage = error.data?.message || error.message || 'Login failed'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    // Get user profile
    async getProfile() {
      if (!this.token) return

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiUrl}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.user = user
        this.saveToStorage()
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        // If profile fetch fails, token might be invalid
        this.clearAuth()
      }
    },

    // Update user profile
    async updateProfile(updates: { firstName?: string; lastName?: string }) {
      if (!this.token) return { success: false, error: 'Not authenticated' }

      this.isLoading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const user = await $fetch<User>(`${config.public.apiUrl}/auth/profile`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          body: updates
        })

        this.user = user
        this.saveToStorage()

        return { success: true }
      } catch (error: any) {
        const errorMessage = error.data?.message || error.message || 'Profile update failed'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    // Logout user
    logout() {
      this.clearAuth()
      // Navigate to home page
      return navigateTo('/')
    },

    // Clear authentication state
    clearAuth() {
      this.user = null
      this.token = null
      this.error = null

      if (process.client) {
        localStorage.removeItem('auth.token')
        localStorage.removeItem('auth.user')
      }
    },

    // Save auth state to localStorage
    saveToStorage() {
      if (process.client && this.token && this.user) {
        localStorage.setItem('auth.token', this.token)
        localStorage.setItem('auth.user', JSON.stringify(this.user))
      }
    },

    // Exchange Firebase token for backend token
    async exchangeFirebaseToken(firebaseToken: string) {
      this.isLoading = true
      this.error = null

      try {
        const config = useRuntimeConfig()
        const response = await $fetch<{
          user: User
          token: string
        }>(`${config.public.apiUrl}/auth/firebase/exchange`, {
          method: 'POST',
          body: {
            firebaseToken
          }
        })

        this.user = response.user
        this.token = response.token
        this.saveToStorage()

        return { success: true }
      } catch (error: any) {
        const errorMessage = error.data?.message || error.message || 'Firebase authentication failed'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    // Clear any errors
    clearError() {
      this.error = null
    },

    // Get auth headers for API requests
    getAuthHeaders() {
      if (!this.token) return {}

      return {
        Authorization: `Bearer ${this.token}`
      }
    }
  }
})