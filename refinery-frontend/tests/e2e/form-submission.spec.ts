import { test, expect } from '@playwright/test'

test.describe('FormReady E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the form page
    await page.goto('/forms/va-21-526ez')
    await page.waitForLoadState('networkidle')
  })

  test('Complete form submission flow', async ({ page }) => {
    // Test form loading
    await expect(page.locator('h1')).toContainText('VA Form 21-526EZ')
    await expect(page.locator('.progress-bar')).toBeVisible()

    // Fill out Veteran Information section
    await page.fill('input[name="first_name"]', 'John')
    await page.fill('input[name="last_name"]', 'Doe')
    await page.fill('input[name="ssn"]', '123-45-6789')
    await page.fill('input[name="date_of_birth"]', '1990-01-01')
    await page.fill('input[name="email"]', 'john.doe@example.com')

    // Navigate to next section
    await page.click('button:has-text("Next")')
    await expect(page.locator('h2')).toContainText('Contact Information')

    // Fill out Contact Information
    await page.fill('input[name="phone_number"]', '555-123-4567')
    await page.fill('input[name="street_address"]', '123 Main St')
    await page.fill('input[name="city"]', 'Anytown')
    await page.selectOption('select[name="state"]', 'CA')
    await page.fill('input[name="zip_code"]', '12345')

    // Navigate to next section
    await page.click('button:has-text("Next")')
    await expect(page.locator('h2')).toContainText('Service Information')

    // Fill out Service Information
    await page.selectOption('select[name="branch_of_service"]', 'army')
    await page.fill('input[name="service_start_date"]', '2010-01-01')
    await page.fill('input[name="service_end_date"]', '2014-12-31')
    await page.selectOption('select[name="discharge_status"]', 'honorable')

    // Navigate to final section
    await page.click('button:has-text("Next")')
    await expect(page.locator('h2')).toContainText('Claim Information')

    // Fill out Claim Information
    await page.selectOption('select[name="claim_type"]', 'initial')
    await page.fill('input[name="disability_description"]', 'Back pain from service')
    await page.fill('input[name="condition_start_date"]', '2012-06-01')
    await page.check('input[name="service_connected"]')
    await page.selectOption('select[name="current_treatment"]', 'yes_va')

    // Generate PDF
    await page.click('button:has-text("Generate PDF")')
    
    // Wait for success page
    await expect(page).toHaveURL(/\/forms\/va-21-526ez\/success/)
    await expect(page.locator('h1')).toContainText('Form Submitted Successfully')
  })

  test('Form validation works correctly', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")')
    
    // Should show validation errors
    await expect(page.locator('.text-red-600')).toBeVisible()
    await expect(page.locator('input[name="first_name"]')).toHaveClass(/border-red-300/)
  })

  test('Draft saving works for authenticated users', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('auth.token', 'mock-token')
      localStorage.setItem('auth.user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }))
    })

    // Reload page to pick up auth state
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Fill some form data
    await page.fill('input[name="first_name"]', 'John')
    await page.fill('input[name="last_name"]', 'Doe')

    // Wait for auto-save
    await page.waitForTimeout(3000)

    // Check for save confirmation
    await expect(page.locator('text=Draft last saved')).toBeVisible()
  })

  test('Guest session works correctly', async ({ page }) => {
    // Ensure no authentication
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Fill form data
    await page.fill('input[name="first_name"]', 'John')
    await page.fill('input[name="last_name"]', 'Doe')

    // Wait for guest auto-save
    await page.waitForTimeout(3000)

    // Navigate away and back
    await page.goto('/')
    await page.goto('/forms/va-21-526ez')

    // Check if data is restored
    await expect(page.locator('input[name="first_name"]')).toHaveValue('John')
    await expect(page.locator('input[name="last_name"]')).toHaveValue('Doe')
  })

  test('Mobile responsive design works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile layout
    await expect(page.locator('.nav-label')).not.toBeVisible()
    await expect(page.locator('.brand-name')).toBeVisible()

    // Test form interaction on mobile
    await page.fill('input[name="first_name"]', 'John')
    await page.click('button:has-text("Next")')

    // Should work on mobile
    await expect(page.locator('h2')).toContainText('Contact Information')
  })

  test('Browser compatibility features work', async ({ page }) => {
    // Test browser compatibility detection
    const compatibility = await page.evaluate(() => {
      return {
        hasFetch: typeof fetch !== 'undefined',
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        hasFormData: typeof FormData !== 'undefined'
      }
    })

    expect(compatibility.hasFetch).toBe(true)
    expect(compatibility.hasLocalStorage).toBe(true)
    expect(compatibility.hasSessionStorage).toBe(true)
    expect(compatibility.hasFormData).toBe(true)
  })

  test('Error handling works correctly', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/forms/va-21-526ez/generate', route => {
      route.abort('failed')
    })

    // Fill out form
    await page.fill('input[name="first_name"]', 'John')
    await page.fill('input[name="last_name"]', 'Doe')
    await page.fill('input[name="ssn"]', '123-45-6789')
    await page.fill('input[name="date_of_birth"]', '1990-01-01')
    await page.fill('input[name="email"]', 'john.doe@example.com')

    // Try to generate PDF
    await page.click('button:has-text("Generate PDF")')

    // Should show error toast
    await expect(page.locator('.toast-error')).toBeVisible()
  })

  test('Accessibility features work', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('input[name="first_name"]:focus')).toBeVisible()

    // Test ARIA labels
    const firstNameInput = page.locator('input[name="first_name"]')
    await expect(firstNameInput).toHaveAttribute('aria-required', 'true')

    // Test screen reader support
    const labels = await page.locator('label').all()
    expect(labels.length).toBeGreaterThan(0)
  })

  test('Performance metrics are acceptable', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now()
    await page.goto('/forms/va-21-526ez')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)

    // Measure form interaction response
    const interactionStart = Date.now()
    await page.fill('input[name="first_name"]', 'John')
    const interactionTime = Date.now() - interactionStart

    // Should respond within 100ms
    expect(interactionTime).toBeLessThan(100)
  })
})

test.describe('Authentication Flow', () => {
  test('User can sign in and access protected features', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('User can sign out and lose access to protected features', async ({ page }) => {
    // Mock authenticated state
    await page.evaluate(() => {
      localStorage.setItem('auth.token', 'mock-token')
      localStorage.setItem('auth.user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com'
      }))
    })

    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back')

    // Sign out
    await page.click('button:has-text("Sign out")')
    await expect(page).toHaveURL('/')
  })
})

test.describe('Analytics Dashboard', () => {
  test('Analytics page loads and displays data', async ({ page }) => {
    // Mock authenticated user
    await page.evaluate(() => {
      localStorage.setItem('auth.token', 'mock-token')
      localStorage.setItem('auth.user', JSON.stringify({
        id: 'user-123',
        email: 'test@example.com'
      }))
    })

    await page.goto('/analytics')
    await page.waitForLoadState('networkidle')

    // Check for analytics content
    await expect(page.locator('h1')).toContainText('Analytics Dashboard')
    await expect(page.locator('.metrics-grid')).toBeVisible()
  })
})

