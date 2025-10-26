// https://nuxt.com/docs/api/configuration/nuxt-config
// FORCE RAILWAY REBUILD - 2025-10-26
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Modules
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],

  // Icon configuration
  icon: {
    collections: ['heroicons']
  },

  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      authorizerUrl: process.env.NUXT_PUBLIC_AUTHORIZER_URL || 'https://auth.claimready.io',
      authorizerClientId: process.env.NUXT_PUBLIC_AUTHORIZER_CLIENT_ID || '9c81da5e-0635-43c5-bcef-c629174c7c6f',
      authorizerRedirectUrl: process.env.NUXT_PUBLIC_AUTHORIZER_REDIRECT_URL || 'http://localhost:3000',
    }
  },

  // Nitro (server) configuration for production
  nitro: {
    preset: 'node-server'
  }
})
