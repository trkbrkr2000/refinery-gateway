import { ref, readonly, onMounted, watch } from 'vue'
import { debounce } from 'lodash-es'

export const useGuestAuthMigration = () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  
  // Guest session data
  const guestSessionId = ref<string | null>(null)
  const guestFormData = ref<Record<string, any>>({})
  const isGuestSession = ref(false)
  const migrationInProgress = ref(false)

  // Generate unique guest session ID
  const generateGuestSessionId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize guest session
  const initializeGuestSession = () => {
    if (authStore.isAuthenticated) {
      isGuestSession.value = false
      return
    }

    // Check if we have an existing guest session
    const existingSessionId = sessionStorage.getItem('guest_session_id')
    if (existingSessionId) {
      guestSessionId.value = existingSessionId
      loadGuestData()
    } else {
      // Create new guest session
      guestSessionId.value = generateGuestSessionId()
      sessionStorage.setItem('guest_session_id', guestSessionId.value)
    }
    
    isGuestSession.value = true
  }

  // Load guest data from session storage
  const loadGuestData = () => {
    if (!guestSessionId.value) return

    try {
      const storedData = sessionStorage.getItem(`guest_form_data_${guestSessionId.value}`)
      if (storedData) {
        guestFormData.value = JSON.parse(storedData)
      }
    } catch (error) {
      console.error('Failed to load guest data:', error)
    }
  }

  // Save guest data to session storage
  const saveGuestData = (formId: string, data: Record<string, any>) => {
    if (!guestSessionId.value) return

    try {
      guestFormData.value[formId] = {
        data,
        timestamp: Date.now(),
        formId
      }
      
      sessionStorage.setItem(
        `guest_form_data_${guestSessionId.value}`,
        JSON.stringify(guestFormData.value)
      )
    } catch (error) {
      console.error('Failed to save guest data:', error)
    }
  }

  // Get guest data for a specific form
  const getGuestData = (formId: string) => {
    if (!guestSessionId.value) return null
    
    return guestFormData.value[formId]?.data || null
  }

  // Migrate guest data to authenticated user
  const migrateGuestData = async (firebaseToken: string) => {
    if (!guestSessionId.value || !guestFormData.value) {
      return { success: true, migrated: 0 }
    }

    migrationInProgress.value = true
    
    try {
      // First, authenticate the user
      const authResult = await authStore.exchangeFirebaseToken(firebaseToken)
      if (!authResult.success) {
        throw new Error('Authentication failed')
      }

      // Migrate each form's data
      let migratedCount = 0
      const migrationPromises = Object.entries(guestFormData.value).map(async ([formId, guestData]) => {
        try {
          // Save as draft for the authenticated user
          await $fetch(`${config.public.apiUrl}/api/v1/forms/${formId}/drafts`, {
            method: 'PUT',
            headers: authStore.getAuthHeaders(),
            body: {
              data: guestData.data,
              migratedFromGuest: true,
              originalGuestSessionId: guestSessionId.value
            }
          })
          migratedCount++
        } catch (error) {
          console.error(`Failed to migrate data for form ${formId}:`, error)
        }
      })

      await Promise.all(migrationPromises)

      // Clear guest session data
      clearGuestSession()

      return {
        success: true,
        migrated: migratedCount,
        message: `Successfully migrated ${migratedCount} form draft(s) to your account`
      }
    } catch (error) {
      console.error('Guest data migration failed:', error)
      return {
        success: false,
        error: error.message || 'Failed to migrate guest data'
      }
    } finally {
      migrationInProgress.value = false
    }
  }

  // Clear guest session data
  const clearGuestSession = () => {
    if (guestSessionId.value) {
      // Clear all guest data
      Object.keys(guestFormData.value).forEach(formId => {
        sessionStorage.removeItem(`guest_form_data_${guestSessionId.value}`)
      })
      
      sessionStorage.removeItem('guest_session_id')
      guestFormData.value = {}
      guestSessionId.value = null
    }
    
    isGuestSession.value = false
  }

  // Show migration prompt
  const showMigrationPrompt = () => {
    const hasGuestData = Object.keys(guestFormData.value).length > 0
    return hasGuestData && !authStore.isAuthenticated
  }

  // Get migration summary
  const getMigrationSummary = () => {
    const formsWithData = Object.keys(guestFormData.value).length
    const totalFields = Object.values(guestFormData.value).reduce((total, formData) => {
      return total + Object.keys(formData.data || {}).length
    }, 0)

    return {
      formsWithData,
      totalFields,
      hasData: formsWithData > 0
    }
  }

  // Auto-save for guest users
  const autoSaveGuestData = debounce((formId: string, data: Record<string, any>) => {
    if (isGuestSession.value) {
      saveGuestData(formId, data)
    }
  }, 2000)

  // Initialize on mount
  onMounted(() => {
    initializeGuestSession()
  })

  // Watch for authentication changes
  watch(() => authStore.isAuthenticated, (isAuthenticated) => {
    if (isAuthenticated && isGuestSession.value) {
      // User just authenticated, offer to migrate data
      if (showMigrationPrompt()) {
        // This would typically trigger a modal or notification
        console.log('User authenticated with guest data available for migration')
      }
    }
  })

  return {
    // State
    isGuestSession: readonly(isGuestSession),
    guestSessionId: readonly(guestSessionId),
    migrationInProgress: readonly(migrationInProgress),
    
    // Methods
    initializeGuestSession,
    saveGuestData,
    getGuestData,
    migrateGuestData,
    clearGuestSession,
    showMigrationPrompt,
    getMigrationSummary,
    autoSaveGuestData,
    loadGuestData
  }
}
