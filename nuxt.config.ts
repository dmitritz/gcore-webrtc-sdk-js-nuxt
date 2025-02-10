// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  css: ['~/assets/css/main.css', '@gcorevideo/player-plugins/dist/index.css'],
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    apiHost: '',
    // Key to access Gcore API https://api.gcore.com/docs/iam#section/Authentication/APIKey,
    // must be kept secret
    apiKey: '',
    public: {
      appVersion: '',
    },
  },
  vite: {
    ssr: {
      noExternal: ['sdp-transform'],
    }
  }
})
