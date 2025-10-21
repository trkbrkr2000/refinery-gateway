import { useClerk, useUser } from '@clerk/vue'

export interface ApiToken {
  token: string
  expiresAt: number
}

export const useAuth = () => {
  const { isSignedIn, user } = useUser()
  const clerk = useClerk()
  const config = useRuntimeConfig()

  // Store API token in session storage
  const apiToken = useState<ApiToken | null>('apiToken', () => null)
  const isAuthenticated = computed(() => !!apiToken.value && apiToken.value.expiresAt > Date.now())

  // Exchange Clerk token for API token
  const exchangeToken = async () => {
    if (!isSignedIn?.value) {
      throw new Error('User not signed in')
    }

    try {
      // Get Clerk session token
      const clerkToken = await clerk.session?.getToken()

      if (!clerkToken) {
        throw new Error('No Clerk token available')
      }

      // Exchange for API token
      const response = await $fetch<{ apiToken: string; expiresIn: number }>(`${config.public.apiUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkToken}`
        }
      })

      // Store API token with expiry
      apiToken.value = {
        token: response.apiToken,
        expiresAt: Date.now() + (response.expiresIn * 1000)
      }

      // Store in session storage for persistence
      if (process.client) {
        sessionStorage.setItem('apiToken', JSON.stringify(apiToken.value))
      }

      return apiToken.value
    } catch (error) {
      console.error('Failed to exchange token:', error)
      throw error
    }
  }

  // Get current API token or exchange if needed
  const getApiToken = async (): Promise<string> => {
    // Check if we have a valid token
    if (isAuthenticated.value && apiToken.value) {
      return apiToken.value.token
    }

    // Try to get from session storage
    if (process.client) {
      const stored = sessionStorage.getItem('apiToken')
      if (stored) {
        const parsed = JSON.parse(stored) as ApiToken
        if (parsed.expiresAt > Date.now()) {
          apiToken.value = parsed
          return parsed.token
        }
      }
    }

    // Exchange for new token
    if (isSignedIn?.value) {
      const newToken = await exchangeToken()
      return newToken.token
    }

    throw new Error('Not authenticated')
  }

  // API fetch wrapper with auth
  const $api = async <T>(url: string, options: any = {}): Promise<T> => {
    const token = await getApiToken()

    return $fetch<T>(`${config.public.apiUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    })
  }

  // Logout - clear tokens
  const logout = async () => {
    apiToken.value = null
    if (process.client) {
      sessionStorage.removeItem('apiToken')
    }
    await clerk.signOut()
  }

  // Initialize on mount
  onMounted(() => {
    if (process.client && isSignedIn?.value) {
      // Try to restore token from session storage
      const stored = sessionStorage.getItem('apiToken')
      if (stored) {
        const parsed = JSON.parse(stored) as ApiToken
        if (parsed.expiresAt > Date.now()) {
          apiToken.value = parsed
        }
      }
    }
  })

  return {
    user: readonly(user),
    isSignedIn: readonly(isSignedIn),
    isAuthenticated: readonly(isAuthenticated),
    apiToken: readonly(apiToken),
    exchangeToken,
    getApiToken,
    $api,
    logout
  }
}