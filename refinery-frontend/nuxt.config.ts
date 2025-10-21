// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  // Server-side rendering
  ssr: true,

  // TypeScript configuration - minimal setup to avoid build issues
  typescript: {
    strict: false,
    typeCheck: false
  },

  // Development server configuration
  devServer: {
    port: 3000,
    host: '0.0.0.0'
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@pinia/nuxt'
  ],

  // Vite configuration
  vite: {
    esbuild: {
      target: 'esnext'
    },
    optimizeDeps: {
      exclude: ['@nuxt/devtools']
    },
    vue: {
      script: {
        defineModel: true
      }
    }
  },

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      // Firebase configuration
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
    }
  },

  // Nitro (server) configuration for production
  nitro: {
    preset: 'node-server'
  }
})
