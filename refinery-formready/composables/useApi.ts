/**
 * Composable for making API calls with proper URL configuration
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  
  /**
   * Get the base API URL (without /api suffix for auth endpoints)
   */
  const getApiUrl = (endpoint: string = '') => {
    let baseUrl = config.public.apiUrl
    
    // Simple fix: if URL has domain duplication, fix it
    if (baseUrl.includes('/.claimready.io/')) {
      baseUrl = 'https://claimready.io/api'
    }
    
    // Remove /api suffix for auth endpoints
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.replace('/api', '')
    }
    
    // Add endpoint
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
    
    const response = await fetch(getApiUrl(endpoint), {
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
