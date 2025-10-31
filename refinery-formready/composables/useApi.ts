/**
 * Composable for making API calls with proper URL configuration
 * Updated: 2025-10-26 - Force Railway rebuild
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  
  /**
   * Get the base API URL (without /api suffix - endpoints provide that)
   */
  const getApiUrl = (endpoint: string = '') => {
    let baseUrl = config.public.apiUrl
    if (window.location.hostname === 'claimready.io') {
      baseUrl = 'https://api.claimready.io'
    }

    // Normalize endpoint to start with /
    if (endpoint && !endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`
    }

    return `${baseUrl}${endpoint}`
  }
  
  /**
   * Get the full API URL for a specific endpoint
   */
  const getFullApiUrl = (endpoint: string) => {
    return `${config.public.apiUrl}${endpoint}`
  }
  
  /**
   * Make an authenticated API call
   */
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('auth_token')
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
    const url = getApiUrl(endpoint)
    console.log('🔧 API URL:', url)
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })
    
    return response
  }
  
  return {
    getApiUrl,
    getFullApiUrl,
    apiCall
  }
}
