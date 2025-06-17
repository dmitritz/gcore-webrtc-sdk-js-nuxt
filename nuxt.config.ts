import tailwindcss from "@tailwindcss/vite";
import fetch from "node-fetch";
import consola from "consola";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css", "@gcorevideo/player/dist/index.css"],
  devtools: { enabled: true },

  hooks: {
    ready: async (nuxt) => {
      if (import.meta.env.VERCEL_WEBHOOK_URL) {
        consola.info(
          "Ready region:%s deployment:%s",
          import.meta.env.VERCEL_REGION,
          import.meta.env.VERCEL_DEPLOYMENT_ID
        );
        try {
          const response = await fetch(import.meta.env.VERCEL_WEBHOOK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: import.meta.env.VERCEL_WEBHOOK_STARTUP_PAYLOAD,
          });
          consola.info("OK");
        } catch (error) {
          consola.error("ERROR %s", String(error));
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

  modules: ["@pinia/nuxt", "@nuxt/test-utils/module"],
});
