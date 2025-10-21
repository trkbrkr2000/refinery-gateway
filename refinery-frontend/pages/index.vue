<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            Transform PDF Forms into
            <span class="hero-highlight">Beautiful Web Experiences</span>
          </h1>
          <p class="hero-description">
            FormReady converts complex government forms into user-friendly, 
            multi-step web experiences. Start with VA Form 21-526EZ and 
            experience the future of form completion.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/forms" class="btn-primary">
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Try VA Form 21-526EZ
            </NuxtLink>
            <button @click="scrollToDemo" class="btn-secondary">
              <svg class="btn-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
              </svg>
              Watch Demo
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">22</div>
              <div class="stat-label">Form Fields</div>
            </div>
            <div class="stat">
              <div class="stat-number">4</div>
              <div class="stat-label">Sections</div>
            </div>
            <div class="stat">
              <div class="stat-number">90%</div>
              <div class="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="form-preview">
            <div class="preview-header">
              <div class="preview-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
              <div class="preview-title">VA Form 21-526EZ</div>
            </div>
            <div class="preview-content">
              <div class="preview-section">
                <div class="section-title">Veteran Information</div>
                <div class="field-group">
                  <div class="field">
                    <div class="field-label">First Name</div>
                    <div class="field-input">John</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Last Name</div>
                    <div class="field-input">Doe</div>
                  </div>
                </div>
              </div>
              <div class="preview-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 25%"></div>
                </div>
                <div class="progress-text">Section 1 of 4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="features-container">
        <h2 class="features-title">Why FormReady?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3 class="feature-title">Guided Experience</h3>
            <p class="feature-description">
              Multi-step forms break down complex applications into manageable sections with clear progress tracking.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h3 class="feature-title">Auto-Save Drafts</h3>
            <p class="feature-description">
              Never lose your progress. Forms automatically save as you type, and you can resume anytime.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✅</div>
            <h3 class="feature-title">Smart Validation</h3>
            <p class="feature-description">
              Real-time validation catches errors before submission, with helpful guidance for each field.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">Mobile Optimized</h3>
            <p class="feature-description">
              Works perfectly on any device with touch-friendly interfaces and responsive design.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3 class="feature-title">Secure & Private</h3>
            <p class="feature-description">
              Your data is encrypted and secure. No account required to get started.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📄</div>
            <h3 class="feature-title">Perfect PDFs</h3>
            <p class="feature-description">
              Generate perfectly formatted PDFs that match the original government forms exactly.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section id="demo" class="demo">
      <div class="demo-container">
        <h2 class="demo-title">See It In Action</h2>
        <p class="demo-description">
          Experience the difference. Try our interactive demo of VA Form 21-526EZ.
        </p>
        <div class="demo-iframe">
          <iframe
            src="/forms/va-21-526ez"
            width="100%"
            height="600"
            frameborder="0"
            title="FormReady Demo"
          ></iframe>
        </div>
        <div class="demo-actions">
          <NuxtLink to="/forms" class="btn-primary">
            Try Full Experience
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-container">
        <h2 class="cta-title">Ready to Get Started?</h2>
        <p class="cta-description">
          Join thousands of users who have simplified their form completion process.
        </p>
        <div class="cta-actions">
          <NuxtLink to="/forms" class="btn-primary btn-large">
            Start Your Form
          </NuxtLink>
          <NuxtLink to="/help" class="btn-outline btn-large">
            Learn More
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'FormReady - Transform PDF Forms into Beautiful Web Experiences',
  description: 'Convert complex government forms into user-friendly, multi-step web experiences. Start with VA Form 21-526EZ and experience the future of form completion.'
})

// Scroll to demo section
const scrollToDemo = () => {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.1;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  animation: slideInLeft 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem 0;
}

.hero-highlight {
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #fbbf24;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.hero-visual {
  animation: slideInRight 0.8s ease-out;
}

.form-preview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  color: #374151;
}

.preview-header {
  background: #f3f4f6;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}

.dot:nth-child(1) { background: #ef4444; }
.dot:nth-child(2) { background: #f59e0b; }
.dot:nth-child(3) { background: #10b981; }

.preview-title {
  font-weight: 600;
  color: #111827;
}

.preview-content {
  padding: 1.5rem;
}

.section-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.field-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 0.875rem;
}

.preview-progress {
  margin-top: 1rem;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

/* Features Section */
.features {
  padding: 6rem 0;
  background: #f9fafb;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 3rem 0;
  color: #111827;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #111827;
}

.feature-description {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Demo Section */
.demo {
  padding: 6rem 0;
  background: white;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.demo-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #111827;
}

.demo-description {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 0 0 3rem 0;
}

.demo-iframe {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.demo-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* CTA Section */
.cta {
  padding: 6rem 0;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  text-align: center;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.cta-description {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0 0 2rem 0;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-large {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline:hover {
  background: white;
  color: #1f2937;
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>