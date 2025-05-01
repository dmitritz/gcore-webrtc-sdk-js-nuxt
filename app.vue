<script setup lang="ts">
import rtckit from '@gcorevideo/rtckit/package.json' with { type: 'json' }
import rtckitNode from '@gcorevideo/rtckit-node/package.json' with { type: 'json' }
import pkg from './package.json' with { type: 'json' }
import { setTracer } from "@gcorevideo/rtckit";
import { setTracer as setTracerPlayer, version as playerVersion } from "@gcorevideo/player";
import { LogTracer, Logger, RemoteTracer, SentryTracer } from "@gcorevideo/utils";
import * as Sentry from '@sentry/browser'
import Fingerprint from '@fingerprintjs/fingerprintjs'
import mousetrap from 'mousetrap'

const $route = useRoute()

const BIND_KEYS_NEXT = 'option+right'
const BIND_KEYS_PREV = 'option+left'

if (import.meta.client) {
  const tags = {
    client: pkg.name,
    build_id: import.meta.env.VITE_SENTRY_BUILD_ID,
    rtckit: rtckit.version,
    rtckit_node: rtckitNode.version,
    player: playerVersion().gplayer,
  }
  const client = import.meta.env.VITE_SENTRY_DSN ? Sentry.init({
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
  }) : null
  const baseTracer = client ? new SentryTracer(client as any, Sentry.getGlobalScope() as any) : new LogTracer(pkg.name)
  const tracer = new RemoteTracer(baseTracer, {
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
  if (client) {
    Fingerprint.load()
      .then((agent) => agent.get())
      .then((res) => {
        tracer.setTag('visitor_id', res.visitorId)
        Sentry.getGlobalScope().setTag('visitor_id', res.visitorId)
      })
  } else {
    console.log('Sentry client is not initialized')
    Logger.enable(import.meta.env.VITE_DEBUG ?? '*')
  }
  const routes = [
    '/',
    '/settings',
  ]
  mousetrap.bind(BIND_KEYS_NEXT, () => {
    const next = (routes.findIndex((route) => route === $route.path) + 1) % routes.length
    navigateTo(routes[next])
  })
  mousetrap.bind(BIND_KEYS_PREV, () => {
    const next = (routes.findIndex((route) => route === $route.path) - 1 + routes.length) % routes.length
    navigateTo(routes[next])
  })
}

useStreamSetup()
</script>

<template>
  <NuxtPage />
</template>
