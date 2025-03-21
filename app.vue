<script setup lang="ts">
import rtckit from '@gcorevideo/rtckit/package.json' with { type: 'json' }
import rtckitNode from '@gcorevideo/rtckit-node/package.json' with { type: 'json' }
import pkg from './package.json' with { type: 'json' }

import { setTracer } from "@gcorevideo/rtckit";
import { setTracer as setTracerPlayer, version as playerVersion } from "@gcorevideo/player";

import { RemoteTracer, SentryTracer } from "@gcorevideo/utils";
import * as Sentry from '@sentry/browser'

import Fingerprint from '@fingerprintjs/fingerprintjs'

if (import.meta.client) {
  const tags = {
    client: pkg.name,
    build_id: import.meta.env.VITE_SENTRY_BUILD_ID,
    rtckit: rtckit.version,
    rtckit_node: rtckitNode.version,
    player: playerVersion().gplayer,
  }
  const client = Sentry.init({
    debug: true,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENV,
    initialScope: (scope) => {
      scope.setTags(tags)
      return scope
    },
    integrations: [Sentry.browserTracingIntegration()],
    release: pkg.version,
    tracesSampleRate: 1.0,
  })
  if (client) {
    const sentryScope = Sentry.getGlobalScope()
    const st = new SentryTracer(client, sentryScope)
    const tracer = new RemoteTracer(st, {
      // device: Browser.device?.replace(/ /g, '_'),
      // browser: Browser.name,
      // browser_ver: Browser.version,
      // ios: Browser.isiOS,
      // android: Browser.isAndroid,
      // mobile: Browser.isMobile,
      // localstorage: Browser.hasLocalstorage,
      // os: Browser.os.group?.replace(/ /g, '_'),
      // os_name: Browser.os.name?.replace(/ /g, '_'),
      // width: Browser.viewport.width,
      // height: Browser.viewport.height,
    })
    setTracer(tracer)
    setTracerPlayer(tracer)
    Fingerprint.load()
      .then((agent) => agent.get())
      .then((res) => {
        tracer.setTag('visitor_id', res.visitorId)
        sentryScope.setTag('visitor_id', res.visitorId)
      })
  } else {
    console.error('Sentry client is not initialized')
  }
}

useStreamSetup()
</script>

<template>
  <NuxtPage />
</template>
