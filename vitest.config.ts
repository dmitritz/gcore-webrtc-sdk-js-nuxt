import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  // any custom Vitest config you require
//   ...getVitestConfigFromNuxt(),
  test: {
    globals: true,
    environment: "nuxt",
    include: ["**/__tests__/*.test.ts"],
  },
});
