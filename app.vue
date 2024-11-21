<script setup lang="ts">
import pkg from './package.json' with { type: 'json' }
import rtckit from '@gcorevideo/rtckit/package.json' with { type: 'json' }
import rtckitNode from '@gcorevideo/rtckit-node/package.json' with { type: 'json' }
import { LogTracer, Logger, setTracer } from "@gcorevideo/rtckit";

if (typeof window !== 'undefined') {
  console.log(
    '%s %s/rtckit %s %s ',
    pkg.name,
    pkg.version,
    rtckit.version,
    rtckitNode.version,
  )
  Logger.enable('*')
  setTracer(new LogTracer())
}
</script>

<template>
  <NuxtPage />
</template>
