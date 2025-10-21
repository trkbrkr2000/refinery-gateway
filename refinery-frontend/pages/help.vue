<template>
  <div class="help-page">
    <div class="help-container">
      <!-- Header -->
      <div class="help-header">
        <h1 class="help-title">Help & FAQ</h1>
        <p class="help-description">
          Find answers to common questions and learn how to get the most out of FormReady.
        </p>
      </div>

      <!-- Search -->
      <div class="help-search">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for help topics..."
            class="search-input"
          />
        </div>
      </div>

      <!-- FAQ Sections -->
      <div class="faq-sections">
        <!-- Getting Started -->
        <section class="faq-section">
          <h2 class="section-title">Getting Started</h2>
          <div class="faq-list">
            <div
              v-for="faq in filteredFaqs.gettingStarted"
              :key="faq.id"
              class="faq-item"
              :class="{ 'faq-open': openFaq === faq.id }"
            >
              <button
                @click="toggleFaq(faq.id)"
                class="faq-question"
              >
                <span>{{ faq.question }}</span>
                <svg class="faq-icon" :class="{ 'faq-icon-rotated': openFaq === faq.id }" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
              </button>
              <div v-if="openFaq === faq.id" class="faq-answer">
                <div v-html="faq.answer"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Form Features -->
        <section class="faq-section">
          <h2 class="section-title">Form Features</h2>
          <div class="faq-list">
            <div
              v-for="faq in filteredFaqs.formFeatures"
              :key="faq.id"
              class="faq-item"
              :class="{ 'faq-open': openFaq === faq.id }"
            >
              <button
                @click="toggleFaq(faq.id)"
                class="faq-question"
              >
                <span>{{ faq.question }}</span>
                <svg class="faq-icon" :class="{ 'faq-icon-rotated': openFaq === faq.id }" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
              </button>
              <div v-if="openFaq === faq.id" class="faq-answer">
                <div v-html="faq.answer"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Troubleshooting -->
        <section class="faq-section">
          <h2 class="section-title">Troubleshooting</h2>
          <div class="faq-list">
            <div
              v-for="faq in filteredFaqs.troubleshooting"
              :key="faq.id"
              class="faq-item"
              :class="{ 'faq-open': openFaq === faq.id }"
            >
              <button
                @click="toggleFaq(faq.id)"
                class="faq-question"
              >
                <span>{{ faq.question }}</span>
                <svg class="faq-icon" :class="{ 'faq-icon-rotated': openFaq === faq.id }" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
              </button>
              <div v-if="openFaq === faq.id" class="faq-answer">
                <div v-html="faq.answer"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Contact Support -->
      <div class="support-section">
        <h2 class="support-title">Still Need Help?</h2>
        <p class="support-description">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <div class="support-actions">
          <a href="mailto:support@formready.com" class="btn-primary">
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,8L12,13L4,8V6L12,11L20,6V8Z"/>
            </svg>
            Email Support
          </a>
          <a href="https://github.com/formready/issues" class="btn-outline">
            <svg class="btn-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            Report Issue
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Help & FAQ - FormReady',
  description: 'Find answers to common questions and learn how to get the most out of FormReady.'
})

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const searchQuery = ref('')
const openFaq = ref<string | null>(null)

// FAQ data
const faqs: FAQ[] = [
  // Getting Started
  {
    id: 'what-is-formready',
    question: 'What is FormReady?',
    answer: 'FormReady is a platform that converts complex PDF forms into beautiful, user-friendly web experiences. We start with government forms like VA Form 21-526EZ and transform them into guided, multi-step web forms that are easier to complete.',
    category: 'gettingStarted'
  },
  {
    id: 'how-to-start',
    question: 'How do I get started?',
    answer: 'Simply visit our <a href="/forms">forms page</a> and select the form you need. No account is required to get started - you can begin filling out forms immediately. Create an account to save your progress and access your form history.',
    category: 'gettingStarted'
  },
  {
    id: 'account-required',
    question: 'Do I need an account?',
    answer: 'No account is required to use FormReady. You can fill out forms as a guest user. However, creating an account allows you to save your progress, access your form history, and resume forms across different devices.',
    category: 'gettingStarted'
  },
  
  // Form Features
  {
    id: 'auto-save',
    question: 'How does auto-save work?',
    answer: 'FormReady automatically saves your progress as you type. For guest users, data is saved in your browser\'s session storage. For authenticated users, drafts are saved to your account and can be accessed from any device.',
    category: 'formFeatures'
  },
  {
    id: 'form-validation',
    question: 'What kind of validation does FormReady provide?',
    answer: 'FormReady provides real-time validation for all form fields, including format checking for phone numbers, email addresses, and SSNs. We also validate required fields and provide helpful error messages to guide you through the form.',
    category: 'formFeatures'
  },
  {
    id: 'pdf-generation',
    question: 'How does PDF generation work?',
    answer: 'Once you complete a form, FormReady generates a perfectly formatted PDF that matches the original government form. The PDF is automatically downloaded to your device and can be submitted to the appropriate agency.',
    category: 'formFeatures'
  },
  {
    id: 'mobile-support',
    question: 'Does FormReady work on mobile devices?',
    answer: 'Yes! FormReady is fully responsive and optimized for mobile devices. The interface adapts to your screen size and includes touch-friendly controls for the best mobile experience.',
    category: 'formFeatures'
  },
  
  // Troubleshooting
  {
    id: 'form-not-loading',
    question: 'The form won\'t load. What should I do?',
    answer: 'Try refreshing the page. If the problem persists, check your internet connection and try using a different browser. If you\'re still having issues, please contact our support team.',
    category: 'troubleshooting'
  },
  {
    id: 'pdf-download-failed',
    question: 'I can\'t download the PDF. What\'s wrong?',
    answer: 'PDF download issues are usually caused by browser settings or popup blockers. Make sure your browser allows downloads from this site. If you\'re using Safari, you may need to enable file downloads in your browser settings.',
    category: 'troubleshooting'
  },
  {
    id: 'data-lost',
    question: 'I lost my form data. Can I recover it?',
    answer: 'If you were signed in, check your dashboard for saved drafts. If you were using the form as a guest, your data may still be in your browser\'s session storage. Try refreshing the page or clearing your browser cache and starting over.',
    category: 'troubleshooting'
  },
  {
    id: 'browser-compatibility',
    question: 'Which browsers are supported?',
    answer: 'FormReady works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for the best experience.',
    category: 'troubleshooting'
  }
]

// Computed properties
const filteredFaqs = computed(() => {
  const query = searchQuery.value.toLowerCase()
  
  if (!query) {
    return {
      gettingStarted: faqs.filter(faq => faq.category === 'gettingStarted'),
      formFeatures: faqs.filter(faq => faq.category === 'formFeatures'),
      troubleshooting: faqs.filter(faq => faq.category === 'troubleshooting')
    }
  }
  
  const filtered = faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  )
  
  return {
    gettingStarted: filtered.filter(faq => faq.category === 'gettingStarted'),
    formFeatures: filtered.filter(faq => faq.category === 'formFeatures'),
    troubleshooting: filtered.filter(faq => faq.category === 'troubleshooting')
  }
})

// Methods
const toggleFaq = (faqId: string) => {
  openFaq.value = openFaq.value === faqId ? null : faqId
}
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  background: #f9fafb;
}

.help-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.help-header {
  text-align: center;
  margin-bottom: 3rem;
}

.help-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.help-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

.help-search {
  margin-bottom: 3rem;
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.faq-sections {
  margin-bottom: 4rem;
}

.faq-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
}

.faq-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.faq-question {
  width: 100%;
  padding: 1.5rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.faq-question:hover {
  background: #f9fafb;
}

.faq-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.faq-icon-rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1.5rem 1.5rem 1.5rem;
  color: #6b7280;
  line-height: 1.6;
  animation: slideDown 0.2s ease-out;
}

.faq-answer :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.faq-answer :deep(a):hover {
  text-decoration: underline;
}

.support-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.support-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.support-description {
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.support-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  color: #374151;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .help-container {
    padding: 1rem;
  }
  
  .help-title {
    font-size: 2rem;
  }
  
  .support-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .faq-question {
    padding: 1rem;
  }
  
  .faq-answer {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>

