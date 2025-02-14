import tailwindcss from "@tailwindcss/vite";
import fetch from 'node-fetch'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css", "@gcorevideo/player-plugins/dist/index.css"],
  devtools: { enabled: true },
  hooks: {
    ready: async (nuxt) => {
      if (import.meta.env.VERCEL_WEBHOOK_URL) {
        console.log('ready', typeof nuxt)
        try {
          const response = await fetch(import.meta.env.VERCEL_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: import.meta.env.VERCEL_WEBHOOK_STARTUP_BODY,
          })
          console.log('response', response)
        } catch (error) {
          console.error('error', error)
        }
      }
    },
  },
  runtimeConfig: {
    apiHost: "",
    // Key to access Gcore API https://api.gcore.com/docs/iam#section/Authentication/APIKey,
    // must be kept secret
    apiKey: "",
    public: {
      appVersion: "",
    },
  },
  ssr: false,
  vite: {
    plugins: [tailwindcss()],
  },
});
