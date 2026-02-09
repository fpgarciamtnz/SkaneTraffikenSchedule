export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxthub/core'
  ],

  hub: {
    database: true,
    kv: true
  },

  runtimeConfig: {
    adminEmail: '',
    resendApiKey: ''
  },

  nitro: {
    preset: 'cloudflare-pages'
  },

  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true }
})
