interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  query?: Record<string, any>
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl

  const apiCall = async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const {
      method = 'GET',
      headers = {},
      body,
      query
    } = options

    try {
      // Build URL with query parameters
      let url = `${baseURL}${endpoint}`
      if (query) {
        const searchParams = new URLSearchParams()
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Development API key for testing
          'X-API-Key': 'test-api-key-dev-123',
          ...headers
        }
      }

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error('API call failed:', error)
      throw error
    }
  }

  return {
    get: <T>(endpoint: string, query?: Record<string, any>) =>
      apiCall<T>(endpoint, { method: 'GET', query }),

    post: <T>(endpoint: string, body?: any, query?: Record<string, any>) =>
      apiCall<T>(endpoint, { method: 'POST', body, query }),

    put: <T>(endpoint: string, body?: any, query?: Record<string, any>) =>
      apiCall<T>(endpoint, { method: 'PUT', body, query }),

    delete: <T>(endpoint: string, query?: Record<string, any>) =>
      apiCall<T>(endpoint, { method: 'DELETE', query })
  }
}