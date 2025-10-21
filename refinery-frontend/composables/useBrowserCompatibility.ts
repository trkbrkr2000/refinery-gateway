import { ref, readonly } from 'vue'

export const useBrowserCompatibility = () => {
  const isSupported = ref(true)
  const browserInfo = ref({
    name: 'unknown',
    version: 'unknown',
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })
  const compatibilityIssues = ref<string[]>([])

  // Detect browser and device
  const detectBrowser = () => {
    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent)
    
    let browserName = 'unknown'
    let browserVersion = 'unknown'

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      browserName = 'chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      browserName = 'firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'safari'
      const match = userAgent.match(/Version\/(\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    }
    // Edge
    else if (userAgent.includes('Edge')) {
      browserName = 'edge'
      const match = userAgent.match(/Edge\/(\d+)/)
      browserVersion = match ? match[1] : 'unknown'
    }

    browserInfo.value = {
      name: browserName,
      version: browserVersion,
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet
    }
  }

  // Check for required features
  const checkCompatibility = () => {
    const issues: string[] = []

    // Check for ES6 support
    if (!window.Promise) {
      issues.push('ES6 Promise support required')
    }

    // Check for fetch API
    if (!window.fetch) {
      issues.push('Fetch API not supported')
    }

    // Check for localStorage
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
    } catch (e) {
      issues.push('LocalStorage not available')
    }

    // Check for sessionStorage
    try {
      sessionStorage.setItem('test', 'test')
      sessionStorage.removeItem('test')
    } catch (e) {
      issues.push('SessionStorage not available')
    }

    // Check for FormData
    if (!window.FormData) {
      issues.push('FormData not supported')
    }

    // Check for File API
    if (!window.File || !window.FileReader) {
      issues.push('File API not supported')
    }

    // Check for CSS Grid
    const testElement = document.createElement('div')
    if (!testElement.style.grid) {
      issues.push('CSS Grid not supported')
    }

    // Check for Flexbox
    if (!testElement.style.flex) {
      issues.push('Flexbox not supported')
    }

    // Safari-specific checks
    if (browserInfo.value.name === 'safari') {
      // Check for date input support
      const dateInput = document.createElement('input')
      dateInput.type = 'date'
      if (dateInput.type !== 'date') {
        issues.push('Date input not supported in Safari')
      }

      // Check for file download support
      if (!window.URL || !window.URL.createObjectURL) {
        issues.push('File download not supported')
      }
    }

    // Firefox-specific checks
    if (browserInfo.value.name === 'firefox') {
      // Check for PDF generation support
      if (!window.Blob || !window.URL) {
        issues.push('PDF generation may not work properly')
      }
    }

    // Mobile-specific checks
    if (browserInfo.value.isMobile) {
      // Check for touch events
      if (!('ontouchstart' in window)) {
        issues.push('Touch events not supported')
      }

      // Check for viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]')
      if (!viewport) {
        issues.push('Viewport meta tag missing')
      }
    }

    compatibilityIssues.value = issues
    isSupported.value = issues.length === 0

    return {
      isSupported: isSupported.value,
      issues: issues,
      browserInfo: browserInfo.value
    }
  }

  // Apply browser-specific fixes
  const applyFixes = () => {
    const fixes: string[] = []

    // Safari fixes
    if (browserInfo.value.name === 'safari') {
      // Add Safari-specific classes
      document.body.classList.add('safari')
      
      // Fix date inputs
      const dateInputs = document.querySelectorAll('input[type="date"]')
      dateInputs.forEach(input => {
        input.classList.add('safari-date-input')
      })
      
      fixes.push('Applied Safari-specific fixes')
    }

    // Firefox fixes
    if (browserInfo.value.name === 'firefox') {
      document.body.classList.add('firefox')
      
      // Fix scrollbars
      document.body.classList.add('firefox-scroll-fix')
      
      fixes.push('Applied Firefox-specific fixes')
    }

    // Mobile fixes
    if (browserInfo.value.isMobile) {
      document.body.classList.add('mobile')
      
      // Add touch-friendly classes
      const buttons = document.querySelectorAll('button, .btn')
      buttons.forEach(button => {
        button.classList.add('touch-button')
      })
      
      fixes.push('Applied mobile-specific fixes')
    }

    // Tablet fixes
    if (browserInfo.value.isTablet) {
      document.body.classList.add('tablet')
      fixes.push('Applied tablet-specific fixes')
    }

    return fixes
  }

  // Initialize compatibility checks
  const initialize = () => {
    detectBrowser()
    const compatibility = checkCompatibility()
    const fixes = applyFixes()
    
    return {
      ...compatibility,
      fixes
    }
  }

  // Get browser-specific recommendations
  const getRecommendations = () => {
    const recommendations: string[] = []

    if (browserInfo.value.name === 'safari' && parseInt(browserInfo.value.version) < 14) {
      recommendations.push('Consider updating Safari for better compatibility')
    }

    if (browserInfo.value.name === 'firefox' && parseInt(browserInfo.value.version) < 80) {
      recommendations.push('Consider updating Firefox for better performance')
    }

    if (browserInfo.value.isMobile && browserInfo.value.name === 'safari') {
      recommendations.push('Use Chrome or Firefox on mobile for best experience')
    }

    return recommendations
  }

  // Monitor performance
  const monitorPerformance = () => {
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: window.performance.getEntriesByType('paint')[0]?.startTime || 0
      }
    }
    
    return null
  }

  return {
    isSupported: readonly(isSupported),
    browserInfo: readonly(browserInfo),
    compatibilityIssues: readonly(compatibilityIssues),
    detectBrowser,
    checkCompatibility,
    applyFixes,
    initialize,
    getRecommendations,
    monitorPerformance
  }
}
