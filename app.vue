<script setup lang="ts">
import pkg from './package.json' with { type: 'json' }
import rtckit from '@gcorevideo/rtckit/package.json' with { type: 'json' }
import rtckitNode from '@gcorevideo/rtckit-node/package.json' with { type: 'json' }
import { SentryTracer, setTracer } from "@gcorevideo/rtckit";
import * as Sentry from '@sentry/browser'

if (typeof window !== 'undefined') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENV,
    initialScope: (scope) => {
      scope.setTags({ client: pkg.name, build_id: import.meta.env.VITE_SENTRY_BUILD_ID });
      return scope;
    },
    integrations: [Sentry.browserTracingIntegration()],
    release: rtckit.version,
    tracesSampleRate: 1.0,
  })
  console.log("Sentry env %s %s %s", import.meta.env.VITE_SENTRY_DSN, import.meta.env.VITE_SENTRY_ENV, import.meta.env.VITE_SENTRY_BUILD_ID)
  setTracer(new SentryTracer(Sentry))
  console.log(
    '%s %s/rtckit %s %s ',
    pkg.name,
    pkg.version,
    rtckit.version,
    rtckitNode.version,
  )
}
</script>

<template>
  <NuxtPage />
</template>
